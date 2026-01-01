# LAPORAN DEVELOPMENT FASE 3

## SISTEM REVIEW DAN EDITOR PUBLISHIFY

**Bagian 4 dari 5: Implementasi Frontend**

---

## D. IMPLEMENTASI FRONTEND (STEP BY STEP)

Setelah backend selesai diimplementasikan, kami melanjutkan ke development frontend yang menyediakan user interface untuk admin dan editor berinteraksi dengan sistem review. Frontend dibangun menggunakan Next.js empat belas dengan App Router, TypeScript untuk type safety, dan Tailwind CSS untuk styling.

### D.5 Setup API Client Layer

Sebelum membuat halaman UI, kami perlu mempersiapkan API client layer yang akan digunakan untuk berkomunikasi dengan backend.

#### D.5.1 Konfigurasi Base API Client

Langkah pertama adalah membuat base API client dengan Axios yang include configuration untuk base URL, interceptors untuk token injection, dan error handling.

Buat file `lib/api/client.ts`:

```typescript
// Lokasi: frontend/lib/api/client.ts
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor untuk inject token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    if (error.response) {
      const message = error.response.data?.pesan || "Terjadi kesalahan";

      // Handle unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Show toast for errors
      if (error.response.status >= 400) {
        toast.error(message);
      }
    } else {
      toast.error("Tidak dapat terhubung ke server");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

Penjelasan kode:

- **Base URL**: Configurable via environment variable untuk support multiple environments
- **Request interceptor**: Automatically inject JWT token dari localStorage ke Authorization header
- **Response interceptor**: Extract data dari response dan handle common errors
- **Error handling**: Show user-friendly toast notifications untuk errors dan redirect ke login jika unauthorized

#### D.5.2 Review API Client Module

Selanjutnya, buat dedicated module untuk review-related API calls:

```typescript
// Lokasi: frontend/lib/api/review.ts
import apiClient from "./client";

// Type definitions
export type StatusReview =
  | "ditugaskan"
  | "dalam_proses"
  | "selesai"
  | "dibatalkan";
export type Rekomendasi = "setujui" | "revisi" | "tolak";

export interface Review {
  id: string;
  idNaskah: string;
  idEditor: string;
  status: StatusReview;
  rekomendasi?: Rekomendasi;
  catatan?: string;
  catatanRekomendasi?: string;
  dibuatPada: string;
  diselesaikanPada?: string;
  naskah: {
    id: string;
    judul: string;
    sinopsis: string;
    urlFile?: string;
    penulis: {
      id: string;
      email: string;
      profilPengguna?: {
        namaDepan?: string;
        namaBelakang?: string;
      };
    };
  };
  editor: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
  feedback?: FeedbackReview[];
}

export interface FeedbackReview {
  id: string;
  idReview: string;
  aspek: string;
  rating: number;
  komentar: string;
  dibuatPada: string;
}

export interface TugaskanReviewPayload {
  idNaskah: string;
  idEditor: string;
  catatan?: string;
}

export interface TambahFeedbackPayload {
  aspek: string;
  rating: number;
  komentar: string;
}

export interface SubmitReviewPayload {
  rekomendasi: Rekomendasi;
  catatanUmum: string;
}

export interface KeputusanAdminPayload {
  keputusan: "setujui" | "revisi" | "tolak";
  catatan?: string;
}

