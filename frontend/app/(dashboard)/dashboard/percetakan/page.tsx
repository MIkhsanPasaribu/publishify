"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ambilStatistikPercetakan,
  ambilPesananPercetakan,
} from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

// Status config untuk badge colors
const STATUS_CONFIG = {
  tertunda: { label: "Tertunda", color: "bg-yellow-100 text-yellow-800" },
  diterima: { label: "Diterima", color: "bg-blue-100 text-blue-800" },
  dalam_produksi: {
    label: "Dalam Produksi",
    color: "bg-purple-100 text-purple-800",
  },
  kontrol_kualitas: {
    label: "Kontrol Kualitas",
    color: "bg-indigo-100 text-indigo-800",
  },
  siap: { label: "Siap", color: "bg-green-100 text-green-800" },
  dikirim: { label: "Dikirim", color: "bg-teal-100 text-teal-800" },
  terkirim: { label: "Terkirim", color: "bg-green-100 text-green-800" },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
};

export default function DashboardPercetakanPage() {
  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats-percetakan"],
    queryFn: ambilStatistikPercetakan,
  });

  // Fetch pesanan terbaru (semua status)
  const { data: pesananData, isLoading: pesananLoading } = useQuery({
    queryKey: ["pesanan-all"],
    queryFn: () => ambilPesananPercetakan(),
  });

  const stats = statsData?.data || {
    totalPesanan: 0,
    pesananTertunda: 0,
    pesananDalamProduksi: 0,
    pesananSelesai: 0,
    revenueBulanIni: 0,
    pesananBulanIni: 0,
    tingkatPenyelesaian: 0,
    rataRataWaktuProduksi: 0,
  };

  // Calculate pesananAktif from pesananDalamProduksi + pesananTertunda
  const pesananAktif = (Number(stats.pesananTertunda) || 0) + (Number(stats.pesananDalamProduksi) || 0);

  const pesananList = pesananData?.data || [];
  const pesananTerbaru = pesananList.slice(0, 5); // Ambil 5 terbaru

  if (statsLoading || pesananLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <Link href="/dashboard/percetakan/pesanan/baru">
              <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg">
                <Package className="mr-2 h-4 w-4" />
                Kelola Pesanan
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistik Cards - Grid 4 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {Number(stats.totalPesanan) || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Semua waktu</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Aktif
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-medium">Pesanan Aktif</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {pesananAktif}
              </p>
              <p className="text-xs text-gray-500 mt-2">Dalam proses</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Selesai</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {Number(stats.pesananSelesai) || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Pesanan terkirim</p>
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
              <p className="text-sm text-gray-600 font-medium">Revenue Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatRupiah(parseFloat(stats.revenueBulanIni?.toString() || "0"))}
              </p>
              <p className="text-xs text-gray-500 mt-2">Bulan ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/percetakan/pesanan/baru">
            <Card className="border-2 border-blue-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Pesanan Baru</p>
                    <p className="text-sm text-gray-600">
                      {Number(stats.pesananTertunda) || 0} menunggu konfirmasi
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/percetakan/tarif">
            <Card className="border-2 border-purple-200 hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Kelola Tarif</p>
                    <p className="text-sm text-gray-600">Atur harga cetak</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/percetakan/keuangan/saldo">
            <Card className="border-2 border-green-200 hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Saldo & Penarikan</p>
                    <p className="text-sm text-gray-600">Lihat penghasilan</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Pesanan Terbaru */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-slate-700" />
                  Pesanan Terbaru
                </CardTitle>
                <Link href="/dashboard/percetakan/pesanan/baru">
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pesananTerbaru.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada pesanan</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pesananTerbaru.map((pesanan: PesananCetak) => {
                    const config =
                      STATUS_CONFIG[
                        pesanan.status as keyof typeof STATUS_CONFIG
                      ];
                    return (
                      <div
                        key={pesanan.id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {pesanan.naskah?.judul || "-"}
                            </h4>
                            <p className="text-xs text-gray-600 font-mono">
                              {pesanan.nomorPesanan}
                            </p>
                          </div>
                          <Badge className={`${config.color} text-xs`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {pesanan.jumlah} eks
                            </span>
                            <span>
                              {pesanan.pemesan?.profilPengguna?.namaTampilan ||
                                pesanan.pemesan?.email ||
                                "-"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {pesanan.tanggalPesan ? format(
                              new Date(pesanan.tanggalPesan),
                              "dd MMM yyyy",
                              { locale: id }
                            ) : "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
