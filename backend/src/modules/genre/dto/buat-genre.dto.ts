import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk membuat genre baru
 */
export const BuatGenreSchema = z.object({
  nama: z
    .string({
      required_error: 'Nama genre wajib diisi',
    })
    .min(2, 'Nama genre minimal 2 karakter')
    .max(100, 'Nama genre maksimal 100 karakter'),

  slug: z
    .string({
      required_error: 'Slug wajib diisi',
    })
    .min(2, 'Slug minimal 2 karakter')
    .max(100, 'Slug maksimal 100 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug harus lowercase dengan format kebab-case'),

  deskripsi: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),

  aktif: z.boolean().optional().default(true),
});

/**
 * Type inference dari Zod schema
 */
export type BuatGenreDto = z.infer<typeof BuatGenreSchema>;

/**
 * Class untuk Swagger documentation
 */
export class BuatGenreDtoClass {
  @ApiProperty({
    description: 'Nama genre',
    example: 'Romance',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  nama!: string;

  @ApiProperty({
    description: 'Slug untuk URL (kebab-case)',
    example: 'romance',
    type: String,
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  slug!: string;

  @ApiProperty({
    description: 'Deskripsi genre',
    example: 'Genre untuk cerita romantis dan percintaan',
    type: String,
    maxLength: 500,
    required: false,
  })
  deskripsi?: string;

  @ApiProperty({
    description: 'Status aktif genre',
    example: true,
    type: Boolean,
    default: true,
    required: false,
  })
  aktif?: boolean;
}
