import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseSukses } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseSukses<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseSukses<T>> {
    return next.handle().pipe(
      map((data) => {
        // Jika data sudah dalam format response standar, return as is
        if (data && typeof data === 'object' && 'sukses' in data) {
          return data;
        }

        // Transform ke format response standar
        return {
          sukses: true,
          pesan: 'Operasi berhasil',
          data,
        };
      }),
    );
  }
}
