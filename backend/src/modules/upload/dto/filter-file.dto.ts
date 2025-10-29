import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { TipeFile } from './upload-file.dto';

/**
 * Zod Schema untuk filter file
 */
export const FilterFileSchema = z.object({
  halaman: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default('1')
    .describe('Nomor halaman (default: 1)'),

  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('20')
    .describe('Jumlah item per halaman (max: 100)'),

  tujuan: z.nativeEnum(TipeFile).optional().describe('Filter berdasarkan tujuan upload'),

  idPengguna: z
    .string()
    .uuid('ID pengguna harus berupa UUID')
    .optional()
    .describe('Filter berdasarkan ID pengguna yang upload'),

  idReferensi: z
    .string()
    .uuid('ID referensi harus berupa UUID')
    .optional()
    .describe('Filter berdasarkan ID referensi'),

  mimeType: z.string().optional().describe('Filter berdasarkan MIME type'),

  cari: z
    .string()
    .max(100, 'Kata kunci pencarian maksimal 100 karakter')
    .optional()
    .describe('Kata kunci pencarian (nama file atau deskripsi)'),

  urutkan: z
    .enum(['diuploadPada', 'namaFileAsli', 'ukuran'])
    .optional()
    .default('diuploadPada')
    .describe('Field untuk sorting'),

  arah: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('Arah sorting (ascending/descending)'),
});

export type FilterFileDto = z.infer<typeof FilterFileSchema>;

/**
 * Class untuk Swagger documentation
 */
export class FilterFileSwagger {
  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    required: false,
    default: 1,
  })
  halaman?: number;

  @ApiProperty({
    description: 'Jumlah item per halaman (max: 100)',
    example: 20,
    required: false,
    default: 20,
  })
  limit?: number;

  @ApiProperty({
    enum: TipeFile,
    description: 'Filter berdasarkan tujuan upload',
    required: false,
  })
  tujuan?: TipeFile;

  @ApiProperty({
    description: 'Filter berdasarkan ID pengguna yang upload',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  idPengguna?: string;

  @ApiProperty({
    description: 'Filter berdasarkan ID referensi',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  idReferensi?: string;

  @ApiProperty({
    description: 'Filter berdasarkan MIME type',
    example: 'application/pdf',
    required: false,
  })
  mimeType?: string;

  @ApiProperty({
    description: 'Kata kunci pencarian (nama file atau deskripsi)',
    example: 'naskah',
    required: false,
    maxLength: 100,
  })
  cari?: string;

  @ApiProperty({
    enum: ['diuploadPada', 'namaFileAsli', 'ukuran'],
    description: 'Field untuk sorting',
    required: false,
    default: 'diuploadPada',
  })
  urutkan?: string;

  @ApiProperty({
    enum: ['asc', 'desc'],
    description: 'Arah sorting',
    required: false,
    default: 'desc',
  })
  arah?: 'asc' | 'desc';
}
