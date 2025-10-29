import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk mengajukan naskah ke editor
 */
export const AjukanNaskahSchema = z.object({
  catatan: z.string().max(500, 'Catatan maksimal 500 karakter').trim().optional().nullable(),
});

/**
 * Type inference dari Zod schema
 */
export type AjukanNaskahDto = z.infer<typeof AjukanNaskahSchema>;

/**
 * Class untuk Swagger documentation
 */
export class AjukanNaskahDtoClass {
  @ApiProperty({
    description: 'Catatan tambahan untuk editor',
    example: 'Mohon review dan berikan masukan untuk naskah ini',
    required: false,
    maxLength: 500,
    type: String,
  })
  catatan?: string;
}
