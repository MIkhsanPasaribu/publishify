import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk memperbarui genre
 */
export const PerbaruiGenreSchema = z.object({
  nama: z
    .string()
    .min(2, 'Nama genre minimal 2 karakter')
    .max(100, 'Nama genre maksimal 100 karakter')
    .optional(),

  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(100, 'Slug maksimal 100 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug harus lowercase dengan format kebab-case')
    .optional(),

  deskripsi: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),

  aktif: z.boolean().optional(),
});

/**
 * Type inference dari Zod schema
 */
export type PerbaruiGenreDto = z.infer<typeof PerbaruiGenreSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiGenreDtoClass {
  @ApiProperty({
    description: 'Nama genre',
    example: 'Romance',
    type: String,
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  nama?: string;

  @ApiProperty({
    description: 'Slug untuk URL (kebab-case)',
    example: 'romance',
    type: String,
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    required: false,
  })
  slug?: string;

  @ApiProperty({
    description: 'Deskripsi genre',
    example: 'Genre untuk cerita romantis dan percintaan',
    type: String,
    maxLength: 500,
    required: false,
    nullable: true,
  })
  deskripsi?: string | null;

  @ApiProperty({
    description: 'Status aktif genre',
    example: true,
    type: Boolean,
    required: false,
  })
  aktif?: boolean;
}
