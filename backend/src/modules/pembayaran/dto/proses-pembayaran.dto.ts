import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk memproses pembayaran pesanan cetak
 * Digunakan oleh penulis untuk melakukan pembayaran pesanan
 */
export const ProsesPembayaranSchema = z.object({
  idPesanan: z
    .string()
    .uuid('ID pesanan harus berupa UUID yang valid')
    .describe('ID pesanan yang akan dibayar'),

  metodePembayaran: z
    .enum(['transfer_bank', 'kartu_kredit', 'e_wallet', 'virtual_account', 'cod'])
    .describe('Metode pembayaran yang dipilih'),

  urlBukti: z
    .string()
    .url('URL bukti pembayaran harus valid')
    .optional()
    .describe('URL bukti transfer (untuk transfer_bank)'),

  catatanPembayaran: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .describe('Catatan tambahan untuk pembayaran'),
});

export type ProsesPembayaranDto = z.infer<typeof ProsesPembayaranSchema>;

/**
 * Class untuk Swagger documentation
 */
export class ProsesPembayaranDtoClass implements ProsesPembayaranDto {
  @ApiProperty({
    description: 'ID pesanan yang akan dibayar',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  idPesanan: string;

  @ApiProperty({
    description: 'Metode pembayaran yang dipilih',
    enum: ['transfer_bank', 'kartu_kredit', 'e_wallet', 'virtual_account', 'cod'],
    example: 'transfer_bank',
  })
  metodePembayaran: 'transfer_bank' | 'kartu_kredit' | 'e_wallet' | 'virtual_account' | 'cod';

  @ApiProperty({
    description: 'URL bukti transfer (wajib untuk transfer_bank)',
    example: 'https://storage.example.com/bukti-transfer-123.jpg',
    required: false,
  })
  urlBukti?: string;

  @ApiProperty({
    description: 'Catatan tambahan untuk pembayaran',
    example: 'Transfer dari rekening BCA an. John Doe',
    required: false,
    maxLength: 500,
  })
  catatanPembayaran?: string;
}
