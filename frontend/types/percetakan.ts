// Types untuk modul percetakan berdasarkan schema database

export type StatusPesanan =
  | "tertunda"
  | "diterima"
  | "dalam_produksi"
  | "kontrol_kualitas"
  | "siap"
  | "dikirim"
  | "terkirim"
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
  
  // Spesifikasi cetak
  jumlahCetak: number; // Changed from 'jumlah'
  ukuranKertas: string; // Changed from 'formatKertas'
  jenisKertas: string;
  jenisCover: string;
  finishing: string; // Changed from 'finishingTambahan'
  warnaCetak: string; // Added
  catatanTambahan: string | null; // Changed from 'catatan'
  
  // Informasi pemesan
  namaPemesan: string;
  teleponPemesan: string;
  alamatPengiriman: string;
  
  // Pricing
  hargaPerUnit: number; // Added
  totalHarga: number; // Changed from 'hargaTotal'
  
  // Status & dates
  status: StatusPesanan;
  dibuatPada: string; // Changed from 'tanggalPesan'
  tanggalDiterima: string | null; // Added
  estimasiSelesai: string | null;
  tanggalSelesai: string | null;
  diperbaruiPada: string;
  
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
  jumlah: number;
  formatKertas: string;
  jenisKertas: string;
  jenisCover: string;
  finishingTambahan?: string[];
  catatan?: string;
  hargaTotal: number;
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
  catatan?: string;
  estimasiSelesai?: string;
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
