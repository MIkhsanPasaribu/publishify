import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk menerbitkan naskah
 */
export const TerbitkanNaskahSchema = z.object({
  isbn: z
    .string({
      required_error: 'ISBN wajib diisi untuk penerbitan',
    })
    .regex(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
      'Format ISBN tidak valid',
    )
    .trim(),

  tanggalTerbit: z
    .string()
    .datetime('Format tanggal tidak valid')
    .optional()
    .default(() => new Date().toISOString()),

  catatan: z.string().max(500, 'Catatan maksimal 500 karakter').trim().optional().nullable(),
});

/**
 * Type inference dari Zod schema
 */
export type TerbitkanNaskahDto = z.infer<typeof TerbitkanNaskahSchema>;

/**
 * Class untuk Swagger documentation
 */
export class TerbitkanNaskahDtoClass {
  @ApiProperty({
    description: 'ISBN naskah (International Standard Book Number)',
    example: '978-3-16-148410-0',
    type: String,
  })
  isbn!: string;

  @ApiProperty({
    description: 'Tanggal penerbitan (ISO 8601 format)',
    example: '2025-10-29T00:00:00.000Z',
    required: false,
    type: String,
  })
  tanggalTerbit?: string;

  @ApiProperty({
    description: 'Catatan penerbitan',
    example: 'Edisi pertama - Cetakan pertama',
    required: false,
    maxLength: 500,
    type: String,
  })
  catatan?: string;
}
