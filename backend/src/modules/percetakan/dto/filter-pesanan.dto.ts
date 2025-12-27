import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk filter dan pagination pesanan cetak
 * Digunakan untuk listing pesanan dengan berbagai filter
 */
export const FilterPesananSchema = z.object({
  // Pagination
  halaman: z.coerce
    .number({
      invalid_type_error: 'Halaman harus berupa angka',
    })
    .int('Halaman harus berupa bilangan bulat')
    .positive('Halaman harus lebih dari 0')
    .default(1)
    .describe('Nomor halaman untuk pagination'),

  limit: z.coerce
    .number({
      invalid_type_error: 'Limit harus berupa angka',
    })
    .int('Limit harus berupa bilangan bulat')
    .positive('Limit harus lebih dari 0')
    .max(100, 'Limit maksimal 100')
    .default(20)
    .describe('Jumlah data per halaman'),

  // Filters
  status: z
    .enum([
      'tertunda',
      'diterima',
      'dalam_produksi',
      'kontrol_kualitas',
      'siap',
      'dikirim',
      'terkirim',
      'dibatalkan',
    ])
    .optional()
    .describe('Filter berdasarkan status pesanan'),

  idPemesan: z
    .string()
    .uuid('ID pemesan harus berupa UUID')
    .optional()
    .describe('Filter berdasarkan ID pemesan/penulis'),

  idNaskah: z
    .string()
    .uuid('ID naskah harus berupa UUID')
    .optional()
    .describe('Filter berdasarkan ID naskah'),

  nomorPesanan: z.string().optional().describe('Filter berdasarkan nomor pesanan'),

  tanggalMulai: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Filter pesanan dari tanggal ini (inclusive)'),

  tanggalSelesai: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Filter pesanan sampai tanggal ini (inclusive)'),

  // Search
  cari: z.string().optional().describe('Pencarian berdasarkan nomor pesanan atau catatan'),

  // Sorting
  urutkan: z
    .enum(['tanggalPesan', 'hargaTotal', 'jumlah', 'status'])
    .optional()
    .default('tanggalPesan')
    .describe('Field untuk sorting'),

  arah: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('Arah sorting (ascending/descending)'),
});

export type FilterPesananDto = z.infer<typeof FilterPesananSchema>;

/**
 * Class untuk Swagger documentation
 */
export class FilterPesananDtoClass implements FilterPesananDto {
  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  halaman!: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  limit!: number;

  @ApiProperty({
    description: 'Filter berdasarkan status pesanan',
    enum: [
      'tertunda',
      'diterima',
      'dalam_produksi',
      'kontrol_kualitas',
      'siap',
      'dikirim',
      'terkirim',
      'dibatalkan',
    ],
    example: 'dalam_produksi',
    required: false,
  })
  status?:
    | 'tertunda'
    | 'diterima'
    | 'dalam_produksi'
    | 'kontrol_kualitas'
    | 'siap'
    | 'dikirim'
    | 'terkirim'
    | 'dibatalkan';

  @ApiProperty({
    description: 'Filter berdasarkan ID pemesan',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  idPemesan?: string;

  @ApiProperty({
    description: 'Filter berdasarkan ID naskah',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  idNaskah?: string;

  @ApiProperty({
    description: 'Filter berdasarkan nomor pesanan',
    example: 'PO-2024-001',
    required: false,
  })
  nomorPesanan?: string;

  @ApiProperty({
    description: 'Filter pesanan dari tanggal ini (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
    required: false,
  })
  tanggalMulai?: string;

  @ApiProperty({
    description: 'Filter pesanan sampai tanggal ini (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
    format: 'date-time',
    required: false,
  })
  tanggalSelesai?: string;

  @ApiProperty({
    description: 'Pencarian berdasarkan nomor pesanan atau catatan',
    example: 'urgent',
    required: false,
  })
  cari?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    enum: ['tanggalPesan', 'hargaTotal', 'jumlah', 'status'],
    example: 'tanggalPesan',
    default: 'tanggalPesan',
    required: false,
  })
  urutkan!: 'tanggalPesan' | 'hargaTotal' | 'jumlah' | 'status';

  @ApiProperty({
    description: 'Arah sorting',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
    required: false,
  })
  arah!: 'asc' | 'desc';
}
