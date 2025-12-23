"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Truck,
  Calendar,
  FileText,
  Printer,
  CreditCard,
  AlertCircle,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ambilStatistikPercetakan,
  ambilPesananPercetakan,
} from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

// Fungsi untuk mendapatkan sapaan berdasarkan waktu
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

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
  selesai: { label: "Selesai", color: "bg-emerald-100 text-emerald-800" },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
};

export default function DashboardPercetakanPage() {
  const router = useRouter();

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

  const pesananList = pesananData?.data || [];
  const pesananTerbaru = pesananList.slice(0, 5);

  // Data statistik untuk 8 cards layout
  const statsCards = [
    {
      label: "Total Pesanan",
      sublabel: "Semua waktu",
      value: Number(stats.totalPesanan) || 0,
      icon: Package,
      bgColor: "bg-blue-500",
    },
    {
      label: "Pesanan Tertunda",
      sublabel: "Menunggu konfirmasi",
      value: Number(stats.pesananTertunda) || 0,
      icon: Clock,
      bgColor: "bg-yellow-500",
    },
    {
      label: "Dalam Produksi",
      sublabel: "Sedang dikerjakan",
      value: Number(stats.pesananDalamProduksi) || 0,
      icon: Printer,
      bgColor: "bg-purple-500",
    },
    {
      label: "Pesanan Selesai",
      sublabel: "Sudah terkirim",
      value: Number(stats.pesananSelesai) || 0,
      icon: CheckCircle2,
      bgColor: "bg-teal-500",
    },
    {
      label: "Pesanan Bulan Ini",
      sublabel: "Periode berjalan",
      value: Number(stats.pesananBulanIni) || 0,
      icon: Calendar,
      bgColor: "bg-indigo-500",
    },
    {
      label: "Tingkat Penyelesaian",
      sublabel: "Persentase sukses",
      value: `${Number(stats.tingkatPenyelesaian) || 0}%`,
      icon: TrendingUp,
      bgColor: "bg-green-500",
    },
    {
      label: "Rata-rata Produksi",
      sublabel: "Waktu pengerjaan",
      value: `${Number(stats.rataRataWaktuProduksi) || 0} hari`,
      icon: Timer,
      bgColor: "bg-orange-500",
    },
    {
      label: "Revenue Bulan Ini",
      sublabel: "Pendapatan",
      value: formatRupiah(parseFloat(stats.revenueBulanIni?.toString() || "0")),
      icon: DollarSign,
      bgColor: "bg-pink-500",
    },
  ];

  if (statsLoading || pesananLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Main Content - Centered Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                <Printer className="h-6 w-6 sm:h-7 sm:w-7" />
                Dashboard Percetakan
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola dan pantau semua aktivitas produksi percetakan Anda
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block ml-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Printer className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - 8 Cards (4x2 grid) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5 truncate">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {stat.sublabel}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Highlight Cards & Orders */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Highlight Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              {/* Pesanan Tertunda Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {Number(stats.pesananTertunda) || 0}
                    </div>
                    <div className="text-sm opacity-90">Pesanan menunggu konfirmasi</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <Link href="/percetakan/pesanan/baru">
                  <button className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                    Lihat Pesanan →
                  </button>
                </Link>
              </div>

              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold mb-1">
                      {formatRupiah(parseFloat(stats.revenueBulanIni?.toString() || "0"))}
                    </div>
                    <div className="text-sm opacity-90">Revenue bulan ini</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <Link href="/percetakan/keuangan/saldo">
                  <button className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                    Lihat Keuangan →
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Pesanan Terbaru */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  Pesanan Terbaru
                </h3>
                <Link href="/percetakan/pesanan" className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Lihat Semua →
                </Link>
              </div>
              
              {pesananTerbaru.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pesananTerbaru.map((pesanan: PesananCetak) => {
                    const config = STATUS_CONFIG[pesanan.status as keyof typeof STATUS_CONFIG];
                    return (
                      <Link
                        key={pesanan.id}
                        href={`/percetakan/pesanan/${pesanan.id}`}
                        className="block"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-xs sm:text-sm font-medium text-slate-900 line-clamp-1">
                                {pesanan.naskah?.judul || "Judul tidak tersedia"}
                              </p>
                              <Badge className={`${config?.color || 'bg-slate-100'} text-xs flex-shrink-0`}>
                                {config?.label || pesanan.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-mono">{pesanan.nomorPesanan}</span>
                              <span>•</span>
                              <span>{pesanan.jumlah} eks</span>
                              <span>•</span>
                              <span>
                                {pesanan.tanggalPesan
                                  ? format(new Date(pesanan.tanggalPesan), "dd MMM", { locale: id })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Status Breakdown */}
          <div className="space-y-4 sm:space-y-6">
            {/* Status Pesanan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6"
            >
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                Status Pesanan
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-slate-700">Tertunda</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{Number(stats.pesananTertunda) || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-slate-700">Produksi</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{Number(stats.pesananDalamProduksi) || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-600" />
                    <span className="text-sm text-slate-700">Dikirim</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">0</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Selesai</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{Number(stats.pesananSelesai) || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/percetakan/pesanan/baru")}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Kelola Pesanan Baru
                  </h4>
                  <p className="text-xs text-slate-600">Konfirmasi pesanan</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/percetakan/tarif")}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Kelola Tarif
                  </h4>
                  <p className="text-xs text-slate-600">Atur harga cetak</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/percetakan/keuangan/saldo")}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Saldo & Penarikan
                  </h4>
                  <p className="text-xs text-slate-600">Lihat penghasilan</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
