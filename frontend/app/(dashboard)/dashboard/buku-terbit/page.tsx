"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Printer, Settings, ExternalLink } from "lucide-react";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { percetakanApi, type BuatPesananCetakPayload } from "@/lib/api/percetakan";

// ----------------------------------------------
// Type untuk buku terbit
// ----------------------------------------------
interface BukuTerbit {
  id: string;
  judul: string;
  urlSampul?: string;
  terbitPada: string; // ISO date
  kategori?: string;
  genre?: string;
}

function formatTanggalIndo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ----------------------------------------------
// Skema Form Pesan Cetak
// ----------------------------------------------
const FormPesanCetakSchema = z.object({
  // Zod v4: gunakan message alih-alih invalid_type_error; tetap pakai z.number karena form register sudah valueAsNumber
  jumlah: z.number({ message: "Jumlah harus berupa angka" }).min(1, "Minimal 1 eksemplar"),
  penerima: z.string().min(3, "Nama penerima minimal 3 karakter"),
  telepon: z.string().min(8, "Nomor telepon tidak valid"),
  alamat: z.string().min(10, "Alamat terlalu singkat"),
  kota: z.string().min(2, "Kota harus diisi"),
  provinsi: z.string().min(2, "Provinsi harus diisi"),
  kodePos: z.string().min(4, "Kode pos tidak valid"),
  kurir: z.string().min(2, "Pilih kurir"),
  catatan: z.string().optional(),
});

