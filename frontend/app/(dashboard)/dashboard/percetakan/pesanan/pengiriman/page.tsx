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
  Truck,
  CheckCircle2,
  MapPin,
  Calendar,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import {
  ambilPesananPercetakan,
  perbaruiStatusPesanan,
} from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import { formatRupiah } from "@/lib/utils";

export default function PengirimanPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState<PesananCetak | null>(
    null
  );
  const [kirimDialogOpen, setKirimDialogOpen] = useState(false);
  const [nomorResi, setNomorResi] = useState("");
  const [catatanPengiriman, setCatatanPengiriman] = useState("");

  // Fetch pesanan untuk pengiriman
  const { data, isLoading } = useQuery({
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

  // Mutation untuk kirim pesanan
  const kirimPesananMutation = useMutation({
    mutationFn: async ({
      idPesanan,
      nomorResi,
      catatan,
    }: {
      idPesanan: string;
      nomorResi: string;
      catatan: string;
    }) => {
      // Update status ke dikirim dengan catatan resi
      return perbaruiStatusPesanan(idPesanan, {
        status: "dikirim",
        catatan: `Resi: ${nomorResi}. ${catatan}`,
      });
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil dikirim");
      queryClient.invalidateQueries({ queryKey: ["pesanan-pengiriman"] });
      queryClient.invalidateQueries({ queryKey: ["stats-percetakan"] });
      setKirimDialogOpen(false);
      setSelectedPesanan(null);
      setNomorResi("");
      setCatatanPengiriman("");
    },
    onError: () => {
      toast.error("Gagal mengirim pesanan");
    },
  });

  // Mutation untuk konfirmasi terkirim
  const konfirmasiTerkirimMutation = useMutation({
    mutationFn: (idPesanan: string) =>
      perbaruiStatusPesanan(idPesanan, {
        status: "terkirim",
      }),
    onSuccess: () => {
      toast.success("Pesanan dikonfirmasi terkirim");
      queryClient.invalidateQueries({ queryKey: ["pesanan-pengiriman"] });
      queryClient.invalidateQueries({ queryKey: ["stats-percetakan"] });
    },
    onError: () => {
      toast.error("Gagal konfirmasi pengiriman");
    },
  });

  const handleKirimPesanan = () => {
    if (!selectedPesanan || !nomorResi.trim()) {
      toast.error("Nomor resi wajib diisi");
      return;
    }
    kirimPesananMutation.mutate({
      idPesanan: selectedPesanan.id,
      nomorResi: nomorResi.trim(),
      catatan: catatanPengiriman.trim(),
    });
  };

  const openKirimDialog = (pesanan: PesananCetak) => {
    setSelectedPesanan(pesanan);
    setNomorResi(pesanan.pengiriman?.nomorResi || "");
    setCatatanPengiriman("");
    setKirimDialogOpen(true);
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
                      {pesanan.status === "siap" ? (
                        <Button
                          size="sm"
                          onClick={() => openKirimDialog(pesanan)}
                          disabled={kirimPesananMutation.isPending}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Kirim
                        </Button>
                      ) : pesanan.status === "dikirim" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            konfirmasiTerkirimMutation.mutate(pesanan.id)
                          }
                          disabled={konfirmasiTerkirimMutation.isPending}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Konfirmasi Terkirim
                        </Button>
                      ) : (
                        <Badge variant="secondary">Selesai</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kirim Pesanan Dialog */}
      <Dialog open={kirimDialogOpen} onOpenChange={setKirimDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kirim Pesanan</DialogTitle>
            <DialogDescription>
              Input nomor resi dan detail pengiriman untuk pesanan{" "}
              {selectedPesanan?.nomorPesanan}
            </DialogDescription>
          </DialogHeader>

          {selectedPesanan && (
            <div className="space-y-4">
              {/* Info Pesanan */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Judul:</span>
                  <span className="font-medium">
                    {selectedPesanan.naskah?.judul || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah:</span>
                  <span className="font-medium">
                    {selectedPesanan.jumlah} eksemplar
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pemesan:</span>
                  <span className="font-medium">
                    {selectedPesanan.pemesan?.profilPengguna?.namaTampilan ||
                      selectedPesanan.pemesan?.email}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-600">Alamat Pengiriman:</span>
                  <span className="font-medium">
                    {selectedPesanan.pengiriman?.alamatTujuan || "-"}
                  </span>
                </div>
              </div>

              {/* Form Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomorResi">
                    Nomor Resi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomorResi"
                    placeholder="Contoh: JNE123456789"
                    value={nomorResi}
                    onChange={(e) => setNomorResi(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catatan">Catatan Pengiriman (Opsional)</Label>
                  <Textarea
                    id="catatan"
                    placeholder="Tambahkan catatan pengiriman jika diperlukan..."
                    value={catatanPengiriman}
                    onChange={(e) => setCatatanPengiriman(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setKirimDialogOpen(false)}
              disabled={kirimPesananMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleKirimPesanan}
              disabled={kirimPesananMutation.isPending}
            >
              {kirimPesananMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kirim Pesanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
