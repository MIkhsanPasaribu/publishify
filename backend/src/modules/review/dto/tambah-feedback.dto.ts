import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk menambah feedback review
 */
export const TambahFeedbackSchema = z.object({
  bab: z.string().max(100, 'Bab maksimal 100 karakter').trim().optional().nullable(),

  halaman: z
    .number()
    .int('Halaman harus bilangan bulat')
    .min(1, 'Halaman minimal 1')
    .optional()
    .nullable(),

  komentar: z
    .string({
      required_error: 'Komentar wajib diisi',
    })
    .min(10, 'Komentar minimal 10 karakter')
    .max(2000, 'Komentar maksimal 2000 karakter')
    .trim(),
});

/**
 * Type inference dari Zod schema
 */
export type TambahFeedbackDto = z.infer<typeof TambahFeedbackSchema>;

/**
 * Class untuk Swagger documentation
 */
export class TambahFeedbackDtoClass {
  @ApiProperty({
    description: 'Nama/nomor bab (opsional)',
    example: 'Bab 3',
    required: false,
    maxLength: 100,
    type: String,
  })
  bab?: string;

  @ApiProperty({
    description: 'Nomor halaman (opsional)',
    example: 45,
    required: false,
    type: Number,
  })
  halaman?: number;

  @ApiProperty({
    description: 'Komentar/feedback untuk penulis',
    example:
      'Dialog pada bagian ini perlu diperbaiki. Terlalu kaku dan tidak natural. Coba gunakan bahasa yang lebih santai sesuai karakter.',
    minLength: 10,
    maxLength: 2000,
    type: String,
  })
  komentar: string;
}
