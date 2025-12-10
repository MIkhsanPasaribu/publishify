"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogFooter,
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
import { toast } from "sonner";
import Link from "next/link";
import {
  ambilPesananPercetakan,
  perbaruiStatusPesanan,
} from "@/lib/api/percetakan";
import type { PesananCetak, StatusPesanan } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

export default function DalamProduksiPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState<PesananCetak | null>(
    null
  );
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusBaru, setStatusBaru] = useState<StatusPesanan>("dalam_produksi");

  // Fetch pesanan dalam produksi
  const { data, isLoading } = useQuery({
    queryKey: ["pesanan-produksi"],
    queryFn: () => ambilPesananPercetakan("produksi"),
    refetchInterval: 30000, // Refetch setiap 30 detik
  });

  const pesananList = data?.data || [];

  // Filter berdasarkan search
  const filteredPesanan = pesananList.filter((pesanan: PesananCetak) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pesanan.nomorPesanan?.toLowerCase().includes(searchLower) ||
      pesanan.judulSnapshot?.toLowerCase().includes(searchLower) ||
      pesanan.pemesan?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    total: pesananList.length,
    dalamProduksi: pesananList.filter(
      (p: PesananCetak) => p.status === "dalam_produksi"
    ).length,
    kontrolKualitas: pesananList.filter(
      (p: PesananCetak) => p.status === "kontrol_kualitas"
    ).length,
    siap: pesananList.filter((p: PesananCetak) => p.status === "siap").length,
  };

  // Mutation untuk update status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      idPesanan,
      status,
    }: {
      idPesanan: string;
      status: StatusPesanan;
    }) => perbaruiStatusPesanan(idPesanan, { status }),
    onSuccess: () => {
      toast.success("Status pesanan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["pesanan-produksi"] });
      queryClient.invalidateQueries({ queryKey: ["stats-percetakan"] });
      setUpdateDialogOpen(false);
      setSelectedPesanan(null);
    },
    onError: () => {
      toast.error("Gagal memperbarui status pesanan");
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedPesanan) return;
    updateStatusMutation.mutate({
      idPesanan: selectedPesanan.id,
      status: statusBaru,
    });
  };

  const openUpdateDialog = (pesanan: PesananCetak) => {
    setSelectedPesanan(pesanan);
    setStatusBaru(pesanan.status);
    setUpdateDialogOpen(true);
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
          <Link href="/dashboard/percetakan">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pesanan Dalam Produksi
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola dan update status produksi pesanan
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Printer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dalam Produksi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dalamProduksi}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kontrol Kualitas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.kontrolKualitas}
                </p>
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
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nomor pesanan, judul, atau pemesan..."
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
                <TableHead>Jumlah</TableHead>
                <TableHead>Spesifikasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
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
                      {pesanan.judulSnapshot || pesanan.naskah?.judul || "-"}
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
                          {pesanan.formatSnapshot || pesanan.formatBuku} •{" "}
                          {pesanan.jenisKertas}
                        </div>
                        <div>{pesanan.jenisCover}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          pesanan.status === "dalam_produksi"
                            ? "bg-purple-100 text-purple-800"
                            : pesanan.status === "kontrol_kualitas"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {pesanan.status === "dalam_produksi"
                          ? "Dalam Produksi"
                          : pesanan.status === "kontrol_kualitas"
                            ? "Kontrol Kualitas"
                            : "Siap Kirim"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pesanan.tanggalDiterima
                        ? format(
                            new Date(pesanan.tanggalDiterima),
                            "dd MMM yyyy",
                            { locale: id }
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openUpdateDialog(pesanan)}
                        disabled={updateStatusMutation.isPending}
                      >
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
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Pesanan</DialogTitle>
            <DialogDescription>
              Perbarui status produksi untuk pesanan{" "}
              {selectedPesanan?.nomorPesanan}
            </DialogDescription>
          </DialogHeader>

          {selectedPesanan && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Judul:</span>
                  <span className="font-medium">
                    {selectedPesanan.judulSnapshot ||
                      selectedPesanan.naskah?.judul}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah:</span>
                  <span className="font-medium">
                    {selectedPesanan.jumlah} eksemplar
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status Saat Ini:</span>
                  <Badge>
                    {selectedPesanan.status === "dalam_produksi"
                      ? "Dalam Produksi"
                      : selectedPesanan.status === "kontrol_kualitas"
                        ? "Kontrol Kualitas"
                        : "Siap Kirim"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Baru</label>
                <Select
                  value={statusBaru}
                  onValueChange={(value) => setStatusBaru(value as StatusPesanan)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dalam_produksi">
                      Dalam Produksi
                    </SelectItem>
                    <SelectItem value="kontrol_kualitas">
                      Kontrol Kualitas
                    </SelectItem>
                    <SelectItem value="siap">Siap Kirim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
