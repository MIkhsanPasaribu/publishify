"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reviewApi, type Review, type StatusReview, type StatistikReview } from "@/lib/api/review";

// ================================
// INTERFACES
// ================================

interface FilterState {
  status: StatusReview | "semua";
  pencarian: string;
}

// ================================
// MAIN COMPONENT
// ================================

export default function MonitoringReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [statistik, setStatistik] = useState<StatistikReview | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    status: "semua",
    pencarian: "",
  });

  // Format tanggal ke format Indonesia
  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, reviews]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching monitoring data...");

      const [reviewRes, statsRes] = await Promise.all([
        reviewApi.ambilSemuaReview({ limit: 100 }),
        reviewApi.ambilStatistik(),
      ]);

      console.log("✅ Reviews fetched:", reviewRes.data?.length);
      console.log("✅ Statistik fetched:", statsRes.data);

      setReviews(reviewRes.data || []);
      setStatistik(statsRes.data);
    } catch (error: any) {
      console.error("❌ Error fetching monitoring data:", error);
      toast.error("Gagal memuat data monitoring review");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by status
    if (filter.status !== "semua") {
      filtered = filtered.filter((r) => r.status === filter.status);
    }

    // Filter by pencarian (judul naskah atau nama editor)
    if (filter.pencarian) {
      const search = filter.pencarian.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.naskah?.judul?.toLowerCase().includes(search) ||
          r.editor?.email?.toLowerCase().includes(search) ||
          r.editor?.profilPengguna?.namaDepan?.toLowerCase().includes(search) ||
          r.editor?.profilPengguna?.namaBelakang?.toLowerCase().includes(search)
      );
    }

    setFilteredReviews(filtered);
  };

  const getLabelStatus = (status: StatusReview) => {
    const labels: Record<StatusReview, string> = {
      ditugaskan: "Ditugaskan",
      dalam_proses: "Dalam Proses",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return labels[status];
  };

  const getColorStatus = (status: StatusReview) => {
    const colors: Record<StatusReview, string> = {
      ditugaskan: "bg-yellow-100 text-yellow-800 border-yellow-300",
      dalam_proses: "bg-blue-100 text-blue-800 border-blue-300",
      selesai: "bg-green-100 text-green-800 border-green-300",
      dibatalkan: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status];
  };

  const getLabelRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return "-";
    const labels: Record<string, string> = {
      setujui: "Disetujui",
      revisi: "Perlu Revisi",
      tolak: "Ditolak",
    };
    return labels[rekomendasi] || rekomendasi;
  };

  const getColorRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return "bg-gray-100 text-gray-600";
    const colors: Record<string, string> = {
      setujui: "bg-green-100 text-green-800",
      revisi: "bg-orange-100 text-orange-800",
      tolak: "bg-red-100 text-red-800",
    };
    return colors[rekomendasi] || "bg-gray-100 text-gray-600";
  };

  const formatNamaEditor = (editor: Review["editor"]) => {
    if (!editor) return "Editor tidak ditemukan";
    if (editor.profilPengguna?.namaDepan || editor.profilPengguna?.namaBelakang) {
      return `${editor.profilPengguna.namaDepan || ""} ${editor.profilPengguna.namaBelakang || ""}`.trim();
    }
    return editor.email || "Email tidak tersedia";
  };

  const hitungDurasi = (review: Review) => {
    const mulai = review.dimulaiPada || review.ditugaskanPada;
    const selesai = review.selesaiPada || new Date().toISOString();
    const diff = new Date(selesai).getTime() - new Date(mulai).getTime();
    const hari = Math.floor(diff / (1000 * 60 * 60 * 24));
    return hari;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Monitoring Review</h1>
          <p className="text-gray-600">Monitor dan kelola proses review naskah secara real-time</p>
        </div>

        {/* Stats Cards */}
        {statistik && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Review */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Review</p>
                  <p className="text-3xl font-bold text-gray-900">{statistik.totalReview}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Review Aktif */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Review Aktif</p>
                  <p className="text-3xl font-bold text-blue-600">{statistik.reviewAktif}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Review Selesai */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Review Selesai</p>
                  <p className="text-3xl font-bold text-green-600">{statistik.reviewSelesai}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Review Dibatalkan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dibatalkan</p>
                  <p className="text-3xl font-bold text-red-600">{statistik.reviewDibatalkan}</p>
                </div>
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="semua">Semua Status</option>
                <option value="ditugaskan">Ditugaskan</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Naskah / Editor
              </label>
              <input
                type="text"
                value={filter.pencarian}
                onChange={(e) => setFilter({ ...filter, pencarian: e.target.value })}
                placeholder="Ketik judul naskah atau nama editor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan {filteredReviews.length} dari {reviews.length} review
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Naskah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Editor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rekomendasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ditugaskan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Memuat data review...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">Tidak ada review ditemukan</p>
                        <p className="text-sm mt-1">Coba ubah filter pencarian Anda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {review.naskah?.judul || "Judul tidak tersedia"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {review.naskah?.penulis?.profilPengguna?.namaDepan || review.naskah?.penulis?.email || "Penulis tidak diketahui"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatNamaEditor(review.editor)}
                          </p>
                          <p className="text-xs text-gray-500">{review.editor?.email || "-"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getColorStatus(review.status)}`}
                        >
                          {getLabelStatus(review.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getColorRekomendasi(review.rekomendasi)}`}
                        >
                          {getLabelRekomendasi(review.rekomendasi)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {hitungDurasi(review)} hari
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatTanggal(review.ditugaskanPada)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/review/${review.id}`)}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                        >
                          Lihat Detail →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats by Status */}
        {statistik && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Per Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 Review per Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Ditugaskan</span>
                  <span className="text-lg font-bold text-yellow-700">
                    {statistik.perStatus.ditugaskan}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Dalam Proses</span>
                  <span className="text-lg font-bold text-blue-700">
                    {statistik.perStatus.dalam_proses}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Selesai</span>
                  <span className="text-lg font-bold text-green-700">
                    {statistik.perStatus.selesai}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Dibatalkan</span>
                  <span className="text-lg font-bold text-red-700">
                    {statistik.perStatus.dibatalkan}
                  </span>
                </div>
              </div>
            </div>

            {/* Per Rekomendasi */}
            {statistik.perRekomendasi && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🎯 Hasil Rekomendasi
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Disetujui</span>
                    <span className="text-lg font-bold text-green-700">
                      {statistik.perRekomendasi.setujui}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Perlu Revisi</span>
                    <span className="text-lg font-bold text-orange-700">
                      {statistik.perRekomendasi.revisi}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Ditolak</span>
                    <span className="text-lg font-bold text-red-700">
                      {statistik.perRekomendasi.tolak}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
