import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk menugaskan review ke editor
 */
export const TugaskanReviewSchema = z.object({
  idNaskah: z
    .string({
      required_error: 'ID naskah wajib diisi',
    })
    .uuid('ID naskah harus berupa UUID'),

  idEditor: z
    .string({
      required_error: 'ID editor wajib diisi',
    })
    .uuid('ID editor harus berupa UUID'),

  catatan: z.string().max(500, 'Catatan maksimal 500 karakter').trim().optional().nullable(),
});

/**
 * Type inference dari Zod schema
 */
export type TugaskanReviewDto = z.infer<typeof TugaskanReviewSchema>;

/**
 * Class untuk Swagger documentation
 */
export class TugaskanReviewDtoClass {
  @ApiProperty({
    description: 'ID naskah yang akan direview',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  idNaskah: string;

  @ApiProperty({
    description: 'ID editor yang ditugaskan',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: String,
  })
  idEditor: string;

  @ApiProperty({
    description: 'Catatan penugasan untuk editor',
    example: 'Mohon review fokus pada struktur cerita dan karakter',
    required: false,
    maxLength: 500,
    type: String,
  })
  catatan?: string;
}
