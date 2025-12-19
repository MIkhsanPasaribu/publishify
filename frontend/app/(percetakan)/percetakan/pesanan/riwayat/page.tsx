"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import {
  Package,
  Loader2,
  Search,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ambilPesananPercetakan } from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

export default function RiwayatPesananPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState<PesananCetak | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filterPeriode, setFilterPeriode] = useState<string>("semua");

  // Fetch pesanan selesai
  const { data, isLoading } = useQuery({
    queryKey: ["pesanan-riwayat"],
    queryFn: () => ambilPesananPercetakan("selesai"),
  });

  const pesananList = data?.data || [];

  // Filter berdasarkan periode
  const getFilteredByPeriode = () => {
    if (filterPeriode === "semua") return pesananList;

    const now = new Date();
    let startDate: Date;

    switch (filterPeriode) {
      case "bulan-ini":
        startDate = startOfMonth(now);
        break;
      case "bulan-lalu":
        startDate = startOfMonth(subMonths(now, 1));
        break;
      case "3-bulan":
        startDate = subMonths(now, 3);
        break;
      case "6-bulan":
        startDate = subMonths(now, 6);
        break;
      default:
        return pesananList;
    }

    return pesananList.filter((p: PesananCetak) => {
      const tanggal = p.tanggalSelesai || p.diperbaruiPada || p.tanggalPesan;
      return new Date(tanggal) >= startDate;
    });
  };

  const filteredByPeriode = getFilteredByPeriode();

  // Filter berdasarkan search
  const filteredPesanan = filteredByPeriode.filter((pesanan: PesananCetak) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pesanan.nomorPesanan?.toLowerCase().includes(searchLower) ||
      pesanan.naskah?.judul?.toLowerCase().includes(searchLower) ||
      pesanan.pemesan?.email?.toLowerCase().includes(searchLower) ||
      pesanan.pengiriman?.nomorResi?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const totalRevenue = filteredPesanan.reduce(
    (sum: number, p: PesananCetak) => sum + parseFloat(p.hargaTotal?.toString() || "0"),
    0
  );

  const stats = {
    total: filteredPesanan.length,
    totalRevenue,
    rataRataHarga: filteredPesanan.length > 0 ? totalRevenue / filteredPesanan.length : 0,
  };

  const openDetailDialog = (pesanan: PesananCetak) => {
    setSelectedPesanan(pesanan);
    setDetailDialogOpen(true);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert("Fitur export PDF akan segera hadir");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Gradient Header Panel */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📜</span>
                Riwayat Pesanan
              </h1>
              <p className="text-sm text-teal-50">
                Lihat semua pesanan yang telah selesai
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleExportPDF} variant="ghost" className="bg-white/20 hover:bg-white/30 text-white">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl items-center justify-center hidden sm:flex">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRupiah(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata Harga</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRupiah(stats.rataRataHarga)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nomor pesanan, resi, judul, atau pemesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-48">
          <Select value={filterPeriode} onValueChange={setFilterPeriode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Periode</SelectItem>
              <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
              <SelectItem value="bulan-lalu">Bulan Lalu</SelectItem>
              <SelectItem value="3-bulan">3 Bulan Terakhir</SelectItem>
              <SelectItem value="6-bulan">6 Bulan Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Riwayat ({filteredPesanan.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Pesanan</TableHead>
                <TableHead>Judul Naskah</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead>Nomor Resi</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPesanan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Tidak ada riwayat pesanan</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPesanan.map((pesanan: PesananCetak) => (
                  <TableRow key={pesanan.id}>
                    <TableCell className="font-mono text-sm">
                      {pesanan.nomorPesanan}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pesanan.naskah?.judul || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {pesanan.pemesan?.profilPengguna?.namaTampilan ||
                            pesanan.pemesan?.email ||
                            "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{pesanan.jumlah} eks</TableCell>
                    <TableCell className="font-semibold">
                      {formatRupiah(parseFloat(pesanan.hargaTotal?.toString() || "0"))}
                    </TableCell>
                    <TableCell>
                      {pesanan.pengiriman?.nomorResi ? (
                        <span className="font-mono text-sm">
                          {pesanan.pengiriman.nomorResi}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pesanan.tanggalSelesai
                        ? format(
                            new Date(pesanan.tanggalSelesai),
                            "dd MMM yyyy",
                            { locale: id }
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailDialog(pesanan)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              Informasi lengkap pesanan {selectedPesanan?.nomorPesanan}
            </DialogDescription>
          </DialogHeader>

          {selectedPesanan && (
            <div className="space-y-4">
              {/* Info Naskah */}
              <div>
                <h3 className="font-semibold mb-2">Informasi Naskah</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Judul:</span>
                    <span className="font-medium">
                      {selectedPesanan.naskah?.judul || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">
                      {selectedPesanan.formatKertas}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jumlah Halaman:</span>
                    <span className="font-medium">
                      {selectedPesanan.naskah?.jumlahHalaman || "-"} halaman
                    </span>
                  </div>
                </div>
              </div>

              {/* Spesifikasi */}
              <div>
                <h3 className="font-semibold mb-2">Spesifikasi Cetak</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Kertas:</span>
                    <span className="font-medium">{selectedPesanan.jenisKertas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Cover:</span>
                    <span className="font-medium">{selectedPesanan.jenisCover}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jumlah Cetak:</span>
                    <span className="font-medium">
                      {selectedPesanan.jumlah} eksemplar
                    </span>
                  </div>
                </div>
              </div>

              {/* Pengiriman */}
              <div>
                <h3 className="font-semibold mb-2">Informasi Pengiriman</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nomor Resi:</span>
                    <span className="font-mono font-medium">
                      {selectedPesanan.pengiriman?.nomorResi || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">Alamat:</span>
                    <span className="font-medium">
                      {selectedPesanan.pengiriman?.alamatTujuan || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Selesai:</span>
                    <span className="font-medium">
                      {selectedPesanan.tanggalSelesai
                        ? format(
                            new Date(selectedPesanan.tanggalSelesai),
                            "dd MMM yyyy",
                            { locale: id }
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Harga */}
              <div>
                <h3 className="font-semibold mb-2">Rincian Harga</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Harga:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatRupiah(
                        parseFloat(selectedPesanan.hargaTotal?.toString() || "0")
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status Pembayaran:</span>
                    <Badge className="bg-green-100 text-green-800">Lunas</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
