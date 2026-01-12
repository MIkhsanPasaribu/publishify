/**
 * Halaman Pesanan Saya - Penulis
 * List semua pesanan cetak yang dibuat penulis
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Calendar,
  Eye,
  XCircle,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";
import type { PesananCetak, StatusPesanan } from "@/types/percetakan";

// Status Badge Component
function StatusBadge({ status }: { status: StatusPesanan }) {
  const statusConfig = {
    tertunda: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Tertunda" },
    diterima: { bg: "bg-blue-100", text: "text-blue-700", label: "Diterima" },
    dalam_produksi: { bg: "bg-purple-100", text: "text-purple-700", label: "Produksi" },
    kontrol_kualitas: { bg: "bg-indigo-100", text: "text-indigo-700", label: "QC" },
    siap: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Siap" },
    dikirim: { bg: "bg-teal-100", text: "text-teal-700", label: "Dikirim" },
    terkirim: { bg: "bg-green-100", text: "text-green-700", label: "Terkirim" },
    selesai: { bg: "bg-gray-100", text: "text-gray-700", label: "Selesai" },
    dibatalkan: { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" },
  };

  const config = statusConfig[status] || statusConfig.tertunda;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export default function PesananSayaPage() {
  const [pesanan, setPesanan] = useState<PesananCetak[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusPesanan | "">("");
  const [halaman, setHalaman] = useState(1);
  const [totalHalaman, setTotalHalaman] = useState(1);

  useEffect(() => {
    ambilPesananSaya();
  }, [halaman, filterStatus]);

  async function ambilPesananSaya() {
    try {
      setLoading(true);
      // TODO: API call
      // const response = await percetakanApi.ambilDaftarPesanan({
      //   halaman,
      //   limit: 20,
      //   status: filterStatus || undefined,
      // });
      
      // Dummy data
      setPesanan([]);
      setTotalHalaman(1);
    } catch (error) {
      console.error("Error loading pesanan:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPesanan = pesanan.filter((p) =>
    p.nomorPesanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.naskah?.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatRupiah(angka: number | string): string {
    const num = typeof angka === "string" ? parseInt(angka) : angka;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  function formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="text-gray-600 mt-1">
            Kelola dan tracking semua pesanan cetak Anda
          </p>
        </div>
        <Link
          href="/dashboard/penulis/percetakan/buat"
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
        >
          <Package className="w-5 h-5" />
          Buat Pesanan Baru
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nomor pesanan atau judul naskah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusPesanan | "")}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
        >
          <option value="">Semua Status</option>
          <option value="tertunda">Tertunda</option>
          <option value="diterima">Diterima</option>
          <option value="dalam_produksi">Dalam Produksi</option>
          <option value="kontrol_kualitas">Kontrol Kualitas</option>
          <option value="siap">Siap</option>
          <option value="dikirim">Dikirim</option>
          <option value="terkirim">Terkirim</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {/* Pesanan List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat pesanan...</p>
          </div>
        </div>
      ) : filteredPesanan.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum Ada Pesanan
          </h3>
          <p className="text-gray-600 mb-6">
            Anda belum membuat pesanan cetak. Mulai dengan membuat pesanan pertama Anda!
          </p>
          <Link
            href="/dashboard/penulis/percetakan/buat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            Buat Pesanan Pertama
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Pesanan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Naskah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPesanan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.nomorPesanan}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.naskah?.judul || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.formatKertas} • {item.jenisCover}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.jumlah} pcs</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatRupiah(item.hargaTotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatTanggal(item.tanggalPesan)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/dashboard/penulis/percetakan/pesanan/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredPesanan.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.nomorPesanan}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.naskah?.judul || "N/A"}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Jumlah</p>
                    <p className="text-sm font-medium text-gray-900">
                      {item.jumlah} pcs
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatRupiah(item.hargaTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Format</p>
                    <p className="text-sm font-medium text-gray-900">
                      {item.formatKertas}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTanggal(item.tanggalPesan)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/penulis/percetakan/pesanan/${item.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Lihat Detail
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredPesanan.length} dari {pesanan.length} pesanan
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHalaman((prev) => Math.max(1, prev - 1))}
                disabled={halaman === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Halaman {halaman} dari {totalHalaman}
              </span>
              <button
                onClick={() => setHalaman((prev) => Math.min(totalHalaman, prev + 1))}
                disabled={halaman === totalHalaman}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
