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
import { uploadApi } from "@/lib/api/upload";

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
      // Buat full URL jika relative
      const fileUrl = selectedNaskah.urlFile.startsWith("http")
        ? selectedNaskah.urlFile
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${selectedNaskah.urlFile}`;
      window.open(fileUrl, "_blank");
    }
  };

  const handleConvertToPdf = async () => {
    if (!selectedNaskah?.urlFile) {
      toast.error("Tidak ada file naskah untuk dikonversi");
      return;
    }

    // Cek apakah file sudah PDF
    const fileExt = getFileExtension(selectedNaskah.urlFile);
    if (fileExt === "pdf") {
      // File sudah PDF, langsung gunakan
      setConvertedPdfUrl(selectedNaskah.urlFile);
      toast.success("File sudah dalam format PDF", {
        description: "Tidak perlu konversi",
      });
      return;
    }

    setIsConvertingPdf(true);
    setConvertedPdfUrl(null);

    try {
      // Panggil API backend untuk konversi
      const result = await uploadApi.konversiDariUrl(selectedNaskah.urlFile);
      
      // Set URL PDF hasil konversi
      setConvertedPdfUrl(result.url);

      toast.success("Konversi berhasil!", {
        description: `File berhasil dikonversi ke PDF`,
      });
    } catch (error: any) {
      console.error("Error konversi PDF:", error);
      
      // Handle error spesifik
      const errorMessage = error.response?.data?.pesan || error.message || "Terjadi kesalahan saat konversi";
      
      // Cek jika error karena LibreOffice tidak terinstall
      if (errorMessage.toLowerCase().includes("libreoffice")) {
        toast.error("LibreOffice belum terinstall", {
          description: "Fitur konversi otomatis memerlukan LibreOffice di server. Silakan gunakan 'Upload PDF Manual' sebagai alternatif.",
          duration: 6000,
        });
      } else {
        toast.error("Gagal mengkonversi file", {
          description: errorMessage,
        });
      }
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
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Gradient Header */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Naskah Siap Terbit
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Naskah yang sudah disetujui editor dan siap untuk diterbitkan
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BookCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{filteredNaskah.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Menunggu Penerbitan</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">Disetujui</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Status Review</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">PDF & ISBN</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Langkah Selanjutnya</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Cari berdasarkan judul naskah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
              <p className="text-slate-600">Memuat data naskah...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-900">Gagal memuat data</p>
                <p className="text-sm text-red-700">{(error as any).message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredNaskah.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <BookCheck className="h-10 w-10 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Tidak ada naskah siap terbit</p>
                <p className="text-sm text-slate-600 mt-1">
                  Semua naskah yang disetujui sudah diterbitkan
                </p>
              </div>
            </div>
          </div>
        )}

        {/* List Naskah */}
        {!isLoading && !error && filteredNaskah.length > 0 && (
          <div className="space-y-4">
            {filteredNaskah.map((naskah: Naskah) => (
              <div key={naskah.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-4 sm:p-6">
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
                      <div className="w-24 h-36 md:w-28 md:h-42 lg:w-32 lg:h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title & Badge */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
                          {naskah.judul}
                        </h3>
                        <Badge className="bg-green-100 text-green-800 border border-green-200 self-start">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Disetujui
                        </Badge>
                      </div>
                      {naskah.subJudul && (
                        <p className="text-sm md:text-base text-slate-600 italic">
                          {naskah.subJudul}
                        </p>
                      )}
                    </div>

                    {/* Sinopsis */}
                    <p className="text-sm text-slate-700 line-clamp-2">{naskah.sinopsis}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-slate-600">
                      <span>
                        <span className="text-slate-400">Format:</span>{" "}
                        <span className="font-medium text-slate-700">{naskah.formatBuku || "A5"}</span>
                      </span>
                      <span>
                        <span className="text-slate-400">Halaman:</span>{" "}
                        <span className="font-medium text-slate-700">{naskah.jumlahHalaman || "-"}</span>
                      </span>
                      <span>
                        <span className="text-slate-400">Kata:</span>{" "}
                        <span className="font-medium text-slate-700">
                          {naskah.jumlahKata?.toLocaleString("id-ID") || "-"}
                        </span>
                      </span>
                      <span>
                        <span className="text-slate-400">File:</span>{" "}
                        <span className="font-medium text-slate-700">
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
                      <Button variant="outline" size="sm" className="hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300">
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* MODAL TERBITKAN NASKAH */}
      {/* ============================================ */}
      <Dialog open={modalTerbitkan} onOpenChange={(open) => !open && resetModal()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <DialogTitle className="text-xl md:text-2xl font-bold text-slate-900">Terbitkan Naskah</DialogTitle>
            <DialogDescription className="text-slate-600">
              Finalisasi file PDF, upload cover final, lalu isi data penerbitan
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Naskah Info */}
            <div className="border-2 border-slate-200 bg-slate-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {selectedNaskah?.urlSampul ? (
                  <img
                    src={selectedNaskah.urlSampul}
                    alt={selectedNaskah.judul}
                    className="w-16 h-24 object-cover rounded-lg shadow"
                  />
                ) : (
                  <div className="w-16 h-24 bg-slate-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{selectedNaskah?.judul}</h3>
                  {selectedNaskah?.subJudul && (
                    <p className="text-sm text-slate-600 italic truncate">
                      {selectedNaskah.subJudul}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                    <span className="text-slate-700 font-medium">Format: {selectedNaskah?.formatBuku || "A5"}</span>
                    <span>•</span>
                    <span>{selectedNaskah?.jumlahKata?.toLocaleString("id-ID") || "-"} kata</span>
                  </div>
                </div>
              </div>
            </div>

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
                  <h4 className="font-semibold text-slate-900">File PDF Final</h4>
                  <p className="text-xs text-slate-600">
                    Pilih metode untuk menghasilkan PDF siap cetak
                  </p>
                </div>
            </div>

            {/* Card File Sumber */}
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  File Sumber (Naskah Asli)
                </h3>
              </div>
              <div className="px-6 pb-6">
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
              </div>
            </div>
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
                    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">Konversi Word ke PDF</p>
                            <p className="text-xs text-slate-600">
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
                      </div>
                  </TabsContent>

                  {/* Tab: Upload Manual */}
                  <TabsContent value="upload" className="mt-4 space-y-4">
                    <Dropzone
                      onFileSelect={handleUploadPdf}
                      accept=".pdf"
                      label="Drag & drop file PDF di sini"
                      helperText="Gunakan ini jika Anda telah melakukan layout manual di luar sistem (misal: InDesign)"
                      icon={<Upload className="h-6 w-6 text-slate-400" />}
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
                <div className="border-2 border-amber-200 bg-amber-50 rounded-lg p-4 space-y-4">
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
                          <p className="text-sm font-medium text-slate-900">
                            {activeTab === "konversi" ? "PDF Hasil Konversi" : uploadedPdfFile?.name}
                          </p>
                          <p className="text-xs text-slate-600">
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
                </div>
              )}

              {/* Status PDF Terkunci */}
              {isPdfLocked && (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
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
                </div>
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
                  <h4 className="font-semibold text-slate-900">Cover Final (Opsional)</h4>
                  <p className="text-xs text-slate-600">
                    Upload cover yang sudah dilengkapi ISBN/Barcode
                  </p>
                </div>
              </div>

              <Dropzone
                onFileSelect={handleUploadCover}
                accept=".jpg,.jpeg,.png,.pdf"
                label="Drag & drop file cover di sini"
                helperText="Format: JPG, PNG, atau PDF (dengan ISBN/Barcode)"
                icon={<ImageIcon className="h-6 w-6 text-slate-400" />}
                selectedFile={uploadedCoverFile}
                onClear={() => {
                  setUploadedCoverFile(null);
                  setUploadedCoverUrl(null);
                }}
                disabled={!isPdfLocked}
              />

              {!isPdfLocked && (
                <p className="text-xs text-slate-500 italic">
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
                  <h4 className={`font-semibold ${isPdfLocked ? "text-slate-900" : "text-slate-400"}`}>
                    Data Penerbitan
                  </h4>
                  <p className="text-xs text-slate-600">
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
                  <p className="text-xs text-slate-600 mt-1">
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
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        } ${!isPdfLocked ? "cursor-not-allowed" : ""}`}
                      >
                        {formData.formatBuku === format.kode && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                          </div>
                        )}
                        <p
                          className={`font-bold text-sm ${
                            formData.formatBuku === format.kode ? "text-teal-600" : "text-slate-900"
                          }`}
                        >
                          {format.nama}
                        </p>
                        <p className="text-xs text-slate-600">{format.ukuran}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
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
                  <p className="text-xs text-slate-600 mt-1">
                    Jumlah halaman buku setelah layout final
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Info:</strong> Setelah diterbitkan, penulis akan mendapat notifikasi
                untuk mengatur harga jual. Harga cetak ditentukan oleh mitra percetakan saat
                penulis melakukan checkout.
              </p>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-slate-50">
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
              <>
                {/* Cek apakah URL adalah blob (dari upload lokal) atau URL external */}
                {finalPdfUrl.startsWith("blob:") ? (
                  <iframe
                    src={finalPdfUrl}
                    className="w-full h-full border rounded-lg"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-8">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-blue-100 rounded-full inline-block">
                        <FileText className="h-12 w-12 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">Preview File PDF</p>
                        <p className="text-sm text-slate-600 mb-4">
                          File tersimpan di server. Klik tombol di bawah untuk membuka preview.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button
                            onClick={() => {
                              // Buat full URL jika relative
                              const fullUrl = finalPdfUrl.startsWith("http")
                                ? finalPdfUrl
                                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${finalPdfUrl}`;
                              window.open(fullUrl, "_blank");
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Buka Preview di Tab Baru
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Buat full URL jika relative
                              const fullUrl = finalPdfUrl.startsWith("http")
                                ? finalPdfUrl
                                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${finalPdfUrl}`;
                              const link = document.createElement("a");
                              link.href = fullUrl;
                              link.download = getFileName(finalPdfUrl);
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </Button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      URL: {finalPdfUrl.length > 60 ? finalPdfUrl.substring(0, 60) + "..." : finalPdfUrl}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
              <p className="text-slate-600">Tidak ada file PDF untuk ditampilkan</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModalPreviewPdf(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
}
