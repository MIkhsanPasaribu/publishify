"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Printer, Settings, ExternalLink, BookOpen, Calendar, Filter } from "lucide-react";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { percetakanApi, type BuatPesananCetakPayload } from "@/lib/api/percetakan";
import { getSampulUrl } from "@/lib/utils/url";

// Fungsi untuk mendapatkan sapaan berdasarkan waktu
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

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
          urlSampul: getSampulUrl(naskah.urlSampul),
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
    
    // DEPRECATED: Modal quick order ini sudah diganti dengan halaman cetak lengkap
    // Redirect user ke halaman cetak proper
    toast.info("Mengalihkan ke halaman pemesanan lengkap...");
    window.location.href = `/penulis/buku-terbit/${bukuTerpilih.id}/cetak`;
    return;

    /* FLOW LAMA - DEPRECATED
    setProses(true);
    try {
      const alamatLengkap = `${v.alamat}, ${v.kota}, ${v.provinsi} ${v.kodePos}`;
      const payload: BuatPesananCetakPayload = {
        idNaskah: bukuTerpilih.id,
        idPercetakan: "", // Sekarang wajib diisi
        jumlah: Number(v.jumlah),
        formatKertas: "A5",
        jenisKertas: "HVS",
        jenisCover: "SOFTCOVER",
        finishingTambahan: [],
        alamatPengiriman: alamatLengkap,
        namaPenerima: v.penerima,
        teleponPenerima: v.telepon,
        catatan: v.catatan,
      };

      await percetakanApi.buatPesananCetak(payload);
      toast.success("Pesanan cetak berhasil dibuat");
      tutupModal();
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat pesanan cetak");
    } finally {
      setProses(false);
    }
    */
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1"
              >
                Buku Terbit
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs sm:text-sm md:text-base text-white/90"
              >
                Kelola buku yang telah diterbitkan
              </motion.p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Galeri buku yang sudah disetujui dan siap dicetak
          </h2>
        </div>

        {/* Galeri Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="aspect-[3/4] bg-slate-200"></div>
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bukuTerbit.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 bg-white rounded-lg border border-slate-200"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <p className="text-slate-900 text-base sm:text-lg font-semibold mb-2">Belum ada buku terbit</p>
            <p className="text-slate-600 text-xs sm:text-sm">Naskah yang disetujui akan muncul di sini</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {bukuTerbit.map((buku, index) => (
            <motion.div
              key={buku.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all"
            >
              <div className="relative aspect-[3/4] bg-slate-100">
                {buku.urlSampul ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={buku.urlSampul} alt={`Sampul ${buku.judul}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-white/90 line-clamp-1">
                    {buku.kategori || "-"} {buku.genre ? `• ${buku.genre}` : ""}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] break-words">{buku.judul}</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTanggalIndo(buku.terbitPada)}
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`/penulis/buku-terbit/${buku.id}/cetak`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-md transition-all text-xs sm:text-sm font-medium"
                  >
                    <Printer className="w-3 h-3 sm:w-4 sm:h-4" /> Cetak Fisik
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`/penulis/buku-terbit/${buku.id}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all text-xs sm:text-sm font-medium"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* Modal Form Pesan Cetak */}
        {bukuTerpilih && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={tutupModal} />
            <div className="relative bg-white w-full max-w-xl mx-auto rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="text-xl font-semibold">Cetak Fisik — {bukuTerpilih?.judul}</h2>
                <p className="text-sm text-gray-600 mt-1">Lengkapi detail pemesanan untuk melanjutkan</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                    <input type="number" min={1} {...register("jumlah", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.jumlah && <p className="text-sm text-rose-600 mt-1">{errors.jumlah?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kurir</label>
                    <select {...register("kurir")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                      <option value="jne_reg">JNE Reg</option>
                      <option value="sicepat_best">SiCepat BEST</option>
                      <option value="anteraja_reg">AnterAja Reg</option>
                    </select>
                    {errors.kurir && <p className="text-sm text-rose-600 mt-1">{errors.kurir?.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
                    <input type="text" {...register("penerima")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.penerima && <p className="text-sm text-rose-600 mt-1">{errors.penerima?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telepon</label>
                    <input type="tel" {...register("telepon")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.telepon && <p className="text-sm text-rose-600 mt-1">{errors.telepon?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                    <input type="text" {...register("kodePos")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.kodePos && <p className="text-sm text-rose-600 mt-1">{errors.kodePos?.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                    <textarea rows={3} {...register("alamat")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.alamat && <p className="text-sm text-rose-600 mt-1">{errors.alamat?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kota</label>
                    <input type="text" {...register("kota")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.kota && <p className="text-sm text-rose-600 mt-1">{errors.kota?.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                    <input type="text" {...register("provinsi")} className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500" />
                    {errors.provinsi && <p className="text-sm text-rose-600 mt-1">{errors.provinsi?.message}</p>}
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
