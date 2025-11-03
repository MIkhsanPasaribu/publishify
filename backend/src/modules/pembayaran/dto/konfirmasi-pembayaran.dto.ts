import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk konfirmasi pembayaran oleh admin/percetakan
 * Digunakan untuk menerima atau menolak pembayaran
 */
export const KonfirmasiPembayaranSchema = z.object({
  diterima: z.boolean().describe('Apakah pembayaran diterima atau ditolak'),

  catatan: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .describe('Catatan konfirmasi (wajib jika ditolak)'),
});

export type KonfirmasiPembayaranDto = z.infer<typeof KonfirmasiPembayaranSchema>;

/**
 * Class untuk Swagger documentation
 */
export class KonfirmasiPembayaranDtoClass implements KonfirmasiPembayaranDto {
  @ApiProperty({
    description: 'Apakah pembayaran diterima atau ditolak',
    example: true,
  })
  diterima!: boolean;

  @ApiProperty({
    description: 'Catatan konfirmasi (wajib jika ditolak)',
    example: 'Bukti transfer tidak valid',
    required: false,
    maxLength: 500,
  })
  catatan?: string;
}
