/**
 * API Client untuk Admin Features
 * Endpoint khusus admin: terbitkan naskah, kelola pengguna, dll
 */

import client from "./client";
import type {
  Naskah,
  ResponseNaskahDetail,
  ResponseNaskahList,
  FilterNaskah,
  TerbitkanNaskahDto,
  StatistikAdmin,
} from "@/types/admin";

// ============= KELOLA NASKAH =============

/**
 * Ambil daftar naskah untuk admin dengan filter
 */
export async function ambilDaftarNaskahAdmin(
  filter?: FilterNaskah
): Promise<ResponseNaskahList> {
  // Bersihkan filter dari undefined values
  const cleanFilter = filter ? Object.fromEntries(
    Object.entries(filter).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ) : {};
  
  const response = await client.get("/naskah", { params: cleanFilter });
  return response.data;
}

/**
 * Ambil detail naskah by ID
 */
export async function ambilDetailNaskahAdmin(
  id: string
): Promise<ResponseNaskahDetail> {
  const response = await client.get(`/naskah/${id}`);
  return response.data;
}

/**
 * Admin terbitkan naskah (set ISBN & biaya produksi)
 * Endpoint: POST /naskah/:id/terbitkan
 */
export async function terbitkanNaskah(
  id: string,
  dto: TerbitkanNaskahDto
): Promise<ResponseNaskahDetail> {
  const response = await client.post(`/naskah/${id}/terbitkan`, dto);
  return response.data;
}

/**
 * Ambil statistik untuk dashboard admin
 */
export async function ambilStatistikAdmin(): Promise<{
  sukses: boolean;
  data: StatistikAdmin;
}> {
  const response = await client.get("/admin/statistik");
  return response.data;
}

// ============= PENULIS: ATUR HARGA JUAL =============

/**
 * Penulis set harga jual setelah admin terbitkan
 * Endpoint: PUT /naskah/:id/harga-jual
 */
export async function aturHargaJual(
  id: string,
  hargaJual: number
): Promise<ResponseNaskahDetail> {
  const response = await client.put(`/naskah/${id}/harga-jual`, { hargaJual });
  return response.data;
}

// ============= DEFAULT EXPORT =============

const adminApi = {
  // Naskah
  ambilDaftarNaskahAdmin,
  ambilDetailNaskahAdmin,
  terbitkanNaskah,
  
  // Statistik
  ambilStatistikAdmin,
  
  // Penulis
  aturHargaJual,
};

export default adminApi;
export { adminApi };
