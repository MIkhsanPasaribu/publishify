"use client";

import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";

// Dummy data untuk laporan
const laporanBulanan = {
  periode: "Desember 2025",
  totalRevenue: 17337500,
  totalPesanan: 8,
  rataRataPesanan: 2167187,
  pertumbuhanRevenue: 15.5,
  pertumbuhanPesanan: 12.3,
};

const dataPerBulan = [
  { bulan: "Jul 2025", revenue: 8500000, pesanan: 4 },
  { bulan: "Agu 2025", revenue: 12300000, pesanan: 6 },
  { bulan: "Sep 2025", revenue: 9800000, pesanan: 5 },
  { bulan: "Okt 2025", revenue: 13500000, pesanan: 7 },
  { bulan: "Nov 2025", revenue: 15000000, pesanan: 7 },
  { bulan: "Des 2025", revenue: 17337500, pesanan: 8 },
];

const topNaskah = [
  {
    id: "1",
    judul: "Konspirasi Gedung Putih",
    penulis: "Ahmad Surya Wijaya",
    jumlahCetak: 250,
    revenue: 4687500,
    persentase: 27.0,
  },
  {
    id: "2",
    judul: "Jejak Sang Pemburu",
    penulis: "Ahmad Surya Wijaya",
    jumlahCetak: 200,
    revenue: 3750000,
    persentase: 21.6,
  },
  {
    id: "3",
    judul: "Masa Depan Bumi 2150",
    penulis: "Ahmad Surya Wijaya",
    jumlahCetak: 150,
    revenue: 2625000,
    persentase: 15.1,
  },
  {
    id: "4",
    judul: "Komedi Keluarga Modern",
    penulis: "Ahmad Surya Wijaya",
    jumlahCetak: 100,
    revenue: 1650000,
    persentase: 9.5,
  },
  {
    id: "5",
    judul: "Perang Galaksi Terakhir",
    penulis: "Ahmad Surya Wijaya",
    jumlahCetak: 100,
    revenue: 1650000,
    persentase: 9.5,
  },
];

const statusDistribusi = [
  { status: "Terkirim", jumlah: 1, persentase: 12.5, color: "bg-green-500" },
  { status: "Siap", jumlah: 1, persentase: 12.5, color: "bg-teal-500" },
  { status: "Quality Control", jumlah: 1, persentase: 12.5, color: "bg-indigo-500" },
  { status: "Dalam Produksi", jumlah: 2, persentase: 25.0, color: "bg-purple-500" },
  { status: "Diterima", jumlah: 1, persentase: 12.5, color: "bg-blue-500" },
  { status: "Tertunda", jumlah: 2, persentase: 25.0, color: "bg-yellow-500" },
];

const performanceMetrics = {
  rataRataWaktuProduksi: 7.5,
  tingkatKetepatan: 92.3,
  tingkatKepuasan: 4.8,
  jumlahRevisi: 3,
};

export default function LaporanPercetakanPage() {
  const [periodeLaporan, setPeriodeLaporan] = useState("bulan-ini");
  const [jenisLaporan, setJenisLaporan] = useState("ringkasan");

  const handleExportPDF = () => {
    console.log("Export to PDF");
  };

  const handleExportExcel = () => {
    console.log("Export to Excel");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Laporan Keuangan
            </h1>
            <p className="text-gray-600 mt-2">
              Analisis kinerja dan statistik operasional percetakan
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button onClick={handleExportPDF} className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg gap-2">
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Periode Laporan
                </label>
                <Select value={periodeLaporan} onValueChange={setPeriodeLaporan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hari-ini">Hari Ini</SelectItem>
                    <SelectItem value="minggu-ini">Minggu Ini</SelectItem>
                    <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
                    <SelectItem value="3-bulan">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="6-bulan">6 Bulan Terakhir</SelectItem>
                    <SelectItem value="tahun-ini">Tahun Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Jenis Laporan
                </label>
                <Select value={jenisLaporan} onValueChange={setJenisLaporan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ringkasan">Ringkasan</SelectItem>
                    <SelectItem value="keuangan">Keuangan Detail</SelectItem>
                    <SelectItem value="operasional">Operasional</SelectItem>
                    <SelectItem value="lengkap">Laporan Lengkap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+{laporanBulanan.pertumbuhanRevenue}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatRupiah(laporanBulanan.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{laporanBulanan.periode}</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+{laporanBulanan.pertumbuhanPesanan}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {laporanBulanan.totalPesanan}
              </p>
              <p className="text-xs text-gray-500 mt-2">Pesanan bulan ini</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Rata-rata Pesanan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatRupiah(laporanBulanan.rataRataPesanan)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Per pesanan</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Tingkat Ketepatan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {performanceMetrics.tingkatKetepatan}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Waktu produksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-700" />
              Trend Revenue 6 Bulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dataPerBulan.map((data, index) => {
                const maxRevenue = Math.max(...dataPerBulan.map(d => d.revenue));
                const percentage = (data.revenue / maxRevenue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{data.bulan}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">{data.pesanan} pesanan</span>
                        <span className="font-bold text-green-600">{formatRupiah(data.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Naskah */}
          <Card className="border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-700" />
                Top 5 Naskah Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="text-right">Cetak</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topNaskah.map((naskah, index) => (
                    <TableRow key={naskah.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{naskah.judul}</p>
                            <p className="text-xs text-gray-500">{naskah.penulis}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {naskah.jumlahCetak}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-bold text-green-600">{formatRupiah(naskah.revenue)}</p>
                          <p className="text-xs text-gray-500">{naskah.persentase}%</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-slate-700" />
                Distribusi Status Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {statusDistribusi.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium text-gray-700">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">{item.jumlah} pesanan</span>
                        <span className="font-bold text-gray-900 w-12 text-right">
                          {item.persentase}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.persentase}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-700" />
              Metrik Performa Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {performanceMetrics.rataRataWaktuProduksi}
                </p>
                <p className="text-sm text-gray-600">Rata-rata Produksi (hari)</p>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {performanceMetrics.tingkatKetepatan}%
                </p>
                <p className="text-sm text-gray-600">Tingkat Ketepatan Waktu</p>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-amber-600 mb-2">
                  {performanceMetrics.tingkatKepuasan}
                </p>
                <p className="text-sm text-gray-600">Rating Kepuasan (dari 5)</p>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-2">
                  {performanceMetrics.jumlahRevisi}
                </p>
                <p className="text-sm text-gray-600">Total Revisi Bulan Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
