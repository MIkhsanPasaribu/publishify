"use client";

import { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  CreditCard,
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

// Data pembayaran akan diambil dari API

const STATUS_CONFIG = {
  berhasil: {
    label: "Berhasil",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    icon: Clock,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500",
  },
  gagal: {
    label: "Gagal",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
};

function formatTanggal(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PembayaranPercetakanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  // State untuk data dari API
  const [pembayaranData] = useState<any[]>([]);

  // TODO: Fetch data dari API
  // useEffect(() => {
  //   fetchPembayaran();
  // }, []);

  // Filter data
  const filteredPembayaran = pembayaranData.filter((bayar) => {
    const matchSearch =
      bayar.nomorPembayaran?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bayar.nomorPesanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bayar.pemesan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "semua" || bayar.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Statistik
  const stats = {
    totalPembayaran: pembayaranData.length,
    berhasil: pembayaranData.filter((p) => p.status === "berhasil").length,
    menunggu: pembayaranData.filter((p) => p.status === "menunggu_verifikasi").length,
    gagal: pembayaranData.filter((p) => p.status === "gagal").length,
    totalPendapatan: pembayaranData.filter((p) => p.status === "berhasil").reduce(
      (sum, p) => sum + (p.jumlah || 0),
      0
    ),
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Gradient Header Panel */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
                Kelola Pembayaran
              </h1>
              <p className="text-sm text-teal-50">
                Verifikasi dan kelola pembayaran dari penulis
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.totalPembayaran}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Total Pembayaran</div>
                <div className="text-xs text-slate-500">Transaksi bulan ini</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.berhasil}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Berhasil</div>
                <div className="text-xs text-slate-500">Terverifikasi</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-amber-900">{stats.menunggu}</div>
                <div className="text-xs sm:text-sm font-medium text-amber-700">Menunggu Verifikasi</div>
                <div className="text-xs text-amber-600">Perlu ditindaklanjuti</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-teal-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-bold text-teal-900">{formatRupiah(stats.totalPendapatan)}</div>
                <div className="text-xs sm:text-sm font-medium text-teal-700">Total Pendapatan</div>
                <div className="text-xs text-teal-600">Pembayaran berhasil</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Cari nomor pembayaran, pesanan, atau pemesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:ring-teal-500"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-64 h-11 border-slate-300">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="berhasil">Berhasil</SelectItem>
                <SelectItem value="menunggu_verifikasi">Menunggu Verifikasi</SelectItem>
                <SelectItem value="gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Pembayaran */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      Pembayaran
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      Pesanan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPembayaran.map((bayar) => {
                    const config = STATUS_CONFIG[bayar.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = config.icon;

                    return (
                      <tr key={bayar.id} className="hover:bg-teal-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-sm text-gray-900 mb-1">
                            {bayar.pemesan}
                          </div>
                          <div className="text-xs text-gray-600 font-mono">
                            {bayar.nomorPembayaran}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTanggal(bayar.tanggalBayar)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {bayar.judul}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {bayar.nomorPesanan}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{bayar.metodePembayaran}</div>
                          <div className="text-xs text-gray-600">{bayar.bank}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base font-bold text-teal-700">
                            {formatRupiah(bayar.jumlah)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${config.color} border-2 flex items-center gap-1.5 w-fit`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${config.dotColor} ${
                                bayar.status === "menunggu_verifikasi" ? "animate-pulse" : ""
                              }`}
                            />
                            <StatusIcon className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">{config.label}</span>
                          </Badge>
                          {bayar.tanggalVerifikasi && (
                            <div className="text-xs text-gray-500 mt-1">
                              Verified: {formatTanggal(bayar.tanggalVerifikasi)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {bayar.status === "menunggu_verifikasi" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Verifikasi
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-300 text-red-600">
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          )}
                          {bayar.status === "berhasil" && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Terverifikasi
                            </Badge>
                          )}
                          {bayar.status === "gagal" && (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Gagal
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
