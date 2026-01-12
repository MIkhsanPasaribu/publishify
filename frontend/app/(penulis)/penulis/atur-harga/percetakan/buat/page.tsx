/**
 * Form Buat Pesanan Cetak Baru
 * Penulis membuat pesanan cetak untuk naskah yang sudah diterbitkan
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";
import {
  BookOpen,
  Package,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

interface FormData {
  idNaskah: string;
  jumlah: number;
  formatKertas: string;
  jenisKertas: string;
  jenisCover: string;
  finishingTambahan: string[];
  catatan: string;
}

const formatKertasOptions = ["A4", "A5", "B5", "Letter", "Custom"];
const jenisKertasOptions = [
  "HVS 70gr",
  "HVS 80gr",
  "Art Paper 120gr",
  "Art Paper 150gr",
  "Bookpaper",
];
const jenisCoverOptions = ["Soft Cover", "Hard Cover", "Board Cover"];
const finishingOptions = [
  "Laminasi Glossy",
  "Laminasi Doff",
  "Emboss",
  "Deboss",
  "Spot UV",
  "Foil",
  "Tidak Ada",
];

// Harga dasar per unit (dalam Rupiah) - contoh
const HARGA_BASE = {
  formatKertas: { A4: 5000, A5: 4000, B5: 4500, Letter: 5000, Custom: 6000 },
  jenisKertas: {
    "HVS 70gr": 2000,
    "HVS 80gr": 2500,
    "Art Paper 120gr": 4000,
    "Art Paper 150gr": 5000,
    Bookpaper: 3000,
  },
  jenisCover: {
    "Soft Cover": 5000,
    "Hard Cover": 15000,
    "Board Cover": 10000,
  },
  finishing: {
    "Laminasi Glossy": 3000,
    "Laminasi Doff": 3000,
    Emboss: 5000,
    Deboss: 5000,
    "Spot UV": 7000,
    Foil: 8000,
    "Tidak Ada": 0,
  },
};

function BuatPesananCetakContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const naskahIdParam = searchParams.get("naskahId");

  const [loading, setLoading] = useState(false);
  const [naskahList, setNaskahList] = useState<any[]>([]);
  const [selectedNaskah, setSelectedNaskah] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    idNaskah: naskahIdParam || "",
    jumlah: 0,
    formatKertas: "A5",
    jenisKertas: "HVS 80gr",
    jenisCover: "Soft Cover",
    finishingTambahan: [],
    catatan: "",
  });

  useEffect(() => {
    ambilNaskahDiterbitkan();
  }, []);

  useEffect(() => {
    if (formData.idNaskah) {
      const naskah = naskahList.find((n) => n.id === formData.idNaskah);
      setSelectedNaskah(naskah);
    }
  }, [formData.idNaskah, naskahList]);

  async function ambilNaskahDiterbitkan() {
    try {
      const response = await naskahApi.ambilNaskahDiterbitkan();
      setNaskahList(response.data);
    } catch (error) {
      console.error("Error mengambil naskah diterbitkan:", error);
      toast.error("Gagal mengambil daftar naskah");
    }
  }

  function hitungHargaTotal(): number {
    const { idNaskah, jumlah, formatKertas, jenisKertas, jenisCover, finishingTambahan } =
      formData;

    // Return 0 jika belum pilih naskah atau jumlah masih 0
    if (!idNaskah || jumlah === 0) {
      return 0;
    }

    const hargaFormat =
      HARGA_BASE.formatKertas[formatKertas as keyof typeof HARGA_BASE.formatKertas] || 0;
    const hargaJenis =
      HARGA_BASE.jenisKertas[jenisKertas as keyof typeof HARGA_BASE.jenisKertas] || 0;
    const hargaCover =
      HARGA_BASE.jenisCover[jenisCover as keyof typeof HARGA_BASE.jenisCover] || 0;
    const hargaFinishing = finishingTambahan.reduce((total, finishing) => {
      return total + (HARGA_BASE.finishing[finishing as keyof typeof HARGA_BASE.finishing] || 0);
    }, 0);

    const hargaPerUnit = hargaFormat + hargaJenis + hargaCover + hargaFinishing;
    return hargaPerUnit * jumlah;
  }

  function formatRupiah(angka: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: API call
      // await percetakanApi.buatPesanan(formData);
      console.log("Submit pesanan:", formData);
      
      alert("Pesanan berhasil dibuat!");
      router.push("/penulis/penulis/percetakan/pesanan");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  const hargaTotal = hitungHargaTotal();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Buat Pesanan Cetak
          </h1>
          <p className="text-gray-600 mt-1">
            Pesan cetak fisik untuk naskah yang sudah diterbitkan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pilih Naskah */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Pilih Naskah
            </h2>
          </div>

          <select
            required
            value={formData.idNaskah}
            onChange={(e) =>
              setFormData({ ...formData, idNaskah: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">-- Pilih Naskah --</option>
            {naskahList.map((naskah) => (
              <option key={naskah.id} value={naskah.id}>
                {naskah.judul} {naskah.isbn ? `(ISBN: ${naskah.isbn})` : ""}
              </option>
            ))}
          </select>

          {selectedNaskah && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Sinopsis:</strong> {selectedNaskah.sinopsis}
              </p>
              {selectedNaskah.jumlahHalaman && (
                <p className="text-sm text-gray-600">
                  <strong>Jumlah Halaman:</strong>{" "}
                  {selectedNaskah.jumlahHalaman} hal
                </p>
              )}
            </div>
          )}
        </div>

        {/* Spesifikasi Cetak */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              2. Spesifikasi Cetak
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jumlah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Eksemplar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="10000"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 1, maksimum 10.000 eksemplar
              </p>
            </div>

            {/* Format Kertas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format Kertas <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.formatKertas}
                onChange={(e) =>
                  setFormData({ ...formData, formatKertas: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {formatKertasOptions.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Kertas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kertas <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.jenisKertas}
                onChange={(e) =>
                  setFormData({ ...formData, jenisKertas: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {jenisKertasOptions.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Cover */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Cover <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.jenisCover}
                onChange={(e) =>
                  setFormData({ ...formData, jenisCover: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {jenisCoverOptions.map((cover) => (
                  <option key={cover} value={cover}>
                    {cover}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Finishing Tambahan */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Finishing Tambahan (Opsional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {finishingOptions.map((finishing) => (
                <label
                  key={finishing}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.finishingTambahan.includes(finishing)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          finishingTambahan: [
                            ...formData.finishingTambahan,
                            finishing,
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          finishingTambahan:
                            formData.finishingTambahan.filter(
                              (f) => f !== finishing
                            ),
                        });
                      }
                    }}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{finishing}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              value={formData.catatan}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              maxLength={1000}
              rows={4}
              placeholder="Tambahkan catatan khusus untuk pesanan ini..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.catatan.length}/1000 karakter
            </p>
          </div>
        </div>

        {/* Ringkasan Harga */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Estimasi Biaya
            </h2>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jumlah Eksemplar:</span>
              <span className="font-medium text-gray-900">
                {formData.jumlah} pcs
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Format & Jenis Kertas:</span>
              <span className="font-medium text-gray-900">
                {formData.formatKertas} - {formData.jenisKertas}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jenis Cover:</span>
              <span className="font-medium text-gray-900">
                {formData.jenisCover}
              </span>
            </div>
            {formData.finishingTambahan.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Finishing:</span>
                <span className="font-medium text-gray-900">
                  {formData.finishingTambahan.join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="h-px bg-teal-200 my-4"></div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              Total Biaya:
            </span>
            <span className="text-2xl font-bold text-teal-600">
              {formatRupiah(hargaTotal)}
            </span>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                Harga ini adalah estimasi. Harga final akan dikonfirmasi oleh
                percetakan setelah pesanan diterima.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !formData.idNaskah}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Buat Pesanan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BuatPesananCetak() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    }>
      <BuatPesananCetakContent />
    </Suspense>
  );
}
