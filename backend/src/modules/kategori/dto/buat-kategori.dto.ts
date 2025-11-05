import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk membuat kategori baru
 */
export const BuatKategoriSchema = z.object({
  nama: z
    .string({
      required_error: 'Nama kategori wajib diisi',
    })
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter'),

  slug: z
    .string({
      required_error: 'Slug wajib diisi',
    })
    .min(2, 'Slug minimal 2 karakter')
    .max(100, 'Slug maksimal 100 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug harus lowercase dengan format kebab-case'),

  deskripsi: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),

  idInduk: z.string().uuid('ID induk harus berupa UUID yang valid').optional(),

  aktif: z.boolean().optional().default(true),
});

/**
 * Type inference dari Zod schema
 */
export type BuatKategoriDto = z.infer<typeof BuatKategoriSchema>;

/**
 * Class untuk Swagger documentation
 */
export class BuatKategoriDtoClass {
  @ApiProperty({
    description: 'Nama kategori',
    example: 'Novel Fiksi',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  nama!: string;

  @ApiProperty({
    description: 'Slug untuk URL (kebab-case)',
    example: 'novel-fiksi',
    type: String,
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  slug!: string;

  @ApiProperty({
    description: 'Deskripsi kategori',
    example: 'Kategori untuk novel fiksi dan karya imaginatif',
    type: String,
    maxLength: 500,
    required: false,
  })
  deskripsi?: string;

  @ApiProperty({
    description: 'ID kategori induk (untuk sub-kategori)',
    example: 'uuid-kategori-induk',
    type: String,
    required: false,
  })
  idInduk?: string;

  @ApiProperty({
    description: 'Status aktif kategori',
    example: true,
    type: Boolean,
    default: true,
    required: false,
  })
  aktif?: boolean;
}
