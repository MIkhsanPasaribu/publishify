import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Cursor Pagination DTO Schema
 * Untuk pagination berdasarkan cursor (last item ID/timestamp)
 */
export const CursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
  direction: z.enum(['next', 'prev']).default('next').optional(),
});

export type CursorPaginationDto = z.infer<typeof CursorPaginationSchema>;

/**
 * Class untuk Swagger documentation
 */
export class CursorPaginationDtoClass {
  @ApiProperty({
    description: 'Cursor dari item terakhir (timestamp atau ID)',
    required: false,
    example: '2024-01-15T10:30:00.000Z',
  })
  cursor?: string;

  @ApiProperty({
    description: 'Jumlah items per halaman (max 100)',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  limit?: number;

  @ApiProperty({
    description: 'Arah pagination',
    required: false,
    enum: ['next', 'prev'],
    default: 'next',
    example: 'next',
  })
  direction?: 'next' | 'prev';
}

/**
 * Cursor Pagination Response Interface
 */
export interface CursorPaginationResponse<T> {
  sukses: boolean;
  data: T[];
  pagination: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    count: number;
  };
}

/**
 * Helper function untuk build cursor pagination response
 */
export function buildCursorPaginationResponse<T>(
  items: T[],
  limit: number,
  getCursor: (item: T) => string,
): CursorPaginationResponse<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;

  const nextCursor = hasMore && data.length > 0 ? getCursor(data[data.length - 1]) : null;
  const prevCursor = data.length > 0 ? getCursor(data[0]) : null;

  return {
    sukses: true,
    data,
    pagination: {
      nextCursor,
      prevCursor,
      hasMore,
      count: data.length,
    },
  };
}
