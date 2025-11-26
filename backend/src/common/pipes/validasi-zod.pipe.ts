import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ValidasiZodPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      // Debug log untuk melihat input yang diterima
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [ValidasiZodPipe] Input value:', JSON.stringify(value, null, 2));
      }
      
      const result = this.schema.parse(value);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [ValidasiZodPipe] Parsed result:', JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ [ValidasiZodPipe] Validation error:', error.errors);
      
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new BadRequestException({
        message: 'Validasi gagal',
        errors,
      });
    }
  }
}
