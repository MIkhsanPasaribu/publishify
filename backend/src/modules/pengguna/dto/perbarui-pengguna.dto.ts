import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk update pengguna (Admin only)
 */
export const PerbaruiPenggunaSchema = z.object({
  email: z.string().email('Format email tidak valid').toLowerCase().trim().optional(),

  telepon: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
    .optional()
    .nullable(),

  namaDepan: z
    .string()
    .min(2, 'Nama depan minimal 2 karakter')
    .max(50, 'Nama depan maksimal 50 karakter')
    .trim()
    .optional(),

  namaBelakang: z
    .string()
    .max(50, 'Nama belakang maksimal 50 karakter')
    .trim()
    .optional()
    .nullable(),

  aktif: z.boolean().optional(),

  terverifikasi: z.boolean().optional(),
});

/**
 * Type inference dari Zod schema
 */
export type PerbaruiPenggunaDto = z.infer<typeof PerbaruiPenggunaSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiPenggunaDtoClass {
  @ApiProperty({
    description: 'Alamat email pengguna',
    example: 'user@publishify.com',
    required: false,
    type: String,
  })
  email?: string;

  @ApiProperty({
    description: 'Nomor telepon pengguna',
    example: '081234567890',
    required: false,
    type: String,
  })
  telepon?: string;

  @ApiProperty({
    description: 'Nama depan pengguna',
    example: 'John',
    required: false,
    type: String,
  })
  namaDepan?: string;

  @ApiProperty({
    description: 'Nama belakang pengguna',
    example: 'Doe',
    required: false,
    type: String,
  })
  namaBelakang?: string;

  @ApiProperty({
    description: 'Status aktif pengguna',
    required: false,
    type: Boolean,
  })
  aktif?: boolean;

  @ApiProperty({
    description: 'Status verifikasi email',
    required: false,
    type: Boolean,
  })
  terverifikasi?: boolean;
}
