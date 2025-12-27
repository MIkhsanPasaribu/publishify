"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Calendar,
  FileCheck,
  FilePlus,
  Activity,
} from "lucide-react";
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
      <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
          <div className="mb-8 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse shadow-sm border border-gray-100">
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
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header with Gradient */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
                Dashboard Editor
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola review naskah dan pantau progres editorial
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/editor/review")}
            className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {statistik?.totalReview || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                  Total Review
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/editor/review?status=ditugaskan")}
            className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {statistik?.perStatus.ditugaskan || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                  Ditugaskan
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/editor/review?status=dalam_proses")}
            className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {statistik?.perStatus.dalam_proses || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                  Dalam Proses
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/editor/review?status=selesai")}
            className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {statistik?.perStatus.selesai || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                  Selesai
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Aksi Cepat */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/editor/naskah")}
                className="flex flex-col p-3 sm:p-4 border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FilePlus className="h-5 w-5 text-teal-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">Naskah Masuk</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">Lihat naskah siap review</p>
              </button>

              <button
                onClick={() => router.push("/editor/review")}
                className="flex flex-col p-3 sm:p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">Semua Review</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">Lihat daftar lengkap</p>
              </button>

              <button
                onClick={() => router.push("/editor/review?status=ditugaskan")}
                className="flex flex-col p-3 sm:p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">Review Baru</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{statistik?.perStatus.ditugaskan || 0} menunggu</p>
              </button>

              <button
                onClick={() => router.push("/editor/review?status=dalam_proses")}
                className="flex flex-col p-3 sm:p-4 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all group text-left"
              >
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">Dalam Proses</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{statistik?.perStatus.dalam_proses || 0} berlangsung</p>
              </button>
            </div>
          </div>

          {/* Review Perlu Dikerjakan */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Review Perlu Dikerjakan
            </h2>

            <div className="space-y-3">
              {reviewPerluDikerjakan.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">Tidak ada review baru</p>
                  <p className="text-gray-400 text-xs mt-1">Semua review sudah dikerjakan</p>
                </div>
              ) : (
                reviewPerluDikerjakan.map((review) => {
                  const badge = statusBadge(review.status);
                  return (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/editor/review/${review.id}`)}
                      className="p-3 border border-slate-200 rounded-lg hover:border-teal-400 hover:shadow-md cursor-pointer transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-teal-600 transition-colors line-clamp-1">
                            {review.naskah.judul}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {formatWaktuRelative(review.ditugaskanPada)}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {reviewPerluDikerjakan.length > 0 && (
              <button
                onClick={() => router.push("/editor/review?status=ditugaskan")}
                className="mt-4 w-full py-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center justify-center gap-1 border-t border-slate-200 pt-3"
              >
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Review Terbaru */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Review Terbaru
            </h2>

            <div className="space-y-3">
              {reviewTerbaru.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">Belum ada review</p>
                  <p className="text-gray-400 text-xs mt-1">Review akan muncul di sini</p>
                </div>
              ) : (
                reviewTerbaru.map((review) => {
                  const badge = statusBadge(review.status);
                  return (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/editor/review/${review.id}`)}
                      className="p-3 border border-slate-200 rounded-lg hover:border-teal-400 hover:shadow-md cursor-pointer transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-teal-600 transition-colors line-clamp-1">
                            {review.naskah.judul}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {formatWaktuRelative(review.ditugaskanPada)}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {reviewTerbaru.length > 0 && (
              <button
                onClick={() => router.push("/editor/review")}
                className="mt-4 w-full py-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center justify-center gap-1 border-t border-slate-200 pt-3"
              >
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
