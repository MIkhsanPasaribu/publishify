import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

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
  email: string;

  @ApiProperty({
    description: 'Kata sandi pengguna',
    example: 'Password123!',
    type: String,
  })
  kataSandi: string;
}
