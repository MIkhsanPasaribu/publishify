import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk ganti password
 */
export const GantiPasswordSchema = z
  .object({
    kataSandiLama: z.string({
      required_error: 'Kata sandi lama wajib diisi',
    }),

    kataSandiBaru: z
      .string({
        required_error: 'Kata sandi baru wajib diisi',
      })
      .min(8, 'Kata sandi minimal 8 karakter')
      .max(100, 'Kata sandi maksimal 100 karakter')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka',
      ),

    konfirmasiKataSandiBaru: z.string({
      required_error: 'Konfirmasi kata sandi baru wajib diisi',
    }),
  })
  .refine((data) => data.kataSandiBaru === data.konfirmasiKataSandiBaru, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['konfirmasiKataSandiBaru'],
  })
  .refine((data) => data.kataSandiLama !== data.kataSandiBaru, {
    message: 'Kata sandi baru harus berbeda dengan kata sandi lama',
    path: ['kataSandiBaru'],
  });

/**
 * Type inference dari Zod schema
 */
export type GantiPasswordDto = z.infer<typeof GantiPasswordSchema>;

/**
 * Class untuk Swagger documentation
 */
export class GantiPasswordDtoClass {
  @ApiProperty({
    description: 'Kata sandi lama pengguna',
    example: 'OldPassword123!',
    type: String,
  })
  kataSandiLama: string;

  @ApiProperty({
    description: 'Kata sandi baru (minimal 8 karakter, harus ada huruf besar, kecil, dan angka)',
    example: 'NewPassword123!',
    minLength: 8,
    maxLength: 100,
    type: String,
  })
  kataSandiBaru: string;

  @ApiProperty({
    description: 'Konfirmasi kata sandi baru (harus sama dengan kata sandi baru)',
    example: 'NewPassword123!',
    type: String,
  })
  konfirmasiKataSandiBaru: string;
}
