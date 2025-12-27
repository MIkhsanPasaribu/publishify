/**
 * API Client untuk Module Percetakan
 * Semua request ke backend API percetakan
 */

import client from "./client";
import type {
  PesananCetak,
  ResponsePesananList,
  ResponsePesananDetail,
  ResponseStatistikPercetakan,
  FilterPesanan,
  UpdateStatusPesananDto,
  KonfirmasiPesananDto,
  BuatPengirimanDto,
  BuatPesananCetakDto,
  Pembayaran,
  KonfirmasiPembayaranDto,
  LogProduksi,
  TambahLogProduksiDto,
} from "@/types/percetakan";

// Re-export types untuk backward compatibility
export type { 
  PesananCetak,
  Pembayaran,
  LogProduksi,
} from "@/types/percetakan";

// Alias untuk backward compatibility
export type BuatPesananCetakPayload = BuatPesananCetakDto;

// ============= PESANAN CETAK =============

/**
 * Buat pesanan cetak baru
 */
export async function buatPesananCetak(
  dto: BuatPesananCetakDto
): Promise<ResponsePesananDetail> {
  const response = await client.post("/percetakan", dto);
  return response.data;
}

/**
 * Ambil statistik dashboard percetakan
 */
export async function ambilStatistikPercetakan(): Promise<ResponseStatistikPercetakan> {
  const response = await client.get("/percetakan/statistik");
  return response.data;
}

/**
 * Ambil daftar pesanan dengan pagination dan filter
 */
export async function ambilDaftarPesanan(
  filter?: FilterPesanan
): Promise<ResponsePesananList> {
  // Bersihkan filter dari undefined values
  const cleanFilter = filter ? Object.fromEntries(
    Object.entries(filter).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ) : {};
  
  const response = await client.get("/percetakan", { params: cleanFilter });
  return response.data;
}

/**
 * Ambil detail pesanan by ID
 */
export async function ambilDetailPesanan(
  id: string
): Promise<ResponsePesananDetail> {
  const response = await client.get(`/percetakan/${id}`);
  return response.data;
}

/**
 * Update status pesanan (untuk tracking produksi)
 */
export async function updateStatusPesanan(
  id: string,
  dto: UpdateStatusPesananDto
): Promise<ResponsePesananDetail> {
  const response = await client.put(`/percetakan/${id}/status`, dto);
  return response.data;
}

/**
 * Alias untuk updateStatusPesanan (backward compatibility)
 */
export const perbaruiStatusPesanan = updateStatusPesanan;

/**
 * Konfirmasi atau tolak pesanan oleh percetakan
 */
export async function konfirmasiPesanan(
  id: string,
  dto: KonfirmasiPesananDto
): Promise<ResponsePesananDetail> {
  const response = await client.put(`/percetakan/${id}/konfirmasi`, dto);
  return response.data;
}

/**
 * Batalkan pesanan
 */
export async function batalkanPesanan(
  id: string,
  alasan?: string
): Promise<ResponsePesananDetail> {
  const response = await client.put(`/percetakan/${id}/batal`, { alasan });
  return response.data;
}

// ============= LOG PRODUKSI =============

/**
 * Ambil log produksi by ID pesanan
 */
export async function ambilLogProduksi(
  idPesanan: string
): Promise<{ sukses: boolean; data: LogProduksi[] }> {
  const response = await client.get(`/percetakan/${idPesanan}/log-produksi`);
  return response.data;
}

/**
 * Tambah log produksi
 */
export async function tambahLogProduksi(
  idPesanan: string,
  dto: TambahLogProduksiDto
): Promise<{ sukses: boolean; data: LogProduksi }> {
  const response = await client.post(`/percetakan/${idPesanan}/log-produksi`, dto);
  return response.data;
}

// ============= PENGIRIMAN =============

/**
 * Buat data pengiriman untuk pesanan
 */
export async function buatPengiriman(
  idPesanan: string,
  dto: BuatPengirimanDto
): Promise<ResponsePesananDetail> {
  const response = await client.post(`/percetakan/${idPesanan}/pengiriman`, dto);
  return response.data;
}

// ============= PEMBAYARAN =============

