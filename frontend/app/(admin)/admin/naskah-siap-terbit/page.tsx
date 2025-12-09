"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  BookCheck,
  Loader2,
  FileText,
  Download,
  FileType,
  Upload,
  Image as ImageIcon,
  Lock,
  ExternalLink,
  AlertTriangle,
  X,
  File,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { naskahApi, type Naskah } from "@/lib/api/naskah";

// ============================================
// CONSTANTS
// ============================================

const formatBukuList = [
  { kode: "A4", nama: "A4", ukuran: "21 × 29.7 cm", deskripsi: "Buku teks & katalog" },
  { kode: "A5", nama: "A5", ukuran: "14.8 × 21 cm", deskripsi: "Novel & buku populer" },
  { kode: "B5", nama: "B5", ukuran: "17.6 × 25 cm", deskripsi: "Majalah & jurnal" },
] as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

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

function getFileExtension(url: string): string {
  const filename = url.split("/").pop() || "";
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ext;
}

function getFileName(url: string): string {
  return url.split("/").pop() || "file";
}

// ============================================
// DROPZONE COMPONENT
// ============================================

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
  helperText: string;
  icon: React.ReactNode;
  selectedFile?: File | null;
  onClear?: () => void;
  disabled?: boolean;
}

function Dropzone({
  onFileSelect,
  accept,
  label,
  helperText,
  icon,
  selectedFile,
  onClear,
  disabled,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;

        if (acceptedTypes.includes(fileExt) || acceptedTypes.includes(file.type)) {
          onFileSelect(file);
        } else {
          toast.error("Format file tidak didukung", {
            description: `Hanya menerima file ${accept}`,
          });
        }
      }
    },
    [accept, onFileSelect, disabled]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  if (selectedFile) {
    return (
      <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {onClear && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-2">
        <div className={`p-3 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
          {icon}
        </div>
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function NaskahSiapTerbitPage() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [modalTerbitkan, setModalTerbitkan] = useState(false);
  const [modalPreviewPdf, setModalPreviewPdf] = useState(false);

  // PDF Workflow State
  const [activeTab, setActiveTab] = useState<"konversi" | "upload">("konversi");
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [isPdfLocked, setIsPdfLocked] = useState(false);
  const [pdfConfirmationChecked, setPdfConfirmationChecked] = useState(false);

  // Cover Upload State
  const [uploadedCoverFile, setUploadedCoverFile] = useState<File | null>(null);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);

  // Form Data State
  const [formData, setFormData] = useState({
    isbn: "",
    formatBuku: "A5" as "A4" | "A5" | "B5",
    jumlahHalaman: "",
  });

  const queryClient = useQueryClient();

  // ============================================
  // API QUERIES & MUTATIONS
  // ============================================

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["naskah-siap-terbit"],
    queryFn: async () => {
      const result = await naskahApi.ambilSemuaNaskahAdmin({ status: "disetujui" });
      return result;
    },
  });

  const terbitkanMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { isbn: string; formatBuku?: "A4" | "A5" | "B5"; jumlahHalaman: number };
    }) => {
      const result = await naskahApi.terbitkanNaskah(id, payload);
      return result;
    },
    onSuccess: () => {
      toast.success("Naskah berhasil diterbitkan!", {
        description: `"${selectedNaskah?.judul}" sekarang berstatus diterbitkan`,
      });
      queryClient.invalidateQueries({ queryKey: ["naskah-siap-terbit"] });
      resetModal();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.pesan || error.message || "Terjadi kesalahan";
      toast.error("Gagal menerbitkan naskah", { description: message });
    },
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const naskahList = response?.data || [];
  const filteredNaskah = naskahList.filter((naskah: Naskah) => {
    const matchSearch =
      naskah.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (naskah.subJudul?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Final PDF URL (dari konversi atau upload)
  const finalPdfUrl = activeTab === "konversi" ? convertedPdfUrl : uploadedPdfUrl;
  const hasFinalPdf = !!finalPdfUrl;

  // ============================================
  // HANDLERS
  // ============================================

  const resetModal = () => {
    setModalTerbitkan(false);
    setSelectedNaskah(null);
    setActiveTab("konversi");
    setIsConvertingPdf(false);
    setConvertedPdfUrl(null);
    setUploadedPdfFile(null);
    setUploadedPdfUrl(null);
    setIsPdfLocked(false);
    setPdfConfirmationChecked(false);
    setUploadedCoverFile(null);
    setUploadedCoverUrl(null);
    setFormData({ isbn: "", formatBuku: "A5", jumlahHalaman: "" });
  };

  const handleOpenTerbitkan = (naskah: Naskah) => {
    setSelectedNaskah(naskah);
    setFormData({
      isbn: naskah.isbn || "",
      formatBuku: (naskah.formatBuku as "A4" | "A5" | "B5") || "A5",
      jumlahHalaman: naskah.jumlahHalaman?.toString() || "",
    });
    setModalTerbitkan(true);
  };

  const handleDownloadOriginal = () => {
    if (selectedNaskah?.urlFile) {
      window.open(selectedNaskah.urlFile, "_blank");
    }
  };

  const handleConvertToPdf = async () => {
    if (!selectedNaskah?.urlFile) {
      toast.error("Tidak ada file naskah untuk dikonversi");
      return;
    }

    setIsConvertingPdf(true);
    setConvertedPdfUrl(null);

    try {
      // TODO: Implementasi konversi Word ke PDF di backend
      // const result = await uploadApi.convertToPdf(selectedNaskah.urlFile);
      // setConvertedPdfUrl(result.data.url);

      // Simulasi konversi (2 detik)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Untuk simulasi, gunakan URL file asli (dalam implementasi nyata, ini akan jadi URL PDF hasil konversi)
      const simulatedPdfUrl = selectedNaskah.urlFile.replace(/\.[^.]+$/, ".pdf");
      setConvertedPdfUrl(simulatedPdfUrl);

      toast.success("Konversi berhasil!", {
        description: "File PDF hasil konversi siap untuk di-preview",
      });
    } catch (error: any) {
      toast.error("Gagal mengkonversi file", {
        description: error.message || "Terjadi kesalahan saat konversi",
      });
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const handleUploadPdf = async (file: File) => {
    setUploadedPdfFile(file);

    // TODO: Upload file ke storage
    // const result = await uploadApi.uploadFile(file);
    // setUploadedPdfUrl(result.data.url);

    // Simulasi upload
    const fakeUrl = URL.createObjectURL(file);
    setUploadedPdfUrl(fakeUrl);

    toast.success("File PDF berhasil dipilih", {
      description: "Silakan preview dan konfirmasi",
    });
  };

  const handleUploadCover = async (file: File) => {
    setUploadedCoverFile(file);

    // TODO: Upload file ke storage
    // const result = await uploadApi.uploadFile(file);
    // setUploadedCoverUrl(result.data.url);

    // Simulasi upload
    const fakeUrl = URL.createObjectURL(file);
    setUploadedCoverUrl(fakeUrl);

    toast.success("File cover berhasil dipilih");
  };

  const handlePreviewPdf = () => {
    if (finalPdfUrl) {
      setModalPreviewPdf(true);
    }
  };

  const handleLockPdf = () => {
    if (!pdfConfirmationChecked) {
      toast.error("Anda harus mencentang konfirmasi terlebih dahulu");
      return;
    }
    setIsPdfLocked(true);
    toast.success("File PDF telah dikunci!", {
      description: "Silakan lanjutkan ke pengisian data penerbitan",
    });
  };

  const handleUnlockPdf = () => {
    setIsPdfLocked(false);
    setPdfConfirmationChecked(false);
  };

  const handleSubmitTerbitkan = () => {
    if (!selectedNaskah) return;

    // Validasi PDF
    if (!isPdfLocked) {
      toast.error("PDF belum dikunci", {
        description: "Pastikan Anda sudah mengunci file PDF final",
      });
      return;
    }

    // Validasi form
    if (!formData.isbn.trim()) {
      toast.error("ISBN wajib diisi");
      return;
    }

    const jumlahHalaman = parseInt(formData.jumlahHalaman);
    if (isNaN(jumlahHalaman) || jumlahHalaman <= 0) {
      toast.error("Jumlah halaman harus lebih dari 0");
      return;
    }

    terbitkanMutation.mutate({
      id: selectedNaskah.id,
      payload: {
        isbn: formData.isbn.trim(),
        formatBuku: formData.formatBuku,
        jumlahHalaman,
      },
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
              Naskah Siap Terbit
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Naskah yang sudah disetujui editor dan siap untuk diterbitkan
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <BookCheck className="h-5 w-5 text-slate-600" />
                </div>
                <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>
              <p className="text-sm text-slate-700 font-medium">Menunggu Penerbitan</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                {filteredNaskah.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-700 font-medium">Status</p>
              <p className="text-xl md:text-2xl font-bold text-green-900 mt-1">Disetujui</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-700 font-medium">Langkah Selanjutnya</p>
              <p className="text-xl md:text-2xl font-bold text-blue-900 mt-1">PDF & ISBN</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-2">
          <CardContent className="pt-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan judul naskah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="border-2">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
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
                  <AlertTriangle className="h-5 w-5 text-red-600" />
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
                  <BookCheck className="h-10 w-10 text-slate-400" />
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
          <div className="space-y-4">
            {filteredNaskah.map((naskah: Naskah) => (
              <Card key={naskah.id} className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Cover */}
                    <div className="flex-shrink-0 flex justify-center lg:justify-start">
                      {naskah.urlSampul ? (
                        <img
                          src={naskah.urlSampul}
                          alt={naskah.judul}
                          className="w-24 h-36 md:w-28 md:h-42 lg:w-32 lg:h-48 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-36 md:w-28 md:h-42 lg:w-32 lg:h-48 bg-gradient-to-br from-slate-200 to-gray-300 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Title & Badge */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                            {naskah.judul}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 border border-green-200 self-start">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Disetujui
                          </Badge>
                        </div>
                        {naskah.subJudul && (
                          <p className="text-sm md:text-base text-gray-600 italic">
                            {naskah.subJudul}
                          </p>
                        )}
                      </div>

                      {/* Sinopsis */}
                      <p className="text-sm text-gray-700 line-clamp-2">{naskah.sinopsis}</p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-gray-600">
                        <span>
                          <span className="text-gray-400">Format:</span>{" "}
                          <span className="font-medium">{naskah.formatBuku || "A5"}</span>
                        </span>
                        <span>
                          <span className="text-gray-400">Halaman:</span>{" "}
                          <span className="font-medium">{naskah.jumlahHalaman || "-"}</span>
                        </span>
                        <span>
                          <span className="text-gray-400">Kata:</span>{" "}
                          <span className="font-medium">
                            {naskah.jumlahKata?.toLocaleString("id-ID") || "-"}
                          </span>
                        </span>
                        <span>
                          <span className="text-gray-400">File:</span>{" "}
                          <span className="font-medium">
                            {naskah.urlFile ? getFileExtension(naskah.urlFile).toUpperCase() : "-"}
                          </span>
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          onClick={() => handleOpenTerbitkan(naskah)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          size="sm"
                        >
                          <BookCheck className="h-4 w-4 mr-2" />
                          Terbitkan Naskah
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
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

      {/* ============================================ */}
      {/* MODAL TERBITKAN NASKAH */}
      {/* ============================================ */}
      <Dialog open={modalTerbitkan} onOpenChange={(open) => !open && resetModal()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <DialogTitle className="text-xl md:text-2xl font-bold">Terbitkan Naskah</DialogTitle>
            <DialogDescription>
              Finalisasi file PDF, upload cover final, lalu isi data penerbitan
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Naskah Info */}
            <Card className="border-2 border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {selectedNaskah?.urlSampul ? (
                    <img
                      src={selectedNaskah.urlSampul}
                      alt={selectedNaskah.judul}
                      className="w-16 h-24 object-cover rounded-lg shadow"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{selectedNaskah?.judul}</h3>
                    {selectedNaskah?.subJudul && (
                      <p className="text-sm text-gray-600 italic truncate">
                        {selectedNaskah.subJudul}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      <span>Format: {selectedNaskah?.formatBuku || "A5"}</span>
                      <span>•</span>
                      <span>{selectedNaskah?.jumlahKata?.toLocaleString("id-ID") || "-"} kata</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* LANGKAH 1: FILE PDF FINAL */}
            {/* ============================================ */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isPdfLocked
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isPdfLocked ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">File PDF Final</h4>
                  <p className="text-xs text-gray-500">
                    Pilih metode untuk menghasilkan PDF siap cetak
                  </p>
                </div>
              </div>

              {/* Card File Sumber */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    File Sumber (Naskah Asli)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {selectedNaskah?.urlFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <File className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 truncate max-w-[200px]">
                            {getFileName(selectedNaskah.urlFile)}
                          </p>
                          <p className="text-xs text-blue-600">
                            Format: {getFileExtension(selectedNaskah.urlFile).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadOriginal}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        disabled={isPdfLocked}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Tidak ada file naskah yang terunggah</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs: Konversi Otomatis / Upload Manual */}
              {!isPdfLocked && (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "konversi" | "upload")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="konversi" className="text-xs md:text-sm">
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Konversi Otomatis
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="text-xs md:text-sm">
                      <Upload className="h-4 w-4 mr-1.5" />
                      Upload PDF Manual
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Konversi Otomatis */}
                  <TabsContent value="konversi" className="mt-4 space-y-4">
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">Konversi Word ke PDF</p>
                            <p className="text-xs text-gray-500">
                              Sistem akan mengkonversi file .docx secara otomatis
                            </p>
                          </div>
                          <Button
                            onClick={handleConvertToPdf}
                            disabled={isConvertingPdf || !selectedNaskah?.urlFile}
                            className={
                              convertedPdfUrl
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }
                            size="sm"
                          >
                            {isConvertingPdf ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                Mengkonversi...
                              </>
                            ) : convertedPdfUrl ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                Konversi Berhasil
                              </>
                            ) : (
                              <>
                                <FileType className="h-4 w-4 mr-1.5" />
                                Coba Konversi
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Upload Manual */}
                  <TabsContent value="upload" className="mt-4 space-y-4">
                    <Dropzone
                      onFileSelect={handleUploadPdf}
                      accept=".pdf"
                      label="Drag & drop file PDF di sini"
                      helperText="Gunakan ini jika Anda telah melakukan layout manual di luar sistem (misal: InDesign)"
                      icon={<Upload className="h-6 w-6 text-gray-400" />}
                      selectedFile={uploadedPdfFile}
                      onClear={() => {
                        setUploadedPdfFile(null);
                        setUploadedPdfUrl(null);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              )}

              {/* Area Preview & Konfirmasi PDF */}
              {hasFinalPdf && !isPdfLocked && (
                <Card className="border-2 border-amber-200 bg-amber-50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium text-sm">Preview & Konfirmasi PDF</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activeTab === "konversi" ? "PDF Hasil Konversi" : uploadedPdfFile?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activeTab === "konversi"
                              ? "Dikonversi dari file naskah asli"
                              : `${((uploadedPdfFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviewPdf}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Lihat Preview
                      </Button>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="pdfConfirmation"
                        checked={pdfConfirmationChecked}
                        onCheckedChange={(checked) =>
                          setPdfConfirmationChecked(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="pdfConfirmation"
                        className="text-xs text-amber-800 leading-tight cursor-pointer"
                      >
                        Saya menyatakan layout PDF ini sudah benar, rapi, dan siap cetak/terbit
                      </label>
                    </div>

                    <Button
                      onClick={handleLockPdf}
                      disabled={!pdfConfirmationChecked}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      size="sm"
                    >
                      <Lock className="h-4 w-4 mr-1.5" />
                      Kunci File PDF Ini
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Status PDF Terkunci */}
              {isPdfLocked && (
                <Card className="border-2 border-green-300 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Lock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900">File PDF Terkunci</p>
                          <p className="text-xs text-green-600">
                            {activeTab === "konversi" ? "PDF Hasil Konversi" : uploadedPdfFile?.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUnlockPdf}
                        className="text-green-700 hover:text-green-900 hover:bg-green-100"
                      >
                        Buka Kunci
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* ============================================ */}
            {/* UPLOAD COVER FINAL */}
            {/* ============================================ */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cover Final (Opsional)</h4>
                  <p className="text-xs text-gray-500">
                    Upload cover yang sudah dilengkapi ISBN/Barcode
                  </p>
                </div>
              </div>

              <Dropzone
                onFileSelect={handleUploadCover}
                accept=".jpg,.jpeg,.png,.pdf"
                label="Drag & drop file cover di sini"
                helperText="Format: JPG, PNG, atau PDF (dengan ISBN/Barcode)"
                icon={<ImageIcon className="h-6 w-6 text-gray-400" />}
                selectedFile={uploadedCoverFile}
                onClear={() => {
                  setUploadedCoverFile(null);
                  setUploadedCoverUrl(null);
                }}
                disabled={!isPdfLocked}
              />

              {!isPdfLocked && (
                <p className="text-xs text-gray-400 italic">
                  * Kunci file PDF terlebih dahulu untuk mengupload cover
                </p>
              )}
            </div>

            <Separator />

            {/* ============================================ */}
            {/* LANGKAH 2: DATA PENERBITAN */}
            {/* ============================================ */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isPdfLocked
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  2
                </div>
                <div>
                  <h4 className={`font-semibold ${isPdfLocked ? "text-gray-900" : "text-gray-400"}`}>
                    Data Penerbitan
                  </h4>
                  <p className="text-xs text-gray-500">
                    Isi informasi ISBN dan detail buku
                  </p>
                </div>
              </div>

              <div className={`space-y-4 ${!isPdfLocked ? "opacity-50 pointer-events-none" : ""}`}>
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
                    disabled={!isPdfLocked}
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
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formatBukuList.map((format) => (
                      <button
                        key={format.kode}
                        type="button"
                        onClick={() => setFormData({ ...formData, formatBuku: format.kode })}
                        disabled={!isPdfLocked}
                        className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                          formData.formatBuku === format.kode
                            ? "border-teal-500 bg-teal-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        } ${!isPdfLocked ? "cursor-not-allowed" : ""}`}
                      >
                        {formData.formatBuku === format.kode && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                          </div>
                        )}
                        <p
                          className={`font-bold text-sm ${
                            formData.formatBuku === format.kode ? "text-teal-600" : "text-gray-900"
                          }`}
                        >
                          {format.nama}
                        </p>
                        <p className="text-xs text-gray-500">{format.ukuran}</p>
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
                    disabled={!isPdfLocked}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Jumlah halaman buku setelah layout final
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Info:</strong> Setelah diterbitkan, penulis akan mendapat notifikasi
                  untuk mengatur harga jual. Harga cetak ditentukan oleh mitra percetakan saat
                  penulis melakukan checkout.
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={resetModal}
              disabled={terbitkanMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitTerbitkan}
              disabled={terbitkanMutation.isPending || !isPdfLocked}
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

      {/* ============================================ */}
      {/* MODAL PREVIEW PDF */}
      {/* ============================================ */}
      <Dialog open={modalPreviewPdf} onOpenChange={setModalPreviewPdf}>
        <DialogContent className="sm:max-w-[900px] h-[85vh]">
          <DialogHeader>
            <DialogTitle>Preview PDF</DialogTitle>
            <DialogDescription>
              Pastikan layout sudah benar sebelum dikunci
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full min-h-[500px]">
            {finalPdfUrl ? (
              <iframe
                src={finalPdfUrl}
                className="w-full h-full border rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Tidak ada file PDF untuk ditampilkan</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPreviewPdf(false)}>
              Tutup
            </Button>
            {finalPdfUrl && (
              <Button onClick={() => window.open(finalPdfUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka di Tab Baru
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
