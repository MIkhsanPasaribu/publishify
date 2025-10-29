import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk verifikasi email
 */
export const VerifikasiEmailSchema = z.object({
  token: z.string({
    required_error: 'Token verifikasi wajib diisi',
  }),
});

/**
 * Type inference dari Zod schema
 */
export type VerifikasiEmailDto = z.infer<typeof VerifikasiEmailSchema>;

/**
 * Class untuk Swagger documentation
 */
export class VerifikasiEmailDtoClass {
  @ApiProperty({
    description: 'Token verifikasi email yang diterima via email',
    example: 'abc123def456...',
    type: String,
  })
  token: string;
}
