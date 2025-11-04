import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk membuat data pengiriman pesanan
 * Digunakan ketika pesanan siap dikirim
 */
export const BuatPengirimanSchema = z.object({
  namaEkspedisi: z
    .string()
    .min(3, 'Nama ekspedisi minimal 3 karakter')
    .max(100, 'Nama ekspedisi maksimal 100 karakter')
    .describe('Nama jasa ekspedisi yang digunakan'),

  nomorResi: z
    .string()
    .min(5, 'Nomor resi minimal 5 karakter')
    .max(50, 'Nomor resi maksimal 50 karakter')
    .optional()
    .describe('Nomor resi pengiriman'),

  biayaPengiriman: z
    .number()
    .nonnegative('Biaya pengiriman tidak boleh negatif')
    .describe('Biaya pengiriman dalam rupiah'),

  alamatTujuan: z
    .string()
    .min(10, 'Alamat tujuan minimal 10 karakter')
    .max(500, 'Alamat tujuan maksimal 500 karakter')
    .describe('Alamat lengkap tujuan pengiriman'),

  namaPenerima: z
    .string()
    .min(3, 'Nama penerima minimal 3 karakter')
    .max(100, 'Nama penerima maksimal 100 karakter')
    .describe('Nama penerima paket'),

  teleponPenerima: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format telepon tidak valid')
    .describe('Nomor telepon penerima'),

  estimasiTiba: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Estimasi tanggal tiba paket'),
});

export type BuatPengirimanDto = z.infer<typeof BuatPengirimanSchema>;

/**
 * Class untuk Swagger documentation
 */
export class BuatPengirimanDtoClass implements BuatPengirimanDto {
  @ApiProperty({
    description: 'Nama jasa ekspedisi',
    example: 'JNE Express',
    minLength: 3,
    maxLength: 100,
  })
  namaEkspedisi!: string;

  @ApiProperty({
    description: 'Nomor resi pengiriman',
    example: 'JNE123456789',
    minLength: 5,
    maxLength: 50,
    required: false,
  })
  nomorResi?: string;

  @ApiProperty({
    description: 'Biaya pengiriman dalam rupiah',
    example: 50000,
    minimum: 0,
  })
  biayaPengiriman!: number;

  @ApiProperty({
    description: 'Alamat lengkap tujuan pengiriman',
    example: 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
    minLength: 10,
    maxLength: 500,
  })
  alamatTujuan!: string;

  @ApiProperty({
    description: 'Nama penerima paket',
    example: 'Ahmad Budiman',
    minLength: 3,
    maxLength: 100,
  })
  namaPenerima!: string;

  @ApiProperty({
    description: 'Nomor telepon penerima (format Indonesia)',
    example: '081234567890',
    pattern: '^(\\+62|62|0)[0-9]{9,12}$',
  })
  teleponPenerima!: string;

  @ApiProperty({
    description: 'Estimasi tanggal tiba paket (ISO 8601)',
    example: '2024-02-20T00:00:00Z',
    format: 'date-time',
    required: false,
  })
  estimasiTiba?: string;
}
