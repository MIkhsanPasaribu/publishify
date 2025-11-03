import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk webhook payment gateway
 * Digunakan untuk menerima notifikasi dari payment gateway (Midtrans, Xendit, dll)
 */
export const WebhookPembayaranSchema = z.object({
  nomorTransaksi: z.string().describe('Nomor transaksi dari sistem'),

  externalId: z.string().optional().describe('ID transaksi dari payment gateway'),

  status: z
    .enum(['pending', 'success', 'failed', 'cancelled', 'refunded'])
    .describe('Status dari payment gateway'),

  jumlah: z.number().positive('Jumlah harus lebih dari 0').optional().describe('Jumlah pembayaran'),

  metodePembayaran: z.string().optional().describe('Metode pembayaran dari gateway'),

  tanggalPembayaran: z
    .string()
    .datetime('Format tanggal harus ISO 8601')
    .optional()
    .describe('Tanggal pembayaran dari gateway'),

  signature: z.string().optional().describe('Signature untuk verifikasi webhook'),

  rawData: z.record(z.any()).optional().describe('Data mentah dari webhook untuk logging'),
});

export type WebhookPembayaranDto = z.infer<typeof WebhookPembayaranSchema>;

/**
 * Class untuk Swagger documentation
 */
export class WebhookPembayaranDtoClass implements WebhookPembayaranDto {
  @ApiProperty({
    description: 'Nomor transaksi dari sistem',
    example: 'TRX-20240129-1234',
  })
  nomorTransaksi!: string;

  @ApiProperty({
    description: 'ID transaksi dari payment gateway',
    example: 'midtrans-order-12345',
    required: false,
  })
  externalId?: string;

  @ApiProperty({
    description: 'Status dari payment gateway',
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
    example: 'success',
  })
  status!: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';

  @ApiProperty({
    description: 'Jumlah pembayaran',
    example: 15000000,
    required: false,
  })
  jumlah?: number;

  @ApiProperty({
    description: 'Metode pembayaran dari gateway',
    example: 'bank_transfer',
    required: false,
  })
  metodePembayaran?: string;

  @ApiProperty({
    description: 'Tanggal pembayaran dari gateway (ISO 8601)',
    example: '2024-01-29T10:30:00Z',
    format: 'date-time',
    required: false,
  })
  tanggalPembayaran?: string;

  @ApiProperty({
    description: 'Signature untuk verifikasi webhook',
    example: 'abc123def456...',
    required: false,
  })
  signature?: string;

  @ApiProperty({
    description: 'Data mentah dari webhook',
    example: { transaction_id: '12345', payment_type: 'bank_transfer' },
    required: false,
  })
  rawData?: Record<string, any>;
}
