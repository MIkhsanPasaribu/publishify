import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk reset password
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string({
      required_error: 'Token reset password wajib diisi',
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
  });

/**
 * Type inference dari Zod schema
 */
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

/**
 * Class untuk Swagger documentation
 */
export class ResetPasswordDtoClass {
  @ApiProperty({
    description: 'Token reset password yang diterima via email',
    example: 'abc123def456...',
    type: String,
  })
  token: string;

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
