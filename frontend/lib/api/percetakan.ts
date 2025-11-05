import api from "./client";

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

export interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
}

export const percetakanApi = {
  // Endpoint bisa berbeda tergantung backend. Sesuaikan path berikut.
  async buatPesananCetak(payload: BuatPesananCetakPayload): Promise<ResponseSukses<{ idPesanan: string }>> {
    const { data } = await api.post<ResponseSukses<{ idPesanan: string }>>("/percetakan/pesanan", payload);
    return data;
  },
};
