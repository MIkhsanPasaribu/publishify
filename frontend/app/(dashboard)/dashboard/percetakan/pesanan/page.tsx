"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { ambilDaftarPesanan } from "@/lib/api/percetakan";
import type { PesananCetak, StatusPesanan } from "@/types/percetakan";
import Link from "next/link";

export default function DaftarPesananPage() {
  const [pesanan, setPesanan] = useState<PesananCetak[]>([]);
  const [loading, setLoading] = useState(true);
  const [halaman, setHalaman] = useState(1);
  const [totalHalaman, setTotalHalaman] = useState(1);
  const [filterStatus, setFilterStatus] = useState<StatusPesanan | "semua">("semua");
  const [cari, setCari] = useState("");

  const limit = 10;

  useEffect(() => {
    loadPesanan();
  }, [halaman, filterStatus]);

  async function loadPesanan() {
    try {
      setLoading(true);
      const params: any = {
        halaman,
        limit,
        cari: cari || undefined,
      };

      if (filterStatus !== "semua") {
        params.status = filterStatus;
      }

      const response = await ambilDaftarPesanan(params);
      if (response.sukses) {
        setPesanan(response.data);
        if (response.metadata) {
          setTotalHalaman(response.metadata.totalHalaman || 1);
        }
      }
    } catch (error) {
      console.error("Error loading pesanan:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setHalaman(1);
    loadPesanan();
  }

  const statusOptions: { value: StatusPesanan | "semua"; label: string }[] = [
    { value: "semua", label: "Semua Status" },
    { value: "tertunda", label: "Tertunda" },
    { value: "diterima", label: "Diterima" },
    { value: "dalam_produksi", label: "Dalam Produksi" },
    { value: "kontrol_kualitas", label: "Quality Control" },
    { value: "siap", label: "Siap Kirim" },
    { value: "dikirim", label: "Dikirim" },
    { value: "terkirim", label: "Selesai" },
    { value: "dibatalkan", label: "Dibatalkan" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Daftar Pesanan
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola semua pesanan cetak yang masuk
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor pesanan atau nama pemesan..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as StatusPesanan | "semua");
                  setHalaman(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Cari
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        ) : pesanan.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">Tidak ada pesanan</p>
            <p className="text-gray-500 text-sm">
              Belum ada pesanan yang masuk saat ini
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pesanan.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/percetakan/pesanan/${item.id}`}
                          className="font-medium text-teal-600 hover:text-teal-700"
                        >
                          {item.nomorPesanan}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {item.naskah?.judul || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.naskah?.jumlahHalaman || 0} halaman
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {item.pemesan?.profilPengguna?.namaDepan}{" "}
                          {item.pemesan?.profilPengguna?.namaBelakang}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.pemesan?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {item.jumlah} eks • {item.formatKertas}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.jenisKertas} • {item.jenisCover}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          Rp {item.hargaTotal.toLocaleString("id-ID")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.tanggalPesan).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {pesanan.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/percetakan/pesanan/${item.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-teal-600 mb-1">
                        {item.nomorPesanan}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="font-semibold text-gray-900">
                      Rp {item.hargaTotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">
                    {item.naskah?.judul || "-"}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.jumlah} eks • {item.formatKertas} • {item.jenisKertas}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.tanggalPesan).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && pesanan.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Halaman {halaman} dari {totalHalaman}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setHalaman((p) => Math.max(1, p - 1))}
              disabled={halaman === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <button
              onClick={() => setHalaman((p) => Math.min(totalHalaman, p + 1))}
              disabled={halaman === totalHalaman}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Component untuk Badge Status
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    tertunda: {
      label: "Tertunda",
      className: "bg-yellow-100 text-yellow-800",
    },
    diterima: {
      label: "Diterima",
      className: "bg-blue-100 text-blue-800",
    },
    dalam_produksi: {
      label: "Produksi",
      className: "bg-purple-100 text-purple-800",
    },
    kontrol_kualitas: {
      label: "QC",
      className: "bg-indigo-100 text-indigo-800",
    },
    siap: {
      label: "Siap Kirim",
      className: "bg-teal-100 text-teal-800",
    },
    dikirim: {
      label: "Dikirim",
      className: "bg-cyan-100 text-cyan-800",
    },
    terkirim: {
      label: "Selesai",
      className: "bg-green-100 text-green-800",
    },
    dibatalkan: {
      label: "Dibatalkan",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