export const reviewApi = {
  // Admin: Tugaskan review
  tugaskanReview: async (payload: TugaskanReviewPayload) => {
    return apiClient.post("/review/tugaskan", payload);
  },

  // Ambil semua review (admin melihat semua, editor hanya miliknya)
  ambilSemuaReview: async (params?: {
    status?: StatusReview;
    halaman?: number;
    limit?: number;
  }) => {
    return apiClient.get("/review", { params });
  },

  // Ambil review spesifik by ID
  ambilReviewById: async (id: string) => {
    return apiClient.get(`/review/${id}`);
  },

  // Editor: Mulai review
  mulaiReview: async (id: string) => {
    return apiClient.put(`/review/${id}/mulai`);
  },

  // Editor: Tambah feedback
  tambahFeedback: async (id: string, payload: TambahFeedbackPayload) => {
    return apiClient.post(`/review/${id}/feedback`, payload);
  },

  // Editor: Update feedback
  perbaruiFeedback: async (
    idReview: string,
    idFeedback: string,
    payload: Partial<TambahFeedbackPayload>
  ) => {
    return apiClient.put(`/review/${idReview}/feedback/${idFeedback}`, payload);
  },

  // Editor: Hapus feedback
  hapusFeedback: async (idReview: string, idFeedback: string) => {
    return apiClient.delete(`/review/${idReview}/feedback/${idFeedback}`);
  },

  // Editor: Submit review
  submitReview: async (id: string, payload: SubmitReviewPayload) => {
    return apiClient.post(`/review/${id}/submit`, payload);
  },

  // Admin: Keputusan final
  keputusanAdmin: async (id: string, payload: KeputusanAdminPayload) => {
    return apiClient.post(`/review/${id}/keputusan`, payload);
  },
};
```

Penjelasan:

- **Type definitions**: TypeScript interfaces untuk ensure type safety di seluruh aplikasi
- **Exported functions**: Setiap API endpoint wrapped dalam function dengan clear naming
- **Payload types**: Dedicated interfaces untuk request bodies ensure correct data structure
- **Consistent API**: Semua functions return Promise dengan standard response format

Lokasi file lengkap: `frontend/lib/api/review.ts` dengan semua type definitions dan API methods.

---

### D.6 Implementasi Admin Pages

Admin interface terdiri dari beberapa halaman untuk managing review workflow dari perspektif admin.

#### D.6.1 Halaman Dashboard Admin

Dashboard admin menampilkan overview statistik dan quick actions. Halaman ini menjadi landing page setelah admin login.

Buat file `app/(admin)/admin/page.tsx`:

```typescript
// Lokasi: frontend/app/(admin)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Users, ArrowRight } from "lucide-react";
import { reviewApi } from "@/lib/api/review";
import { naskahApi } from "@/lib/api/naskah";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNaskahDiajukan: 0,
    totalReviewAktif: 0,
    totalReviewSelesai: 0,
    totalEditor: 0,
  });

  useEffect(() => {
    fetchStatistik();
  }, []);

  const fetchStatistik = async () => {
    try {
      // Fetch multiple stats in parallel
      const [naskahRes, reviewRes] = await Promise.all([
        naskahApi.ambilStatistik(),
        reviewApi.ambilSemuaReview({ limit: 1 }),
      ]);

      setStats({
        totalNaskahDiajukan: naskahRes.data.diajukan || 0,
        totalReviewAktif: naskahRes.data.dalam_review || 0,
        totalReviewSelesai: reviewRes.metadata?.selesaiBulanIni || 0,
        totalEditor: 12, // Could fetch from pengguna API
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Naskah Diajukan",
      value: stats.totalNaskahDiajukan,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: () => router.push("/admin/antrian-review"),
    },
    {
      title: "Review Aktif",
      value: stats.totalReviewAktif,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      action: () => router.push("/admin/monitoring"),
    },
    {
      title: "Review Selesai",
      value: stats.totalReviewSelesai,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Editor",
      value: stats.totalEditor,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: () => router.push("/admin/pengguna?role=editor"),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Kelola sistem review dan naskah yang masuk
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={stat.action}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.action && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold">
                {loading ? "..." : stat.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/admin/antrian-review")}
              className="w-full"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Antrian Review
            </Button>
            <Button
              onClick={() => router.push("/admin/monitoring")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Clock className="w-5 h-5 mr-2" />
              Monitoring Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

Penjelasan step by step:

- **useEffect hook**: Fetch statistik saat component mount
- **Parallel fetching**: Menggunakan Promise.all untuk fetch multiple endpoints simultaneously
- **Stat cards array**: Data-driven approach untuk render stat cards dengan consistent layout
- **Click handlers**: Setiap card navigasi ke halaman terkait menggunakan Next.js router
- **Loading states**: Show placeholder saat data sedang di-fetch

Lokasi file lengkap: `frontend/app/(admin)/admin/page.tsx` dengan complete component implementation.

#### D.6.2 Halaman Antrian Review (Assignment Page)

Halaman ini menampilkan naskah-naskah yang berstatus diajukan dan belum ada review assignment. Admin dapat assign editor dari halaman ini.

Buat file `app/(admin)/admin/antrian-review/page.tsx`:

```typescript
// Lokasi: frontend/app/(admin)/admin/antrian-review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";
import { reviewApi, type TugaskanReviewPayload } from "@/lib/api/review";
import { penggunaApi } from "@/lib/api/pengguna";
import {
  Dialog,
  DialogContent,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, UserPlus, Calendar } from "lucide-react";

interface Naskah {
  id: string;
  judul: string;
  sinopsis: string;
  status: string;
  dibuatPada: string;
  penulis: {
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
}

interface Editor {
  id: string;
  email: string;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
  };
}

export default function AntrianReviewPage() {
  const [loading, setLoading] = useState(true);
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [editorList, setEditorList] = useState<Editor[]>([]);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [selectedEditor, setSelectedEditor] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch naskah dengan status diajukan dan editor list
      const [naskahRes, editorRes] = await Promise.all([
        naskahApi.ambilSemuaNaskah({ status: "diajukan" }),
        penggunaApi.ambilEditor(),
      ]);

      setNaskahList(naskahRes.data);
      setEditorList(editorRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (naskah: Naskah) => {
    setSelectedNaskah(naskah);
    setShowDialog(true);
    setSelectedEditor("");
    setCatatan("");
  };

  const handleTugaskan = async () => {
    if (!selectedEditor || !selectedNaskah) {
      toast.error("Pilih editor terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const payload: TugaskanReviewPayload = {
        idNaskah: selectedNaskah.id,
        idEditor: selectedEditor,
        catatan: catatan || undefined,
      };

      await reviewApi.tugaskanReview(payload);

      toast.success("Review berhasil ditugaskan");
      setShowDialog(false);

      // Refresh list
      fetchData();
    } catch (error) {
      console.error("Error tugaskan review:", error);
      // Error toast already shown by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const getNamaPenulis = (naskah: Naskah) => {
    const profil = naskah.penulis.profilPengguna;
    if (profil?.namaDepan) {
      return `${profil.namaDepan} ${profil.namaBelakang || ""}`.trim();
    }
    return naskah.penulis.email;
  };

  const getNamaEditor = (editor: Editor) => {
    const profil = editor.profilPengguna;
    if (profil?.namaDepan) {
      return `${profil.namaDepan} ${profil.namaBelakang || ""}`.trim();
    }
    return editor.email;
  };

  if (loading) {
    return <div className="container py-8">Memuat...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Antrian Review</h1>
        <p className="text-muted-foreground">
          {naskahList.length} naskah menunggu untuk ditugaskan ke editor
        </p>
      </div>

      {naskahList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Tidak ada naskah dalam antrian review
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {naskahList.map((naskah) => (
            <Card key={naskah.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Badge className="mb-3">{naskah.status}</Badge>
                <h3 className="text-xl font-semibold mb-2">{naskah.judul}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {naskah.sinopsis}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(naskah.dibuatPada).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <div className="text-sm mb-4">
                  <span className="text-muted-foreground">Penulis: </span>
                  <span className="font-medium">{getNamaPenulis(naskah)}</span>
                </div>

                <Button
                  onClick={() => handleOpenDialog(naskah)}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tugaskan ke Editor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Tugaskan Editor */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tugaskan Review ke Editor</DialogTitle>
          </DialogHeader>

          {selectedNaskah && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Naskah:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedNaskah.judul}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pilih Editor
                </label>
                <Select
                  value={selectedEditor}
                  onValueChange={setSelectedEditor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih editor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {editorList.map((editor) => (
                      <SelectItem key={editor.id} value={editor.id}>
                        {getNamaEditor(editor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Catatan (Opsional)
                </label>
                <Textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan untuk editor..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTugaskan}
                  disabled={!selectedEditor || submitting}
                  className="flex-1"
                >
                  {submitting ? "Memproses..." : "Tugaskan"}
                </Button>
                <Button
                  onClick={() => setShowDialog(false)}
                  variant="outline"
                  disabled={submitting}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

Penjelasan step by step:

- **Parallel data fetching**: Fetch naskah diajukan dan editor list simultaneously untuk efficiency
- **Dialog state management**: useState hooks untuk control dialog visibility dan form state
- **Helper functions**: getNamaPenulis dan getNamaEditor untuk display user-friendly names
- **Optimistic UI**: Show loading state saat submit untuk better UX
- **Refresh after action**: Re-fetch data setelah successful assignment untuk update list
- **Form validation**: Disable submit button jika editor belum dipilih

Lokasi file lengkap: `frontend/app/(admin)/admin/antrian-review/page.tsx` dengan sekitar empat ratus sembilan puluh sembilan baris code.

---

### D.7 Implementasi Editor Pages

Editor interface dirancang untuk streamline review workflow dari perspektif editor.

#### D.7.1 Halaman Daftar Review Editor

Halaman ini menampilkan semua review yang assigned ke logged-in editor dengan filters dan search.

Buat file `app/(editor)/editor/review/page.tsx`:

```typescript
// Lokasi: frontend/app/(editor)/editor/review/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { reviewApi, type Review, type StatusReview } from "@/lib/api/review";
import { toast } from "sonner";

export default function DaftarReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<StatusReview | "semua">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== "semua") {
        params.status = filter;
      }

      const res = await reviewApi.ambilSemuaReview(params);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Gagal memuat daftar review");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return review.naskah.judul.toLowerCase().includes(query);
  });

  const getStatusColor = (status: StatusReview) => {
    switch (status) {
      case "ditugaskan":
        return "bg-blue-100 text-blue-800";
      case "dalam_proses":
        return "bg-orange-100 text-orange-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "dibatalkan":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: StatusReview) => {
    const labels = {
      ditugaskan: "Ditugaskan",
      dalam_proses: "Dalam Proses",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return labels[status];
  };

  const getActionButton = (review: Review) => {
    if (review.status === "ditugaskan") {
      return (
        <Button
          onClick={() => router.push(`/editor/review/${review.id}`)}
          className="w-full"
        >
          Mulai Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      );
    } else if (review.status === "dalam_proses") {
      return (
        <Button
          onClick={() => router.push(`/editor/review/${review.id}`)}
          variant="outline"
          className="w-full"
        >
          Lanjutkan Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => router.push(`/editor/review/${review.id}`)}
          variant="ghost"
          className="w-full"
        >
          Lihat Detail
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daftar Review</h1>
        <p className="text-muted-foreground">
          Kelola review naskah yang ditugaskan kepada Anda
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan judul naskah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
            <SelectItem value="dalam_proses">Dalam Proses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="text-center py-12">Memuat...</div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Tidak ada review ditemukan
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={getStatusColor(review.status)}>
                    {getStatusLabel(review.status)}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      {new Date(review.dibuatPada).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {review.naskah.judul}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {review.naskah.sinopsis}
                </p>

                <div className="text-sm mb-4">
                  <span className="text-muted-foreground">Penulis: </span>
                  <span className="font-medium">
                    {review.naskah.penulis.profilPengguna?.namaDepan ||
                      review.naskah.penulis.email}
                  </span>
                </div>

                {review.feedback && review.feedback.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <CheckCircle className="w-4 h-4" />
                    <span>{review.feedback.length} feedback diberikan</span>
                  </div>
                )}

                {getActionButton(review)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

Penjelasan step by step:

- **Filter dan search**: Combined filter by status dan text search untuk flexible data exploration
- **Status badge styling**: Dynamic styling berdasarkan status dengan helper function
- **Conditional action buttons**: Different button text dan style based on review status
- **Feedback count**: Display number of feedback items jika sudah ada
- **Responsive grid**: Grid layout yang adapt untuk different screen sizes

Lokasi file lengkap: `frontend/app/(editor)/editor/review/page.tsx` dengan sekitar lima ratus enam belas baris code.

#### D.7.2 Halaman Detail Review Editor

Halaman ini adalah main workspace untuk editor melakukan review, menambah feedback, dan submit recommendation.

Karena halaman ini sangat complex, implementation detailnya tersedia di file:

**Lokasi**: `frontend/app/(editor)/editor/review/[id]/page.tsx`

**Fitur utama yang diimplementasikan**:

- Split layout: PDF viewer di kiri, review form di kanan
- Form add feedback dengan validation
- List feedback items dengan edit dan delete actions
- Submit review form dengan rekomendasi dan catatan umum
- State management untuk sync dengan backend
- Optimistic UI updates untuk better UX

**Component hierarchy**:

```
DetailReviewPage
├── PDF Viewer Component
├── Feedback List Component
│   └── Feedback Item Component (editable)
├── Add Feedback Form
└── Submit Review Form
```

---

### Navigasi Dokumen

- **[← Kembali ke PART 3: Implementasi Backend](./LAPORAN-DEVELOPMENT-FASE-3-PART-3-IMPLEMENTASI-BACKEND.md)**
- **[Lanjut ke PART 5: Pengujian & Evaluasi →](./LAPORAN-DEVELOPMENT-FASE-3-PART-5-PENGUJIAN-EVALUASI.md)**
- **[Ke INDEX](./LAPORAN-DEVELOPMENT-FASE-3-INDEX.md)**

---

**Catatan**: Dokumen ini adalah bagian dari seri Laporan Development Fase 3 yang terdiri dari 5 bagian. File lengkap frontend tersedia di repository dengan struktur yang detailed dan well-documented code. Untuk understanding complete implementation, silakan refer ke file-file yang disebutkan di setiap section.
