"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { ambilDaftarPesananPenulis } from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import { toast } from "sonner";

const STATUS_CONFIG = {
  tertunda: {
    label: "Menunggu Pembayaran",
    icon: Clock,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500",
  },
  dalam_produksi: {
    label: "Dalam Produksi",
    icon: Package,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  dikirim: {
    label: "Sedang Dikirim",
    icon: Truck,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  dibatalkan: {
    label: "Dibatalkan",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
};

function formatTanggal(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function RiwayatPesananCetakPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [pesananList, setPesananList] = useState<PesananCetak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data pesanan penulis
  useEffect(() => {
    async function fetchPesanan() {
      try {
        setIsLoading(true);
        const response = await ambilDaftarPesananPenulis();
        
        if (response.sukses && response.data) {
          setPesananList(response.data);
        }
      } catch (error: any) {
        console.error("Error fetching pesanan:", error);
        toast.error(error.response?.data?.pesan || "Gagal memuat data pesanan");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPesanan();
  }, []);

  // Filter data dan sort by latest
  const filteredPesanan = pesananList
    .filter((pesanan) => {
      const matchSearch =
        pesanan.nomorPesanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pesanan.naskah?.judul?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "semua" || pesanan.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      // Sort by creation date, newest first
      const dateA = new Date(a.tanggalPesan || a.diperbaruiPada || 0).getTime();
      const dateB = new Date(b.tanggalPesan || b.diperbaruiPada || 0).getTime();
      return dateB - dateA;
    });

  // Statistik
  const stats = {
    total: pesananList.length,
    tertunda: pesananList.filter((p) => p.status === "tertunda").length,
    diproses: pesananList.filter((p) => p.status === "dalam_produksi").length,
    dikirim: pesananList.filter((p) => p.status === "dikirim").length,
    selesai: pesananList.filter((p) => p.status === "terkirim").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0d7377] mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2"
              >
                Riwayat Pesanan Cetak
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-base text-teal-50"
              >
                Pantau status pesanan cetak buku Anda secara real-time
              </motion.p>
            </div>
            <div className="hidden lg:block ml-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="flex justify-end mb-6 sm:mb-8">
          <Link href="/penulis/buku-terbit">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              Pesan Cetak Baru
            </motion.button>
          </Link>
        </div>

        {/* Statistik Cards - Dashboard Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: "Total Pesanan", sublabel: "Semua pesanan", value: stats.total, icon: Package, bgColor: "bg-slate-500" },
              { label: "Tertunda", sublabel: "Menunggu bayar", value: stats.tertunda, icon: Clock, bgColor: "bg-amber-500" },
              { label: "Diproses", sublabel: "Dalam produksi", value: stats.diproses, icon: Package, bgColor: "bg-blue-500" },
              { label: "Dikirim", sublabel: "Dalam perjalanan", value: stats.dikirim, icon: Truck, bgColor: "bg-purple-500" },
              { label: "Selesai", sublabel: "Berhasil terkirim", value: stats.selesai, icon: CheckCircle2, bgColor: "bg-green-500" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:border-teal-200 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
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

        {/* Filter & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-slate-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  <Input
                    placeholder="Cari nomor pesanan atau judul buku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-64 py-2.5 sm:py-3 text-sm sm:text-base border-slate-200 rounded-xl">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="tertunda">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="dalam_produksi">Dalam Produksi</SelectItem>
                    <SelectItem value="dikirim">Sedang Dikirim</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daftar Pesanan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {filteredPesanan.length === 0 ? (
            <Card className="border-2 border-slate-200">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Tidak ada pesanan ditemukan
                  </h3>
                  <p className="text-sm text-slate-600">
                    Coba ubah filter atau kata kunci pencarian Anda
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPesanan.map((pesanan, index) => {
              const statusConfig = STATUS_CONFIG[pesanan.status as keyof typeof STATUS_CONFIG] || {
                label: pesanan.status || "Tidak Diketahui",
                icon: Package,
                color: "bg-gray-100 text-gray-800 border-gray-200",
                dotColor: "bg-gray-500",
              };
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={pesanan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="border-2 border-slate-200 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 bg-white">
                    <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Cover Buku */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-32 sm:w-28 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-md hover:shadow-lg transition-shadow ring-2 ring-slate-200 hover:ring-teal-300">
                          {pesanan.naskah?.urlSampul ? (
                            <img
                              src={pesanan.naskah.urlSampul}
                              alt={pesanan.naskah.judul}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info Pesanan */}
                      <div className="flex-1 space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 hover:text-teal-600 transition-colors">
                              {pesanan.naskah?.judul || "Judul Tidak Tersedia"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                              {pesanan.nomorPesanan || "-"}
                            </p>
                          </div>
                          <Badge
                            className={`${statusConfig.color} border-2 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 w-fit text-xs sm:text-sm font-semibold shadow-sm`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                            <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100">
                            <p className="text-xs text-slate-600 mb-1">Jumlah</p>
                            <p className="font-bold text-slate-900 text-base sm:text-lg">
                              {pesanan.jumlah || 0} <span className="text-xs sm:text-sm font-normal">eks</span>
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100">
                            <p className="text-xs text-slate-600 mb-1">Format</p>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {pesanan.formatKertas || "-"}
                            </p>
                            <p className="text-xs text-slate-500">{pesanan.jenisKertas || "-"}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100">
                            <p className="text-xs text-slate-600 mb-1">Cover</p>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {pesanan.jenisCover === "SOFTCOVER" ? "Soft Cover" : pesanan.jenisCover === "HARDCOVER" ? "Hard Cover" : "-"}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg p-2.5 sm:p-3 text-white shadow-md shadow-teal-500/20">
                            <p className="text-xs opacity-90 mb-1">Total Biaya</p>
                            <p className="font-bold text-base sm:text-lg flex items-center gap-1">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                              {formatRupiah(Number(pesanan.hargaTotal) || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t-2 border-slate-100">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Dipesan:</span>
                              <span>{pesanan.tanggalPesan ? formatTanggal(pesanan.tanggalPesan) : "-"}</span>
                            </div>
                            {pesanan.estimasiSelesai && (
                              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Estimasi:</span>
                                <span>{formatTanggal(pesanan.estimasiSelesai)}</span>
                              </div>
                            )}
                          </div>

                          {pesanan.pengiriman?.nomorResi && (
                            <div className="flex items-center gap-2 text-sm bg-purple-50 border-2 border-purple-200 px-4 py-2 rounded-lg">
                              <Truck className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-700 font-semibold">
                                {pesanan.pengiriman.namaEkspedisi}:
                              </span>
                              <span className="font-mono font-bold text-purple-900">
                                {pesanan.pengiriman.nomorResi}
                              </span>
                            </div>
                          )}

                          <Link href={`/penulis/pesanan-cetak/${pesanan.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white rounded-xl font-semibold transition-all text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              Lihat Detail
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Pagination */}
        {filteredPesanan.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-2 mt-6"
          >
            <Button variant="outline" disabled className="rounded-xl border-slate-200">
              Previous
            </Button>
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl">
              1
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200">2</Button>
            <Button variant="outline" className="rounded-xl border-slate-200">3</Button>
            <Button variant="outline" className="rounded-xl border-slate-200">Next</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
