import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsUUID, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  IsOptional, 
  Min, 
  Max, 
  MinLength, 
  MaxLength 
} from 'class-validator';

/**
 * DTO untuk membuat pesanan cetak buku
 * Digunakan oleh penulis untuk memesan cetak fisik naskah yang sudah diterbitkan
 */
export const BuatPesananSchema = z.object({
  idNaskah: z
    .string()
    .uuid('ID naskah harus berupa UUID yang valid')
    .describe('ID naskah yang akan dicetak'),

  idPercetakan: z
    .string()
    .uuid('ID percetakan harus berupa UUID yang valid')
    .describe('ID percetakan yang dipilih untuk mencetak'),

  jumlah: z
    .number()
    .int('Jumlah harus berupa bilangan bulat')
    .positive('Jumlah harus lebih dari 0')
    .max(10000, 'Jumlah maksimal 10.000 eksemplar')
    .describe('Jumlah eksemplar yang dicetak'),

  formatKertas: z
    .enum(['A4', 'A5', 'B5'])
    .describe('Format/ukuran kertas cetak'),

  jenisKertas: z
    .enum(['HVS', 'BOOKPAPER', 'ART_PAPER'])
    .describe('Jenis kertas yang digunakan'),

  jenisCover: z
    .enum(['SOFTCOVER', 'HARDCOVER'])
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
 * Class untuk Swagger documentation dan validation
 */
export class BuatPesananDtoClass {
  @IsUUID('4', { message: 'ID naskah harus berupa UUID yang valid' })
  @ApiProperty({
    description: 'ID naskah yang akan dicetak (harus berstatus diterbitkan)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  idNaskah!: string;

  @IsUUID('4', { message: 'ID percetakan harus berupa UUID yang valid' })
  @ApiProperty({
    description: 'ID percetakan yang dipilih',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  idPercetakan!: string;

  @IsNumber({}, { message: 'Jumlah harus berupa angka' })
  @Min(1, { message: 'Jumlah minimal 1 eksemplar' })
  @Max(10000, { message: 'Jumlah maksimal 10.000 eksemplar' })
  @ApiProperty({
    description: 'Jumlah eksemplar yang dicetak',
    example: 100,
    minimum: 1,
    maximum: 10000,
  })
  jumlah!: number;

  @IsEnum(['A4', 'A5', 'B5'], { message: 'Format kertas harus A4, A5, atau B5' })
  @ApiProperty({
    description: 'Format/ukuran kertas',
    enum: ['A4', 'A5', 'B5'],
    example: 'A5',
  })
  formatKertas!: 'A4' | 'A5' | 'B5';

  @IsEnum(['HVS', 'BOOKPAPER', 'ART_PAPER'], { message: 'Jenis kertas tidak valid' })
  @ApiProperty({
    description: 'Jenis kertas yang digunakan',
    enum: ['HVS', 'BOOKPAPER', 'ART_PAPER'],
    example: 'HVS',
  })
  jenisKertas!: 'HVS' | 'BOOKPAPER' | 'ART_PAPER';

  @IsEnum(['SOFTCOVER', 'HARDCOVER'], { message: 'Jenis cover harus SOFTCOVER atau HARDCOVER' })
  @ApiProperty({
    description: 'Jenis cover/jilid buku',
    enum: ['SOFTCOVER', 'HARDCOVER'],
    example: 'SOFTCOVER',
  })
  jenisCover!: 'SOFTCOVER' | 'HARDCOVER';

  @IsOptional()
  @IsArray({ message: 'Finishing tambahan harus berupa array' })
  @ApiProperty({
    description: 'Finishing tambahan untuk cover',
    enum: ['Laminasi Glossy', 'Laminasi Doff', 'Emboss', 'Deboss', 'Spot UV', 'Foil', 'Tidak Ada'],
    isArray: true,
    required: false,
    default: [],
    example: ['Laminasi Glossy', 'Spot UV'],
  })
  finishingTambahan?: Array<
    'Laminasi Glossy' | 'Laminasi Doff' | 'Emboss' | 'Deboss' | 'Spot UV' | 'Foil' | 'Tidak Ada'
  >;

  @IsOptional()
  @IsString({ message: 'Catatan harus berupa teks' })
  @MaxLength(1000, { message: 'Catatan maksimal 1000 karakter' })
  @ApiProperty({
    description: 'Catatan tambahan untuk pesanan',
    example: 'Mohon diproses dengan hati-hati',
    required: false,
    maxLength: 1000,
  })
  catatan?: string;

  @IsString({ message: 'Alamat pengiriman harus berupa teks' })
  @MinLength(10, { message: 'Alamat pengiriman minimal 10 karakter' })
  @MaxLength(500, { message: 'Alamat pengiriman maksimal 500 karakter' })
  @ApiProperty({
    description: 'Alamat lengkap pengiriman',
    example: 'Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan Sukamaju, Kecamatan Bandung Utara, Kota Bandung, Jawa Barat 40123',
    minLength: 10,
    maxLength: 500,
  })
  alamatPengiriman!: string;

  @IsString({ message: 'Nama penerima harus berupa teks' })
  @MinLength(3, { message: 'Nama penerima minimal 3 karakter' })
  @MaxLength(100, { message: 'Nama penerima maksimal 100 karakter' })
  @ApiProperty({
    description: 'Nama lengkap penerima',
    example: 'Budi Santoso',
    minLength: 3,
    maxLength: 100,
  })
  namaPenerima!: string;

  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @MinLength(8, { message: 'Nomor telepon minimal 8 karakter' })
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  @ApiProperty({
    description: 'Nomor telepon penerima',
    example: '081234567890',
    minLength: 8,
    maxLength: 20,
  })
  teleponPenerima!: string;
}
