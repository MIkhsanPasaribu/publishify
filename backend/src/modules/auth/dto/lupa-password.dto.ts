import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk request lupa password
 */
export const LupaPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'Email wajib diisi',
    })
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),
});

/**
 * Type inference dari Zod schema
 */
export type LupaPasswordDto = z.infer<typeof LupaPasswordSchema>;

/**
 * Class untuk Swagger documentation
 */
export class LupaPasswordDtoClass {
  @ApiProperty({
    description: 'Alamat email pengguna yang lupa password',
    example: 'penulis@publishify.com',
    type: String,
  })
  email: string;
}
