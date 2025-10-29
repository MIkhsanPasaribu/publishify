import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseError } from '../interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Log error
    this.logger.error(`HTTP Exception: ${exception.message}`, exception.stack);

    // Format error response
    const errorResponse: ResponseError = {
      sukses: false,
      pesan: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : exceptionResponse.message || 'Terjadi kesalahan',
      error: {
        kode: this.getErrorCode(status),
        detail: typeof exceptionResponse === 'object' 
          ? exceptionResponse.error 
          : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    // Kirim response
    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'PERMINTAAN_TIDAK_VALID',
      [HttpStatus.UNAUTHORIZED]: 'TIDAK_TERAUTENTIKASI',
      [HttpStatus.FORBIDDEN]: 'AKSES_DITOLAK',
      [HttpStatus.NOT_FOUND]: 'TIDAK_DITEMUKAN',
      [HttpStatus.CONFLICT]: 'KONFLIK_DATA',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDASI_GAGAL',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'ERROR_SERVER',
    };

    return errorCodes[status] || 'ERROR_TIDAK_DIKETAHUI';
  }
}
