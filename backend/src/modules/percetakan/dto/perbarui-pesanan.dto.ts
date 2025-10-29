import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk memperbarui detail pesanan cetak
 * Hanya digunakan sebelum pesanan dikonfirmasi (masih status tertunda)
 */
export const PerbaruiPesananSchema = z.object({
  jumlah: z
    .number()
    .int('Jumlah harus berupa bilangan bulat')
    .positive('Jumlah harus lebih dari 0')
    .max(10000, 'Jumlah maksimal 10.000 eksemplar')
    .optional()
    .describe('Jumlah eksemplar yang dicetak'),

  formatKertas: z
    .enum(['A4', 'A5', 'B5', 'Letter', 'Custom'])
    .optional()
    .describe('Format/ukuran kertas cetak'),

  jenisKertas: z
    .enum(['HVS 70gr', 'HVS 80gr', 'Art Paper 120gr', 'Art Paper 150gr', 'Bookpaper'])
    .optional()
    .describe('Jenis kertas yang digunakan'),

  jenisCover: z
    .enum(['Soft Cover', 'Hard Cover', 'Board Cover'])
    .optional()
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
    .describe('Finishing tambahan untuk cover'),

  catatan: z
    .string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .optional()
    .describe('Catatan tambahan untuk pesanan'),
});

export type PerbaruiPesananDto = z.infer<typeof PerbaruiPesananSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiPesananDtoClass implements PerbaruiPesananDto {
  @ApiProperty({
    description: 'Jumlah eksemplar yang dicetak',
    example: 150,
    minimum: 1,
    maximum: 10000,
    required: false,
  })
  jumlah?: number;

  @ApiProperty({
    description: 'Format/ukuran kertas',
    enum: ['A4', 'A5', 'B5', 'Letter', 'Custom'],
    example: 'A5',
    required: false,
  })
  formatKertas?: 'A4' | 'A5' | 'B5' | 'Letter' | 'Custom';

  @ApiProperty({
    description: 'Jenis kertas yang digunakan',
    enum: ['HVS 70gr', 'HVS 80gr', 'Art Paper 120gr', 'Art Paper 150gr', 'Bookpaper'],
    example: 'Bookpaper',
    required: false,
  })
  jenisKertas?: 'HVS 70gr' | 'HVS 80gr' | 'Art Paper 120gr' | 'Art Paper 150gr' | 'Bookpaper';

  @ApiProperty({
    description: 'Jenis cover/jilid buku',
    enum: ['Soft Cover', 'Hard Cover', 'Board Cover'],
    example: 'Hard Cover',
    required: false,
  })
  jenisCover?: 'Soft Cover' | 'Hard Cover' | 'Board Cover';

  @ApiProperty({
    description: 'Finishing tambahan untuk cover',
    enum: ['Laminasi Glossy', 'Laminasi Doff', 'Emboss', 'Deboss', 'Spot UV', 'Foil', 'Tidak Ada'],
    isArray: true,
    required: false,
    example: ['Laminasi Doff'],
  })
  finishingTambahan?: Array<
    'Laminasi Glossy' | 'Laminasi Doff' | 'Emboss' | 'Deboss' | 'Spot UV' | 'Foil' | 'Tidak Ada'
  >;

  @ApiProperty({
    description: 'Catatan tambahan untuk pesanan',
    example: 'Mohon gunakan kertas terbaik',
    required: false,
    maxLength: 1000,
  })
  catatan?: string;
}
