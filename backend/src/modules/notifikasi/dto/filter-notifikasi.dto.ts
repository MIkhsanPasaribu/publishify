import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema untuk filter notifikasi dengan pagination
 * Digunakan untuk mendapatkan daftar notifikasi pengguna
 */
export const FilterNotifikasiSchema = z.object({
  // Pagination
  halaman: z
    .number()
    .int('Halaman harus berupa bilangan bulat')
    .positive('Halaman harus lebih dari 0')
    .default(1)
    .describe('Nomor halaman untuk pagination'),

  limit: z
    .number()
    .int('Limit harus berupa bilangan bulat')
    .positive('Limit harus lebih dari 0')
    .max(100, 'Limit maksimal 100')
    .default(20)
    .describe('Jumlah item per halaman'),

  // Filter berdasarkan status dibaca
  dibaca: z
    .boolean()
    .optional()
    .describe(
      'Filter notifikasi berdasarkan status dibaca (true = sudah dibaca, false = belum dibaca)',
    ),

  // Filter berdasarkan tipe notifikasi
  tipe: z
    .enum(['info', 'sukses', 'peringatan', 'error'])
    .optional()
    .describe('Filter berdasarkan tipe notifikasi'),

  // Date range filter
  tanggalMulai: z
    .string()
    .datetime('Format tanggal tidak valid, gunakan ISO 8601')
    .optional()
    .describe('Filter notifikasi sejak tanggal tertentu'),

  tanggalSelesai: z
    .string()
    .datetime('Format tanggal tidak valid, gunakan ISO 8601')
    .optional()
    .describe('Filter notifikasi sampai tanggal tertentu'),

  // Sorting
  urutkan: z
    .enum(['dibuatPada', 'dibaca'])
    .default('dibuatPada')
    .describe('Field untuk sorting: dibuatPada, dibaca'),

  arah: z
    .enum(['asc', 'desc'])
    .default('desc')
    .describe('Arah sorting: asc (ascending) atau desc (descending)'),
});

export type FilterNotifikasiDto = z.infer<typeof FilterNotifikasiSchema>;

/**
 * Class untuk Swagger documentation
 */
export class FilterNotifikasiDtoClass implements FilterNotifikasiDto {
  @ApiProperty({
    description: 'Nomor halaman untuk pagination',
    example: 1,
    default: 1,
  })
  halaman!: number;

  @ApiProperty({
    description: 'Jumlah item per halaman',
    example: 20,
    default: 20,
    maximum: 100,
  })
  limit!: number;

  @ApiProperty({
    description: 'Filter notifikasi berdasarkan status dibaca',
    example: false,
    required: false,
  })
  dibaca?: boolean;

  @ApiProperty({
    description: 'Filter berdasarkan tipe notifikasi',
    enum: ['info', 'sukses', 'peringatan', 'error'],
    example: 'sukses',
    required: false,
  })
  tipe?: 'info' | 'sukses' | 'peringatan' | 'error';

  @ApiProperty({
    description: 'Filter notifikasi sejak tanggal tertentu',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  tanggalMulai?: string;

  @ApiProperty({
    description: 'Filter notifikasi sampai tanggal tertentu',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  tanggalSelesai?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    enum: ['dibuatPada', 'dibaca'],
    default: 'dibuatPada',
    example: 'dibuatPada',
  })
  urutkan!: 'dibuatPada' | 'dibaca';

  @ApiProperty({
    description: 'Arah sorting',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  arah!: 'asc' | 'desc';
}
