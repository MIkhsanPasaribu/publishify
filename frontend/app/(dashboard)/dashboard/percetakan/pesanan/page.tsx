"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { ambilDaftarPesanan } from "@/lib/api/percetakan";
import type { PesananCetak, StatusPesanan } from "@/types/percetakan";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DaftarPesananPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pengguna } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [pesanan, setPesanan] = useState<PesananCetak[]>([]);
  const [metadata, setMetadata] = useState({
    total: 0,
    halaman: 1,
    limit: 20,
    totalHalaman: 1,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusPesanan | "semua">(
    (searchParams.get("status") as StatusPesanan) || "semua"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("cari") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("halaman") || "1")
  );

  useEffect(() => {
    // Cek role percetakan
    const hasRolePercetakan =
      pengguna?.peran?.includes("percetakan") ||
      pengguna?.peranPengguna?.some(
        (p) => p.jenisPeran === "percetakan" && p.aktif
      );

    if (!hasRolePercetakan) {
      router.push("/dashboard");
      return;
    }

    fetchPesanan();
  }, [pengguna, router, statusFilter, searchQuery, currentPage]);

  const fetchPesanan = async () => {
    try {
      setLoading(true);
      const filter: any = {
        halaman: currentPage,
        limit: 20,
      };

      if (statusFilter !== "semua") {
        filter.status = statusFilter;
      }

      if (searchQuery.trim()) {
        filter.cari = searchQuery.trim();
      }

      const response = await ambilDaftarPesanan(filter);

      if (response.sukses) {
        setPesanan(response.data);
        if (response.metadata) {
          setMetadata(response.metadata);
        }
      }
    } catch (error: any) {
      console.error("Error fetching pesanan:", error);
      // Jika error, set data kosong
      setPesanan([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: StatusPesanan | "semua") => {
    setStatusFilter(status);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    if (status !== "semua") params.set("status", status);
    if (searchQuery) params.set("cari", searchQuery);
    params.set("halaman", "1");
    
    router.push(`/dashboard/percetakan/pesanan?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (statusFilter !== "semua") params.set("status", statusFilter);
    if (searchQuery) params.set("cari", searchQuery);
    params.set("halaman", "1");
    
    router.push(`/dashboard/percetakan/pesanan?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    const params = new URLSearchParams();
    if (statusFilter !== "semua") params.set("status", statusFilter);
    if (searchQuery) params.set("cari", searchQuery);
    params.set("halaman", page.toString());
    
    router.push(`/dashboard/percetakan/pesanan?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      tertunda: { label: "Tertunda", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      diterima: { label: "Diterima", className: "bg-blue-100 text-blue-800 border-blue-200" },
      dalam_produksi: { label: "Dalam Produksi", className: "bg-purple-100 text-purple-800 border-purple-200" },
      kontrol_kualitas: { label: "Quality Control", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      siap: { label: "Siap Kirim", className: "bg-green-100 text-green-800 border-green-200" },
      dikirim: { label: "Dikirim", className: "bg-teal-100 text-teal-800 border-teal-200" },
      terkirim: { label: "Terkirim", className: "bg-green-100 text-green-800 border-green-200" },
      dibatalkan: { label: "Dibatalkan", className: "bg-red-100 text-red-800 border-red-200" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.tertunda;
    return (
      <Badge className={`${config.className} border font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions: Array<{ value: StatusPesanan | "semua"; label: string; count?: number }> = [
    { value: "semua", label: "Semua Status" },
    { value: "tertunda", label: "Tertunda" },
    { value: "diterima", label: "Diterima" },
    { value: "dalam_produksi", label: "Dalam Produksi" },
    { value: "kontrol_kualitas", label: "Quality Control" },
    { value: "siap", label: "Siap Kirim" },
    { value: "dikirim", label: "Dikirim" },
    { value: "terkirim", label: "Terkirim" },
    { value: "dibatalkan", label: "Dibatalkan" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daftar Pesanan</h1>
            <p className="text-gray-600 mt-2">
              Kelola semua pesanan cetak dari penulis
            </p>
          </div>
          <Link
            href="/dashboard/percetakan"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari no. pesanan, judul naskah, atau pemesan..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilter(e.target.value as StatusPesanan | "semua")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Info */}
          {(statusFilter !== "semua" || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Filter aktif:</span>
              {statusFilter !== "semua" && (
                <span className="px-3 py-1 bg-[#0d7377] text-white rounded-full">
                  Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
                  Pencarian: "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setStatusFilter("semua");
                  setSearchQuery("");
                  setCurrentPage(1);
                  router.push("/dashboard/percetakan/pesanan");
                }}
                className="ml-2 text-red-600 hover:text-red-700 font-medium"
              >
                Reset Filter
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabel Pesanan */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              Pesanan ({metadata.total})
            </CardTitle>
            {metadata.total > 0 && (
              <span className="text-sm text-gray-600">
                Halaman {metadata.halaman} dari {metadata.totalHalaman}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pesanan.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                {searchQuery || statusFilter !== "semua"
                  ? "Tidak ada pesanan yang sesuai dengan filter"
                  : "Belum ada pesanan"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery || statusFilter !== "semua"
                  ? "Coba ubah filter atau pencarian Anda"
                  : "Pesanan baru akan muncul di sini"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Pesanan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Naskah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pemesan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spesifikasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Harga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pesanan.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {item.nomorPesanan}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.naskah?.judul || "-"}
                          </div>
                          {item.naskah?.subJudul && (
                            <div className="text-sm text-gray-500">
                              {item.naskah.subJudul}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.pemesan?.profilPengguna?.namaTampilan ||
                              item.pemesan?.email ||
                              "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.ukuranKertas}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.jenisKertas} • {item.jenisCover}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {item.jumlahCetak} eks
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatRupiah(item.totalHarga)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTanggal(item.dibuatPada)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/dashboard/percetakan/pesanan/${item.id}`}
                            className="text-[#0d7377] hover:text-[#0a5c5f] font-medium hover:underline"
                          >
                            Detail →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {metadata.totalHalaman > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Menampilkan {pesanan.length} dari {metadata.total} pesanan
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Sebelumnya
                      </button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from(
                          { length: metadata.totalHalaman },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === metadata.totalHalaman ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => {
                            const showEllipsis =
                              index > 0 && page - array[index - 1] > 1;
                            return (
                              <>
                                {showEllipsis && (
                                  <span
                                    key={`ellipsis-${page}`}
                                    className="px-3 py-2 text-gray-500"
                                  >
                                    ...
                                  </span>
                                )}
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    page === currentPage
                                      ? "bg-[#0d7377] text-white"
                                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              </>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === metadata.totalHalaman}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Selanjutnya →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
