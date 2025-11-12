import api, { sanitizeParams } from "./client";

// ================================
// TIPE DATA
// ================================

export type StatusReview = "ditugaskan" | "dalam_proses" | "selesai" | "dibatalkan";
export type Rekomendasi = "setujui" | "revisi" | "tolak";

export interface Review {
  id: string;
  idNaskah: string;
  idEditor: string;
  status: StatusReview;
  rekomendasi?: Rekomendasi;
  catatanUmum?: string;
  ditugaskanPada: string;
  dimulaiPada?: string;
  selesaiPada?: string;
  dibuatPada: string;
  diperbaruiPada: string;

  // Relations
  naskah: {
    id: string;
    judul: string;
    subJudul?: string;
    sinopsis: string;
    urlFile?: string;
    urlSampul?: string;
    jumlahHalaman?: number;
    jumlahKata?: number;
    kategori?: {
      id: string;
      nama: string;
    };
    genre?: {
      id: string;
      nama: string;
    };
    penulis: {
      id: string;
      email: string;
      profilPengguna?: {
        namaDepan?: string;
        namaBelakang?: string;
      };
      profilPenulis?: {
        namaPena?: string;
        biografi?: string;
      };
    };
  };

  editor: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };

  feedback?: FeedbackReview[];
}

export interface FeedbackReview {
  id: string;
  idReview: string;
  aspek: string; // Alur, Karakter, Gaya Bahasa, dll
  komentar: string;
  skor?: number; // 1-5
  dibuatPada: string;
}

export interface StatistikReview {
  totalReview: number;
  reviewAktif: number;
  reviewSelesai: number;
  reviewDibatalkan: number;
  perStatus: {
    ditugaskan: number;
    dalam_proses: number;
    selesai: number;
    dibatalkan: number;
  };
  perRekomendasi?: {
    setujui: number;
    revisi: number;
    tolak: number;
  };
}

export interface TambahFeedbackDto {
  aspek: string;
  komentar: string;
  skor?: number;
}

export interface SubmitReviewDto {
  rekomendasi: Rekomendasi;
  catatanUmum: string;
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

// ================================
// API CLIENT
// ================================
export const reviewApi = {
  // Ambil review milik editor yang login
  async ambilReviewSaya(params?: {
    halaman?: number;
    limit?: number;
    status?: StatusReview;
  }): Promise<ResponseSukses<Review[]>> {
    const { data } = await api.get<ResponseSukses<Review[]>>("/review/editor/saya", {
      params: sanitizeParams(params),
    });
    return data;
  },

  // Ambil statistik review editor
  async ambilStatistik(): Promise<ResponseSukses<StatistikReview>> {
    const { data } = await api.get<ResponseSukses<StatistikReview>>("/review/statistik");
    return data;
  },

  // Ambil detail review by ID
  async ambilReviewById(id: string): Promise<ResponseSukses<Review>> {
    const { data } = await api.get<ResponseSukses<Review>>(`/review/${id}`);
    return data;
  },

  // Tambah feedback ke review
  async tambahFeedback(
    idReview: string,
    payload: TambahFeedbackDto
  ): Promise<ResponseSukses<FeedbackReview>> {
    const { data } = await api.post<ResponseSukses<FeedbackReview>>(
      `/review/${idReview}/feedback`,
      payload
    );
    return data;
  },

  // Submit review dengan rekomendasi final
  async submitReview(
    idReview: string,
    payload: SubmitReviewDto
  ): Promise<ResponseSukses<Review>> {
    const { data } = await api.put<ResponseSukses<Review>>(
      `/review/${idReview}/submit`,
      payload
    );
    return data;
  },

  // Batalkan review
  async batalkanReview(idReview: string, alasan: string): Promise<ResponseSukses<Review>> {
    const { data } = await api.put<ResponseSukses<Review>>(`/review/${idReview}/batal`, {
      alasan,
    });
    return data;
  },

  // Perbarui review (status, catatan)
  async perbaruiReview(
    idReview: string,
    payload: {
      status?: StatusReview;
      catatanUmum?: string;
    }
  ): Promise<ResponseSukses<Review>> {
    const { data } = await api.put<ResponseSukses<Review>>(`/review/${idReview}`, payload);
    return data;
  },
};
