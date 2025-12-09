import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk membuat pesanan cetak buku
 * Digunakan oleh penulis untuk memesan cetak fisik naskah yang sudah diterbitkan
 */
export const BuatPesananSchema = z.object({
  idNaskah: z
    .string()
    .uuid('ID naskah harus berupa UUID yang valid')
    .describe('ID naskah yang akan dicetak'),

  jumlah: z
    .number()
    .int('Jumlah harus berupa bilangan bulat')
    .positive('Jumlah harus lebih dari 0')
    .max(10000, 'Jumlah maksimal 10.000 eksemplar')
    .describe('Jumlah eksemplar yang dicetak'),

  formatKertas: z
    .enum(['A4', 'A5', 'B5', 'Letter', 'Custom'])
    .describe('Format/ukuran kertas cetak'),

  jenisKertas: z
    .enum(['HVS 70gr', 'HVS 80gr', 'Art Paper 120gr', 'Art Paper 150gr', 'Bookpaper'])
    .describe('Jenis kertas yang digunakan'),

  jenisCover: z
    .enum(['Soft Cover', 'Hard Cover', 'Board Cover'])
    .describe('Jenis cover/jilid buku'),

  finishingTambahan: z
    .array(
      z.enum([
        'Laminasi Glossy',
        'Laminasi Doff',
        'Emboss',
        'Deboss',
        'Spot UV',
        'Foil',
        'Tidak Ada',
      ]),
    )
    .optional()
    .default([])
    .describe('Finishing tambahan untuk cover'),

  catatan: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional()
    .describe('Catatan tambahan untuk pesanan'),

  hargaTotal: z
    .number()
    .positive('Harga total harus lebih dari 0')
    .describe('Total harga pesanan cetak'),

  alamatPengiriman: z
    .string()
    .min(10, 'Alamat pengiriman minimal 10 karakter')
    .max(500, 'Alamat pengiriman maksimal 500 karakter')
    .describe('Alamat lengkap pengiriman'),

  namaPenerima: z
    .string()
    .min(3, 'Nama penerima minimal 3 karakter')
    .max(100, 'Nama penerima maksimal 100 karakter')
    .describe('Nama lengkap penerima'),

  teleponPenerima: z
    .string()
    .min(8, 'Nomor telepon minimal 8 karakter')
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .describe('Nomor telepon penerima'),
});

export type BuatPesananDto = z.infer<typeof BuatPesananSchema>;

/**
 * Class untuk Swagger documentation
 */
export class BuatPesananDtoClass implements BuatPesananDto {
  @ApiProperty({
    description: 'ID naskah yang akan dicetak (harus berstatus diterbitkan)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  idNaskah!: string;

  @ApiProperty({
    description: 'Jumlah eksemplar yang dicetak',
    example: 100,
    minimum: 1,
    maximum: 10000,
  })
  jumlah!: number;

  @ApiProperty({
    description: 'Format/ukuran kertas',
    enum: ['A4', 'A5', 'B5', 'Letter', 'Custom'],
    example: 'A5',
  })
  formatKertas!: 'A4' | 'A5' | 'B5' | 'Letter' | 'Custom';

  @ApiProperty({
    description: 'Jenis kertas yang digunakan',
    enum: ['HVS 70gr', 'HVS 80gr', 'Art Paper 120gr', 'Art Paper 150gr', 'Bookpaper'],
    example: 'HVS 80gr',
  })
  jenisKertas!: 'HVS 70gr' | 'HVS 80gr' | 'Art Paper 120gr' | 'Art Paper 150gr' | 'Bookpaper';

  @ApiProperty({
    description: 'Jenis cover/jilid buku',
    enum: ['Soft Cover', 'Hard Cover', 'Board Cover'],
    example: 'Soft Cover',
  })
  jenisCover!: 'Soft Cover' | 'Hard Cover' | 'Board Cover';

  @ApiProperty({
    description: 'Finishing tambahan untuk cover',
    enum: ['Laminasi Glossy', 'Laminasi Doff', 'Emboss', 'Deboss', 'Spot UV', 'Foil', 'Tidak Ada'],
    isArray: true,
    required: false,
    default: [],
    example: ['Laminasi Glossy', 'Spot UV'],
  })
  finishingTambahan!: Array<
    'Laminasi Glossy' | 'Laminasi Doff' | 'Emboss' | 'Deboss' | 'Spot UV' | 'Foil' | 'Tidak Ada'
  >;

  @ApiProperty({
    description: 'Catatan tambahan untuk pesanan',
    example: 'Mohon diproses dengan hati-hati',
    required: false,
    maxLength: 1000,
  })
  catatan?: string;

  @ApiProperty({
    description: 'Total harga pesanan cetak',
    example: 500000,
    minimum: 0,
  })
  hargaTotal!: number;

  @ApiProperty({
    description: 'Alamat lengkap pengiriman',
    example: 'Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan Sukamaju, Kecamatan Bandung Utara, Kota Bandung, Jawa Barat 40123',
    minLength: 10,
    maxLength: 500,
  })
  alamatPengiriman!: string;

  @ApiProperty({
    description: 'Nama lengkap penerima',
    example: 'Budi Santoso',
    minLength: 3,
    maxLength: 100,
  })
  namaPenerima!: string;

  @ApiProperty({
    description: 'Nomor telepon penerima',
    example: '081234567890',
    minLength: 8,
    maxLength: 20,
  })
  teleponPenerima!: string;
}
