import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk konfirmasi pesanan oleh percetakan
 * Digunakan ketika percetakan menerima dan mengkonfirmasi pesanan
 */
export const KonfirmasiPesananSchema = z.object({
  diterima: z.boolean().describe('Apakah pesanan diterima atau ditolak'),

  hargaTotal: z
    .number()
    .positive('Harga total harus lebih dari 0')
    .optional()
    .describe('Harga total yang dikonfirmasi (bisa berbeda dari kalkulasi awal)'),

  estimasiSelesai: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Estimasi tanggal selesai produksi'),

  catatan: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .describe('Catatan dari percetakan'),
});

export type KonfirmasiPesananDto = z.infer<typeof KonfirmasiPesananSchema>;

/**
 * Class untuk Swagger documentation
 */
export class KonfirmasiPesananDtoClass implements KonfirmasiPesananDto {
  @ApiProperty({
    description: 'Apakah pesanan diterima atau ditolak',
    example: true,
  })
  diterima: boolean;

  @ApiProperty({
    description: 'Harga total yang dikonfirmasi oleh percetakan',
    example: 15000000,
    minimum: 1,
    required: false,
  })
  hargaTotal?: number;

  @ApiProperty({
    description: 'Estimasi tanggal selesai produksi (ISO 8601)',
    example: '2024-03-01T00:00:00Z',
    format: 'date-time',
    required: false,
  })
  estimasiSelesai?: string;

  @ApiProperty({
    description: 'Catatan dari percetakan',
    example: 'Pesanan dapat dikerjakan dengan estimasi 2 minggu',
    required: false,
    maxLength: 500,
  })
  catatan?: string;
}
