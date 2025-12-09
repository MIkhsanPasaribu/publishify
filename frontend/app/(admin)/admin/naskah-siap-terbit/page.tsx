"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  BookCheck,
  Loader2,
  FileText,
  Download,
  FileType,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { naskahApi, type Naskah } from "@/lib/api/naskah";

// Daftar format buku yang tersedia
const formatBukuList = [
  { kode: "A4", nama: "A4 (21 × 29.7 cm)", deskripsi: "Ukuran besar, cocok untuk buku teks & katalog" },
  { kode: "A5", nama: "A5 (14.8 × 21 cm)", deskripsi: "Ukuran standar novel & buku populer" },
  { kode: "B5", nama: "B5 (17.6 × 25 cm)", deskripsi: "Ukuran sedang, cocok untuk majalah & jurnal" },
] as const;

function formatTanggal(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NaskahSiapTerbitPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [modalTerbitkan, setModalTerbitkan] = useState(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [formData, setFormData] = useState({
    isbn: "",
    formatBuku: "A5" as "A4" | "A5" | "B5",
    jumlahHalaman: "",
  });

  const queryClient = useQueryClient();

  // Fetch naskah dengan status "disetujui"
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["naskah-siap-terbit"],
    queryFn: async () => {
      console.log("🔄 Fetching naskah dengan status 'disetujui'...");
      const result = await naskahApi.ambilSemuaNaskahAdmin({ status: "disetujui" });
      console.log("✅ Data naskah siap terbit:", result.data);
      return result;
    },
  });

  // Mutation untuk terbitkan naskah
  const terbitkanMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { isbn: string; formatBuku?: 'A4' | 'A5' | 'B5'; jumlahHalaman: number };
    }) => {
      console.log("🚀 Menerbitkan naskah:", { id, payload });
      const result = await naskahApi.terbitkanNaskah(id, payload);
      console.log("✅ Naskah berhasil diterbitkan:", result);
      return result;
    },
    onSuccess: (data: { sukses: boolean; pesan: string; data: Naskah }) => {
      console.log("✅ Mutation success, data:", data);
      toast.success("Naskah berhasil diterbitkan!", {
        description: `"${selectedNaskah?.judul}" sekarang berstatus diterbitkan`,
      });
      queryClient.invalidateQueries({ queryKey: ["naskah-siap-terbit"] });
      setModalTerbitkan(false);
      setSelectedNaskah(null);
      setFormData({ isbn: "", formatBuku: "A5", jumlahHalaman: "" });
      setPdfReady(false);
    },
    onError: (error: any) => {
      console.error("❌ Error menerbitkan naskah:", error);
      const message = error?.response?.data?.pesan || error.message || "Terjadi kesalahan";
      toast.error("Gagal menerbitkan naskah", {
        description: message,
      });
    },
  });

  const naskahList = response?.data || [];

  // Filter berdasarkan search
  const filteredNaskah = naskahList.filter((naskah: Naskah) => {
    const matchSearch =
      naskah.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (naskah.subJudul?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const handleTerbitkan = (naskah: Naskah) => {
    console.log("📖 Membuka modal terbitkan untuk naskah:", naskah);
    setSelectedNaskah(naskah);
    setFormData({
      isbn: naskah.isbn || "",
      formatBuku: (naskah.formatBuku as "A4" | "A5" | "B5") || "A5",
      jumlahHalaman: naskah.jumlahHalaman?.toString() || "",
    });
    setPdfReady(false);
    setModalTerbitkan(true);
  };

  // Handler untuk konversi Word ke PDF (simulasi)
  const handleConvertToPdf = async () => {
    if (!selectedNaskah?.urlFile) {
      toast.error("Tidak ada file naskah untuk dikonversi");
      return;
    }

    setIsConvertingPdf(true);
    
    // Simulasi proses konversi (dalam implementasi nyata, ini akan memanggil API backend)
    try {
      // TODO: Implementasi konversi Word ke PDF di backend
      // const result = await uploadApi.convertToPdf(selectedNaskah.urlFile);
      
      // Simulasi delay konversi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPdfReady(true);
      toast.success("File berhasil dikonversi ke PDF!", {
        description: "File PDF siap untuk diterbitkan",
      });
    } catch (error: any) {
      toast.error("Gagal mengkonversi file", {
        description: error.message || "Terjadi kesalahan saat konversi",
      });
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const handleSubmitTerbitkan = () => {
    if (!selectedNaskah) return;

    // Validasi
    if (!formData.isbn.trim()) {
      toast.error("ISBN wajib diisi");
      return;
    }

    const jumlahHalaman = parseInt(formData.jumlahHalaman);
    if (isNaN(jumlahHalaman) || jumlahHalaman <= 0) {
      toast.error("Jumlah halaman harus lebih dari 0");
      return;
    }

    console.log("📝 Submitting form:", { 
      isbn: formData.isbn, 
      formatBuku: formData.formatBuku,
      jumlahHalaman 
    });

    terbitkanMutation.mutate({
      id: selectedNaskah.id,
      payload: {
        isbn: formData.isbn.trim(),
        formatBuku: formData.formatBuku,
        jumlahHalaman,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
              Naskah Siap Terbit
            </h1>
            <p className="text-gray-600 mt-2">
              Naskah yang sudah disetujui editor dan siap untuk diterbitkan
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <BookCheck className="h-6 w-6 text-slate-600" />
                </div>
                <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
              <p className="text-sm text-slate-700 font-medium">Menunggu Penerbitan</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{filteredNaskah.length}</p>
              <p className="text-xs text-slate-600 mt-2">Naskah siap diterbitkan</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-700 font-medium">Status</p>
              <p className="text-2xl font-bold text-green-900 mt-1">Disetujui</p>
              <p className="text-xs text-green-600 mt-2">Lolos review editor</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-700 font-medium">Aksi Diperlukan</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">Input Data</p>
              <p className="text-xs text-blue-600 mt-2">ISBN, format & halaman</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan judul naskah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="border-2">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
                <p className="text-gray-500">Memuat data naskah...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Gagal memuat data</p>
                  <p className="text-sm text-red-700">{(error as any).message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredNaskah.length === 0 && (
          <Card className="border-2">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-slate-100 rounded-full">
                  <BookCheck className="h-12 w-12 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Tidak ada naskah siap terbit</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Semua naskah yang disetujui sudah diterbitkan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* List Naskah */}
        {!isLoading && !error && filteredNaskah.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {filteredNaskah.map((naskah: Naskah) => (
              <Card
                key={naskah.id}
                className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover Image */}
                    <div className="flex-shrink-0">
                      {naskah.urlSampul ? (
                        <img
                          src={naskah.urlSampul}
                          alt={naskah.judul}
                          className="w-32 h-48 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-32 h-48 bg-gradient-to-br from-slate-200 to-gray-300 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* Title & Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{naskah.judul}</h3>
                          <Badge className="bg-green-100 text-green-800 border-2 border-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Disetujui
                          </Badge>
                        </div>
                        {naskah.subJudul && (
                          <p className="text-lg text-gray-600 italic">{naskah.subJudul}</p>
                        )}
                      </div>

                      {/* Sinopsis */}
                      <p className="text-gray-700 line-clamp-2">{naskah.sinopsis}</p>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Format</p>
                          <p className="font-semibold">{naskah.formatBuku || "A5"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Halaman</p>
                          <p className="font-semibold">{naskah.jumlahHalaman || "-"} hal</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Kata</p>
                          <p className="font-semibold">
                            {naskah.jumlahKata?.toLocaleString("id-ID") || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Bahasa</p>
                          <p className="font-semibold">{naskah.bahasaTulis}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Disetujui</p>
                          <p className="font-semibold">{formatTanggal(naskah.diperbaruiPada)}</p>
                        </div>
                      </div>

                      {/* Review Info */}
                      {naskah.review && naskah.review.length > 0 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-green-900 mb-2">
                            ✅ Review Terakhir:
                          </p>
                          {naskah.review[0].catatan && (
                            <p className="text-sm text-green-700 italic">
                              "{naskah.review[0].catatan}"
                            </p>
                          )}
                          <p className="text-xs text-green-600 mt-2">
                            Selesai: {formatTanggal(naskah.review[0].selesaiPada || naskah.review[0].ditugaskanPada)}
                          </p>
                        </div>
                      )}

                      {/* ISBN if exists */}
                      {naskah.isbn && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            <span className="font-semibold">ISBN:</span> {naskah.isbn}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleTerbitkan(naskah)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          <BookCheck className="h-4 w-4 mr-2" />
                          Terbitkan Naskah
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Terbitkan Naskah */}
      <Dialog open={modalTerbitkan} onOpenChange={setModalTerbitkan}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terbitkan Naskah</DialogTitle>
            <DialogDescription>
              Finalisasi naskah dengan konversi ke PDF, lalu isi data penerbitan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Naskah Info */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{selectedNaskah?.judul}</p>
              {selectedNaskah?.subJudul && (
                <p className="text-sm text-gray-600 italic">{selectedNaskah.subJudul}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>Format: {selectedNaskah?.formatBuku || "A5"}</span>
                <span>•</span>
                <span>{selectedNaskah?.jumlahKata?.toLocaleString("id-ID") || "-"} kata</span>
              </div>
            </div>

            {/* Step 1: Konversi PDF */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${pdfReady ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  1
                </div>
                <Label className="text-base font-semibold">Konversi ke PDF (Opsional)</Label>
              </div>
              
              <div className="ml-9 space-y-3">
                {selectedNaskah?.urlFile ? (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">File Naskah</p>
                          <p className="text-xs text-blue-600 truncate max-w-[200px]">
                            {selectedNaskah.urlFile.split('/').pop()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedNaskah.urlFile!, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Unduh
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleConvertToPdf}
                          disabled={isConvertingPdf || pdfReady}
                          className={pdfReady ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          {isConvertingPdf ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Mengkonversi...
                            </>
                          ) : pdfReady ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              PDF Siap
                            </>
                          ) : (
                            <>
                              <FileType className="h-4 w-4 mr-1" />
                              Konversi ke PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      ⚠️ Tidak ada file naskah yang terunggah
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Konversi file Word ke PDF agar tampilan konsisten di semua platform
                </p>
              </div>
            </div>

            {/* Step 2: Form Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  2
                </div>
                <Label className="text-base font-semibold">Data Penerbitan</Label>
              </div>

              <div className="ml-9 space-y-4">
                {/* ISBN */}
                <div>
                  <Label htmlFor="isbn" className="text-sm font-semibold">
                    ISBN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="isbn"
                    placeholder="978-602-xxxxx-x-x"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nomor ISBN yang sudah terdaftar di Perpusnas
                  </p>
                </div>

                {/* Format Buku */}
                <div>
                  <Label className="text-sm font-semibold">
                    Format Buku <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {formatBukuList.map((format) => (
                      <button
                        key={format.kode}
                        type="button"
                        onClick={() => setFormData({ ...formData, formatBuku: format.kode })}
                        className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                          formData.formatBuku === format.kode
                            ? "border-[#14b8a6] bg-[#14b8a6]/5 shadow-md ring-2 ring-[#14b8a6]/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {formData.formatBuku === format.kode && (
                          <div className="absolute top-1.5 right-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#14b8a6]" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className={`font-semibold text-sm ${
                            formData.formatBuku === format.kode ? "text-[#14b8a6]" : "text-gray-900"
                          }`}>
                            {format.kode}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format.nama.match(/\(([^)]+)\)/)?.[1]}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatBukuList.find((f) => f.kode === formData.formatBuku)?.deskripsi}
                  </p>
                </div>

                {/* Jumlah Halaman */}
                <div>
                  <Label htmlFor="jumlahHalaman" className="text-sm font-semibold">
                    Jumlah Halaman <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="jumlahHalaman"
                    type="number"
                    placeholder="250"
                    value={formData.jumlahHalaman}
                    onChange={(e) => setFormData({ ...formData, jumlahHalaman: e.target.value })}
                    className="mt-1.5"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jumlah halaman buku setelah layout final
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ⚠️ Setelah diterbitkan, naskah akan muncul di halaman "Buku Terbit" penulis.
                Harga cetak akan ditentukan oleh mitra percetakan saat penulis melakukan checkout.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTerbitkan(false)} disabled={terbitkanMutation.isPending}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitTerbitkan}
              disabled={terbitkanMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {terbitkanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menerbitkan...
                </>
              ) : (
                <>
                  <BookCheck className="h-4 w-4 mr-2" />
                  Terbitkan Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
