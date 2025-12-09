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

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function NaskahSiapTerbitPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [modalTerbitkan, setModalTerbitkan] = useState(false);
  const [formData, setFormData] = useState({
    isbn: "",
    biayaProduksi: "",
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
      payload: { isbn: string; biayaProduksi: number };
    }) => {
      console.log("🚀 Menerbitkan naskah:", { id, payload });
      const result = await naskahApi.terbitkanNaskah(id, payload);
      console.log("✅ Naskah berhasil diterbitkan:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("✅ Mutation success, data:", data);
      toast.success("Naskah berhasil diterbitkan!", {
        description: `"${selectedNaskah?.judul}" sekarang berstatus diterbitkan`,
      });
      queryClient.invalidateQueries({ queryKey: ["naskah-siap-terbit"] });
      setModalTerbitkan(false);
      setSelectedNaskah(null);
      setFormData({ isbn: "", biayaProduksi: "" });
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
  const filteredNaskah = naskahList.filter((naskah) => {
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
      biayaProduksi: "",
    });
    setModalTerbitkan(true);
  };

  const handleSubmitTerbitkan = () => {
    if (!selectedNaskah) return;

    // Validasi
    if (!formData.isbn.trim()) {
      toast.error("ISBN wajib diisi");
      return;
    }

    const biaya = parseFloat(formData.biayaProduksi);
    if (isNaN(biaya) || biaya <= 0) {
      toast.error("Biaya produksi harus lebih dari 0");
      return;
    }

    console.log("📝 Submitting form:", { isbn: formData.isbn, biayaProduksi: biaya });

    terbitkanMutation.mutate({
      id: selectedNaskah.id,
      payload: {
        isbn: formData.isbn.trim(),
        biayaProduksi: biaya,
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
              <p className="text-2xl font-bold text-blue-900 mt-1">Input ISBN</p>
              <p className="text-xs text-blue-600 mt-2">& biaya produksi</p>
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
            {filteredNaskah.map((naskah) => (
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terbitkan Naskah</DialogTitle>
            <DialogDescription>
              Masukkan ISBN dan biaya produksi untuk menerbitkan naskah ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Naskah Info */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{selectedNaskah?.judul}</p>
              {selectedNaskah?.subJudul && (
                <p className="text-sm text-gray-600 italic">{selectedNaskah.subJudul}</p>
              )}
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>{selectedNaskah?.jumlahHalaman} hal</span>
                <span>•</span>
                <span>{selectedNaskah?.jumlahKata?.toLocaleString("id-ID")} kata</span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
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

              <div>
                <Label htmlFor="biayaProduksi" className="text-sm font-semibold">
                  Biaya Produksi (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="biayaProduksi"
                  type="number"
                  placeholder="50000"
                  value={formData.biayaProduksi}
                  onChange={(e) => setFormData({ ...formData, biayaProduksi: e.target.value })}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Estimasi biaya cetak per eksemplar
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ⚠️ Setelah diterbitkan, naskah akan muncul di halaman "Buku Terbit" penulis dan
                tidak dapat dikembalikan ke status disetujui.
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
