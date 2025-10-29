import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Zod Schema untuk proses gambar (resize/compress)
 */
export const ProcessImageSchema = z.object({
  lebar: z
    .number()
    .int()
    .positive()
    .max(5000, 'Lebar maksimal 5000 pixel')
    .optional()
    .describe('Lebar gambar hasil (dalam pixel)'),

  tinggi: z
    .number()
    .int()
    .positive()
    .max(5000, 'Tinggi maksimal 5000 pixel')
    .optional()
    .describe('Tinggi gambar hasil (dalam pixel)'),

  kualitas: z
    .number()
    .int()
    .min(1, 'Kualitas minimal 1')
    .max(100, 'Kualitas maksimal 100')
    .optional()
    .default(80)
    .describe('Kualitas gambar (1-100, default: 80)'),

  format: z
    .enum(['jpeg', 'png', 'webp'])
    .optional()
    .describe('Format output gambar (jpeg/png/webp)'),

  fit: z
    .enum(['cover', 'contain', 'fill', 'inside', 'outside'])
    .optional()
    .default('cover')
    .describe('Cara resize gambar (default: cover)'),

  pertahankanAspekRasio: z
    .boolean()
    .optional()
    .default(true)
    .describe('Pertahankan aspek rasio gambar (default: true)'),
});

export type ProcessImageDto = z.infer<typeof ProcessImageSchema>;

/**
 * Class untuk Swagger documentation
 */
export class ProcessImageSwagger {
  @ApiProperty({
    description: 'Lebar gambar hasil (dalam pixel)',
    example: 800,
    required: false,
    maximum: 5000,
  })
  lebar?: number;

  @ApiProperty({
    description: 'Tinggi gambar hasil (dalam pixel)',
    example: 600,
    required: false,
    maximum: 5000,
  })
  tinggi?: number;

  @ApiProperty({
    description: 'Kualitas gambar (1-100)',
    example: 80,
    required: false,
    default: 80,
    minimum: 1,
    maximum: 100,
  })
  kualitas?: number;

  @ApiProperty({
    enum: ['jpeg', 'png', 'webp'],
    description: 'Format output gambar',
    required: false,
  })
  format?: 'jpeg' | 'png' | 'webp';

  @ApiProperty({
    enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
    description: 'Cara resize gambar',
    required: false,
    default: 'cover',
  })
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

  @ApiProperty({
    description: 'Pertahankan aspek rasio gambar',
    example: true,
    required: false,
    default: true,
  })
  pertahankanAspekRasio?: boolean;
}

/**
 * Preset umum untuk proses gambar
 */
export const IMAGE_PRESETS: Record<
  string,
  {
    lebar: number;
    tinggi: number;
    kualitas: number;
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    pertahankanAspekRasio?: boolean;
  }
> = {
  thumbnail: {
    lebar: 150,
    tinggi: 150,
    kualitas: 70,
    fit: 'cover',
    pertahankanAspekRasio: true,
  },
  sampulKecil: {
    lebar: 300,
    tinggi: 400,
    kualitas: 80,
    fit: 'cover',
    pertahankanAspekRasio: true,
  },
  sampulBesar: {
    lebar: 800,
    tinggi: 1200,
    kualitas: 90,
    fit: 'contain',
    pertahankanAspekRasio: true,
  },
  banner: {
    lebar: 1200,
    tinggi: 400,
    kualitas: 85,
    fit: 'cover',
    pertahankanAspekRasio: true,
  },
};
