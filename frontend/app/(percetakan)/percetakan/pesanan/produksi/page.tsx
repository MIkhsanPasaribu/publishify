"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Package,
  Loader2,
  Search,
  ArrowLeft,
  CheckCircle2,
  Printer,
  AlertCircle,
  Clock,
  Play,
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
import Link from "next/link";
import { ambilPesananPercetakan } from "@/lib/api/percetakan";
import { UpdateStatusDialog } from "@/components/percetakan/update-status-dialog";
import type { PesananCetak } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

export default function DalamProduksiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState<PesananCetak | null>(
    null
  );
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);

  // Fetch pesanan dalam produksi + pesanan baru yang perlu diproses
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pesanan-produksi"],
    queryFn: () => ambilPesananPercetakan("produksi"),
    refetchInterval: 30000, // Refetch setiap 30 detik
  });

  const pesananList = data?.data || [];

  // Filter berdasarkan search dan sort by tanggal terbaru
  const filteredPesanan = pesananList
    .filter((pesanan: PesananCetak) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        pesanan.nomorPesanan?.toLowerCase().includes(searchLower) ||
        pesanan.naskah?.judul?.toLowerCase().includes(searchLower) ||
        pesanan.pemesan?.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a: PesananCetak, b: PesananCetak) => {
      // Sort by tanggalPesan (terbaru di atas)
      const dateA = new Date(a.tanggalPesan || a.diperbaruiPada || 0).getTime();
      const dateB = new Date(b.tanggalPesan || b.diperbaruiPada || 0).getTime();
      return dateB - dateA;
    });

  // Stats
  const stats = {
    total: pesananList.length,
    diterima: pesananList.filter(
      (p: PesananCetak) => p.status === "diterima"
    ).length,
    dalamProduksi: pesananList.filter(
      (p: PesananCetak) => p.status === "dalam_produksi"
    ).length,
    kontrolKualitas: pesananList.filter(
      (p: PesananCetak) => p.status === "kontrol_kualitas"
    ).length,
    siap: pesananList.filter((p: PesananCetak) => p.status === "siap").length,
  };

  const handleUpdateStatusClick = (pesanan: PesananCetak) => {
    setSelectedPesanan(pesanan);
    setShowUpdateStatusDialog(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                Pesanan Dalam Produksi
              </h1>
              <p className="text-sm text-teal-50">
                Kelola dan update status produksi pesanan
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-700">Total Pesanan</div>
              <div className="text-xs text-slate-500">Semua status</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.diterima}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-700">Pesanan Baru</div>
              <div className="text-xs text-slate-500">Perlu diproses</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.dalamProduksi}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-700">Dalam Produksi</div>
              <div className="text-xs text-slate-500">Dikerjakan</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.kontrolKualitas}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-700">Kontrol Kualitas</div>
              <div className="text-xs text-slate-500">QC</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.siap}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-700">Siap Kirim</div>
              <div className="text-xs text-slate-500">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nomor pesanan, judul, atau pemesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-200"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan ({filteredPesanan.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Pesanan</TableHead>
                <TableHead>Judul Naskah</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Spesifikasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPesanan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Tidak ada pesanan</p>
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
                      {pesanan.pemesan?.profilPengguna?.namaTampilan ||
                        pesanan.pemesan?.email ||
                        "-"}
                    </TableCell>
                    <TableCell>{pesanan.jumlah} eks</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        <div>
                          {pesanan.formatKertas} •{" "}
                          {pesanan.jenisKertas}
                        </div>
                        <div>{pesanan.jenisCover}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          pesanan.status === "diterima"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : pesanan.status === "dalam_produksi"
                            ? "bg-purple-100 text-purple-800"
                            : pesanan.status === "kontrol_kualitas"
                              ? "bg-indigo-100 text-indigo-800"
                              : pesanan.status === "siap"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {pesanan.status === "diterima"
                          ? "Pesanan Baru"
                          : pesanan.status === "dalam_produksi"
                          ? "Dalam Produksi"
                          : pesanan.status === "kontrol_kualitas"
                            ? "Kontrol Kualitas"
                            : pesanan.status === "siap"
                            ? "Siap Kirim"
                            : pesanan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {pesanan.tanggalPesan || pesanan.diperbaruiPada
                            ? format(
                                new Date(pesanan.tanggalPesan || pesanan.diperbaruiPada),
                                "dd MMM yyyy",
                                { locale: id }
                              )
                            : "-"}
                        </div>
                        {pesanan.estimasiSelesai && (
                          <div className="text-xs text-gray-500">
                            Est: {format(
                              new Date(pesanan.estimasiSelesai),
                              "dd MMM",
                              { locale: id }
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatusClick(pesanan)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      {selectedPesanan && (
        <UpdateStatusDialog
          pesananId={selectedPesanan.id}
          nomorPesanan={selectedPesanan.nomorPesanan}
          statusSaatIni={selectedPesanan.status}
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          onSuccess={handleRefresh}
        />
      )}
      </div>
    </div>
  );
}
