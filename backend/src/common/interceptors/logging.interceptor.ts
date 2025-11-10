import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AsyncLoggerService } from '@/common/logger/async-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly asyncLogger: AsyncLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, user } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log request ke console (synchronous untuk debugging)
    this.logger.log(`📥 ${method} ${url} - IP: ${ip}`);

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Console log (synchronous)
          this.logger.log(`📤 ${method} ${url} ${statusCode} - ${duration}ms`);

          // Database log (asynchronous via event)
          this.asyncLogger.log({
            idPengguna: user?.id,
            jenis: 'http_request',
            aksi: `${method} ${url}`,
            entitas: 'api',
            deskripsi: `Status: ${statusCode}, Duration: ${duration}ms`,
            ipAddress: ip,
            userAgent,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          // Console log (synchronous)
          this.logger.error(`❌ ${method} ${url} Error - ${duration}ms: ${error.message}`);

          // Database log (asynchronous via event)
          this.asyncLogger.log({
            idPengguna: user?.id,
            jenis: 'http_error',
            aksi: `${method} ${url}`,
            entitas: 'api',
            deskripsi: `Error: ${error.message}, Duration: ${duration}ms`,
            ipAddress: ip,
            userAgent,
          });
        },
      }),
    );
  }
}
