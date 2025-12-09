import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk Admin terbitkan naskah
 * Admin mengisi ISBN dan biaya produksi
 */
export const TerbitkanNaskahSchema = z.object({
  isbn: z
    .string({
      required_error: 'ISBN wajib diisi untuk penerbitan',
    })
    .min(1, 'ISBN tidak boleh kosong')
    .trim(),

  biayaProduksi: z
    .number({
      required_error: 'Biaya produksi wajib diisi',
    })
    .positive('Biaya produksi harus lebih dari 0')
    .min(0, 'Biaya produksi minimal 0'),
});

/**
 * Type inference dari Zod schema
 */
export type TerbitkanNaskahDto = z.infer<typeof TerbitkanNaskahSchema>;

/**
 * Class untuk Swagger documentation
 */
export class TerbitkanNaskahDtoClass {
  @ApiProperty({
    description: 'Nomor ISBN yang sudah diurus di Perpusnas',
    example: '978-602-xxxxx-x-x',
    type: String,
  })
  isbn!: string;

  @ApiProperty({
    description: 'Biaya produksi untuk cetak buku (dalam Rupiah)',
    example: 30000,
    type: Number,
  })
  biayaProduksi!: number;
}
