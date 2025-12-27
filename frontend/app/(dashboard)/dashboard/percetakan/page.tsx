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
  Settings,
  BarChart3,
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

// Status config dengan Emerald color scheme
const STATUS_CONFIG = {
  tertunda: { 
    label: "Tertunda", 
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: Clock,
  },
  diterima: { 
    label: "Diterima", 
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: CheckCircle2,
  },
  dalam_produksi: {
    label: "Dalam Produksi",
    color: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: Package,
  },
  kontrol_kualitas: {
    label: "Kontrol Kualitas",
    color: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    icon: Settings,
  },
  siap: { 
    label: "Siap", 
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: CheckCircle2,
  },
  dikirim: { 
    label: "Dikirim", 
    color: "bg-teal-50 text-teal-700 border border-teal-200",
    icon: TrendingUp,
  },
  terkirim: { 
    label: "Terkirim", 
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: CheckCircle2,
  },
  selesai: { 
    label: "Selesai", 
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: CheckCircle2,
  },
  dibatalkan: { 
    label: "Dibatalkan", 
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: Clock,
  },
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Section - Modern Clean Design */}
        <header className="mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Dashboard Percetakan
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Kelola dan pantau semua aktivitas produksi percetakan Anda
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/percetakan/pesanan/baru">
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <Package className="mr-2 h-4 w-4" />
                  Kelola Pesanan
                </Button>
              </Link>
              <Link href="/dashboard/percetakan/tarif">
                <Button variant="outline" className="w-full sm:w-auto border-slate-200">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Cards - Clean & Minimal */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Pesanan Card */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-50 rounded-lg">
                      <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Pesanan</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {Number(stats.totalPesanan) || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Semua waktu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pesanan Aktif Card */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-50 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">
                      Aktif
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Pesanan Aktif</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {pesananAktif}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Dalam proses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pesanan Selesai Card */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Selesai</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {Number(stats.pesananSelesai) || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Pesanan terkirim</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Revenue Bulan Ini</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {formatRupiah(parseFloat(stats.revenueBulanIni?.toString() || "0"))}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Periode berjalan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </section>

        {/* Quick Actions - Card Based Layout */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <Link href="/dashboard/percetakan/pesanan/baru" className="group">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-0.5">Pesanan Baru</p>
                    <p className="text-sm text-slate-500 truncate">
                      {Number(stats.pesananTertunda) || 0} menunggu konfirmasi
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/percetakan/tarif" className="group">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-0.5">Kelola Tarif</p>
                    <p className="text-sm text-slate-500 truncate">Atur harga cetak</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/percetakan/keuangan/saldo" className="group">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-0.5">Saldo & Penarikan</p>
                    <p className="text-sm text-slate-500 truncate">Lihat penghasilan</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
        </section>

        {/* Recent Orders Table - Clean & Organized */}
        <section>
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Pesanan Terbaru
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {pesananTerbaru.length} pesanan terbaru
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/percetakan/pesanan">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-emerald-600">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pesananTerbaru.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Belum ada pesanan</p>
                  <p className="text-sm text-slate-500">Pesanan baru akan muncul di sini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full divide-y divide-slate-100">
                    {pesananTerbaru.map((pesanan: PesananCetak) => {
                      const config = STATUS_CONFIG[pesanan.status as keyof typeof STATUS_CONFIG];
                      const StatusIcon = config?.icon || Package;
                      
                      return (
                        <Link
                          key={pesanan.id}
                          href={`/dashboard/percetakan/pesanan/${pesanan.id}`}
                          className="block hover:bg-slate-50 transition-colors"
                        >
                          <div className="px-6 py-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-slate-900 mb-1 truncate">
                                  {pesanan.naskah?.judul || "Judul tidak tersedia"}
                                </h4>
                                <p className="text-xs text-slate-500 font-mono">
                                  {pesanan.nomorPesanan}
                                </p>
                              </div>
                              <Badge className={`${config?.color || 'bg-slate-100 text-slate-700'} text-xs px-2.5 py-1 font-medium whitespace-nowrap`}>
                                <StatusIcon className="h-3 w-3 mr-1.5 inline" />
                                {config?.label || pesanan.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5" />
                                <span className="font-medium">{pesanan.jumlah} eks</span>
                              </span>
                              <span className="truncate max-w-[200px]">
                                {pesanan.pemesan?.profilPengguna?.namaTampilan ||
                                  pesanan.pemesan?.email ||
                                  "Pemesan tidak diketahui"}
                              </span>
                              <span className="ml-auto text-slate-400">
                                {pesanan.tanggalPesan
                                  ? format(new Date(pesanan.tanggalPesan), "dd MMM yyyy", { locale: id })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        
      </div>
    </main>
  );
}
