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
import type {
  PercetakanDenganTarif,
  DetailTarifPercetakan,
} from "@/types/tarif";

// Re-export types untuk backward compatibility
export type { 
  PesananCetak,
  Pembayaran,
  LogProduksi,
} from "@/types/percetakan";

// Alias untuk backward compatibility
export type BuatPesananCetakPayload = BuatPesananCetakDto;

// ============= PERCETAKAN & TARIF =============

/**
 * Ambil daftar percetakan yang tersedia dengan tarif aktif
 * Untuk ditampilkan saat penulis akan membuat pesanan cetak
 */
export async function ambilDaftarPercetakan(): Promise<{
  sukses: boolean;
  pesan: string;
  data: PercetakanDenganTarif[];
  total: number;
}> {
  const response = await client.get("/percetakan/daftar");
  return response.data;
}

/**
 * Ambil detail tarif percetakan tertentu
 * Untuk kalkulasi harga sebelum buat pesanan
 */
export async function ambilTarifPercetakan(
  idPercetakan: string
): Promise<{
  sukses: boolean;
  pesan: string;
  data: DetailTarifPercetakan;
}> {
  const response = await client.get(`/percetakan/tarif/${idPercetakan}`);
  return response.data;
}

// ============= PESANAN CETAK =============

/**
 * Buat pesanan cetak baru dengan pilihan percetakan
 * Endpoint baru: POST /percetakan/pesanan
 */
export async function buatPesananCetak(
  dto: BuatPesananCetakDto
): Promise<ResponsePesananDetail> {
  const response = await client.post("/percetakan/pesanan", dto);
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
 * Ambil daftar pesanan milik penulis (untuk halaman /dashboard/pesanan-cetak)
 */
export async function ambilDaftarPesananPenulis(): Promise<ResponsePesananList> {
  const response = await client.get("/percetakan/penulis/saya");
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

/**
 * 🎯 PRIORITY 1: Konfirmasi penerimaan pesanan oleh penulis
 * Update status dari "terkirim" menjadi "selesai"
 * POST /api/percetakan/:id/konfirmasi-terima
 */
export async function konfirmasiPenerimaanPesanan(
  id: string,
  catatan?: string
): Promise<ResponsePesananDetail> {
  const response = await client.post(`/percetakan/${id}/konfirmasi-terima`, { catatan });
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
// PARAMETER HARGA & KOMBINASI TARIF (NEW SYSTEM)
// ============================================

/**
 * Simpan parameter harga percetakan (create/update)
 */
export async function simpanParameterHarga(dto: any) {
  const response = await client.post("/percetakan/parameter-harga", dto);
  return response.data;
}

/**
 * Ambil parameter harga percetakan
 */
export async function ambilParameterHarga() {
  const response = await client.get("/percetakan/parameter-harga");
  return response.data;
}

/**
 * Buat kombinasi tarif baru
 */
export async function buatKombinasiTarif(dto: any) {
  const response = await client.post("/percetakan/kombinasi-tarif", dto);
  return response.data;
}

/**
 * Ambil semua kombinasi tarif percetakan
 */
export async function ambilSemuaKombinasi() {
  const response = await client.get("/percetakan/kombinasi-tarif");
  return response.data;
}

/**
 * Toggle status aktif kombinasi tarif
 */
export async function toggleAktifKombinasi(id: string, aktif: boolean) {
  const response = await client.put(`/percetakan/kombinasi-tarif/${id}/toggle-aktif`, { aktif });
  return response.data;
}

/**
 * Hapus kombinasi tarif
 */
export async function hapusKombinasi(id: string) {
  const response = await client.put(`/percetakan/kombinasi-tarif/${id}/hapus`);
  return response.data;
}

/**
 * Kalkulasi harga otomatis dari kombinasi aktif
 */
export async function kalkulasiHargaOtomatis(dto: any) {
  const response = await client.post("/percetakan/kalkulasi-harga-otomatis", dto);
  return response.data;
}

// ============================================
// KALKULASI & PESANAN BARU (OLD SYSTEM)
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
  
  // Tarif (OLD SYSTEM - Deprecated)
  buatTarif,
  ambilSemuaTarif,
  ambilTarifById,
  perbaruiTarif,
  hapusTarif,
  
  // Parameter Harga & Kombinasi Tarif (NEW SYSTEM)
  simpanParameterHarga,
  ambilParameterHarga,
  buatKombinasiTarif,
  ambilSemuaKombinasi,
  toggleAktifKombinasi,
  hapusKombinasi,
  kalkulasiHargaOtomatis,
  
  // Kalkulasi & Pesanan Baru (OLD SYSTEM)
  kalkulasiOpsiHarga,
  buatPesananBaru,
  ambilPesananPercetakan,
};

export default percetakanApi;
export { percetakanApi };

