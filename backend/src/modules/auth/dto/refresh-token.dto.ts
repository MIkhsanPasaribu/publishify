import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk refresh token
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string({
    required_error: 'Refresh token wajib diisi',
  }),
});

/**
 * Type inference dari Zod schema
 */
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

/**
 * Class untuk Swagger documentation
 */
export class RefreshTokenDtoClass {
  @ApiProperty({
    description: 'Refresh token yang valid',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken!: string;
}
