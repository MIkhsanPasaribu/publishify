"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";
import api from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Calendar, 
  User, 
  FileText,
  UserPlus,
  Clock,
  AlertCircle
} from "lucide-react";

// ================================
// INTERFACES
// ================================

interface NaskahDiajukan {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  status: string;
  dibuatPada: string;
  diperbaruiPada: string;
  penulis: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
  kategori?: {
    nama: string;
  };
  genre?: {
    nama: string;
  };
}

interface Editor {
  id: string;
  email: string;
  telepon?: string;
  aktif: boolean;
  terverifikasi: boolean;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
    namaTampilan?: string;
    urlAvatar?: string;
  };
  peranPengguna: Array<{
    jenisPeran: "penulis" | "editor" | "percetakan" | "admin";
  }>;
}

// ================================
// MAIN COMPONENT
// ================================

export default function AntrianReviewPage() {
  const router = useRouter();
  const [naskahList, setNaskahList] = useState<NaskahDiajukan[]>([]);
  const [editorList, setEditorList] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNaskah, setSelectedNaskah] = useState<NaskahDiajukan | null>(null);
  const [selectedEditor, setSelectedEditor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [pencarian, setPencarian] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch naskah dengan status 'diajukan'
      const naskahResponse = await naskahApi.ambilSemuaNaskahAdmin({
        limit: 100,
      });
      
      const allNaskah = naskahResponse.data || [];
      const naskahDiajukan = allNaskah.filter((n: any) => n.status === "diajukan");
      
      console.log("📚 Total naskah diajukan:", naskahDiajukan.length);
      setNaskahList(naskahDiajukan as NaskahDiajukan[]);

      // Fetch daftar editor menggunakan filter peran
      const editorResponse = await api.get("/pengguna", {
        params: {
          limit: 100,
          peran: "editor", // Filter langsung dari backend berdasarkan tabel peran_pengguna
        },
      });
      
      const editors = editorResponse.data?.data || [];
      
      console.log("👤 Total editor tersedia:", editors.length);
      console.log("� Data editor:", editors);
      setEditorList(editors);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleTugaskanEditor = (naskah: NaskahDiajukan) => {
    setSelectedNaskah(naskah);
    setSelectedEditor("");
    setDialogOpen(true);
  };

  const handleSubmitTugasan = async () => {
    if (!selectedNaskah || !selectedEditor) {
      toast.error("Pilih editor terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      // Panggil API untuk tugaskan review
      await api.post("/review/tugaskan", {
        idNaskah: selectedNaskah.id,
        idEditor: selectedEditor,
        catatan: `Review ditugaskan oleh admin untuk naskah "${selectedNaskah.judul}"`,
      });

      toast.success("Editor berhasil ditugaskan! Status naskah berubah menjadi 'Dalam Review'");
      
      // Refresh data
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error tugaskan editor:", error);
      toast.error(
        error.response?.data?.pesan || 
        error.response?.data?.message ||
        "Gagal menugaskan editor"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";
    try {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  const getNamaPenulis = (penulis: any) => {
    if (!penulis) return "Unknown";
    if (penulis.profilPengguna) {
      const { namaDepan, namaBelakang } = penulis.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || penulis.email;
    }
    return penulis.email;
  };

  const getNamaEditor = (editor: Editor) => {
    if (editor.profilPengguna) {
      const { namaDepan, namaBelakang } = editor.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || editor.email;
    }
    return editor.email;
  };

  // Filter berdasarkan pencarian
  const naskahTerfilter = naskahList.filter((naskah) => {
    if (!pencarian) return true;
    const query = pencarian.toLowerCase();
    const namaPenulis = getNamaPenulis(naskah.penulis).toLowerCase();
    return (
      naskah.judul?.toLowerCase().includes(query) ||
      naskah.sinopsis?.toLowerCase().includes(query) ||
      namaPenulis.includes(query) ||
      naskah.kategori?.nama?.toLowerCase().includes(query) ||
      naskah.genre?.nama?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Antrian Review
              </h1>
              <p className="text-gray-600">
                Naskah yang menunggu untuk ditugaskan ke editor
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">
                  Tentang Antrian Review
                </p>
                <p className="text-blue-700">
                  Halaman ini menampilkan naskah dengan status <strong>"Diajukan"</strong>. 
                  Tugaskan editor untuk melakukan review, dan status akan otomatis berubah 
                  menjadi <strong>"Dalam Review"</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 mb-1">
                    Total Naskah Diajukan
                  </p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {naskahList.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-xl">
                  <BookOpen className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1">
                    Editor Tersedia
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {editorList.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <User className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">
                    Naskah Terfilter
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {naskahTerfilter.length}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <FileText className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Cari naskah (judul, penulis, kategori, genre)..."
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && naskahTerfilter.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tidak Ada Naskah Diajukan
                  </h3>
                  <p className="text-gray-600">
                    {pencarian 
                      ? "Tidak ada naskah yang cocok dengan pencarian Anda"
                      : "Belum ada naskah yang menunggu review saat ini"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Naskah List */}
        {!loading && naskahTerfilter.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {naskahTerfilter.map((naskah) => (
              <Card 
                key={naskah.id} 
                className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-yellow-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                            {naskah.judul}
                          </h3>
                          {naskah.subJudul && (
                            <p className="text-sm text-gray-600 mb-2">
                              {naskah.subJudul}
                            </p>
                          )}
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Menunggu Review
                          </Badge>
                        </div>
                      </div>

                      {/* Sinopsis */}
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {naskah.sinopsis}
                      </p>

                      {/* Meta Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Penulis:</span>
                          <span>{getNamaPenulis(naskah.penulis)}</span>
                        </div>
                        
                        {naskah.kategori && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Kategori:</span>
                            <span>{naskah.kategori.nama}</span>
                          </div>
                        )}
                        
                        {naskah.genre && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Genre:</span>
                            <span>{naskah.genre.nama}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Diajukan:</span>
                          <span>{formatTanggal(naskah.diperbaruiPada)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleTugaskanEditor(naskah)}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Tugaskan Editor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Tugaskan Editor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tugaskan Editor untuk Review</DialogTitle>
            <DialogDescription>
              Pilih editor yang akan melakukan review naskah ini. Status naskah 
              akan otomatis berubah menjadi "Dalam Review".
            </DialogDescription>
          </DialogHeader>

          {selectedNaskah && (
            <div className="space-y-4 py-4">
              {/* Info Naskah */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {selectedNaskah.judul}
                </h4>
                <p className="text-sm text-gray-600">
                  Penulis: {getNamaPenulis(selectedNaskah.penulis)}
                </p>
              </div>

              {/* Pilih Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Pilih Editor <span className="text-red-500">*</span>
                </label>
                <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih Editor --" />
                  </SelectTrigger>
                  <SelectContent>
                    {editorList.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Tidak ada editor tersedia
                      </div>
                    ) : (
                      editorList.map((editor) => (
                        <SelectItem key={editor.id} value={editor.id}>
                          {getNamaEditor(editor)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Editor yang dipilih akan menerima tugas untuk mereview naskah ini
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitTugasan}
                  disabled={!selectedEditor || submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? "Memproses..." : "Tugaskan"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
