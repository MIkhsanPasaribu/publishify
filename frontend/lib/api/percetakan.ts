import api from "./client";

// ================================
// TIPE DATA
// ================================

// Tipe payload untuk membuat pesanan cetak fisik
export interface BuatPesananCetakPayload {
  idNaskah: string; // atau idBuku jika backend memakai entitas buku terbit
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

export interface ItemPesananCetak {
  id: string;
  idNaskah: string;
  judul: string;
  jumlah: number;
  hargaSatuan: number;
}

export interface PesananCetak {
  id: string;
  nomorPesanan: string;
  tanggalPesan: string; // ISO format dari backend
  status: string; // tertunda | diterima | dalam_produksi | kontrol_kualitas | siap | dikirim | terkirim | dibatalkan
  hargaTotal: number;
  jumlah: number;
  formatKertas?: string;
  jenisKertas?: string;
  jenisCover?: string;
  finishingTambahan?: string[];
  catatan?: string;
  
  // Nested relations dari backend
  naskah: {
    id: string;
    judul: string;
    jumlahHalaman?: number;
    urlSampul?: string;
    isbn?: string;
  };
  
  pemesan?: {
    id: string;
    email: string;
    telepon?: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
  
  pengiriman?: {
    id: string;
    namaEkspedisi: string;
    nomorResi: string;
    status: string;
  };
  
  // Alamat pengiriman
  namaPenerima?: string;
  teleponPenerima?: string;
  alamatPengiriman?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  
  // Timestamps
  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
}

// ================================
// API CLIENT
// ================================
export const percetakanApi = {
  // Buat pesanan cetak baru
  async buatPesananCetak(payload: BuatPesananCetakPayload): Promise<ResponseSukses<{ idPesanan: string }>> {
    const { data } = await api.post<ResponseSukses<{ idPesanan: string }>>("/percetakan", payload);
    return data;
  },

  // Ambil daftar pesanan milik penulis yang login
  async ambilPesananSaya(): Promise<ResponseSukses<PesananCetak[]>> {
    const { data } = await api.get<ResponseSukses<PesananCetak[]>>("/percetakan/penulis/saya");
    return data;
  },

  // Ambil detail pesanan
  async ambilPesananById(id: string): Promise<ResponseSukses<PesananCetak>> {
    const { data } = await api.get<ResponseSukses<PesananCetak>>(`/percetakan/${id}`);
    return data;
  },

  // Batalkan pesanan (hanya status tertunda)
  async batalkanPesanan(id: string, alasan?: string): Promise<ResponseSukses<{ status: string }>> {
    const { data } = await api.put<ResponseSukses<{ status: string }>>(`/percetakan/${id}/batal`, { alasan });
    return data;
  },

  // TODO: Endpoint ini belum tersedia di backend
  // Konfirmasi pesanan diterima (ubah status menjadi selesai)
  async konfirmasiPesananDiterima(id: string): Promise<ResponseSukses<{ status: string }>> {
    // Endpoint ini perlu diimplementasikan di backend
    const { data } = await api.post<ResponseSukses<{ status: string }>>(`/percetakan/${id}/diterima`, {});
    return data;
  },

  // TODO: Endpoint ini belum tersedia di backend
  // Bayar pesanan
  async bayarPesanan(id: string): Promise<ResponseSukses<{ redirectUrl?: string }>> {
    // Endpoint ini perlu diimplementasikan di backend (integrasi payment gateway)
    const { data } = await api.post<ResponseSukses<{ redirectUrl?: string }>>(`/percetakan/${id}/bayar`, {});
    return data;
  },
};
