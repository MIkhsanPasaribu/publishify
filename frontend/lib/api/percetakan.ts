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
  nomorPesanan: string; // INV/..
  tanggal: string; // ISO
  status: string; // ikuti backend, akan dinormalisasi di UI
  totalPembayaran: number;
  noResi?: string;
  trackingUrl?: string;
  alamatPengiriman: {
    penerima: string;
    telepon: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kodePos: string;
  };
  items: ItemPesananCetak[];
  subtotal?: number;
  ongkir?: number;
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
  // Endpoint bisa berbeda tergantung backend. Sesuaikan path berikut.
  async buatPesananCetak(payload: BuatPesananCetakPayload): Promise<ResponseSukses<{ idPesanan: string }>> {
    const { data } = await api.post<ResponseSukses<{ idPesanan: string }>>("/percetakan/pesanan", payload);
    return data;
  },

  // Ambil daftar pesanan milik pengguna saat ini
  async ambilPesananSaya(): Promise<ResponseSukses<PesananCetak[]>> {
    const { data } = await api.get<ResponseSukses<PesananCetak[]>>("/percetakan/pesanan/saya");
    return data;
  },

  // Ambil detail pesanan
  async ambilPesananById(id: string): Promise<ResponseSukses<PesananCetak>> {
    const { data } = await api.get<ResponseSukses<PesananCetak>>(`/percetakan/pesanan/${id}`);
    return data;
  },

  // Konfirmasi pesanan diterima (ubah status menjadi selesai)
  async konfirmasiPesananDiterima(id: string): Promise<ResponseSukses<{ status: string }>> {
    const { data } = await api.post<ResponseSukses<{ status: string }>>(`/percetakan/pesanan/${id}/diterima`, {});
    return data;
  },

  // (Opsional) Bayar pesanan
  async bayarPesanan(id: string): Promise<ResponseSukses<{ redirectUrl?: string }>> {
    const { data } = await api.post<ResponseSukses<{ redirectUrl?: string }>>(`/percetakan/pesanan/${id}/bayar`, {});
    return data;
  },
};
