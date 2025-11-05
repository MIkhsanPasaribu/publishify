"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { percetakanApi, type PesananCetak } from "@/lib/api/percetakan";

function formatTanggal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function rupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function DetailPesananCetakPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState<PesananCetak | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await percetakanApi.ambilPesananById(id);
      setP(res.data);
    } catch (e: any) {
      // Dummy detail jika API gagal
      setP({
        id,
        nomorPesanan: "INV/11/2025/12345",
        tanggal: new Date().toISOString(),
        status: "dikirim",
        totalPembayaran: 150000,
        noResi: "JNE123456789ID",
        trackingUrl: "https://cekresi.com/?noresi=JNE123456789ID",
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
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (!p) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border p-6">{loading ? "Memuat detail pesanan..." : "Pesanan tidak ditemukan."}</div>
        </div>
      </div>
    );
  }

  const subtotal = p.subtotal ?? p.items.reduce((a, b) => a + b.hargaSatuan * b.jumlah, 0);
  const ongkir = p.ongkir ?? 25000;
  const total = subtotal + ongkir;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
            <div className="text-gray-600 mt-1">{p.nomorPesanan} • {formatTanggal(p.tanggal)}</div>
          </div>
          <div className="flex gap-2">
            {/* Kondisional aksi */}
            {p.status.toLowerCase() === "tertunda" && (
              <button
                onClick={async () => {
                  try {
                    const r = await percetakanApi.bayarPesanan(p.id);
                    if (r?.data?.redirectUrl) window.location.href = r.data.redirectUrl;
                    else toast.success("Silakan lanjutkan pembayaran");
                  } catch {
                    toast.warning("Simulasi: pembayaran belum diaktifkan");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
              >
                Bayar Sekarang
              </button>
            )}
            {p.status.toLowerCase() === "dikirim" && p.noResi && (
              <a
                href={p.trackingUrl || `https://cekresi.com/?noresi=${encodeURIComponent(p.noResi)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Lacak Pengiriman
              </a>
            )}
            {p.status.toLowerCase() === "dikirim" && (
              <button
                onClick={async () => {
                  try {
                    await percetakanApi.konfirmasiPesananDiterima(p.id);
                    toast.success("Terima kasih, pesanan ditandai selesai");
                    router.back();
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

        {/* Alamat Pengiriman */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
          <div className="mt-2 text-gray-700">
            <div className="font-medium">{p.alamatPengiriman.penerima} — {p.alamatPengiriman.telepon}</div>
            <div>{p.alamatPengiriman.alamat}</div>
            <div>
              {p.alamatPengiriman.kota}, {p.alamatPengiriman.provinsi} {p.alamatPengiriman.kodePos}
            </div>
          </div>
        </div>

        {/* Rincian Item */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900">Rincian Item</h2>
          <div className="mt-3 divide-y">
            {p.items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between">
                <div className="text-gray-800">
                  <div className="font-medium">{it.judul}</div>
                  <div className="text-sm text-gray-600">Jumlah: {it.jumlah} × {rupiah(it.hargaSatuan)}</div>
                </div>
                <div className="text-gray-900 font-semibold">{rupiah(it.jumlah * it.hargaSatuan)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Pembayaran</h2>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
            <div className="flex justify-between"><span>Ongkir</span><span>{rupiah(ongkir)}</span></div>
            <div className="flex justify-between text-base font-semibold text-gray-900 mt-1"><span>Total</span><span>{rupiah(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
