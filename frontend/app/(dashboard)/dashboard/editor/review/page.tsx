"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { reviewApi, type Review, type StatusReview, type StatistikReview } from "@/lib/api/review";

export default function DaftarReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as StatusReview | null;

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistik, setStatistik] = useState<StatistikReview | null>(null);
  const [filter, setFilter] = useState<StatusReview | "semua">(statusFilter || "semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [halaman, setHalaman] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalHalaman, setTotalHalaman] = useState(0);

  useEffect(() => {
    fetchStatistik();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filter, halaman]);

  const fetchStatistik = async () => {
    setLoadingStats(true);
    try {
      const res = await reviewApi.ambilStatistik();
      setStatistik(res.data);
    } catch (error: any) {
      console.error("Error fetching statistik:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: any = { halaman, limit };
      if (filter !== "semua") {
        params.status = filter;
      }
      const res = await reviewApi.ambilReviewSaya(params);
      setReviews(res.data);
      
      // Update pagination metadata
      if (res.metadata) {
        setTotal(res.metadata.total || 0);
        setTotalHalaman(res.metadata.totalHalaman || 1);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error("Gagal memuat daftar review");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: StatusReview | "semua") => {
    setFilter(newFilter);
    setHalaman(1); // Reset ke halaman pertama
  };

  const handlePageChange = (newPage: number) => {
    setHalaman(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.naskah.judul.toLowerCase().includes(query) ||
      review.naskah.sinopsis.toLowerCase().includes(query)
    );
  });

  const statusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: string }> = {
      ditugaskan: { label: "Ditugaskan", className: "bg-blue-100 text-blue-800 border-blue-200", icon: "📋" },
      dalam_proses: { label: "Dalam Proses", className: "bg-amber-100 text-amber-800 border-amber-200", icon: "⏳" },
      selesai: { label: "Selesai", className: "bg-green-100 text-green-800 border-green-200", icon: "✅" },
      dibatalkan: { label: "Dibatalkan", className: "bg-gray-100 text-gray-800 border-gray-200", icon: "❌" },
    };
    return badges[status] || badges.ditugaskan;
  };

  const rekomendasiBadge = (rekomendasi?: string) => {
    if (!rekomendasi) return null;
    const badges: Record<string, { label: string; className: string }> = {
      setujui: { label: "Disetujui", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      revisi: { label: "Perlu Revisi", className: "bg-amber-100 text-amber-800 border-amber-200" },
      tolak: { label: "Ditolak", className: "bg-rose-100 text-rose-800 border-rose-200" },
    };
    return badges[rekomendasi] || null;
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const filterTabs = [
    { value: "semua", label: "Semua Review", icon: "📋", count: statistik?.totalReview || 0 },
    { value: "ditugaskan", label: "Baru Ditugaskan", icon: "🆕", count: statistik?.perStatus.ditugaskan || 0 },
    { value: "dalam_proses", label: "Sedang Proses", icon: "⏳", count: statistik?.perStatus.dalam_proses || 0 },
    { value: "selesai", label: "Selesai", icon: "✅", count: statistik?.perStatus.selesai || 0 },
    { value: "dibatalkan", label: "Dibatalkan", icon: "❌", count: statistik?.perStatus.dibatalkan || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/editor")}
                className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📚 Daftar Review Naskah</h1>
                <p className="text-gray-600 mt-1">Kelola dan review naskah yang ditugaskan kepada Anda</p>
              </div>
            </div>
          </div>

          {/* Statistik Cards */}
          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : statistik && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Total Review</span>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-3xl font-bold">{statistik.totalReview}</div>
                <div className="text-xs opacity-80 mt-1">Semua review Anda</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Review Aktif</span>
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-3xl font-bold">{statistik.reviewAktif}</div>
                <div className="text-xs opacity-80 mt-1">Perlu dikerjakan</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Selesai</span>
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-3xl font-bold">{statistik.reviewSelesai}</div>
                <div className="text-xs opacity-80 mt-1">Review diselesaikan</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Tingkat Penyelesaian</span>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="text-3xl font-bold">
                  {statistik.totalReview > 0 
                    ? Math.round((statistik.reviewSelesai / statistik.totalReview) * 100)
                    : 0}%
                </div>
                <div className="text-xs opacity-80 mt-1">Completion rate</div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau sinopsis naskah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value as StatusReview | "semua")}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    filter === tab.value
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${filter === tab.value ? "bg-white/20" : "bg-gray-200 text-gray-700"}
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
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
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">Belum ada review</p>
            <p className="text-gray-400 text-sm">
              {searchQuery 
                ? `Tidak ada review yang cocok dengan pencarian "${searchQuery}"`
                : filter === "semua" 
                  ? "Review akan muncul di sini setelah ditugaskan oleh admin"
                  : `Tidak ada review dengan status "${filterTabs.find(t => t.value === filter)?.label}"`
              }
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {filteredReviews.map((review) => {
                const badge = statusBadge(review.status);
                const rekBadge = rekomendasiBadge(review.rekomendasi);
                const namaPenulis = review.naskah.penulis.profilPenulis?.namaPena || 
                                   `${review.naskah.penulis.profilPengguna?.namaDepan || ''} ${review.naskah.penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
                                   review.naskah.penulis.email;

                return (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer group"
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${badge.className}`}>
                              {badge.icon} {badge.label}
                            </span>
                            {rekBadge && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${rekBadge.className}`}>
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
                            <span className="flex items-center gap-1 font-medium text-purple-600">
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
                            : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg"
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

            {/* Pagination */}
            {totalHalaman > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan <span className="font-medium">{((halaman - 1) * limit) + 1}</span> - <span className="font-medium">{Math.min(halaman * limit, total)}</span> dari <span className="font-medium">{total}</span> review
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(halaman - 1)}
                      disabled={halaman === 1}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${halaman === 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-purple-600 text-white hover:bg-purple-700"
                        }
                      `}
                    >
                      Sebelumnya
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalHalaman }, (_, i) => i + 1)
                        .filter(page => {
                          // Tampilkan halaman: 1, ..., current-1, current, current+1, ..., last
                          return page === 1 || 
                                 page === totalHalaman || 
                                 (page >= halaman - 1 && page <= halaman + 1);
                        })
                        .map((page, idx, arr) => {
                          // Tambahkan "..." jika ada gap
                          const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1;
                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsisBefore && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`
                                  w-10 h-10 rounded-lg text-sm font-medium transition-all
                                  ${page === halaman
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }
                                `}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => handlePageChange(halaman + 1)}
                      disabled={halaman === totalHalaman}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${halaman === totalHalaman
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-purple-600 text-white hover:bg-purple-700"
                        }
                      `}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
