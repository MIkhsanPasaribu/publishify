"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { percetakanApi, type PesananCetak } from "@/lib/api/percetakan";

// Normalisasi status backend -> UI
// Backend: tertunda | diterima | dalam_produksi | kontrol_kualitas | siap | dikirim | terkirim | dibatalkan
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
  const [loading, setLoading] = useState(true);
  const [pesanan, setPesanan] = useState<PesananCetak[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await percetakanApi.ambilPesananSaya();
      const list = (res?.data || []).slice().sort((a, b) => {
        const dateA = a.tanggalPesan || a.dibuatPada || '';
        const dateB = b.tanggalPesan || b.dibuatPada || '';
        return dateA < dateB ? 1 : -1;
      });
      setPesanan(list);
    } catch (e: any) {
      console.error("Gagal ambil pesanan dari API:", e);
      toast.error("Gagal memuat riwayat pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ringkasBuku = (p: PesananCetak) => {
    // Backend mengirim naskah sebagai object, bukan array items
    if (p.naskah) {
      return `Mencetak ${p.jumlah}x '${p.naskah.judul}'`;
    }
    return "Detail pesanan";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan Cetak</h1>
          <p className="text-gray-600 mt-1">Lacak status pesanan cetak fisik Anda secara real-time</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : pesanan.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Belum ada pesanan cetak</p>
              <p className="text-gray-400 text-sm mt-2">Pesanan cetak Anda akan muncul di sini</p>
            </div>
          ) : (
            <>
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
                  <div className="text-sm text-gray-600">{formatTanggal(p.tanggalPesan || p.dibuatPada || '')}</div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-gray-800">{ringkasBuku(p)}</div>
                  <div className="text-lg font-semibold text-gray-900">{rupiah(p.hargaTotal)}</div>
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

                  {st === "dikirim" && p.pengiriman?.nomorResi && (
                    <a
                      href={`https://cekresi.com/?noresi=${encodeURIComponent(p.pengiriman.nomorResi)}`}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
