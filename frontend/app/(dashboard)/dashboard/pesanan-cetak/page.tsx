"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      const dateA = new Date(a.dibuatPada || 0).getTime();
      const dateB = new Date(b.dibuatPada || 0).getTime();
      return dateB - dateA;
    });

  // Statistik
  const stats = {
    total: pesananList.length,
    tertunda: pesananList.filter((p) => p.status === "tertunda").length,
    diproses: pesananList.filter((p) => p.status === "dalam_produksi").length,
    dikirim: pesananList.filter((p) => p.status === "dikirim").length,
    selesai: pesananList.filter((p) => p.status === "selesai").length,
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0d7377] to-[#0a5c5f] bg-clip-text text-transparent">
              Riwayat Pesanan Cetak
            </h1>
            <p className="text-gray-600 mt-2">
              Pantau status pesanan cetak buku Anda secara real-time
            </p>
          </div>
          <Link href="/dashboard/buku-terbit">
            <Button className="bg-gradient-to-r from-[#0d7377] to-[#0a5c5f] hover:from-[#0a5c5f] hover:to-[#084a4c] text-white shadow-lg">
              <Package className="mr-2 h-4 w-4" />
              Pesan Cetak Baru
            </Button>
          </Link>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-2 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-amber-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Tertunda</p>
                  <p className="text-3xl font-bold text-amber-800 mt-1">{stats.tertunda}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Diproses</p>
                  <p className="text-3xl font-bold text-blue-800 mt-1">{stats.diproses}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Dikirim</p>
                  <p className="text-3xl font-bold text-purple-800 mt-1">{stats.dikirim}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Selesai</p>
                  <p className="text-3xl font-bold text-green-800 mt-1">{stats.selesai}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
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
                  placeholder="Cari nomor pesanan atau judul buku..."
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

        {/* Daftar Pesanan */}
        <div className="space-y-4">
          {filteredPesanan.length === 0 ? (
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="mx-auto h-20 w-20 text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Tidak ada pesanan ditemukan
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Coba ubah filter atau kata kunci pencarian Anda
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPesanan.map((pesanan) => {
              const statusConfig = STATUS_CONFIG[pesanan.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={pesanan.id}
                  className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#0d7377] group"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Cover Buku */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-44 rounded-lg overflow-hidden bg-gray-100 shadow-lg group-hover:shadow-xl transition-shadow ring-2 ring-gray-200 group-hover:ring-[#0d7377]">
                          {pesanan.naskah?.urlSampul ? (
                            <img
                              src={pesanan.naskah.urlSampul}
                              alt={pesanan.naskah.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info Pesanan */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0d7377] transition-colors">
                              {pesanan.naskah?.judul || "Judul Tidak Tersedia"}
                            </h3>
                            <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-full w-fit">
                              {pesanan.nomorPesanan || "-"}
                            </p>
                          </div>
                          <Badge
                            className={`${statusConfig.color} border-2 px-4 py-2 flex items-center gap-2 w-fit text-sm font-semibold shadow-sm`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                            <StatusIcon className="h-4 w-4" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Jumlah</p>
                            <p className="font-bold text-gray-900 text-lg">
                              {pesanan.jumlah || 0} <span className="text-sm font-normal">eks</span>
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Format</p>
                            <p className="font-semibold text-gray-900 text-sm">
                              {pesanan.formatKertas || "-"}
                            </p>
                            <p className="text-xs text-gray-600">{pesanan.jenisKertas || "-"}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Cover</p>
                            <p className="font-semibold text-gray-900 text-sm">
                              {pesanan.jenisCover === "SOFTCOVER" ? "Soft Cover" : pesanan.jenisCover === "HARDCOVER" ? "Hard Cover" : "-"}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-[#0d7377] to-[#0a5c5f] rounded-lg p-3 text-white">
                            <p className="text-xs opacity-90 mb-1">Total Biaya</p>
                            <p className="font-bold text-lg flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatRupiah(Number(pesanan.hargaTotal) || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t-2 border-gray-100">
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Dipesan:</span>
                              <span>{pesanan.dibuatPada ? formatTanggal(pesanan.dibuatPada) : "-"}</span>
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

                          <Link href={`/dashboard/pesanan-cetak/${pesanan.id}`}>
                            <Button
                              variant="outline"
                              className="border-2 border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white font-semibold transition-all duration-300"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination Dummy */}
        {filteredPesanan.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" className="bg-[#0d7377] text-white border-[#0d7377]">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
