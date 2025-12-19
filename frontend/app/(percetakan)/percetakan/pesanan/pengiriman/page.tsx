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
  Truck,
  CheckCircle2,
  MapPin,
  Calendar,
  Play,
  Send,
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
import { BuatPengirimanDialog } from "@/components/percetakan/buat-pengiriman-dialog";
import { UpdateStatusDialog } from "@/components/percetakan/update-status-dialog";
import type { PesananCetak } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

export default function PengirimanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState<PesananCetak | null>(
    null
  );
  const [showBuatPengirimanDialog, setShowBuatPengirimanDialog] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);

  // Fetch pesanan untuk pengiriman
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pesanan-pengiriman"],
    queryFn: () => ambilPesananPercetakan("pengiriman"),
    refetchInterval: 30000, // Refetch setiap 30 detik
  });

  const pesananList = data?.data || [];

  // Filter berdasarkan search
  const filteredPesanan = pesananList.filter((pesanan: PesananCetak) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pesanan.nomorPesanan?.toLowerCase().includes(searchLower) ||
      pesanan.naskah?.judul?.toLowerCase().includes(searchLower) ||
      pesanan.pemesan?.email?.toLowerCase().includes(searchLower) ||
      pesanan.pengiriman?.nomorResi?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    total: pesananList.length,
    siap: pesananList.filter((p: PesananCetak) => p.status === "siap").length,
    dikirim: pesananList.filter((p: PesananCetak) => p.status === "dikirim")
      .length,
    terkirim: pesananList.filter((p: PesananCetak) => p.status === "terkirim")
      .length,
  };

  const handleBuatPengiriman = (pesanan: PesananCetak) => {
    setSelectedPesanan(pesanan);
    setShowBuatPengirimanDialog(true);
  };

  const handleUpdateStatus = (pesanan: PesananCetak) => {
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
                Pengiriman Pesanan
              </h1>
              <p className="text-sm text-teal-50">
                Kelola pengiriman dan tracking pesanan
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.dikirim}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Dalam Pengiriman</div>
                <div className="text-xs text-slate-500">On delivery</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-slate-900">{stats.terkirim}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Terkirim</div>
                <div className="text-xs text-slate-500">Delivered</div>
              </div>
            </div>
          </div>
        </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari nomor pesanan, resi, judul, atau pemesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-300 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Daftar Pesanan ({filteredPesanan.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Pesanan</TableHead>
                <TableHead>Judul Naskah</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Alamat Pengiriman</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nomor Resi</TableHead>
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
                      <div className="text-sm">
                        <div className="font-medium">
                          {pesanan.pemesan?.profilPengguna?.namaTampilan ||
                            pesanan.pemesan?.email ||
                            "-"}
                        </div>
                        <div className="text-gray-500">
                          {pesanan.pemesan?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-xs">
                        {pesanan.pengiriman?.alamatTujuan || "-"}
                      </div>
                    </TableCell>
                    <TableCell>{pesanan.jumlah} eks</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          pesanan.status === "siap"
                            ? "bg-green-100 text-green-800"
                            : pesanan.status === "dikirim"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {pesanan.status === "siap"
                          ? "Siap Kirim"
                          : pesanan.status === "dikirim"
                            ? "Dikirim"
                            : "Terkirim"}
                      </Badge>
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
                      <div className="flex gap-2">
                        {pesanan.status === "siap" && (
                          <Button
                            size="sm"
                            onClick={() => handleBuatPengiriman(pesanan)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Buat Pengiriman
                          </Button>
                        )}
                        {pesanan.status === "dikirim" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateStatus(pesanan)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Konfirmasi Terkirim
                          </Button>
                        )}
                        {pesanan.status === "terkirim" && (
                          <Badge variant="secondary">Selesai</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Buat Pengiriman Dialog */}
      {selectedPesanan && (
        <BuatPengirimanDialog
          pesananId={selectedPesanan.id}
          nomorPesanan={selectedPesanan.nomorPesanan}
          defaultAlamat={selectedPesanan.pengiriman?.alamatTujuan}
          defaultNama={selectedPesanan.pemesan?.profilPengguna?.namaTampilan || selectedPesanan.pemesan?.email || ""}
          defaultTelepon={selectedPesanan.pemesan?.telepon || undefined}
          open={showBuatPengirimanDialog}
          onOpenChange={setShowBuatPengirimanDialog}
          onSuccess={handleRefresh}
        />
      )}

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
