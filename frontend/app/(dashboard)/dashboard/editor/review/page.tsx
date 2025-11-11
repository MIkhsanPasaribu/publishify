"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { reviewApi, type Review, type StatusReview } from "@/lib/api/review";

export default function DaftarReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as StatusReview | null;

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<StatusReview | "semua">(statusFilter || "semua");

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = filter === "semua" ? {} : { status: filter };
      const res = await reviewApi.ambilReviewSaya(params);
      setReviews(res.data);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error("Gagal memuat daftar review");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      ditugaskan: { label: "Ditugaskan", className: "bg-blue-100 text-blue-800" },
      dalam_proses: { label: "Dalam Proses", className: "bg-amber-100 text-amber-800" },
      selesai: { label: "Selesai", className: "bg-green-100 text-green-800" },
      dibatalkan: { label: "Dibatalkan", className: "bg-gray-100 text-gray-800" },
    };
    return badges[status] || badges.ditugaskan;
  };

  const rekomendasiBadge = (rekomendasi?: string) => {
    if (!rekomendasi) return null;
    const badges: Record<string, { label: string; className: string }> = {
      setujui: { label: "Disetujui", className: "bg-emerald-100 text-emerald-800" },
      revisi: { label: "Perlu Revisi", className: "bg-amber-100 text-amber-800" },
      tolak: { label: "Ditolak", className: "bg-rose-100 text-rose-800" },
    };
    return badges[rekomendasi] || null;
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const filterTabs = [
    { value: "semua", label: "Semua", icon: "📋" },
    { value: "ditugaskan", label: "Baru", icon: "🆕" },
    { value: "dalam_proses", label: "Proses", icon: "⏳" },
    { value: "selesai", label: "Selesai", icon: "✅" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Daftar Review</h1>
          </div>
          <p className="text-gray-600">Kelola semua review naskah yang ditugaskan kepada Anda</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as StatusReview | "semua")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  filter === tab.value
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Review List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">Belum ada review</p>
            <p className="text-gray-400 text-sm">
              {filter === "semua" 
                ? "Review akan muncul di sini setelah ditugaskan oleh admin"
                : `Tidak ada review dengan status "${filter}"`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const badge = statusBadge(review.status);
              const rekBadge = rekomendasiBadge(review.rekomendasi);
              const namaPenulis = review.naskah.penulis.profilPenulis?.namaPena || 
                                 `${review.naskah.penulis.profilPengguna?.namaDepan || ''} ${review.naskah.penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
                                 review.naskah.penulis.email;

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => router.push(`/dashboard/editor/review/${review.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Judul & Status */}
                      <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {review.naskah.judul}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge.className}`}>
                            {badge.label}
                          </span>
                          {rekBadge && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${rekBadge.className}`}>
                              {rekBadge.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Penulis & Kategori */}
                      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{namaPenulis}</span>
                        </span>
                        {review.naskah.kategori && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {review.naskah.kategori.nama}
                          </span>
                        )}
                        {review.naskah.jumlahHalaman && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {review.naskah.jumlahHalaman} halaman
                          </span>
                        )}
                      </div>

                      {/* Sinopsis */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {review.naskah.sinopsis}
                      </p>

                      {/* Timeline */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ditugaskan: {formatTanggal(review.ditugaskanPada)}
                        </span>
                        {review.dimulaiPada && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Dimulai: {formatTanggal(review.dimulaiPada)}
                          </span>
                        )}
                        {review.selesaiPada && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selesai: {formatTanggal(review.selesaiPada)}
                          </span>
                        )}
                        {review.feedback && review.feedback.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {review.feedback.length} Feedback
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className={`
                        px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                        ${review.status === "selesai" 
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                          : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                        }
                      `}
                    >
                      {review.status === "selesai" ? "Lihat Detail" : "Mulai Review"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
