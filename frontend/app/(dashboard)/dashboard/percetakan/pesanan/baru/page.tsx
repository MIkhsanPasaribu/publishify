"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { ambilPesananPercetakan, konfirmasiPesanan } from "@/lib/api/percetakan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { PesananCetak } from "@/types/percetakan";

export default function PesananBaruPage() {
  const [selectedPesanan, setSelectedPesanan] = useState<PesananCetak | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pesanan baru
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pesanan-baru"],
    queryFn: () => ambilPesananPercetakan("baru"),
    refetchInterval: 30000, // Refresh setiap 30 detik
  });

  // Konfirmasi mutation
  const konfirmasiMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      konfirmasiPesanan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pesanan-baru"] });
      toast.success("Pesanan berhasil dikonfirmasi");
      setIsDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.pesan || "Gagal mengkonfirmasi pesanan"
      );
    },
  });

  const handleTerima = (pesanan: PesananCetak) => {
    if (
      confirm(
        `Terima pesanan ${pesanan.nomorPesanan}?\n\nAnda akan bertanggung jawab untuk mencetak ${pesanan.jumlah} eksemplar.`
      )
    ) {
      konfirmasiMutation.mutate({
        id: pesanan.id,
        data: { konfirmasi: true },
      });
    }
  };

  const handleTolak = (pesanan: PesananCetak) => {
    const alasan = prompt(
      "Masukkan alasan penolakan (akan dikirim ke penulis):"
    );
    if (alasan) {
      konfirmasiMutation.mutate({
        id: pesanan.id,
        data: { konfirmasi: false, alasan },
      });
    }
  };

  const handleDownloadPDF = (pesanan: PesananCetak) => {
    if (pesanan.naskah?.urlFile) {
      window.open(pesanan.naskah.urlFile, "_blank");
    } else {
      toast.error("File PDF tidak tersedia");
    }
  };

  const handleViewDetail = (pesanan: PesananCetak) => {
    setSelectedPesanan(pesanan);
    setIsDetailOpen(true);
  };

  const pesananList = data?.data || [];
  const totalPesanan = data?.total || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            📥 Pesanan Baru
            {totalPesanan > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {totalPesanan}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Pesanan yang menunggu konfirmasi dari Anda
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Pesanan Baru</CardDescription>
            <CardTitle className="text-3xl">{totalPesanan}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Menunggu Konfirmasi</CardDescription>
            <CardTitle className="text-3xl">
              {
                pesananList.filter((p: PesananCetak) => p.status === "tertunda")
                  .length
              }
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Diterima</CardDescription>
            <CardTitle className="text-3xl">
              {
                pesananList.filter((p: PesananCetak) => p.status === "diterima")
                  .length
              }
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>
            Klik "Lihat Detail" untuk informasi lengkap pesanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat pesanan...</p>
            </div>
          ) : pesananList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-600 text-lg">
                Tidak ada pesanan baru saat ini
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Pesanan akan muncul di sini ketika ada penulis yang memesan
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Naskah</TableHead>
                    <TableHead>Pemesan</TableHead>
                    <TableHead className="text-center">Jumlah</TableHead>
                    <TableHead>Spesifikasi</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pesananList.map((pesanan: PesananCetak) => (
                    <TableRow key={pesanan.id}>
                      <TableCell className="font-mono font-medium">
                        {pesanan.nomorPesanan}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {pesanan.naskah?.judul || "-"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {pesanan.naskah?.jumlahHalaman || 0} halaman
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pesanan.pemesan?.profilPengguna?.namaTampilan ||
                          pesanan.pemesan?.email ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {pesanan.jumlah} eks
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-500">Format:</span>{" "}
                            {pesanan.formatKertas}
                          </div>
                          <div>
                            <span className="text-gray-500">Kertas:</span>{" "}
                            {pesanan.jenisKertas}
                          </div>
                          <div>
                            <span className="text-gray-500">Cover:</span>{" "}
                            {pesanan.jenisCover}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatRupiah(pesanan.hargaTotal || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            pesanan.status === "tertunda"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {pesanan.status === "tertunda"
                            ? "Menunggu"
                            : "Diterima"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(pesanan)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                          {pesanan.status === "tertunda" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleTerima(pesanan)}
                                disabled={konfirmasiMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Terima
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleTolak(pesanan)}
                                disabled={konfirmasiMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Tolak
                              </Button>
                            </>
                          )}
                          {pesanan.naskah?.urlFile && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(pesanan)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          )}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              Informasi lengkap pesanan cetak
            </DialogDescription>
          </DialogHeader>

          {selectedPesanan && (
            <div className="space-y-6 mt-4">
              {/* Info Pesanan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nomor Pesanan</p>
                  <p className="font-mono font-semibold">
                    {selectedPesanan.nomorPesanan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Pesan</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedPesanan.tanggalPesan),
                      "dd MMMM yyyy, HH:mm",
                      { locale: id }
                    )}
                  </p>
                </div>
              </div>

              {/* Info Naskah */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Informasi Naskah</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Judul</p>
                    <p className="font-medium">
                      {selectedPesanan.naskah?.judul || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Format</p>
                      <p>{selectedPesanan.formatKertas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Jumlah Halaman</p>
                      <p>{selectedPesanan.naskah?.jumlahHalaman || 0} halaman</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spesifikasi Cetak */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Spesifikasi Cetak</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Jenis Kertas</p>
                    <p className="font-medium">{selectedPesanan.jenisKertas}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Cover</p>
                    <p className="font-medium">{selectedPesanan.jenisCover}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jumlah Cetak</p>
                    <p className="font-medium text-lg">
                      {selectedPesanan.jumlah} eksemplar
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Harga</p>
                    <p className="font-mono font-bold text-lg text-primary">
                      {formatRupiah(selectedPesanan.hargaTotal || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Catatan */}
              {selectedPesanan.catatan && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Catatan Pemesan</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedPesanan.catatan}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedPesanan.status === "tertunda" && (
                <div className="border-t pt-4 flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleTerima(selectedPesanan);
                      setIsDetailOpen(false);
                    }}
                    disabled={konfirmasiMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Terima Pesanan
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleTolak(selectedPesanan);
                      setIsDetailOpen(false);
                    }}
                    disabled={konfirmasiMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak Pesanan
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
