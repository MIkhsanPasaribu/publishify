/**
 * API Client untuk Module Percetakan
 * Semua request ke backend API percetakan
 */

import client from "./client";
import type {
  ApiResponse,
  PesananCetak,
  StatistikDashboard,
  PaginationParams,
  UpdateStatusPesananDto,
  LogProduksi,
  TambahLogProduksiDto,
  Pengiriman,
  InputPengirimanDto,
  Pembayaran,
  VerifikasiPembayaranDto,
  TrackingLog,
} from "@/types/percetakan";

/**
 * Ambil statistik dashboard percetakan
 */
export async function ambilStatistikDashboard(): Promise<
  ApiResponse<StatistikDashboard>
> {
  const response = await client.get("/api/percetakan/statistik");
  return response.data;
}

/**
 * Ambil daftar pesanan dengan pagination dan filter
 */
export async function ambilDaftarPesanan(
  params?: PaginationParams
): Promise<ApiResponse<PesananCetak[]>> {
  const response = await client.get("/api/percetakan", { params });
  return response.data;
}

/**
 * Ambil detail pesanan by ID
 */
export async function ambilDetailPesanan(
  id: string
): Promise<ApiResponse<PesananCetak>> {
  const response = await client.get(`/api/percetakan/${id}`);
  return response.data;
}

/**
 * Terima pesanan (ubah status dari tertunda ke diterima)
 */
export async function terimaPesanan(
  id: string,
  catatan?: string
): Promise<ApiResponse<PesananCetak>> {
  const response = await client.post(`/api/percetakan/${id}/konfirmasi`, {
    catatan,
  });
  return response.data;
}

/**
 * Tolak pesanan (ubah status menjadi dibatalkan)
 */
export async function tolakPesanan(
  id: string,
  alasan: string
): Promise<ApiResponse<PesananCetak>> {
  const response = await client.put(`/api/percetakan/${id}/batal`, {
    alasan,
  });
  return response.data;
}

/**
 * Update status pesanan
 */
export async function updateStatusPesanan(
  id: string,
  dto: UpdateStatusPesananDto
): Promise<ApiResponse<PesananCetak>> {
  const response = await client.patch(`/api/percetakan/${id}/status`, dto);
  return response.data;
}

/**
 * Ambil log produksi pesanan
 */
export async function ambilLogProduksi(
  idPesanan: string
): Promise<ApiResponse<LogProduksi[]>> {
  const response = await client.get(
    `/api/percetakan/${idPesanan}/log-produksi`
  );
  return response.data;
}

/**
 * Tambah log produksi
 */
export async function tambahLogProduksi(
  idPesanan: string,
  dto: TambahLogProduksiDto
): Promise<ApiResponse<LogProduksi>> {
  const response = await client.post(
    `/api/percetakan/${idPesanan}/log-produksi`,
    dto
  );
  return response.data;
}

/**
 * Ambil data pengiriman pesanan
 */
export async function ambilPengiriman(
  idPesanan: string
): Promise<ApiResponse<Pengiriman>> {
  const response = await client.get(`/api/percetakan/${idPesanan}/pengiriman`);
  return response.data;
}

/**
 * Input data pengiriman
 */
export async function inputPengiriman(
  idPesanan: string,
  dto: InputPengirimanDto
): Promise<ApiResponse<Pengiriman>> {
  const response = await client.post(
    `/api/percetakan/${idPesanan}/pengiriman`,
    dto
  );
  return response.data;
}

/**
 * Update data pengiriman
 */
export async function updatePengiriman(
  idPengiriman: string,
  dto: Partial<InputPengirimanDto>
): Promise<ApiResponse<Pengiriman>> {
  const response = await client.patch(
    `/api/percetakan/pengiriman/${idPengiriman}`,
    dto
  );
  return response.data;
}

/**
 * Ambil tracking log pengiriman
 */
export async function ambilTrackingLog(
  idPengiriman: string
): Promise<ApiResponse<TrackingLog[]>> {
  const response = await client.get(
    `/api/percetakan/pengiriman/${idPengiriman}/tracking`
  );
  return response.data;
}

/**
 * Tambah tracking log
 */
export async function tambahTrackingLog(
  idPengiriman: string,
  data: Omit<TrackingLog, "id" | "idPengiriman" | "waktu">
): Promise<ApiResponse<TrackingLog>> {
  const response = await client.post(
    `/api/percetakan/pengiriman/${idPengiriman}/tracking`,
    data
  );
  return response.data;
}

/**
 * Ambil pembayaran pesanan
 */
export async function ambilPembayaran(
  idPesanan: string
): Promise<ApiResponse<Pembayaran[]>> {
  const response = await client.get(`/api/pembayaran/pesanan/${idPesanan}`);
  return response.data;
}

/**
 * Verifikasi pembayaran
 */
export async function verifikasiPembayaran(
  idPembayaran: string,
  dto: VerifikasiPembayaranDto
): Promise<ApiResponse<Pembayaran>> {
  const response = await client.patch(
    `/api/pembayaran/${idPembayaran}/verifikasi`,
    dto
  );
  return response.data;
}

/**
 * Download file naskah
 */
export async function downloadFileNaskah(urlFile: string): Promise<Blob> {
  const response = await client.get(urlFile, {
    responseType: "blob",
  });
  return response.data;
}

// ================================
// TYPES & INTERFACES untuk Penulis/Pemesan
// ================================

/**
 * Payload untuk membuat pesanan cetak baru
 * Digunakan oleh penulis untuk memesan cetak buku
 */
export interface BuatPesananCetakPayload {
  idNaskah: string;
  jumlah: number;
  alamatPengiriman: {
    penerima: string;
    telepon: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kodePos: string;
  };
  kurir: string; // mis. "jne_reg", "sicepat_best"
  catatan?: string;
}

// ================================
// API CLIENT OBJECT (Legacy Support)
// ================================

/**
 * Object-style API client untuk backward compatibility
 * dengan halaman yang sudah ada (buku-terbit, pesanan-cetak, dll)
 */
export const percetakanApi = {
  /**
   * Buat pesanan cetak baru (untuk penulis)
   */
  async buatPesananCetak(
    payload: BuatPesananCetakPayload
  ): Promise<ApiResponse<{ idPesanan: string }>> {
    const response = await client.post("/api/percetakan", payload);
    return response.data;
  },

  /**
   * Ambil daftar pesanan milik penulis yang login
   */
  async ambilPesananSaya(): Promise<ApiResponse<PesananCetak[]>> {
    const response = await client.get("/api/percetakan/penulis/saya");
    return response.data;
  },

  /**
   * Ambil detail pesanan by ID
   */
  async ambilPesananById(id: string): Promise<ApiResponse<PesananCetak>> {
    const response = await client.get(`/api/percetakan/${id}`);
    return response.data;
  },

  /**
   * Batalkan pesanan (hanya status tertunda)
   */
  async batalkanPesanan(
    id: string,
    alasan?: string
  ): Promise<ApiResponse<{ status: string }>> {
    const response = await client.put(`/api/percetakan/${id}/batal`, { alasan });
    return response.data;
  },
};
