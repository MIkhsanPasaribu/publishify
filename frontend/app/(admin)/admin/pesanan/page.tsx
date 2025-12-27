"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Printer,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dummy data
const dummyPesanan = [
  {
    id: "1",
    nomorPesanan: "PO-2024-001234",
    judulBuku: "Filosofi Kopi",
    pemesan: "John Doe",
    jumlah: 50,
    hargaTotal: 2250000,
    status: "tertunda",
    tanggalPesan: "2024-12-08T10:30:00",
  },
  {
    id: "2",
    nomorPesanan: "PO-2024-001235",
    judulBuku: "Laskar Pelangi",
    pemesan: "Jane Smith",
    jumlah: 100,
    hargaTotal: 4750000,
    status: "diterima",
    tanggalPesan: "2024-12-07T14:20:00",
  },
  {
    id: "3",
    nomorPesanan: "PO-2024-001236",
    judulBuku: "Negeri 5 Menara",
    pemesan: "Ahmad Fuadi",
    jumlah: 75,
    hargaTotal: 3187500,
    status: "dalam_produksi",
    tanggalPesan: "2024-12-06T09:15:00",
  },
  {
    id: "4",
    nomorPesanan: "PO-2024-001237",
    judulBuku: "Bumi Manusia",
    pemesan: "Dewi Lestari",
    jumlah: 30,
    hargaTotal: 1350000,
    status: "siap",
    tanggalPesan: "2024-12-05T16:45:00",
  },
  {
    id: "5",
    nomorPesanan: "PO-2024-001238",
    judulBuku: "Pulang",
    pemesan: "Tere Liye",
    jumlah: 200,
    hargaTotal: 8900000,
    status: "dikirim",
    tanggalPesan: "2024-12-04T11:00:00",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  tertunda: { label: "Tertunda", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
  diterima: { label: "Diterima", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  dalam_produksi: { label: "Dalam Produksi", color: "bg-purple-100 text-purple-800 border-purple-200", icon: <Printer className="w-3 h-3" /> },
  siap: { label: "Siap Kirim", color: "bg-green-100 text-green-800 border-green-200", icon: <Package className="w-3 h-3" /> },
  dikirim: { label: "Dikirim", color: "bg-teal-100 text-teal-800 border-teal-200", icon: <TrendingUp className="w-3 h-3" /> },
  terkirim: { label: "Terkirim", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="w-3 h-3" /> },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PesananCetakAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const filteredPesanan = dummyPesanan.filter((pesanan) => {
    const matchSearch =
      pesanan.nomorPesanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesanan.judulBuku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesanan.pemesan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "semua" || pesanan.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalPesanan = dummyPesanan.length;
  const pesananBaru = dummyPesanan.filter((p) => p.status === "tertunda").length;
  const dalamProduksi = dummyPesanan.filter((p) => p.status === "dalam_produksi").length;
  const totalPendapatan = dummyPesanan.reduce((acc, p) => acc + p.hargaTotal, 0);

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
                Pesanan Cetak
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola pesanan cetak dari penulis dan pemesan
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{totalPesanan}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Total Pesanan</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{pesananBaru}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Menunggu</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{dalamProduksi}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Produksi</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">{formatRupiah(totalPendapatan)}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Total Nilai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        {/* Search & Filter */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Cari berdasarkan nomor pesanan, judul buku, atau pemesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:ring-teal-500"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 border-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="tertunda">Tertunda</SelectItem>
                <SelectItem value="diterima">Diterima</SelectItem>
                <SelectItem value="dalam_produksi">Dalam Produksi</SelectItem>
                <SelectItem value="siap">Siap Kirim</SelectItem>
                <SelectItem value="dikirim">Dikirim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pesanan List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      No. Pesanan
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Buku
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Pemesan
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPesanan.map((pesanan) => {
                    const status = statusConfig[pesanan.status];
                    return (
                      <tr key={pesanan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                            {pesanan.nomorPesanan}
                          </code>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {pesanan.judulBuku}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{pesanan.pemesan}</td>
                        <td className="px-6 py-4 text-center font-semibold">
                          {pesanan.jumlah}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          {formatRupiah(pesanan.hargaTotal)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={`${status.color} gap-1`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-500">
                          {formatTanggal(pesanan.tanggalPesan)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button size="sm" variant="ghost" className="hover:bg-teal-50 hover:text-teal-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Fitur dalam pengembangan
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Data yang ditampilkan adalah data dummy. Integrasi dengan backend percetakan
              akan ditambahkan untuk mengelola pesanan cetak secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
