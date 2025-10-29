import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
   * Helper untuk menangani transaksi dengan retry logic
   */
  async runTransaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>,
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
