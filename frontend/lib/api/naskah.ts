import api from "./client";

// ============================================
// TYPES
// ============================================

export interface Kategori {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  idInduk?: string;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface Genre {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface Naskah {
  id: string;
  idPenulis: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  isbn?: string;
  idKategori: string;
  idGenre: string;
  bahasaTulis: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  status: string;
  urlSampul?: string;
  urlFile?: string;
  publik: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface BuatNaskahPayload {
  judul: string;
  subJudul?: string;
  sinopsis: string;
  idKategori: string;
  idGenre: string;
  bahasaTulis?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  urlSampul?: string;
  urlFile?: string;
  publik?: boolean;
}

export interface FilterNaskahParams {
  halaman?: number;
  limit?: number;
  status?: string;
  cari?: string;
  idKategori?: string;
  idGenre?: string;
}

export interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

// ============================================
// API CLIENT
// ============================================

export const naskahApi = {
  /**
   * POST /naskah - Buat naskah baru
   */
  async buatNaskah(payload: BuatNaskahPayload): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.post<ResponseSukses<Naskah>>("/naskah", payload);
    return data;
  },

  /**
   * GET /naskah - Ambil semua naskah dengan filter
   */
  async ambilSemuaNaskah(params?: FilterNaskahParams): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah", { params });
    return data;
  },

  /**
   * GET /naskah/penulis/saya - Ambil naskah penulis yang sedang login
   */
  async ambilNaskahSaya(params?: FilterNaskahParams): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah/penulis/saya", { params });
    return data;
  },

  /**
   * GET /naskah/:id - Ambil detail naskah by ID
   */
  async ambilNaskahById(id: string): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.get<ResponseSukses<Naskah>>(`/naskah/${id}`);
    return data;
  },

  /**
   * PUT /naskah/:id - Perbarui naskah
   */
  async perbaruiNaskah(id: string, payload: Partial<BuatNaskahPayload>): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.put<ResponseSukses<Naskah>>(`/naskah/${id}`, payload);
    return data;
  },

  /**
   * DELETE /naskah/:id - Hapus naskah
   */
  async hapusNaskah(id: string): Promise<ResponseSukses<void>> {
    const { data } = await api.delete<ResponseSukses<void>>(`/naskah/${id}`);
    return data;
  },

  /**
   * GET /naskah/statistik - Ambil statistik naskah
   */
  async ambilStatistik(): Promise<ResponseSukses<any>> {
    const { data } = await api.get<ResponseSukses<any>>("/naskah/statistik");
    return data;
  },

  /**
   * GET /kategori - Ambil daftar kategori (public endpoint)
   */
  async ambilKategori(params?: { halaman?: number; limit?: number; aktif?: boolean }): Promise<ResponseSukses<Kategori[]>> {
    const { data } = await api.get<ResponseSukses<Kategori[]>>("/kategori", { params });
    return data;
  },

  /**
   * GET /genre - Ambil daftar genre (public endpoint)
   */
  async ambilGenre(params?: { halaman?: number; limit?: number; aktif?: boolean }): Promise<ResponseSukses<Genre[]>> {
    const { data } = await api.get<ResponseSukses<Genre[]>>("/genre", { params });
    return data;
  },
};
