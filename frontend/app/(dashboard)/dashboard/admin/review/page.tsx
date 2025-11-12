"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { reviewApi, type Review } from "@/lib/api/review";

export default function AdminReviewPage() {
  const [daftarReview, setDaftarReview] = useState<Review[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [filter, setFilter] = useState<string>("semua");

  useEffect(() => {
    fetchDaftarReview();
  }, [filter]);

  const fetchDaftarReview = async () => {
    try {
      setSedangMemuat(true);
      
      // Ambil semua review
      const response = await reviewApi.ambilSemuaReview();
      
      let reviews = response.data || [];
      
      // Filter berdasarkan status
      if (filter !== "semua") {
        reviews = reviews.filter((r) => r.status === filter);
      }
      
      setDaftarReview(reviews);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error(error.response?.data?.pesan || "Gagal memuat daftar review");
      setDaftarReview([]);
    } finally {
      setSedangMemuat(false);
    }
  };

  const getLabelStatus = (status: string) => {
    const labels: Record<string, string> = {
      ditugaskan: "Ditugaskan",
      dalam_proses: "Dalam Proses",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getWarnaBadgeStatus = (status: string) => {
    const colors: Record<string, string> = {
      ditugaskan: "bg-yellow-100 text-yellow-800",
      dalam_proses: "bg-blue-100 text-blue-800",
      selesai: "bg-green-100 text-green-800",
      dibatalkan: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getLabelRekomendasi = (rekomendasi: string | null) => {
    if (!rekomendasi) return "-";
    const labels: Record<string, string> = {
      setujui: "Disetujui",
      revisi: "Perlu Revisi",
      tolak: "Ditolak",
    };
    return labels[rekomendasi] || rekomendasi;
  };

  const getWarnaRekomendasi = (rekomendasi: string | null) => {
    if (!rekomendasi) return "text-gray-500";
    const colors: Record<string, string> = {
      setujui: "text-green-600 font-semibold",
      revisi: "text-yellow-600 font-semibold",
      tolak: "text-red-600 font-semibold",
    };
    return colors[rekomendasi] || "text-gray-600";
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

  // Hitung statistik
  const statistik = {
    total: daftarReview.length,
    ditugaskan: daftarReview.filter((r) => r.status === "ditugaskan").length,
    dalamProses: daftarReview.filter((r) => r.status === "dalam_proses").length,
    selesai: daftarReview.filter((r) => r.status === "selesai").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Monitoring Review
          </h1>
          <p className="text-gray-600">
            Pantau dan kelola semua proses review naskah
          </p>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Review</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistik.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ditugaskan</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {statistik.ditugaskan}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dalam Proses</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statistik.dalamProses}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-3xl font-bold text-green-600">
                  {statistik.selesai}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("semua")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "semua"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua ({statistik.total})
            </button>
            <button
              onClick={() => setFilter("ditugaskan")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "ditugaskan"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ditugaskan ({statistik.ditugaskan})
            </button>
            <button
              onClick={() => setFilter("dalam_proses")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "dalam_proses"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Dalam Proses ({statistik.dalamProses})
            </button>
            <button
              onClick={() => setFilter("selesai")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "selesai"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Selesai ({statistik.selesai})
            </button>
          </div>
        </div>

        {/* Tabel Review */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Judul Naskah
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Penulis
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Editor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Rekomendasi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Ditugaskan
                  </th>
                </tr>
              </thead>
              <tbody>
                {sedangMemuat ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : daftarReview.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <span className="text-6xl">📭</span>
                        <p className="text-gray-600 text-lg">
                          Tidak ada review yang ditemukan
                        </p>
                        <p className="text-gray-500 text-sm">
                          {filter === "semua"
                            ? "Belum ada review yang dibuat"
                            : `Tidak ada review dengan status "${getLabelStatus(filter)}"`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  daftarReview.map((review, index) => (
                    <tr
                      key={review.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.naskah?.judul || "-"}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {review.naskah?.sinopsis || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {review.naskah?.penulis?.profilPengguna?.namaDepan || ""}{" "}
                        {review.naskah?.penulis?.profilPengguna?.namaBelakang || ""}
                        {!review.naskah?.penulis?.profilPengguna && (
                          <span className="text-gray-400 italic">Tidak ada data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {review.editor?.profilPengguna?.namaDepan || ""}{" "}
                        {review.editor?.profilPengguna?.namaBelakang || ""}
                        {!review.editor?.profilPengguna && (
                          <span className="text-gray-400 italic">Tidak ada data</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getWarnaBadgeStatus(
                            review.status
                          )}`}
                        >
                          {getLabelStatus(review.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getWarnaRekomendasi(review.rekomendasi || null)}>
                          {getLabelRekomendasi(review.rekomendasi || null)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatTanggal(review.ditugaskanPada)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Footer */}
        {!sedangMemuat && daftarReview.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Menampilkan {daftarReview.length} review
          </div>
        )}
      </div>
    </div>
  );
}
