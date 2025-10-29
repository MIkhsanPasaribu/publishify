import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk update naskah
 * Semua field optional (partial update)
 */
export const PerbaruiNaskahSchema = z.object({
  judul: z
    .string()
    .min(3, 'Judul minimal 3 karakter')
    .max(200, 'Judul maksimal 200 karakter')
    .trim()
    .optional(),

  subJudul: z.string().max(200, 'Sub judul maksimal 200 karakter').trim().optional().nullable(),

  sinopsis: z
    .string()
    .min(50, 'Sinopsis minimal 50 karakter')
    .max(2000, 'Sinopsis maksimal 2000 karakter')
    .trim()
    .optional(),

  idKategori: z.string().uuid('ID kategori harus berupa UUID').optional(),

  idGenre: z.string().uuid('ID genre harus berupa UUID').optional(),

  bahasaTulis: z.string().length(2, 'Kode bahasa harus 2 karakter (ISO 639-1)').optional(),

  jumlahHalaman: z
    .number()
    .int('Jumlah halaman harus bilangan bulat')
    .min(1, 'Jumlah halaman minimal 1')
    .optional()
    .nullable(),

  jumlahKata: z
    .number()
    .int('Jumlah kata harus bilangan bulat')
    .min(100, 'Jumlah kata minimal 100')
    .optional()
    .nullable(),

  urlSampul: z.string().url('URL sampul tidak valid').optional().nullable(),

  urlFile: z.string().url('URL file tidak valid').optional().nullable(),

  publik: z.boolean().optional(),
});

/**
 * Type inference dari Zod schema
 */
export type PerbaruiNaskahDto = z.infer<typeof PerbaruiNaskahSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiNaskahDtoClass {
  @ApiProperty({
    description: 'Judul naskah',
    example: 'Perjalanan ke Negeri Dongeng',
    required: false,
    type: String,
  })
  judul?: string;

  @ApiProperty({
    description: 'Sub judul naskah',
    example: 'Petualangan Seru di Dunia Fantasi',
    required: false,
    type: String,
  })
  subJudul?: string;

  @ApiProperty({
    description: 'Sinopsis naskah',
    example: 'Cerita tentang seorang anak yang menemukan portal ajaib...',
    required: false,
    type: String,
  })
  sinopsis?: string;

  @ApiProperty({
    description: 'ID kategori naskah',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    type: String,
  })
  idKategori?: string;

  @ApiProperty({
    description: 'ID genre naskah',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
    type: String,
  })
  idGenre?: string;

  @ApiProperty({
    description: 'Bahasa tulisan (kode ISO 639-1)',
    example: 'id',
    required: false,
    type: String,
  })
  bahasaTulis?: string;

  @ApiProperty({
    description: 'Jumlah halaman naskah',
    example: 250,
    required: false,
    type: Number,
  })
  jumlahHalaman?: number;

  @ApiProperty({
    description: 'Jumlah kata dalam naskah',
    example: 75000,
    required: false,
    type: Number,
  })
  jumlahKata?: number;

  @ApiProperty({
    description: 'URL sampul/cover naskah',
    example: 'https://storage.publishify.com/covers/cover-123.jpg',
    required: false,
    type: String,
  })
  urlSampul?: string;

  @ApiProperty({
    description: 'URL file naskah (PDF/DOCX)',
    example: 'https://storage.publishify.com/manuscripts/manuscript-123.pdf',
    required: false,
    type: String,
  })
  urlFile?: string;

  @ApiProperty({
    description: 'Status publik',
    required: false,
    type: Boolean,
  })
  publik?: boolean;
}
