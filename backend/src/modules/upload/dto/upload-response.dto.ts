import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO untuk upload berhasil
 */
export class UploadResponseDto {
  @ApiProperty({
    description: 'ID file yang diupload',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nama file asli',
    example: 'naskah-buku-saya.pdf',
  })
  namaFileAsli: string;

  @ApiProperty({
    description: 'Nama file yang disimpan di server',
    example: '2024-01-15_naskah-buku-saya_abc123.pdf',
  })
  namaFileSimpan: string;

  @ApiProperty({
    description: 'URL untuk mengakses file',
    example: '/uploads/naskah/2024-01-15_naskah-buku-saya_abc123.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'URL publik jika file bisa diakses publik',
    example: 'https://cdn.publishify.com/uploads/naskah/2024-01-15_naskah-buku-saya_abc123.pdf',
    required: false,
  })
  urlPublik?: string;

  @ApiProperty({
    description: 'Ukuran file dalam bytes',
    example: 1048576,
  })
  ukuran: number;

  @ApiProperty({
    description: 'MIME type file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Ekstensi file',
    example: '.pdf',
  })
  ekstensi: string;

  @ApiProperty({
    description: 'Tujuan upload (naskah/sampul/gambar/dokumen)',
    example: 'naskah',
  })
  tujuan: string;

  @ApiProperty({
    description: 'Path lengkap file di server',
    example: '/uploads/naskah/2024-01-15_naskah-buku-saya_abc123.pdf',
  })
  path: string;

  @ApiProperty({
    description: 'Timestamp upload',
    example: '2024-01-15T10:30:00.000Z',
  })
  diuploadPada: Date;
}

/**
 * Response DTO untuk multiple upload
 */
export class UploadMultipleResponseDto {
  @ApiProperty({
    description: 'Daftar file yang berhasil diupload',
    type: [UploadResponseDto],
  })
  berhasil: UploadResponseDto[];

  @ApiProperty({
    description: 'Daftar file yang gagal diupload',
    type: [Object],
    example: [
      {
        namaFile: 'invalid-file.exe',
        error: 'Tipe file tidak diperbolehkan',
      },
    ],
  })
  gagal: Array<{
    namaFile: string;
    error: string;
  }>;

  @ApiProperty({
    description: 'Total file yang berhasil diupload',
    example: 3,
  })
  totalBerhasil: number;

  @ApiProperty({
    description: 'Total file yang gagal diupload',
    example: 1,
  })
  totalGagal: number;
}
