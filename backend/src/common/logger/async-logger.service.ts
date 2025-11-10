import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Interface untuk log entry
 */
export interface LogEntry {
  idPengguna?: string;
  jenis: string;
  aksi: string;
  entitas?: string;
  idEntitas?: string;
  deskripsi?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Event payload untuk log aktivitas
 */
export interface LogAktivitasEvent extends LogEntry {
  timestamp?: Date;
}

/**
 * AsyncLoggerService
 *
 * Service untuk logging asynchronous dengan buffer dan batch processing.
 * Mengurangi blocking I/O untuk write ke database.
 *
 * Features:
 * - Event-driven logging (non-blocking)
 * - Buffer management (max 100 logs)
 * - Auto-flush setiap 5 detik
 * - Batch write ke database
 * - Graceful shutdown (flush on destroy)
 */
@Injectable()
export class AsyncLoggerService implements OnModuleDestroy {
  private readonly logger = new Logger(AsyncLoggerService.name);
  private logBuffer: LogAktivitasEvent[] = [];
  private readonly maxBufferSize = 100;
  private readonly flushInterval = 5000; // 5 detik
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Auto-flush setiap 5 detik
    this.startAutoFlush();
    this.logger.log('AsyncLoggerService initialized with buffer size: ' + this.maxBufferSize);
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch((error) => {
        this.logger.error('Auto-flush error:', error.message);
      });
    }, this.flushInterval);
  }

  /**
   * Log aktivitas secara asynchronous
   * Emit event tanpa blocking
   */
  log(entry: LogEntry): void {
    this.eventEmitter.emit('log.aktivitas', {
      ...entry,
      timestamp: new Date(),
    });
  }

  /**
   * Event listener untuk log aktivitas
   * Buffer logs dan flush saat buffer penuh
   */
  @OnEvent('log.aktivitas', { async: true })
  async handleLogEvent(payload: LogAktivitasEvent): Promise<void> {
    try {
      // Add to buffer
      this.logBuffer.push(payload);

      // Flush jika buffer penuh
      if (this.logBuffer.length >= this.maxBufferSize) {
        await this.flush();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('Error handling log event:', errorMessage);
    }
  }

  /**
   * Flush buffer ke database
   * Batch write untuk efisiensi
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToWrite = [...this.logBuffer];
    this.logBuffer = []; // Clear buffer immediately

    try {
      // Batch insert menggunakan createMany
      await this.prisma.logAktivitas.createMany({
        data: logsToWrite.map((log) => ({
          idPengguna: log.idPengguna,
          jenis: log.jenis,
          aksi: log.aksi,
          entitas: log.entitas,
          idEntitas: log.idEntitas,
          deskripsi: log.deskripsi,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          dibuatPada: log.timestamp || new Date(),
        })),
        skipDuplicates: true,
      });

      this.logger.debug(`Flushed ${logsToWrite.length} logs to database`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('Error flushing logs:', errorMessage);

      // Fallback: try individual inserts
      for (const log of logsToWrite) {
        try {
          await this.prisma.logAktivitas.create({
            data: {
              idPengguna: log.idPengguna,
              jenis: log.jenis,
              aksi: log.aksi,
              entitas: log.entitas,
              idEntitas: log.idEntitas,
              deskripsi: log.deskripsi,
              ipAddress: log.ipAddress,
              userAgent: log.userAgent,
              dibuatPada: log.timestamp || new Date(),
            },
          });
        } catch (individualErr: unknown) {
          const individualErrorMessage =
            individualErr instanceof Error ? individualErr.message : String(individualErr);
          this.logger.error('Error writing individual log:', individualErrorMessage);
        }
      }
    }
  }

  /**
   * Get buffer status
   */
  getBufferStatus(): { size: number; maxSize: number; percentage: number } {
    return {
      size: this.logBuffer.length,
      maxSize: this.maxBufferSize,
      percentage: (this.logBuffer.length / this.maxBufferSize) * 100,
    };
  }

  /**
   * Force flush (for manual trigger)
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Cleanup on module destroy
   * Flush remaining logs before shutdown
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('AsyncLoggerService shutting down...');

    // Stop auto-flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Flush remaining logs
    await this.flush();

    this.logger.log('AsyncLoggerService shutdown complete');
  }
}
