/**
 * TypeScript Types untuk Module Percetakan
 * Sesuai dengan schema database PostgreSQL
 */

// Enum Status Pesanan
export type StatusPesanan =
  | "tertunda"
  | "diterima"
  | "dalam_produksi"
  | "kontrol_kualitas"
  | "siap"
  | "dikirim"
  | "terkirim"
  | "dibatalkan";

// Enum Status Pembayaran
export type StatusPembayaran =
  | "tertunda"
  | "diverifikasi"
  | "selesai"
  | "gagal";

// Enum Metode Pembayaran
export type MetodePembayaran =
  | "transfer_bank"
  | "e_wallet"
  | "kartu_kredit"
  | "cod";

// Enum Status Pengiriman
export type StatusPengiriman =
  | "diproses"
  | "dalam_perjalanan"
  | "terkirim"
  | "gagal";

// Enum Status Naskah
export type StatusNaskah =
  | "draft"
  | "diajukan"
  | "dalam_review"
  | "perlu_revisi"
  | "disetujui"
  | "ditolak"
  | "diterbitkan";

// Interface untuk Pesanan Cetak
export interface PesananCetak {
  id: string;
  idNaskah: string;
  idPemesan: string;
  idPercetakan: string | null;
  nomorPesanan: string;
  jumlah: number;
  formatKertas: string;
  jenisKertas: string;
  jenisCover: string;
  finishingTambahan: string[];
  catatan: string | null;
  hargaTotal: number;
  status: StatusPesanan;
  tanggalPesan: Date | string;
  estimasiSelesai: Date | string | null;
  tanggalSelesai: Date | string | null;
  diperbaruiPada: Date | string;
  
  // Relasi
  naskah?: Naskah;
  pemesan?: Pengguna;
  pembayaran?: Pembayaran[];
  pengiriman?: Pengiriman | null;
  logProduksi?: LogProduksi[];
}

// Interface untuk Naskah (simplified)
export interface Naskah {
  id: string;
  judul: string;
  subJudul: string | null;
  sinopsis: string;
  isbn: string | null;
  idKategori: string;
  idGenre: string;
  bahasaTulis: string;
  jumlahHalaman: number | null;
  jumlahKata: number | null;
  status: StatusNaskah;
  urlSampul: string | null;
  urlFile: string | null;
  publik: boolean;
  diterbitkanPada: Date | string | null;
  dibuatPada: Date | string;
  
  // Relasi
  penulis?: Pengguna;
  kategori?: Kategori;
  genre?: Genre;
}

// Interface untuk Pengguna (simplified)
export interface Pengguna {
  id: string;
  email: string;
  telepon: string | null;
  aktif: boolean;
  terverifikasi: boolean;
  dibuatPada: Date | string;
  
  // Relasi
  profilPengguna?: ProfilPengguna;
}

// Interface untuk Profil Pengguna
export interface ProfilPengguna {
  id: string;
  idPengguna: string;
  namaDepan: string | null;
  namaBelakang: string | null;
  namaTampilan: string | null;
  bio: string | null;
  urlAvatar: string | null;
  tanggalLahir: Date | string | null;
  jenisKelamin: string | null;
  alamat: string | null;
  kota: string | null;
  provinsi: string | null;
  kodePos: string | null;
}

// Interface untuk Kategori
export interface Kategori {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  aktif: boolean;
}

// Interface untuk Genre
export interface Genre {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  aktif: boolean;
}

// Interface untuk Pembayaran
export interface Pembayaran {
  id: string;
  idPesanan: string;
  idPengguna: string;
  nomorTransaksi: string;
  jumlah: number;
  metodePembayaran: MetodePembayaran;
  status: StatusPembayaran;
  urlBukti: string | null;
  catatanPembayaran: string | null;
  tanggalPembayaran: Date | string | null;
  dibuatPada: Date | string;
  diperbaruiPada: Date | string;
}

// Interface untuk Pengiriman
export interface Pengiriman {
  id: string;
  idPesanan: string;
  namaEkspedisi: string;
  nomorResi: string | null;
  biayaPengiriman: number;
  alamatTujuan: string;
  namaPenerima: string;
  teleponPenerima: string;
  status: StatusPengiriman;
  tanggalKirim: Date | string | null;
  estimasiTiba: Date | string | null;
  tanggalTiba: Date | string | null;
  dibuatPada: Date | string;
  diperbaruiPada: Date | string;
  
  // Relasi
  trackingLog?: TrackingLog[];
}

// Interface untuk Tracking Log
export interface TrackingLog {
  id: string;
  idPengiriman: string;
  lokasi: string;
  status: string;
  deskripsi: string | null;
  waktu: Date | string;
}

// Interface untuk Log Produksi
export interface LogProduksi {
  id: string;
  idPesanan: string;
  tahapan: string;
  deskripsi: string | null;
  dibuatPada: Date | string;
}

// Interface untuk Response API
export interface ApiResponse<T> {
  sukses: boolean;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

// Interface untuk Pagination
export interface PaginationParams {
  halaman?: number;
  limit?: number;
  cari?: string;
  status?: StatusPesanan;
  urutkan?: string;
  arah?: "asc" | "desc";
}

// Interface untuk Statistik Dashboard
export interface StatistikDashboard {
  totalPesanan: number;
  pesananBaru: number;
  dalamProduksi: number;
  siapKirim: number;
  selesai: number;
  totalRevenue: number;
  revenueHariIni: number;
  revenueBulanIni: number;
}

// Interface untuk Filter Pesanan
export interface FilterPesanan {
  status?: StatusPesanan[];
  tanggalMulai?: Date | string;
  tanggalAkhir?: Date | string;
  cari?: string;
}

// DTO untuk Update Status Pesanan
export interface UpdateStatusPesananDto {
  status: StatusPesanan;
  catatan?: string;
  estimasiSelesai?: Date | string;
}

// DTO untuk Tambah Log Produksi
export interface TambahLogProduksiDto {
  tahapan: string;
  deskripsi: string;
}

// DTO untuk Input Pengiriman
export interface InputPengirimanDto {
  namaEkspedisi: string;
  nomorResi: string;
  biayaPengiriman: number;
  alamatTujuan: string;
  namaPenerima: string;
  teleponPenerima: string;
  estimasiTiba?: Date | string;
}

// DTO untuk Verifikasi Pembayaran
export interface VerifikasiPembayaranDto {
  status: StatusPembayaran;
  catatanPembayaran?: string;
}
