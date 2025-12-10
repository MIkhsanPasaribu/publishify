"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  ambilSemuaTarif,
  buatTarif,
  perbaruiTarif,
  hapusTarif,
} from "@/lib/api/percetakan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import type { TarifPercetakan } from "@/types/percetakan";

export default function KelolaTarifPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarif, setEditingTarif] = useState<TarifPercetakan | null>(
    null
  );
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    formatBuku: "A5",
    jenisKertas: "BOOKPAPER",
    jenisCover: "SOFTCOVER",
    hargaPerHalaman: "",
    biayaJilid: "",
    minimumPesanan: "1",
    aktif: true,
  });

  // Fetch tarif
  const { data, isLoading } = useQuery({
    queryKey: ["tarif-percetakan"],
    queryFn: () => ambilSemuaTarif(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: buatTarif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarif-percetakan"] });
      toast.success("Tarif berhasil ditambahkan");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal menambahkan tarif");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      perbaruiTarif(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarif-percetakan"] });
      toast.success("Tarif berhasil diperbarui");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal memperbarui tarif");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: hapusTarif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarif-percetakan"] });
      toast.success("Tarif berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal menghapus tarif");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      hargaPerHalaman: parseFloat(formData.hargaPerHalaman),
      biayaJilid: parseFloat(formData.biayaJilid),
      minimumPesanan: parseInt(formData.minimumPesanan),
    };

    if (editingTarif) {
      updateMutation.mutate({ id: editingTarif.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (tarif: TarifPercetakan) => {
    setEditingTarif(tarif);
    setFormData({
      formatBuku: tarif.formatBuku,
      jenisKertas: tarif.jenisKertas,
      jenisCover: tarif.jenisCover,
      hargaPerHalaman: tarif.hargaPerHalaman.toString(),
      biayaJilid: tarif.biayaJilid.toString(),
      minimumPesanan: tarif.minimumPesanan.toString(),
      aktif: tarif.aktif,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus tarif ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTarif(null);
    setFormData({
      formatBuku: "A5",
      jenisKertas: "BOOKPAPER",
      jenisCover: "SOFTCOVER",
      hargaPerHalaman: "",
      biayaJilid: "",
      minimumPesanan: "1",
      aktif: true,
    });
  };

  const tarifs = data?.data || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Tarif</h1>
          <p className="text-gray-600 mt-1">
            Atur harga cetak untuk berbagai kombinasi format dan bahan
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Tarif
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTarif ? "Edit Tarif" : "Tambah Tarif Baru"}
              </DialogTitle>
              <DialogDescription>
                Masukkan detail tarif untuk kombinasi format, kertas, dan cover
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Format Buku */}
              <div className="space-y-2">
                <Label htmlFor="formatBuku">Format Buku</Label>
                <Select
                  value={formData.formatBuku}
                  onValueChange={(value) =>
                    setFormData({ ...formData, formatBuku: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (21 x 29.7 cm)</SelectItem>
                    <SelectItem value="A5">A5 (14.8 x 21 cm)</SelectItem>
                    <SelectItem value="B5">B5 (17.6 x 25 cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jenis Kertas */}
              <div className="space-y-2">
                <Label htmlFor="jenisKertas">Jenis Kertas</Label>
                <Select
                  value={formData.jenisKertas}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jenisKertas: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HVS">HVS (70-80 gsm)</SelectItem>
                    <SelectItem value="BOOKPAPER">
                      Bookpaper (55-60 gsm)
                    </SelectItem>
                    <SelectItem value="ART_PAPER">
                      Art Paper (120-150 gsm)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jenis Cover */}
              <div className="space-y-2">
                <Label htmlFor="jenisCover">Jenis Cover</Label>
                <Select
                  value={formData.jenisCover}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jenisCover: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOFTCOVER">Softcover</SelectItem>
                    <SelectItem value="HARDCOVER">Hardcover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Harga Per Halaman */}
              <div className="space-y-2">
                <Label htmlFor="hargaPerHalaman">Harga Per Halaman (Rp)</Label>
                <Input
                  id="hargaPerHalaman"
                  type="number"
                  placeholder="500"
                  value={formData.hargaPerHalaman}
                  onChange={(e) =>
                    setFormData({ ...formData, hargaPerHalaman: e.target.value })
                  }
                  required
                />
              </div>

              {/* Biaya Jilid */}
              <div className="space-y-2">
                <Label htmlFor="biayaJilid">Biaya Jilid/Finishing (Rp)</Label>
                <Input
                  id="biayaJilid"
                  type="number"
                  placeholder="5000"
                  value={formData.biayaJilid}
                  onChange={(e) =>
                    setFormData({ ...formData, biayaJilid: e.target.value })
                  }
                  required
                />
              </div>

              {/* Minimum Pesanan */}
              <div className="space-y-2">
                <Label htmlFor="minimumPesanan">Minimum Pesanan (eks)</Label>
                <Input
                  id="minimumPesanan"
                  type="number"
                  placeholder="1"
                  value={formData.minimumPesanan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumPesanan: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center space-x-2">
                <input
                  id="aktif"
                  type="checkbox"
                  checked={formData.aktif}
                  onChange={(e) =>
                    setFormData({ ...formData, aktif: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="aktif" className="cursor-pointer">
                  Tarif Aktif
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingTarif ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tarif</CardTitle>
          <CardDescription>
            {tarifs.length} tarif terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat data tarif...</p>
            </div>
          ) : tarifs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Belum ada tarif. Tambahkan tarif pertama Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Jenis Kertas</TableHead>
                    <TableHead>Jenis Cover</TableHead>
                    <TableHead className="text-right">Harga/Halaman</TableHead>
                    <TableHead className="text-right">Biaya Jilid</TableHead>
                    <TableHead className="text-center">Min. Order</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarifs.map((tarif: TarifPercetakan) => (
                    <TableRow key={tarif.id}>
                      <TableCell className="font-medium">
                        {tarif.formatBuku}
                      </TableCell>
                      <TableCell>{tarif.jenisKertas}</TableCell>
                      <TableCell>{tarif.jenisCover}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(tarif.hargaPerHalaman)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(tarif.biayaJilid)}
                      </TableCell>
                      <TableCell className="text-center">
                        {tarif.minimumPesanan} eks
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tarif.aktif ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {tarif.aktif ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Nonaktif
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(tarif)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(tarif.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
