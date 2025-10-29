/**
 * Interface untuk options pagination
 */
export interface OpsiPaginasi {
  halaman?: number;
  limit?: number;
  urutkan?: string;
  arah?: 'asc' | 'desc';
  cari?: string;
}

/**
 * Interface untuk hasil pagination dari Prisma
 */
export interface HasilPaginasi<T> {
  data: T[];
  total: number;
  halaman: number;
  limit: number;
  totalHalaman: number;
}

/**
 * Helper function untuk membuat pagination query
 */
export function buatQueryPaginasi(opsi: OpsiPaginasi = {}) {
  const halaman = opsi.halaman || 1;
  const limit = opsi.limit || 20;
  const skip = (halaman - 1) * limit;

  return {
    skip,
    take: limit,
    halaman,
    limit,
  };
}

/**
 * Helper function untuk format hasil pagination
 */
export function formatHasilPaginasi<T>(
  data: T[],
  total: number,
  halaman: number,
  limit: number,
): HasilPaginasi<T> {
  return {
    data,
    total,
    halaman,
    limit,
    totalHalaman: Math.ceil(total / limit),
  };
}
