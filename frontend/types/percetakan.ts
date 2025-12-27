// Types untuk modul percetakan berdasarkan schema database

export type StatusPesanan =
  | "tertunda"
  | "diterima"
  | "dalam_produksi"
  | "kontrol_kualitas"
  | "siap"
  | "dikirim"
  | "terkirim"
  | "selesai"
  | "dibatalkan";

export type StatusPembayaran =
  | "tertunda"
  | "diverifikasi"
  | "selesai"
  | "gagal";

export type MetodePembayaran =
  | "transfer_bank"
  | "e_wallet"
  | "kartu_kredit"
  | "cod";

export type StatusPengiriman =
  | "diproses"
  | "dalam_perjalanan"
  | "terkirim"
  | "gagal";

export interface PesananCetak {
  id: string;
  idNaskah: string;
  idPemesan: string;
  idPercetakan: string | null;
  nomorPesanan: string;
  
  // Snapshot data (saved at order time)
  judulSnapshot: string;
  formatSnapshot: string;
  jumlahHalamanSnapshot: number;
  
  // Spesifikasi cetak (sesuai schema database)
  jumlah: number; // Database field name
  formatKertas: string; // Database field name (A5, A4, dll)
  jenisKertas: string; // HVS, Art Paper, dll
  jenisCover: string; // Soft Cover, Hard Cover
  finishingTambahan: string[] | null; // Array of finishing options
  catatan: string | null; // Database field name
  
  // Shipping information (from database)
  alamatPengiriman: string;
  namaPenerima: string;
  teleponPenerima: string;
  
  // Pricing
  hargaTotal: number; // Database field name (Decimal/numeric in DB)
  
  // Status & dates (sesuai schema database)
  status: StatusPesanan;
  tanggalPesan: string; // Database field name (timestamp)
  estimasiSelesai: string | null; // timestamp
  tanggalSelesai: string | null; // timestamp
  catatanPenerimaan: string | null; // Catatan saat konfirmasi penerimaan
  diperbaruiPada: string; // timestamp
  
  // Relations (jika di-include dari API)
  naskah?: {
    id: string;
    judul: string;
    subJudul: string | null;
    isbn: string | null; // Added
    jumlahHalaman: number | null; // Added
    urlSampul: string | null;
    urlFile: string | null;
    penulis: {
      id: string;
      email: string;
      profilPengguna: {
        namaDepan: string | null;
        namaBelakang: string | null;
        namaTampilan: string | null;
      } | null;
    };
  };
  pemesan?: {
    id: string;
    email: string;
    telepon: string | null;
    profilPengguna: {
      namaDepan: string | null;
      namaBelakang: string | null;
      namaTampilan: string | null;
      alamat: string | null;
      kota: string | null;
      provinsi: string | null;
      kodePos: string | null;
    } | null;
  };
  pembayaran?: Pembayaran | null; // Changed from array to single object
  pengiriman?: Pengiriman | null;
  logProduksi?: LogProduksi[];
}

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
  tanggalPembayaran: string | null;
  dibuatPada: string;
  diperbaruiPada: string;
  
  // Relations
  pesanan?: PesananCetak;
  pengguna?: {
    id: string;
    email: string;
    profilPengguna: {
      namaDepan: string | null;
      namaBelakang: string | null;
    } | null;
  };
}

export interface Pengiriman {
  id: string;
  idPesanan: string;
  namaKurir: string; // Changed from namaEkspedisi
  namaEkspedisi: string; // Keep both for compatibility
  nomorResi: string | null;
  biayaPengiriman: number;
  alamatTujuan: string;
  namaPenerima: string;
  teleponPenerima: string;
  status: StatusPengiriman;
  tanggalKirim: string | null;
  estimasiTiba: string | null;
  tanggalTiba: string | null;
  dibuatPada: string;
  diperbaruiPada: string;
  
  // Relations
  pesanan?: PesananCetak;
  trackingLog?: TrackingLog[];
}

export interface TrackingLog {
  id: string;
  idPengiriman: string;
  lokasi: string;
  status: string;
  deskripsi: string | null;
  waktu: string;
}

export interface LogProduksi {
  id: string;
  idPesanan: string;
  status: string; // Added - displayed in timeline
  tahapan: string;
  keterangan: string | null; // Changed from deskripsi
  deskripsi: string | null; // Keep for compatibility
  dibuatPada: string;
}

// DTOs untuk request API
export interface BuatPesananCetakDto {
  idNaskah: string;
  idPercetakan: string; // NEW: ID percetakan yang dipilih
  jumlah: number;
  formatKertas: "A4" | "A5" | "B5";
  jenisKertas: "HVS" | "BOOKPAPER" | "ART_PAPER";
  jenisCover: "SOFTCOVER" | "HARDCOVER";
  finishingTambahan?: string[];
  catatan?: string;
  // hargaTotal DIHAPUS - akan dikalkulasi otomatis di backend
  alamatPengiriman: string;
  namaPenerima: string;
  teleponPenerima: string;
}

