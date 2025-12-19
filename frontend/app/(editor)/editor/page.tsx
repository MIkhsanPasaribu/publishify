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
  const [reviewPerluDikerjakan, setReviewPerluDikerjakan] = useState<Review[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resReviewTerbaru, resReviewAktif] = await Promise.all([
        reviewApi.ambilStatistik(),
        reviewApi.ambilReviewSaya({ limit: 5 }),
        reviewApi.ambilReviewSaya({ status: "ditugaskan", limit: 5 }),
      ]);
      setStatistik(resStats.data);
      setReviewTerbaru(resReviewTerbaru.data);
      setReviewPerluDikerjakan(resReviewAktif.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: string }> = {
      ditugaskan: { label: "Ditugaskan", className: "bg-blue-100 text-blue-800 border-blue-200", icon: "📋" },
      dalam_proses: { label: "Dalam Proses", className: "bg-amber-100 text-amber-800 border-amber-200", icon: "⏳" },
      selesai: { label: "Selesai", className: "bg-green-100 text-green-800 border-green-200", icon: "✅" },
      dibatalkan: { label: "Dibatalkan", className: "bg-gray-100 text-gray-800 border-gray-200", icon: "❌" },
    };
    return badges[status] || badges.ditugaskan;
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatWaktuRelative = (iso: string) => {
    if (!iso) return "-";
    const now = new Date();
    const date = new Date(iso);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return formatTanggal(iso);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Dashboard Editor</h1>
          <p className="text-gray-600 text-lg">Kelola review naskah yang ditugaskan kepada Anda</p>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Total Review</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold mb-2">{statistik?.totalReview || 0}</p>
            <p className="text-xs opacity-80">Semua review Anda</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Review Aktif</h3>
              <span className="text-3xl">⚡</span>
            </div>
            <p className="text-4xl font-bold mb-2">{statistik?.reviewAktif || 0}</p>
            <p className="text-xs opacity-80">Perlu dikerjakan</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Review Selesai</h3>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-4xl font-bold mb-2">{statistik?.reviewSelesai || 0}</p>
            <p className="text-xs opacity-80">Review diselesaikan</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Completion Rate</h3>
              <span className="text-3xl">📈</span>
            </div>
            <p className="text-4xl font-bold mb-2">
              {statistik && statistik.totalReview > 0 
                ? Math.round((statistik.reviewSelesai / statistik.totalReview) * 100)
                : 0}%
            </p>
            <p className="text-xs opacity-80">Tingkat penyelesaian</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push("/editor/naskah")}
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📥
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Naskah Masuk
                </h3>
                <p className="text-sm text-gray-600">Lihat naskah siap review</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => router.push("/editor/review")}
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Semua Review
                </h3>
                <p className="text-sm text-gray-600">Lihat daftar lengkap review</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => router.push("/editor/review?status=ditugaskan")}
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🆕
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Review Baru
                </h3>
                <p className="text-sm text-gray-600">{statistik?.perStatus.ditugaskan || 0} review menunggu</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => router.push("/editor/review?status=dalam_proses")}
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⏳
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                  Dalam Proses
                </h3>
                <p className="text-sm text-gray-600">{statistik?.perStatus.dalam_proses || 0} review berlangsung</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Review Perlu Dikerjakan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">⚡ Perlu Dikerjakan</h2>
                  <p className="text-sm text-gray-600 mt-1">Review yang baru ditugaskan</p>
                </div>
                <button
                  onClick={() => router.push("/editor/review?status=ditugaskan")}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Lihat Semua →
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {reviewPerluDikerjakan.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Tidak ada review baru</p>
                  <p className="text-gray-400 text-sm mt-1">Semua review sudah dikerjakan</p>
                </div>
              ) : (
                reviewPerluDikerjakan.map((review) => {
                  const badge = statusBadge(review.status);
                  return (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/editor/review/${review.id}`)}
                      className="p-4 hover:bg-purple-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-lg">📖</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {review.naskah.judul}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {review.naskah.sinopsis}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatWaktuRelative(review.ditugaskanPada)}
                            </span>
                            {review.naskah.jumlahHalaman && (
                              <span>{review.naskah.jumlahHalaman} hal</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${badge.className}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Review Terbaru */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">📋 Review Terbaru</h2>
                  <p className="text-sm text-gray-600 mt-1">Aktivitas review terkini</p>
                </div>
                <button
                  onClick={() => router.push("/editor/review")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Lihat Semua →
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {reviewTerbaru.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Belum ada review</p>
                  <p className="text-gray-400 text-sm mt-1">Review akan muncul di sini</p>
                </div>
              ) : (
                reviewTerbaru.map((review) => {
                  const badge = statusBadge(review.status);
                  return (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/editor/review/${review.id}`)}
                      className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-lg">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {review.naskah.judul}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {review.naskah.sinopsis}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatWaktuRelative(review.ditugaskanPada)}
                            </span>
                            {review.feedback && review.feedback.length > 0 && (
                              <span className="font-medium text-purple-600">
                                {review.feedback.length} feedback
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${badge.className}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
