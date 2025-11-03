import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Interface untuk user context yang akan di-inject ke RLS
 */
export interface UserContext {
  userId: string;
  email: string;
  role?: string;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Log queries di development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Log errors
    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Koneksi database berhasil');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Koneksi database terputus');
  }

  /**
   * Set user context untuk RLS (Row Level Security) di Supabase
   * Method ini akan dipanggil dari middleware untuk setiap request
   *
   * @param context - User context (userId, email, role)
   * @returns PrismaClient instance dengan context yang sudah di-set
   */
  async setUserContext(context: UserContext): Promise<PrismaClient> {
    try {
      // Set JWT claims ke PostgreSQL session untuk RLS
      // Format: {"sub": "uuid", "email": "email@example.com", "role": "penulis"}
      const claims = {
        sub: context.userId,
        email: context.email,
        role: context.role || 'authenticated',
      };

      // Execute SQL untuk set JWT claims di session
      await this.$executeRawUnsafe(
        `SELECT set_config('request.jwt.claims', $1, true)`,
        JSON.stringify(claims),
      );

      this.logger.debug(`🔐 User context di-set untuk: ${context.email} (${context.userId})`);

      return this;
    } catch (error: any) {
      this.logger.error(`❌ Gagal set user context: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear user context setelah request selesai
   * Penting untuk membersihkan context agar tidak bocor ke request lain
   */
  async clearUserContext(): Promise<void> {
    try {
      await this.$executeRawUnsafe(`SELECT set_config('request.jwt.claims', NULL, true)`);
      this.logger.debug('🔓 User context dibersihkan');
    } catch (error: any) {
      this.logger.error(`❌ Gagal clear user context: ${error.message}`);
    }
  }

  /**
   * Wrapper untuk query dengan auto set/clear context
   * Digunakan untuk memastikan context selalu di-set dan dibersihkan
   *
   * @param context - User context
   * @param fn - Function yang akan dijalankan dengan context
   */
  async withUserContext<T>(
    context: UserContext,
    fn: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    try {
      await this.setUserContext(context);
      const result = await fn(this);
      return result;
    } finally {
      await this.clearUserContext();
    }
  }

  /**
   * Helper untuk menangani transaksi dengan retry logic
   */
  async runTransaction<T>(
    fn: (
      prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>,
    ) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(fn);
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Transaksi gagal (percobaan ${attempt}/${maxRetries}): ${error.message}`);

        if (attempt < maxRetries) {
          // Tunggu sebentar sebelum retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Helper untuk soft delete (jika dibutuhkan di masa depan)
   */
  async softDelete(model: string, id: string) {
    return (this as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Helper untuk cleanup data lama (maintenance)
   */
  async cleanupOldData() {
    try {
      // Hapus token refresh yang sudah expired
      const deletedTokens = await this.tokenRefresh.deleteMany({
        where: {
          kadaluarsaPada: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`🧹 Cleanup: ${deletedTokens.count} token refresh yang expired dihapus`);

      // Hapus notifikasi yang sudah dibaca dan lebih dari 30 hari
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedNotifications = await this.notifikasi.deleteMany({
        where: {
          dibaca: true,
          dibuatPada: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(`🧹 Cleanup: ${deletedNotifications.count} notifikasi lama dihapus`);

      return {
        tokenRefresh: deletedTokens.count,
        notifikasi: deletedNotifications.count,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error saat cleanup: ${error.message}`);
      throw error;
    }
  }
}
