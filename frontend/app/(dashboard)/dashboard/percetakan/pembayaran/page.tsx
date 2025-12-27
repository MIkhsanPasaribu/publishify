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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Kelola Pembayaran
            </h1>
            <p className="text-gray-600 mt-2">
              Verifikasi dan kelola pembayaran dari penulis
            </p>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-emerald-700 font-medium">Total Pembayaran</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">
                {stats.totalPembayaran}
              </p>
              <p className="text-xs text-emerald-600 mt-2">Transaksi bulan ini</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-green-700 font-medium">Berhasil</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.berhasil}</p>
              <p className="text-xs text-green-600 mt-2">Terverifikasi</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
              <p className="text-sm text-amber-700 font-medium">Menunggu Verifikasi</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">{stats.menunggu}</p>
              <p className="text-xs text-amber-600 mt-2">Perlu ditindaklanjuti</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-teal-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-teal-700 font-medium">Total Pendapatan</p>
              <p className="text-xl font-bold text-teal-900 mt-1">
                {formatRupiah(stats.totalPendapatan)}
              </p>
              <p className="text-xs text-teal-600 mt-2">Dari pembayaran berhasil</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Cari nomor pembayaran, pesanan, atau pemesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-64 h-11">
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
          </CardContent>
        </Card>

        {/* Table Pembayaran */}
        <Card className="border-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
