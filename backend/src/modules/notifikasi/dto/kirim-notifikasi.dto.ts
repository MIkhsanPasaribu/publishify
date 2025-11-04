import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema untuk mengirim notifikasi ke pengguna
 * Digunakan oleh service untuk emit notifikasi real-time dan simpan ke database
 */
export const KirimNotifikasiSchema = z.object({
  idPengguna: z
    .string()
    .uuid('ID pengguna harus berupa UUID valid')
    .describe('ID pengguna penerima notifikasi'),

  judul: z
    .string()
    .min(1, 'Judul notifikasi wajib diisi')
    .max(200, 'Judul notifikasi maksimal 200 karakter')
    .describe('Judul notifikasi'),

  pesan: z
    .string()
    .min(1, 'Pesan notifikasi wajib diisi')
    .max(1000, 'Pesan notifikasi maksimal 1000 karakter')
    .describe('Isi pesan notifikasi'),

  tipe: z
    .enum(['info', 'sukses', 'peringatan', 'error'])
    .default('info')
    .describe('Tipe notifikasi: info, sukses, peringatan, error'),

  url: z
    .string()
    .url('URL harus valid')
    .optional()
    .describe('URL untuk redirect ketika notifikasi diklik'),
});

export type KirimNotifikasiDto = z.infer<typeof KirimNotifikasiSchema>;

/**
 * Class untuk Swagger documentation
 */
export class KirimNotifikasiDtoClass implements KirimNotifikasiDto {
  @ApiProperty({
    description: 'ID pengguna penerima notifikasi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  idPengguna!: string;

  @ApiProperty({
    description: 'Judul notifikasi',
    example: 'Pembayaran Berhasil',
    maxLength: 200,
  })
  judul!: string;

  @ApiProperty({
    description: 'Isi pesan notifikasi',
    example: 'Pembayaran untuk pesanan #TRX-20250129-1234 telah dikonfirmasi',
    maxLength: 1000,
  })
  pesan!: string;

  @ApiProperty({
    description: 'Tipe notifikasi',
    enum: ['info', 'sukses', 'peringatan', 'error'],
    default: 'info',
    example: 'sukses',
  })
  tipe!: 'info' | 'sukses' | 'peringatan' | 'error';

  @ApiProperty({
    description: 'URL untuk redirect ketika notifikasi diklik',
    example: '/pembayaran/123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  url?: string;
}