export interface UpdateStatusPesananDto {
  status: StatusPesanan;
  catatan?: string;
  estimasiSelesai?: string;
}

export interface KonfirmasiPesananDto {
  diterima: boolean;
  hargaTotal?: number;
  estimasiSelesai?: string;
  catatan?: string;
}

export interface BuatPengirimanDto {
  namaEkspedisi: string;
  nomorResi?: string;
  biayaPengiriman: number;
  alamatTujuan: string;
  namaPenerima: string;
  teleponPenerima: string;
  estimasiTiba?: string;
}

export interface TambahLogProduksiDto {
  tahapan: string;
  deskripsi?: string;
}

export interface BuatPembayaranDto {
  idPesanan: string;
  jumlah: number;
  metodePembayaran: MetodePembayaran;
  urlBukti?: string;
}

export interface KonfirmasiPembayaranDto {
  disetujui: boolean;
  catatanPembayaran?: string;
}

// Response dari API
export interface ResponsePesananList {
  sukses: boolean;
  pesan: string;
  data: PesananCetak[];
  metadata: {
    total: number;
    halaman: number;
    limit: number;
    totalHalaman: number;
  };
}

export interface ResponsePesananDetail {
  sukses: boolean;
  pesan: string;
  data: PesananCetak;
}

export interface ResponseStatistikPercetakan {
  sukses: boolean;
  data: {
    totalPesanan: number;
    pesananTertunda: number;
    pesananDalamProduksi: number;
    pesananSelesai: number;
    revenueBulanIni: number;
    pesananBulanIni: number;
    tingkatPenyelesaian: number;
    rataRataWaktuProduksi: number;
  };
}

// Filter untuk query pesanan
export interface FilterPesanan {
  status?: StatusPesanan;
  tanggalMulai?: string;
  tanggalAkhir?: string;
  cari?: string;
  halaman?: number;
  limit?: number;
}

// ============================================
// TARIF PERCETAKAN (NEW)
// ============================================

export type JenisKertas = 'HVS' | 'BOOKPAPER' | 'ART_PAPER';
export type JenisCover = 'SOFTCOVER' | 'HARDCOVER';
export type FormatBuku = 'A4' | 'A5' | 'B5';

export interface TarifPercetakan {
  id: string;
  idPercetakan: string;
  formatBuku: string;
  jenisKertas: string;
  jenisCover: string;
  hargaPerHalaman: number;
  biayaJilid: number;
  minimumPesanan: number;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
  percetakan?: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
      namaTampilan?: string;
    };
  };
}

export interface BuatTarifDto {
  formatBuku: string;
  jenisKertas: string;
  jenisCover: string;
  hargaPerHalaman: number;
  biayaJilid: number;
  minimumPesanan?: number;
  aktif?: boolean;
}

export interface PerbaruiTarifDto extends Partial<BuatTarifDto> {}

// ============================================
// KALKULASI HARGA (NEW)
// ============================================

export interface KalkulasiHargaDto {
  naskahId: string;
  jenisKertas: string;
  jenisCover: string;
}

export interface OpsiHarga {
  percetakanId: string;
  namaPercetakan: string;
  tarifId: string;
  formatBuku: string;
  jenisKertas: string;
  jenisCover: string;
  hargaPerHalaman: number;
  biayaJilid: number;
  minimumPesanan: number;
  estimasiHarga: number;
  breakdown: {
    biayaCetak: number;
    biayaJilid: number;
    totalHarga: number;
  };
}

export interface KalkulasiHargaResponse {
  sukses: boolean;
  pesan: string;
  data: OpsiHarga[];
  naskahInfo: {
    id: string;
    judul: string;
    formatBuku: string;
    jumlahHalaman: number;
  };
}

// ============================================
// PESANAN BARU DENGAN SNAPSHOT (NEW)
// ============================================

export interface BuatPesananBaruDto {
  naskahId: string;
  percetakanId: string;
  jenisKertas: string;
  jenisCover: string;
  jumlahOrder: number;
  catatan?: string;
}

// ============================================
// DASHBOARD & LAPORAN (NEW)
// ============================================

export interface StatistikDashboardPercetakan {
  totalPesanan: number;
  pesananBaru: number;
  pesananAktif: number;
  pesananSelesai: number;
  totalRevenue: number;
  statusBreakdown: Record<string, number>;
}

export interface LaporanKeuangan {
  periode: string;
  totalPendapatan: number;
  totalPesanan: number;
  rataRataPesanan: number;
  transaksi: {
    id: string;
    nomorPesanan: string;
    judulNaskah: string;
    jumlah: number;
    total: number;
    tanggal: string;
    status: string;
  }[];
}

export interface SaldoPercetakan {
  saldoAktif: number;
  saldoDitarik: number;
  totalPendapatan: number;
  menungguPembayaran: number;
  riwayatPenarikan: {
    id: string;
    jumlah: number;
    tanggal: string;
    status: string;
    nomorRekening: string;
  }[];
}
