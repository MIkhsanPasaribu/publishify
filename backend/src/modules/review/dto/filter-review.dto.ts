import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { StatusReview, Rekomendasi } from '@prisma/client';

/**
 * Schema Zod untuk filter review
 */
export const FilterReviewSchema = z.object({
  halaman: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(StatusReview).optional(),
  rekomendasi: z.nativeEnum(Rekomendasi).optional(),
  idNaskah: z.string().uuid().optional(),
  idEditor: z.string().uuid().optional(),
  urutkan: z
    .enum(['ditugaskanPada', 'dimulaiPada', 'selesaiPada', 'status'])
    .default('ditugaskanPada'),
  arah: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type inference dari Zod schema
 */
export type FilterReviewDto = z.infer<typeof FilterReviewSchema>;

/**
 * Class untuk Swagger documentation
 */
export class FilterReviewDtoClass {
  @ApiProperty({
    description: 'Halaman yang diminta',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
    required: false,
  })
  halaman?: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Filter berdasarkan status review',
    enum: StatusReview,
    required: false,
  })
  status?: StatusReview;

  @ApiProperty({
    description: 'Filter berdasarkan rekomendasi',
    enum: Rekomendasi,
    required: false,
  })
  rekomendasi?: Rekomendasi;

  @ApiProperty({
    description: 'Filter berdasarkan ID naskah',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    type: String,
  })
  idNaskah?: string;

  @ApiProperty({
    description: 'Filter berdasarkan ID editor',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
    type: String,
  })
  idEditor?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    enum: ['ditugaskanPada', 'dimulaiPada', 'selesaiPada', 'status'],
    default: 'ditugaskanPada',
    required: false,
    type: String,
  })
  urutkan?: 'ditugaskanPada' | 'dimulaiPada' | 'selesaiPada' | 'status';

  @ApiProperty({
    description: 'Arah sorting',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
    type: String,
  })
  arah?: 'asc' | 'desc';
}