export default function BukuTerbitPage() {
  const [bukuTerpilih, setBukuTerpilih] = useState<BukuTerbit | null>(null);
  const [proses, setProses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bukuTerbit, setBukuTerbit] = useState<BukuTerbit[]>([]);

  // Fetch buku terbit dari API
  useEffect(() => {
    const fetchBukuTerbit = async () => {
      setLoading(true);
      try {
        // Ambil naskah dengan status "diterbitkan"
        const res = await naskahApi.ambilNaskahSaya({ status: "diterbitkan" });
        
        // Transform Naskah ke BukuTerbit
        const buku: BukuTerbit[] = (res.data || []).map((naskah: Naskah) => ({
          id: naskah.id,
          judul: naskah.judul,
          urlSampul: naskah.urlSampul,
          terbitPada: naskah.diperbaruiPada, // Gunakan diperbaruiPada sebagai tanggal terbit
          kategori: (naskah as any).kategori?.nama,
          genre: (naskah as any).genre?.nama,
        }));

        setBukuTerbit(buku);
      } catch (e: any) {
        console.error("Gagal memuat buku terbit:", e);
        toast.error("Gagal memuat buku terbit");
      } finally {
        setLoading(false);
      }
    };

    fetchBukuTerbit();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<z.infer<typeof FormPesanCetakSchema>>({
    resolver: zodResolver(FormPesanCetakSchema),
    defaultValues: { jumlah: 1, kurir: "jne_reg" },
  });

  // Hitung ringkasan biaya (dummy)
  const ringkasan = useMemo(() => {
    const jumlah = Number(watch("jumlah")) || 0;
    const hargaSatuan = 45000; // Rp45.000/eksemplar (dummy)
    const ongkir = 25000; // flat (dummy)
    const subtotal = jumlah * hargaSatuan;
    const total = subtotal + ongkir;
    return { hargaSatuan, ongkir, subtotal, total };
  }, [watch("jumlah")]);

  const tutupModal = () => {
    setBukuTerpilih(null);
    reset({ jumlah: 1, penerima: "", telepon: "", alamat: "", kota: "", provinsi: "", kodePos: "", kurir: "jne_reg", catatan: "" });
  };

  const onSubmit = async (v: z.infer<typeof FormPesanCetakSchema>) => {
    if (!bukuTerpilih) return;
    setProses(true);
    try {
      const payload: BuatPesananCetakPayload = {
        idNaskah: bukuTerpilih.id,
        jumlah: Number(v.jumlah),
        alamatPengiriman: {
          penerima: v.penerima,
          telepon: v.telepon,
          alamat: v.alamat,
          kota: v.kota,
          provinsi: v.provinsi,
          kodePos: v.kodePos,
        },
        kurir: v.kurir,
        catatan: v.catatan,
      };

      // Coba kirim ke backend; jika endpoint belum tersedia, tetap tampilkan sukses demo
      try {
        await percetakanApi.buatPesananCetak(payload);
        toast.success("Pesanan cetak berhasil dibuat");
      } catch (err: any) {
        // Demo fallback
        console.warn("Gagal memanggil API percetakan, menampilkan sukses demo", err?.response?.data);
        toast.success("Pesanan cetak berhasil dibuat (demo)");
      }

      tutupModal();
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat pesanan cetak");
    } finally {
      setProses(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Buku Terbit</h1>
          <p className="text-gray-600 mt-1">Galeri buku yang sudah disetujui dan siap dicetak sesuai permintaan</p>
        </div>

        {/* Galeri Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="aspect-[3/4] bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bukuTerbit.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">Belum ada buku terbit</p>
            <p className="text-gray-400 text-sm mt-2">Naskah yang disetujui akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bukuTerbit.map((buku) => (
            <div key={buku.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
              <div className="relative aspect-[3/4] bg-gray-100">
                {buku.urlSampul ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={buku.urlSampul} alt={`Sampul ${buku.judul}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                    <span className="text-sm">Tidak ada sampul</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-white/90 line-clamp-1">
                    {buku.kategori || "-"} {buku.genre ? `• ${buku.genre}` : ""}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">{buku.judul}</h3>
                <div className="mt-1 text-sm text-gray-600">Terbit pada {formatTanggalIndo(buku.terbitPada)}</div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setBukuTerpilih(buku);
                      setValue("jumlah", 100 as any); // contoh default 100 eks
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#14b8a6] text-white hover:bg-[#0d9488]"
                  >
                    <Printer className="w-4 h-4" /> Cetak Fisik
                  </button>
                  <a
                    href={`/dashboard/buku-terbit/${buku.id}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" /> Kelola
                  </a>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Modal Form Pesan Cetak */}
        {bukuTerpilih && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={tutupModal} />
            <div className="relative bg-white w-full max-w-xl mx-auto rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="text-xl font-semibold">Cetak Fisik — {bukuTerpilih.judul}</h2>
                <p className="text-sm text-gray-600 mt-1">Lengkapi detail pemesanan untuk melanjutkan</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                    <input type="number" min={1} {...register("jumlah", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.jumlah && <p className="text-sm text-rose-600 mt-1">{errors.jumlah.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kurir</label>
                    <select {...register("kurir")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <option value="jne_reg">JNE Reg</option>
                      <option value="sicepat_best">SiCepat BEST</option>
                      <option value="anteraja_reg">AnterAja Reg</option>
                    </select>
                    {errors.kurir && <p className="text-sm text-rose-600 mt-1">{errors.kurir.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
                    <input type="text" {...register("penerima")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.penerima && <p className="text-sm text-rose-600 mt-1">{errors.penerima.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telepon</label>
                    <input type="tel" {...register("telepon")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.telepon && <p className="text-sm text-rose-600 mt-1">{errors.telepon.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                    <input type="text" {...register("kodePos")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.kodePos && <p className="text-sm text-rose-600 mt-1">{errors.kodePos.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                    <textarea rows={3} {...register("alamat")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.alamat && <p className="text-sm text-rose-600 mt-1">{errors.alamat.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kota</label>
                    <input type="text" {...register("kota")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.kota && <p className="text-sm text-rose-600 mt-1">{errors.kota.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                    <input type="text" {...register("provinsi")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.provinsi && <p className="text-sm text-rose-600 mt-1">{errors.provinsi.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                    <input type="text" {...register("catatan")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                  </div>
                </div>

                {/* Ringkasan Biaya */}
                <div className="mt-5 bg-gray-50 rounded-xl p-4 border">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Harga Satuan</span>
                    <span>Rp {ringkasan.hargaSatuan.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 mt-1">
                    <span>Subtotal</span>
                    <span>Rp {ringkasan.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 mt-1">
                    <span>Ongkir</span>
                    <span>Rp {ringkasan.ongkir.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-gray-900 mt-2">
                    <span>Total</span>
                    <span>Rp {ringkasan.total.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button type="button" onClick={tutupModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={proses}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14b8a6] text-white hover:bg-[#0d9488] disabled:opacity-60"
                  >
                    <Printer className="w-4 h-4" /> {proses ? "Memproses..." : "Buat Pesanan & Bayar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
