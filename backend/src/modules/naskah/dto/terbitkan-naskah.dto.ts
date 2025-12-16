import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { FormatBukuEnum } from './buat-naskah.dto';

/**
 * Schema Zod untuk Admin terbitkan naskah
 * Admin mengisi ISBN, format buku, dan jumlah halaman
 * Biaya produksi ditentukan oleh mitra percetakan, bukan admin
 */
export const TerbitkanNaskahSchema = z.object({
  isbn: z
    .string({
      required_error: 'ISBN wajib diisi untuk penerbitan',
    })
    .min(1, 'ISBN tidak boleh kosong')
    .trim(),

  formatBuku: FormatBukuEnum.optional(),

  jumlahHalaman: z
    .number({
      required_error: 'Jumlah halaman wajib diisi',
    })
    .int('Jumlah halaman harus bilangan bulat')
    .min(1, 'Jumlah halaman minimal 1'),
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
    description: 'Format/ukuran buku (A4, A5, atau B5)',
    example: 'A5',
    enum: ['A4', 'A5', 'B5'],
    required: false,
    type: String,
  })
  formatBuku?: 'A4' | 'A5' | 'B5';

  @ApiProperty({
    description: 'Jumlah halaman buku setelah final layout',
    example: 250,
    type: Number,
  })
  jumlahHalaman!: number;
}
