"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reviewApi, type StatistikReview, type Review } from "@/lib/api/review";

export default function EditorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statistik, setStatistik] = useState<StatistikReview | null>(null);
  const [reviewTerbaru, setReviewTerbaru] = useState<Review[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resReview] = await Promise.all([
        reviewApi.ambilStatistik(),
        reviewApi.ambilReviewSaya({ limit: 5 }),
      ]);
      setStatistik(resStats.data);
      setReviewTerbaru(resReview.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data dashboard");
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

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Editor</h1>
          <p className="text-gray-600">Kelola review naskah yang ditugaskan kepada Anda</p>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Review</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{statistik?.totalReview || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Dalam Proses</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{statistik?.perStatus.dalam_proses || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Selesai</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{statistik?.reviewSelesai || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Ditugaskan</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{statistik?.perStatus.ditugaskan || 0}</p>
          </div>
        </div>

        {/* Review Terbaru */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Terbaru</h2>
              <p className="text-sm text-gray-600 mt-1">Naskah yang perlu direview</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/editor/review")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {reviewTerbaru.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">Belum ada review yang ditugaskan</p>
                <p className="text-gray-400 text-sm mt-2">Review akan muncul di sini setelah ditugaskan oleh admin</p>
              </div>
            ) : (
              reviewTerbaru.map((review) => {
                const badge = statusBadge(review.status);
                const namaPenulis = review.naskah.penulis.profilPenulis?.namaPena || 
                                   `${review.naskah.penulis.profilPengguna?.namaDepan || ''} ${review.naskah.penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
                                   review.naskah.penulis.email;

                return (
                  <div
                    key={review.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/editor/review/${review.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {review.naskah.judul}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Penulis: <span className="font-medium">{namaPenulis}</span>
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {review.naskah.sinopsis}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ditugaskan: {formatTanggal(review.ditugaskanPada)}
                          </span>
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
                      <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium whitespace-nowrap">
                        Review
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => router.push("/dashboard/editor/review?status=ditugaskan")}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">{statistik?.perStatus.ditugaskan || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Review Baru</h3>
            <p className="text-sm text-gray-600">Naskah yang belum direview</p>
          </button>

          <button
            onClick={() => router.push("/dashboard/editor/review?status=dalam_proses")}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">{statistik?.perStatus.dalam_proses || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Sedang Dikerjakan</h3>
            <p className="text-sm text-gray-600">Review yang sedang berjalan</p>
          </button>

          <button
            onClick={() => router.push("/dashboard/editor/review?status=selesai")}
            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">{statistik?.reviewSelesai || 0}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Review Selesai</h3>
            <p className="text-sm text-gray-600">Sudah memberikan keputusan</p>
          </button>
        </div>
      </div>
    </div>
  );
}
