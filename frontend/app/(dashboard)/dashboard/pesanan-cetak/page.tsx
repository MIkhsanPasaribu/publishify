"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { percetakanApi, type PesananCetak } from "@/lib/api/percetakan";

// ==========================================
// Dummy data fallback agar UI terlihat
// ==========================================
const pesananDummy: PesananCetak[] = [
  {
    id: "o1",
    nomorPesanan: "INV/11/2025/12345",
    tanggal: "2025-11-05T09:00:00.000Z",
    status: "tertunda",
    totalPembayaran: 150000,
    alamatPengiriman: {
      penerima: "Budi Santoso",
      telepon: "08123456789",
      alamat: "Jl. Kenangan No. 12",
      kota: "Padang",
      provinsi: "Sumatera Barat",
      kodePos: "25111",
    },
    items: [
      { id: "i1", idNaskah: "b1", judul: "Cara Cepat Belajar Next.js", jumlah: 5, hargaSatuan: 30000 },
    ],
    subtotal: 150000,
    ongkir: 0,
  },
  {
    id: "o2",
    nomorPesanan: "INV/11/2025/12346",
    tanggal: "2025-11-03T14:30:00.000Z",
    status: "dikirim",
    totalPembayaran: 325000,
    noResi: "JNE123456789ID",
    trackingUrl: "https://cekresi.com/?noresi=JNE123456789ID",
    alamatPengiriman: {
      penerima: "Rina Amelia",
      telepon: "08198765432",
      alamat: "Perumahan Melati Blok B2",
      kota: "Bandung",
      provinsi: "Jawa Barat",
      kodePos: "40111",
    },
    items: [
      { id: "i2", idNaskah: "b2", judul: "Rahasia Hutan Senja", jumlah: 3, hargaSatuan: 65000 },
      { id: "i3", idNaskah: "b3", judul: "Garis Waktu Asa", jumlah: 2, hargaSatuan: 65000 },
    ],
    subtotal: 325000,
    ongkir: 0,
  },
  {
    id: "o3",
    nomorPesanan: "INV/10/2025/11888",
    tanggal: "2025-10-22T10:00:00.000Z",
    status: "terkirim",
    totalPembayaran: 250000,
    alamatPengiriman: {
      penerima: "Sinta Dewi",
      telepon: "082112223333",
      alamat: "Komplek Dahlia No. 3",
      kota: "Depok",
      provinsi: "Jawa Barat",
      kodePos: "16412",
    },
    items: [
      { id: "i4", idNaskah: "b5", judul: "Berkebun di Balkon", jumlah: 5, hargaSatuan: 50000 },
    ],
    subtotal: 250000,
    ongkir: 0,
  },
  {
    id: "o4",
    nomorPesanan: "INV/09/2025/11001",
    tanggal: "2025-09-12T10:00:00.000Z",
    status: "dibatalkan",
    totalPembayaran: 0,
    alamatPengiriman: {
      penerima: "Andi Pratama",
      telepon: "081222333444",
      alamat: "Jl. Teratai No. 7",
      kota: "Jakarta",
      provinsi: "DKI Jakarta",
      kodePos: "13210",
    },
    items: [
      { id: "i5", idNaskah: "b6", judul: "Langkah Kecil Maraton", jumlah: 2, hargaSatuan: 55000 },
    ],
    subtotal: 110000,
    ongkir: 15000,
  },
];

// Normalisasi status backend -> UI
// Backend contoh: StatusPesanan = tertunda | diterima | dalam_produksi | kontrol_kualitas | siap | dikirim | terkirim | dibatalkan
function normalisasiStatus(s: string): "menunggu_pembayaran" | "diproses" | "dikirim" | "selesai" | "dibatalkan" {
  const v = (s || "").toLowerCase();
  if (v === "tertunda") return "menunggu_pembayaran";
  if (v === "dikirim") return "dikirim";
  if (v === "terkirim") return "selesai";
  if (v === "dibatalkan") return "dibatalkan";
  // diterima/dalam_produksi/kontrol_kualitas/siap
  return "diproses";
}

const badge: Record<string, { label: string; className: string }> = {
  menunggu_pembayaran: { label: "Menunggu Pembayaran", className: "bg-amber-100 text-amber-800" },
  diproses: { label: "Diproses Percetakan", className: "bg-blue-100 text-blue-800" },
  dikirim: { label: "Dikirim", className: "bg-emerald-100 text-emerald-800" },
  selesai: { label: "Selesai", className: "bg-green-100 text-green-800" },
  dibatalkan: { label: "Dibatalkan", className: "bg-rose-100 text-rose-800" },
};

function formatTanggal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function rupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function RiwayatPesananCetakPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pesanan, setPesanan] = useState<PesananCetak[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await percetakanApi.ambilPesananSaya();
      const list = (res?.data || []).slice().sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
      setPesanan(list);
    } catch (e: any) {
      console.warn("Gagal ambil pesanan dari API, gunakan dummy", e?.response?.data);
      const list = pesananDummy.slice().sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
      setPesanan(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ringkasBuku = (p: PesananCetak) => {
    if (!p.items || p.items.length === 0) return "-";
    if (p.items.length === 1) {
      const it = p.items[0];
      return `Mencetak ${it.jumlah}x '${it.judul}'`;
    }
    return `Mencetak ${p.items.length} judul buku`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan Cetak</h1>
          <p className="text-gray-600 mt-1">Lacak status pesanan cetak fisik Anda secara real-time</p>
        </div>

        <div className="space-y-4">
          {pesanan.length === 0 && !loading && (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-600">
              Belum ada pesanan cetak.
            </div>
          )}

          {pesanan.map((p) => {
            const st = normalisasiStatus(p.status);
            const b = badge[st];
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.className}`}>{b.label}</span>
                    <span className="text-sm text-gray-500">{p.nomorPesanan}</span>
                  </div>
                  <div className="text-sm text-gray-600">{formatTanggal(p.tanggal)}</div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-gray-800">{ringkasBuku(p)}</div>
                  <div className="text-lg font-semibold text-gray-900">{rupiah(p.totalPembayaran)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button
                    onClick={() => router.push(`/dashboard/pesanan-cetak/${p.id}`)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Lihat Detail
                  </button>

                  {st === "menunggu_pembayaran" && (
                    <button
                      onClick={async () => {
                        try {
                          const r = await percetakanApi.bayarPesanan(p.id);
                          if (r?.data?.redirectUrl) {
                            window.location.href = r.data.redirectUrl;
                          } else {
                            toast.success("Silakan lanjutkan pembayaran");
                          }
                        } catch (e: any) {
                          toast.warning("Simulasi: pembayaran belum diaktifkan");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                    >
                      Bayar Sekarang
                    </button>
                  )}

                  {st === "dikirim" && p.noResi && (
                    <a
                      href={p.trackingUrl || `https://cekresi.com/?noresi=${encodeURIComponent(p.noResi)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Lacak Pengiriman
                    </a>
                  )}

                  {st === "dikirim" && (
                    <button
                      onClick={async () => {
                        try {
                          await percetakanApi.konfirmasiPesananDiterima(p.id);
                          toast.success("Terima kasih, pesanan ditandai selesai");
                          fetchData();
                        } catch {
                          toast.warning("Simulasi: konfirmasi diterima");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Pesanan Diterima
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
