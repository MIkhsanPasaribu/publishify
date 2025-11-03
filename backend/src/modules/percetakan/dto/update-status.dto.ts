import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk update status pesanan cetak
 * Digunakan oleh percetakan untuk memperbarui status produksi
 */
export const UpdateStatusSchema = z.object({
  status: z
    .enum(['diterima', 'dalam_produksi', 'kontrol_kualitas', 'siap', 'dikirim', 'terkirim'])
    .describe('Status baru pesanan'),

  catatan: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .describe('Catatan tambahan untuk update status'),

  estimasiSelesai: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Estimasi tanggal selesai (untuk status diterima/dalam_produksi)'),
});

export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;

/**
 * Class untuk Swagger documentation
 */
export class UpdateStatusDtoClass implements UpdateStatusDto {
  @ApiProperty({
    description: 'Status baru pesanan',
    enum: ['diterima', 'dalam_produksi', 'kontrol_kualitas', 'siap', 'dikirim', 'terkirim'],
    example: 'dalam_produksi',
  })
  status!: 'diterima' | 'dalam_produksi' | 'kontrol_kualitas' | 'siap' | 'dikirim' | 'terkirim';

  @ApiProperty({
    description: 'Catatan tambahan untuk update status',
    example: 'Proses cetak dimulai',
    required: false,
    maxLength: 500,
  })
  catatan?: string;

  @ApiProperty({
    description: 'Estimasi tanggal selesai (ISO 8601)',
    example: '2024-02-15T00:00:00Z',
    format: 'date-time',
    required: false,
  })
  estimasiSelesai?: string;
}