/**
 * Ambil daftar pembayaran
 */
export async function ambilDaftarPembayaran(
  filter?: { status?: string; halaman?: number; limit?: number }
): Promise<{ sukses: boolean; data: Pembayaran[]; metadata: any }> {
  const response = await client.get("/pembayaran", { params: filter });
  return response.data;
}

/**
 * Ambil detail pembayaran by ID
 */
export async function ambilDetailPembayaran(
  id: string
): Promise<{ sukses: boolean; data: Pembayaran }> {
  const response = await client.get(`/pembayaran/${id}`);
  return response.data;
}

/**
 * Konfirmasi pembayaran
 */
export async function konfirmasiPembayaran(
  id: string,
  dto: KonfirmasiPembayaranDto
): Promise<{ sukses: boolean; data: Pembayaran }> {
  const response = await client.put(`/pembayaran/${id}/konfirmasi`, dto);
  return response.data;
}

/**
 * Batalkan pembayaran
 */
export async function batalkanPembayaran(
  id: string,
  alasan?: string
): Promise<{ sukses: boolean; data: Pembayaran }> {
  const response = await client.put(`/pembayaran/${id}/batal`, { alasan });
  return response.data;
}

// ============================================
// TARIF PERCETAKAN (NEW)
// ============================================

/**
 * Buat tarif percetakan baru
 */
export async function buatTarif(dto: any) {
  const response = await client.post("/percetakan/tarif", dto);
  return response.data;
}

/**
 * Ambil semua tarif percetakan
 */
export async function ambilSemuaTarif(params?: { idPercetakan?: string; aktif?: boolean }) {
  const response = await client.get("/percetakan/tarif", { params });
  return response.data;
}

/**
 * Ambil detail tarif by ID
 */
export async function ambilTarifById(id: string) {
  const response = await client.get(`/percetakan/tarif/${id}`);
  return response.data;
}

/**
 * Perbarui tarif
 */
export async function perbaruiTarif(id: string, dto: any) {
  const response = await client.put(`/percetakan/tarif/${id}`, dto);
  return response.data;
}

/**
 * Hapus tarif
 */
export async function hapusTarif(id: string) {
  const response = await client.put(`/percetakan/tarif/${id}/hapus`);
  return response.data;
}

// ============================================
// KALKULASI & PESANAN BARU (NEW)
// ============================================

/**
 * Kalkulasi estimasi harga dari berbagai percetakan
 */
export async function kalkulasiOpsiHarga(dto: any) {
  const response = await client.post("/percetakan/kalkulasi-harga", dto);
  return response.data;
}

/**
 * Buat pesanan baru dengan snapshot pattern
 */
export async function buatPesananBaru(dto: any) {
  const response = await client.post("/percetakan/pesanan/baru", dto);
  return response.data;
}

/**
 * Ambil pesanan untuk percetakan dengan filter
 */
export async function ambilPesananPercetakan(status?: string) {
  const response = await client.get("/percetakan/pesanan/percetakan", {
    params: { status },
  });
  return response.data;
}

// ============= DEFAULT EXPORT =============
// Export sebagai object untuk backward compatibility

const percetakanApi = {
  // Statistik
  ambilStatistikPercetakan,
  
  // Pesanan
  buatPesananCetak,
  ambilDaftarPesanan,
  ambilDetailPesanan,
  updateStatusPesanan,
  konfirmasiPesanan,
  batalkanPesanan,
  
  // Log Produksi
  ambilLogProduksi,
  tambahLogProduksi,
  
  // Pengiriman
  buatPengiriman,
  
  // Pembayaran
  ambilDaftarPembayaran,
  ambilDetailPembayaran,
  konfirmasiPembayaran,
  batalkanPembayaran,
  
  // Tarif (NEW)
  buatTarif,
  ambilSemuaTarif,
  ambilTarifById,
  perbaruiTarif,
  hapusTarif,
  
  // Kalkulasi & Pesanan Baru (NEW)
  kalkulasiOpsiHarga,
  buatPesananBaru,
  ambilPesananPercetakan,
};

export default percetakanApi;
export { percetakanApi };

