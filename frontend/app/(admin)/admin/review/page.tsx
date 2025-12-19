"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";

// Gunakan any untuk menghindari konflik tipe
type NaskahWithRelations = any;

export default function AdminReviewPage() {
  const router = useRouter();
  const [daftarNaskah, setDaftarNaskah] = useState<NaskahWithRelations[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [filter, setFilter] = useState<string>("semua");
  const [pencarian, setPencarian] = useState("");

  useEffect(() => {
    fetchDaftarNaskah();
  }, [filter]);

  const fetchDaftarNaskah = async () => {
    try {
      setSedangMemuat(true);
      
      // Ambil SEMUA naskah menggunakan endpoint admin khusus
      // Endpoint ini melewati filter publik dan menampilkan semua status
      const response = await naskahApi.ambilSemuaNaskahAdmin({
        limit: 100, // Maksimal yang diizinkan backend
      });
      
      let naskah = response.data || [];
      
      console.log("📚 Total naskah dari backend:", naskah.length);
      console.log("📋 Status naskah:", naskah.map(n => `${n.judul}: ${n.status}`));
      
      // Filter berdasarkan status HANYA di frontend
      if (filter !== "semua") {
        naskah = naskah.filter((n) => n.status === filter);
        console.log(`🔍 Setelah filter "${filter}":`, naskah.length);
      }
      
      setDaftarNaskah(naskah);
    } catch (error: any) {
      console.error("Error fetching naskah:", error);
      toast.error(error.response?.data?.pesan || "Gagal memuat daftar naskah");
      setDaftarNaskah([]);
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleLihatDetail = (id: string) => {
    router.push(`/admin/naskah/${id}`);
  };

  const getLabelStatus = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      diajukan: "Diajukan",
      dalam_review: "Dalam Review",
      perlu_revisi: "Perlu Revisi",
      disetujui: "Disetujui",
      ditolak: "Ditolak",
      diterbitkan: "Diterbitkan",
    };
    return labels[status] || status;
  };

  const getWarnaBadgeStatus = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      diajukan: "bg-yellow-100 text-yellow-800",
      dalam_review: "bg-blue-100 text-blue-800",
      perlu_revisi: "bg-orange-100 text-orange-800",
      disetujui: "bg-green-100 text-green-800",
      ditolak: "bg-red-100 text-red-800",
      diterbitkan: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getLabelRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return null;
    const labels: Record<string, string> = {
      setujui: "Disetujui",
      revisi: "Perlu Revisi",
      tolak: "Ditolak",
    };
    return labels[rekomendasi] || rekomendasi;
  };

  const getWarnaBadgeRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return "";
    const colors: Record<string, string> = {
      setujui: "bg-green-100 text-green-800 border border-green-200",
      revisi: "bg-amber-100 text-amber-800 border border-amber-200",
      tolak: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[rekomendasi] || "bg-gray-100 text-gray-800";
  };

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";
    try {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  // Filter berdasarkan pencarian
  const naskahTerfilter = daftarNaskah.filter((naskah) => {
    if (!pencarian) return true;
    const query = pencarian.toLowerCase();
    const namaPenulis = `${naskah.penulis?.profilPengguna?.namaDepan || ""} ${naskah.penulis?.profilPengguna?.namaBelakang || ""}`.trim();
    return (
      naskah.judul?.toLowerCase().includes(query) ||
      naskah.sinopsis?.toLowerCase().includes(query) ||
      namaPenulis.toLowerCase().includes(query)
    );
  });

  // Hitung statistik berdasarkan status naskah
  const statistik = {
    total: daftarNaskah.length,
    draft: daftarNaskah.filter((n) => n.status === "draft").length,
    diajukan: daftarNaskah.filter((n) => n.status === "diajukan").length,
    dalamReview: daftarNaskah.filter((n) => n.status === "dalam_review").length,
    perluRevisi: daftarNaskah.filter((n) => n.status === "perlu_revisi").length,
    disetujui: daftarNaskah.filter((n) => n.status === "disetujui").length,
    ditolak: daftarNaskah.filter((n) => n.status === "ditolak").length,
    diterbitkan: daftarNaskah.filter((n) => n.status === "diterbitkan").length,
  };

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
                Semua Naskah
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola dan monitor semua naskah yang diupload oleh penulis
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{statistik.total}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{statistik.diajukan}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">Diajukan</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{statistik.dalamReview}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">Dalam Review</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{statistik.disetujui}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">Disetujui</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{statistik.ditolak}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">Ditolak</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{statistik.perluRevisi}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">Perlu Revisi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
          {/* Filter Buttons - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => setFilter("semua")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filter === "semua"
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md ring-2 ring-teal-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">Semua</span>
                <span className="text-xs opacity-90">({statistik.total})</span>
              </div>
            </button>
            <button
              onClick={() => setFilter("diajukan")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filter === "diajukan"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md ring-2 ring-amber-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">Diajukan</span>
                <span className="text-xs opacity-90">({statistik.diajukan})</span>
              </div>
            </button>
            <button
              onClick={() => setFilter("dalam_review")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filter === "dalam_review"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md ring-2 ring-blue-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">Dalam Review</span>
                <span className="text-xs opacity-90">({statistik.dalamReview})</span>
              </div>
            </button>
            <button
              onClick={() => setFilter("disetujui")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filter === "disetujui"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md ring-2 ring-green-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">Disetujui</span>
                <span className="text-xs opacity-90">({statistik.disetujui})</span>
              </div>
            </button>
            <button
              onClick={() => setFilter("ditolak")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all col-span-2 sm:col-span-1 ${
                filter === "ditolak"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md ring-2 ring-red-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">Ditolak</span>
                <span className="text-xs opacity-90">({statistik.ditolak})</span>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan judul, sinopsis, atau penulis..."
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Tabel Naskah */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Judul Naskah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Penulis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Rekomendasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tanggal Dibuat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {sedangMemuat ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : naskahTerfilter.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <span className="text-6xl">📭</span>
                        <p className="text-slate-600 text-lg">
                          Tidak ada review yang ditemukan
                        </p>
                        <p className="text-slate-500 text-sm">
                          {filter === "semua"
                            ? "Belum ada naskah yang diupload"
                            : pencarian
                            ? `Tidak ada hasil untuk "${pencarian}"`
                            : `Tidak ada naskah dengan status "${getLabelStatus(filter)}"`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  naskahTerfilter.map((naskah: any, index: number) => (
                    <tr
                      key={naskah.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {naskah.judul || "-"}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {naskah.sinopsis || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {naskah.penulis?.profilPengguna?.namaDepan || ""}{" "}
                        {naskah.penulis?.profilPengguna?.namaBelakang || ""}
                        {!naskah.penulis?.profilPengguna && (
                          <span className="text-slate-400 italic">Tidak ada data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {naskah.kategori?.nama || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getWarnaBadgeStatus(
                            naskah.status
                          )}`}
                        >
                          {getLabelStatus(naskah.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {naskah.review && naskah.review.length > 0 && naskah.review[0].rekomendasi ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getWarnaBadgeRekomendasi(
                              naskah.review[0].rekomendasi
                            )}`}
                          >
                            {getLabelRekomendasi(naskah.review[0].rekomendasi)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Belum ada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatTanggal(naskah.dibuatPada)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleLihatDetail(naskah.id)}
                          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Footer */}
        {!sedangMemuat && naskahTerfilter.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-600">
            Menampilkan {naskahTerfilter.length} dari {daftarNaskah.length} naskah
          </div>
        )}
      </div>
    </div>
  );
}
