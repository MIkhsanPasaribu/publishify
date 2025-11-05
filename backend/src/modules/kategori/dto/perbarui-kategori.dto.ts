import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk memperbarui kategori
 */
export const PerbaruiKategoriSchema = z.object({
  nama: z
    .string()
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter')
    .optional(),

  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(100, 'Slug maksimal 100 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug harus lowercase dengan format kebab-case')
    .optional(),

  deskripsi: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),

  idInduk: z.string().uuid('ID induk harus berupa UUID yang valid').optional().nullable(),

  aktif: z.boolean().optional(),
});

/**
 * Type inference dari Zod schema
 */
export type PerbaruiKategoriDto = z.infer<typeof PerbaruiKategoriSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiKategoriDtoClass {
  @ApiProperty({
    description: 'Nama kategori',
    example: 'Novel Fiksi',
    type: String,
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  nama?: string;

  @ApiProperty({
    description: 'Slug untuk URL (kebab-case)',
    example: 'novel-fiksi',
    type: String,
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    required: false,
  })
  slug?: string;

  @ApiProperty({
    description: 'Deskripsi kategori',
    example: 'Kategori untuk novel fiksi dan karya imaginatif',
    type: String,
    maxLength: 500,
    required: false,
    nullable: true,
  })
  deskripsi?: string | null;

  @ApiProperty({
    description: 'ID kategori induk (untuk sub-kategori)',
    example: 'uuid-kategori-induk',
    type: String,
    required: false,
    nullable: true,
  })
  idInduk?: string | null;

  @ApiProperty({
    description: 'Status aktif kategori',
    example: true,
    type: Boolean,
    required: false,
  })
  aktif?: boolean;
}
