"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Printer, Settings, ExternalLink } from "lucide-react";
import { percetakanApi, type BuatPesananCetakPayload } from "@/lib/api/percetakan";

// ----------------------------------------------
// Dummy data untuk tampilan awal (galeri buku terbit)
// ----------------------------------------------
interface BukuTerbit {
  id: string;
  judul: string;
  urlSampul?: string;
  terbitPada: string; // ISO date
  kategori?: string;
  genre?: string;
}

const bukuTerbitDummy: BukuTerbit[] = [
  {
    id: "b1",
    judul: "Rahasia Hutan Senja",
    urlSampul: "https://images.unsplash.com/photo-1544937950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    terbitPada: "2025-11-05T08:00:00.000Z",
    kategori: "Fiksi",
    genre: "Fantasi",
  },
  {
    id: "b2",
    judul: "Memoar di Balik Kota",
    urlSampul: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    terbitPada: "2025-10-21T08:00:00.000Z",
    kategori: "Non-Fiksi",
    genre: "Biografi",
  },
  {
    id: "b3",
    judul: "Garis Waktu Asa",
    urlSampul: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop",
    terbitPada: "2025-09-12T08:00:00.000Z",
    kategori: "Fiksi",
    genre: "Romansa",
  },
  {
    id: "b4",
    judul: "Teorema Rasa Kopi",
    urlSampul: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    terbitPada: "2025-07-18T08:00:00.000Z",
    kategori: "Fiksi",
    genre: "Slice of Life",
  },
  {
    id: "b5",
    judul: "Berkebun di Balkon",
    urlSampul: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=800&auto=format&fit=crop",
    terbitPada: "2025-05-08T08:00:00.000Z",
    kategori: "Non-Fiksi",
    genre: "Hobi",
  },
  {
    id: "b6",
    judul: "Langkah Kecil Maraton",
    urlSampul: "https://images.unsplash.com/photo-1546549039-49e05b8b56d5?q=80&w=800&auto=format&fit=crop",
    terbitPada: "2025-01-15T08:00:00.000Z",
    kategori: "Non-Fiksi",
    genre: "Kesehatan",
  },
];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bukuTerbitDummy.map((buku) => (
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
