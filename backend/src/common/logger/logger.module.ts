import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AsyncLoggerService } from './async-logger.service';

/**
 * LoggerModule
 *
 * Global module untuk asynchronous logging.
 * Menyediakan AsyncLoggerService yang dapat di-inject di seluruh aplikasi.
 *
 * Features:
 * - Event-driven architecture dengan EventEmitter2
 * - Buffer management dan batch processing
 * - Global scope (tidak perlu import di setiap module)
 */
@Global()
@Module({
  imports: [
    // EventEmitterModule sudah di-import di AppModule
    // Tapi kita pastikan tersedia untuk AsyncLoggerService
  ],
  providers: [AsyncLoggerService],
  exports: [AsyncLoggerService],
})
export class LoggerModule {}
