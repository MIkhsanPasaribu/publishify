import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk Penulis atur harga jual
 */
export const AturHargaJualSchema = z.object({
  hargaJual: z
    .number({
      required_error: 'Harga jual wajib diisi',
    })
    .positive('Harga jual harus lebih dari 0')
    .min(0, 'Harga jual minimal 0'),
});

/**
 * Type inference dari Zod schema
 */
export type AturHargaJualDto = z.infer<typeof AturHargaJualSchema>;

/**
 * Class untuk Swagger documentation
 */
export class AturHargaJualDtoClass {
  @ApiProperty({
    description: 'Harga jual buku yang ditentukan penulis (dalam Rupiah)',
    example: 50000,
    type: Number,
  })
  hargaJual!: number;
}
