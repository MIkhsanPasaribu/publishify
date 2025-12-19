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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/percetakan">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pengiriman Pesanan</h1>
            <p className="text-gray-600 mt-1">
              Kelola pengiriman dan tracking pesanan
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Siap Kirim</p>
                <p className="text-2xl font-bold text-gray-900">{stats.siap}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Truck className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dalam Pengiriman</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dikirim}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terkirim</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.terkirim}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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
        </CardContent>
      </Card>

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
  );
}
