import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk filter dan pagination pembayaran
 * Digunakan untuk listing pembayaran dengan berbagai filter
 */
export const FilterPembayaranSchema = z.object({
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
    .describe('Jumlah data per halaman'),

  // Filters
  status: z
    .enum(['tertunda', 'diproses', 'berhasil', 'gagal', 'dibatalkan', 'dikembalikan'])
    .optional()
    .describe('Filter berdasarkan status pembayaran'),

  metodePembayaran: z
    .enum(['transfer_bank', 'kartu_kredit', 'e_wallet', 'virtual_account', 'cod'])
    .optional()
    .describe('Filter berdasarkan metode pembayaran'),

  idPengguna: z
    .string()
    .uuid('ID pengguna harus berupa UUID')
    .optional()
    .describe('Filter berdasarkan ID pengguna'),

  idPesanan: z
    .string()
    .uuid('ID pesanan harus berupa UUID')
    .optional()
    .describe('Filter berdasarkan ID pesanan'),

  nomorTransaksi: z.string().optional().describe('Filter berdasarkan nomor transaksi'),

  tanggalMulai: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Filter pembayaran dari tanggal ini (inclusive)'),

  tanggalSelesai: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Filter pembayaran sampai tanggal ini (inclusive)'),

  // Sorting
  urutkan: z
    .enum(['dibuatPada', 'tanggalPembayaran', 'jumlah', 'status'])
    .optional()
    .default('dibuatPada')
    .describe('Field untuk sorting'),

  arah: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('Arah sorting (ascending/descending)'),
});

export type FilterPembayaranDto = z.infer<typeof FilterPembayaranSchema>;

/**
 * Class untuk Swagger documentation
 */
export class FilterPembayaranDtoClass implements FilterPembayaranDto {
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
    description: 'Filter berdasarkan status pembayaran',
    enum: ['tertunda', 'diproses', 'berhasil', 'gagal', 'dibatalkan', 'dikembalikan'],
    example: 'berhasil',
    required: false,
  })
  status?: 'tertunda' | 'diproses' | 'berhasil' | 'gagal' | 'dibatalkan' | 'dikembalikan';

  @ApiProperty({
    description: 'Filter berdasarkan metode pembayaran',
    enum: ['transfer_bank', 'kartu_kredit', 'e_wallet', 'virtual_account', 'cod'],
    example: 'transfer_bank',
    required: false,
  })
  metodePembayaran?: 'transfer_bank' | 'kartu_kredit' | 'e_wallet' | 'virtual_account' | 'cod';

  @ApiProperty({
    description: 'Filter berdasarkan ID pengguna',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  idPengguna?: string;

  @ApiProperty({
    description: 'Filter berdasarkan ID pesanan',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  idPesanan?: string;

  @ApiProperty({
    description: 'Filter berdasarkan nomor transaksi',
    example: 'TRX-20240129-1234',
    required: false,
  })
  nomorTransaksi?: string;

  @ApiProperty({
    description: 'Filter pembayaran dari tanggal ini (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
    required: false,
  })
  tanggalMulai?: string;

  @ApiProperty({
    description: 'Filter pembayaran sampai tanggal ini (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
    format: 'date-time',
    required: false,
  })
  tanggalSelesai?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    enum: ['dibuatPada', 'tanggalPembayaran', 'jumlah', 'status'],
    example: 'dibuatPada',
    default: 'dibuatPada',
    required: false,
  })
  urutkan!: 'dibuatPada' | 'tanggalPembayaran' | 'jumlah' | 'status';

  @ApiProperty({
    description: 'Arah sorting',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
    required: false,
  })
  arah!: 'asc' | 'desc';
}
