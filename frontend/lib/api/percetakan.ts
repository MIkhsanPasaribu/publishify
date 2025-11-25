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
  Pembayaran,
  KonfirmasiPembayaranDto,
  LogProduksi,
  TambahLogProduksiDto,
} from "@/types/percetakan";

// ============= PESANAN CETAK =============

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
  const response = await client.get("/percetakan", { params: filter });
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

