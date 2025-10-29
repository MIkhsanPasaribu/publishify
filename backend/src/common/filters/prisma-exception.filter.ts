import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ResponseError } from '../interfaces/response.interface';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log error
    this.logger.error(`Prisma Error: ${exception.message}`, exception.stack);

    // Mapping Prisma error codes
    const { status, pesan, kode } = this.mapPrismaError(exception);

    const errorResponse: ResponseError = {
      sukses: false,
      pesan,
      error: {
        kode,
        detail: exception.meta?.target as string,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }

  private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    pesan: string;
    kode: string;
  } {
    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          pesan: 'Data sudah ada. Mohon gunakan data yang berbeda.',
          kode: 'DATA_DUPLIKAT',
        };

      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          pesan: 'Data tidak ditemukan.',
          kode: 'DATA_TIDAK_DITEMUKAN',
        };

      case 'P2003':
        // Foreign key constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          pesan: 'Data terkait tidak ditemukan.',
          kode: 'RELASI_TIDAK_VALID',
        };

      case 'P2014':
        // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          pesan: 'Relasi yang diperlukan tidak ada.',
          kode: 'RELASI_DIPERLUKAN',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          pesan: 'Terjadi kesalahan pada database.',
          kode: 'DATABASE_ERROR',
        };
    }
  }
}
