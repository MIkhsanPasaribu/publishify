"use client";

import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  ArrowRight,
  AlertCircle,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dummy Data
const STATS = {
  totalPesanan: 127,
  pesananAktif: 23,
  selesaiBulanIni: 45,
  pendapatanBulanIni: 125000000,
  rataWaktuProduksi: 7, // hari
  tingkatKepuasan: 4.8,
};

const PESANAN_TERBARU = [
  {
    id: "1",
    nomorPesanan: "PO-20251126-1234",
    judul: "Petualangan di Negeri Dongeng",
    pemesan: "Ahmad Rudi",
    jumlah: 100,
    status: "dalam_produksi",
    tanggal: "2025-11-26",
    estimasi: "2025-12-03",
  },
  {
    id: "2",
    nomorPesanan: "PO-20251125-5678",
    judul: "Panduan Lengkap Pemrograman Web",
    pemesan: "Siti Nurhaliza",
    jumlah: 50,
    status: "kontrol_kualitas",
    tanggal: "2025-11-25",
    estimasi: "2025-11-30",
  },
  {
    id: "3",
    nomorPesanan: "PO-20251124-9012",
    judul: "Resep Masakan Nusantara",
    pemesan: "Budi Santoso",
    jumlah: 200,
    status: "siap",
    tanggal: "2025-11-24",
    estimasi: "2025-11-29",
  },
  {
    id: "4",
    nomorPesanan: "PO-20251123-3456",
    judul: "Kisah Inspiratif Para Pejuang",
    pemesan: "Dewi Lestari",
    jumlah: 75,
    status: "tertunda",
    tanggal: "2025-11-23",
    estimasi: "2025-11-30",
  },
];

const AKTIVITAS_PRODUKSI = [
  {
    id: "1",
    pesanan: "PO-20251126-1234",
    aktivitas: "Proses pencetakan halaman 1-50 selesai",
    waktu: "2 jam yang lalu",
  },
  {
    id: "2",
    pesanan: "PO-20251125-5678",
    aktivitas: "Quality control tahap 2",
    waktu: "5 jam yang lalu",
  },
  {
    id: "3",
    pesanan: "PO-20251124-9012",
    aktivitas: "Proses finishing dan packaging selesai",
    waktu: "1 hari yang lalu",
  },
  {
    id: "4",
    pesanan: "PO-20251123-3456",
    aktivitas: "Menunggu konfirmasi pembayaran",
    waktu: "2 hari yang lalu",
  },
];

const STATUS_CONFIG = {
  tertunda: { label: "Tertunda", color: "bg-amber-100 text-amber-800" },
  dalam_produksi: { label: "Dalam Produksi", color: "bg-blue-100 text-blue-800" },
  kontrol_kualitas: { label: "QC", color: "bg-purple-100 text-purple-800" },
  siap: { label: "Siap Kirim", color: "bg-green-100 text-green-800" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPercetakanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard Percetakan
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola dan pantau semua aktivitas produksi percetakan
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/percetakan/pesanan">
              <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg">
                <Package className="mr-2 h-4 w-4" />
                Kelola Pesanan
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistik Cards - Grid 3 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{STATS.totalPesanan}</p>
              <p className="text-xs text-gray-500 mt-2">+12% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <Printer className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Pesanan Aktif</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{STATS.pesananAktif}</p>
              <p className="text-xs text-gray-500 mt-2">Sedang dalam proses</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Selesai Bulan Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{STATS.selesaiBulanIni}</p>
              <p className="text-xs text-gray-500 mt-2">Target: 50 pesanan</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Pendapatan Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatRupiah(STATS.pendapatanBulanIni)}
              </p>
              <p className="text-xs text-gray-500 mt-2">+18% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-teal-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Rata-rata Waktu Produksi</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{STATS.rataWaktuProduksi} <span className="text-lg">hari</span></p>
              <p className="text-xs text-gray-500 mt-2">Target: ≤ 10 hari</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-rose-50 to-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-rose-100 rounded-lg">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Tingkat Kepuasan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{STATS.tingkatKepuasan} <span className="text-lg">/5.0</span></p>
              <p className="text-xs text-gray-500 mt-2">Dari 89 ulasan</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pesanan Terbaru */}
          <Card className="border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-700" />
                  Pesanan Terbaru
                </CardTitle>
                <Link href="/dashboard/percetakan/pesanan">
                  <Button variant="ghost" size="sm" className="text-slate-700">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {PESANAN_TERBARU.map((pesanan) => {
                  const config = STATUS_CONFIG[pesanan.status as keyof typeof STATUS_CONFIG];
                  return (
                    <div
                      key={pesanan.id}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {pesanan.judul}
                          </h4>
                          <p className="text-xs text-gray-600 font-mono">
                            {pesanan.nomorPesanan}
                          </p>
                        </div>
                        <Badge className={`${config.color} text-xs`}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{pesanan.pemesan} • {pesanan.jumlah} eks</span>
                        <span>Est: {pesanan.estimasi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Aktivitas Produksi */}
          <Card className="border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-slate-700" />
                Aktivitas Produksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {AKTIVITAS_PRODUKSI.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {item.aktivitas}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 font-mono">
                            {item.pesanan}
                          </p>
                          <p className="text-xs text-gray-500">{item.waktu}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
