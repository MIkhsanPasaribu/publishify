import { z } from 'zod';

/**
 * Schema validasi untuk konfirmasi penerimaan pesanan
 */
export const KonfirmasiPenerimaanSchema = z.object({
  catatan: z.string().optional(),
});

export type KonfirmasiPenerimaanDto = z.infer<typeof KonfirmasiPenerimaanSchema>;

// Class DTO untuk Swagger documentation
export class KonfirmasiPenerimaanDtoClass {
  catatan?: string;
}
