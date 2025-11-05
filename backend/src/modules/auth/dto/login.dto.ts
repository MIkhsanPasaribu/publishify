import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '@prisma/client';

/**
 * Schema Zod untuk validasi login
 */
export const LoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email wajib diisi',
    })
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),

  kataSandi: z.string({
    required_error: 'Kata sandi wajib diisi',
  }),

  platform: z.enum([Platform.web, Platform.mobile]).optional().default(Platform.web),
});

/**
 * Type inference dari Zod schema
 */
export type LoginDto = z.infer<typeof LoginSchema>;

/**
 * Class untuk Swagger documentation
 */
export class LoginDtoClass {
  @ApiProperty({
    description: 'Alamat email pengguna',
    example: 'penulis@publishify.com',
    type: String,
  })
  email!: string;

  @ApiProperty({
    description: 'Kata sandi pengguna',
    example: 'Password123!',
    type: String,
  })
  kataSandi!: string;

  @ApiProperty({
    description: 'Platform yang digunakan (web atau mobile)',
    example: 'web',
    enum: Platform,
    required: false,
    default: 'web',
  })
  platform?: Platform;
}
