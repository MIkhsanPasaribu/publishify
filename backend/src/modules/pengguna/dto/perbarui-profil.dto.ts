import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk update profil pengguna sendiri
 */
export const PerbaruiProfilSchema = z.object({
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

  namaTampilan: z
    .string()
    .max(100, 'Nama tampilan maksimal 100 karakter')
    .trim()
    .optional()
    .nullable(),

  bio: z.string().max(500, 'Bio maksimal 500 karakter').trim().optional().nullable(),

  tanggalLahir: z.string().datetime('Format tanggal tidak valid').optional().nullable(),

  jenisKelamin: z
    .enum(['L', 'P'], {
      invalid_type_error: 'Jenis kelamin harus L atau P',
    })
    .optional()
    .nullable(),

  alamat: z.string().max(200, 'Alamat maksimal 200 karakter').trim().optional().nullable(),

  kota: z.string().max(100, 'Kota maksimal 100 karakter').trim().optional().nullable(),

  provinsi: z.string().max(100, 'Provinsi maksimal 100 karakter').trim().optional().nullable(),

  kodePos: z
    .string()
    .regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit')
    .optional()
    .nullable(),

  telepon: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
    .optional()
    .nullable(),
});

/**
 * Type inference dari Zod schema
 */
export type PerbaruiProfilDto = z.infer<typeof PerbaruiProfilSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiProfilDtoClass {
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
    description: 'Nama tampilan/display name',
    example: 'Johnny',
    required: false,
    type: String,
  })
  namaTampilan?: string;

  @ApiProperty({
    description: 'Bio singkat pengguna',
    example: 'Penulis novel fiksi',
    required: false,
    type: String,
  })
  bio?: string;

  @ApiProperty({
    description: 'Tanggal lahir (ISO 8601 format)',
    example: '1990-01-15T00:00:00.000Z',
    required: false,
    type: String,
  })
  tanggalLahir?: string;

  @ApiProperty({
    description: 'Jenis kelamin (L = Laki-laki, P = Perempuan)',
    enum: ['L', 'P'],
    required: false,
    type: String,
  })
  jenisKelamin?: 'L' | 'P';

  @ApiProperty({
    description: 'Alamat lengkap',
    example: 'Jl. Merdeka No. 123',
    required: false,
    type: String,
  })
  alamat?: string;

  @ApiProperty({
    description: 'Kota',
    example: 'Jakarta',
    required: false,
    type: String,
  })
  kota?: string;

  @ApiProperty({
    description: 'Provinsi',
    example: 'DKI Jakarta',
    required: false,
    type: String,
  })
  provinsi?: string;

  @ApiProperty({
    description: 'Kode pos (5 digit)',
    example: '12345',
    required: false,
    type: String,
  })
  kodePos?: string;

  @ApiProperty({
    description: 'Nomor telepon',
    example: '081234567890',
    required: false,
    type: String,
  })
  telepon?: string;
}
