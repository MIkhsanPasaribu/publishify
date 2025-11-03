import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { Rekomendasi } from '@prisma/client';

/**
 * Schema Zod untuk submit/finalisasi review
 */
export const SubmitReviewSchema = z.object({
  rekomendasi: z.nativeEnum(Rekomendasi, {
    required_error: 'Rekomendasi wajib dipilih',
    invalid_type_error: 'Rekomendasi tidak valid',
  }),

  catatan: z
    .string({
      required_error: 'Catatan kesimpulan wajib diisi',
    })
    .min(50, 'Catatan kesimpulan minimal 50 karakter')
    .max(2000, 'Catatan kesimpulan maksimal 2000 karakter')
    .trim(),
});

/**
 * Type inference dari Zod schema
 */
export type SubmitReviewDto = z.infer<typeof SubmitReviewSchema>;

/**
 * Class untuk Swagger documentation
 */
export class SubmitReviewDtoClass {
  @ApiProperty({
    description: 'Rekomendasi akhir review',
    enum: Rekomendasi,
    example: 'setujui',
  })
  rekomendasi!: Rekomendasi;

  @ApiProperty({
    description: 'Catatan kesimpulan review',
    example:
      'Naskah sudah bagus secara keseluruhan. Struktur cerita solid, karakter berkembang dengan baik. Sudah siap untuk diterbitkan dengan minor editing.',
    minLength: 50,
    maxLength: 2000,
    type: String,
  })
  catatan!: string;
}
