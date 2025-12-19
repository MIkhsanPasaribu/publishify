"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Check, X, Package, Truck, FileText, Calendar, User, Phone, MapPin, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  ambilDetailPesanan,
  konfirmasiPesanan,
  batalkanPesanan,
  ambilLogProduksi,
} from "@/lib/api/percetakan";
import type { PesananCetak, LogProduksi } from "@/types/percetakan";

// Helper function untuk format Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper function untuk format tanggal
function formatTanggal(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper function untuk format tanggal dengan jam
function formatTanggalWaktu(date: string | Date): string {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function untuk badge status
function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    tertunda: { label: "Tertunda", variant: "secondary" },
    diterima: { label: "Diterima", variant: "default" },
    dalam_produksi: { label: "Dalam Produksi", variant: "default" },
    kontrol_kualitas: { label: "Kontrol Kualitas", variant: "default" },
    siap: { label: "Siap", variant: "default" },
    dikirim: { label: "Dikirim", variant: "default" },
    terkirim: { label: "Terkirim", variant: "default" },
    dibatalkan: { label: "Dibatalkan", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const { pengguna } = useAuthStore();
  const [pesanan, setPesanan] = useState<PesananCetak | null>(null);
  const [logProduksi, setLogProduksi] = useState<LogProduksi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog states
  const [showTerimaDialog, setShowTerimaDialog] = useState(false);
  const [showTolakDialog, setShowTolakDialog] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [alasan, setAlasan] = useState("");

  // Check authorization
  useEffect(() => {
    if (!pengguna || !pengguna.peran?.includes("percetakan")) {
      router.push("/dashboard");
    }
  }, [pengguna, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || typeof params.id !== "string") return;

      try {
        setIsLoading(true);

        // Fetch pesanan detail
        const responsePesanan = await ambilDetailPesanan(params.id);
        setPesanan(responsePesanan.data);

        // Fetch log produksi jika pesanan sudah diterima
        if (responsePesanan.data.status !== "tertunda" && responsePesanan.data.status !== "dibatalkan") {
          try {
            const responseLog = await ambilLogProduksi(params.id);
            setLogProduksi(responseLog.data || []);
          } catch (error) {
            console.error("Error fetching log produksi:", error);
            setLogProduksi([]);
          }
        }
      } catch (error) {
        console.error("Error fetching pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Handle terima pesanan
  const handleTerimaPesanan = async () => {
    if (!params.id || typeof params.id !== "string") return;

    try {
      setIsProcessing(true);
      await konfirmasiPesanan(params.id, {
        diterima: true,
        catatan: catatan || undefined,
      });

      // Refresh data
      const response = await ambilDetailPesanan(params.id);
      setPesanan(response.data);
      setShowTerimaDialog(false);
      setCatatan("");
    } catch (error) {
      console.error("Error menerima pesanan:", error);
      alert("Gagal menerima pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle tolak pesanan
  const handleTolakPesanan = async () => {
    if (!params.id || typeof params.id !== "string" || !alasan.trim()) return;

    try {
      setIsProcessing(true);
      await konfirmasiPesanan(params.id, {
        diterima: false,
        catatan: alasan,
      });

      // Refresh data
      const response = await ambilDetailPesanan(params.id);
      setPesanan(response.data);
      setShowTolakDialog(false);
      setAlasan("");
    } catch (error) {
      console.error("Error menolak pesanan:", error);
      alert("Gagal menolak pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div>
      </div>
    );
  }

  if (!pesanan) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Pesanan tidak ditemukan</p>
            <div className="flex justify-center mt-4">
              <Link href="/percetakan/pesanan">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canTakeAction = pesanan.status === "tertunda";

  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Gradient Header Panel */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/percetakan/pesanan">
                <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📋</span>
                  Detail Pesanan
                </h1>
                <p className="text-sm text-teal-50">No. Pesanan: {pesanan.nomorPesanan}</p>
              </div>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          {getStatusBadge(pesanan.status)}
          {canTakeAction && (
            <>
              <Button
                onClick={() => setShowTerimaDialog(true)}
                className="bg-[#0d7377] hover:bg-[#0a5c5f]"
              >
                <Check className="mr-2 h-4 w-4" />
                Terima Pesanan
              </Button>
              <Button
                onClick={() => setShowTolakDialog(true)}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Tolak Pesanan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Informasi Naskah */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Naskah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Judul Naskah</p>
                  <p className="font-medium">{pesanan.naskah?.judul || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penulis</p>
                  <p className="font-medium">
                    {pesanan.naskah?.penulis?.profilPengguna?.namaDepan}{" "}
                    {pesanan.naskah?.penulis?.profilPengguna?.namaBelakang || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium">{pesanan.naskah?.isbn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jumlah Halaman</p>
                  <p className="font-medium">{pesanan.naskah?.jumlahHalaman || 0} halaman</p>
                </div>
              </div>

              {pesanan.naskah?.urlFile && (
                <div className="pt-4 border-t">
                  <a
                    href={pesanan.naskah.urlFile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download File Naskah
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spesifikasi Cetak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Spesifikasi Cetak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Format Kertas</p>
                  <p className="font-medium">{pesanan.formatKertas}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Kertas</p>
                  <p className="font-medium">{pesanan.jenisKertas}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Cover</p>
                  <p className="font-medium">{pesanan.jenisCover}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Finishing Tambahan</p>
                  <p className="font-medium">
                    {pesanan.finishingTambahan && pesanan.finishingTambahan.length > 0 
                      ? pesanan.finishingTambahan.join(", ") 
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jumlah Cetak</p>
                  <p className="font-medium text-lg">{pesanan.jumlah} eksemplar</p>
                </div>
              </div>

              {pesanan.catatan && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="mt-1">{pesanan.catatan}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Produksi */}
          {logProduksi.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline Produksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logProduksi.map((log, index) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#0d7377]' : 'bg-gray-300'}`} />
                        {index !== logProduksi.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{log.status}</p>
                        {log.keterangan && (
                          <p className="text-sm text-muted-foreground mt-1">{log.keterangan}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTanggalWaktu(log.dibuatPada)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informasi Pengiriman */}
          {pesanan.pengiriman && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informasi Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Kurir</p>
                      <p className="font-medium">{pesanan.pengiriman.namaKurir}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nomor Resi</p>
                      <p className="font-medium">{pesanan.pengiriman.nomorResi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status Pengiriman</p>
                      <Badge>{pesanan.pengiriman.status}</Badge>
                    </div>
                    {pesanan.pengiriman.estimasiTiba && (
                      <div>
                        <p className="text-sm text-muted-foreground">Estimasi Tiba</p>
                        <p className="font-medium">{formatTanggal(pesanan.pengiriman.estimasiTiba)}</p>
                      </div>
                    )}
                  </div>

                  {pesanan.pengiriman.trackingLog && pesanan.pengiriman.trackingLog.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Tracking History</p>
                      <div className="space-y-2">
                        {pesanan.pengiriman.trackingLog.map((track) => (
                          <div key={track.id} className="flex justify-between text-sm">
                            <span>{track.status}</span>
                            <span className="text-muted-foreground">
                              {formatTanggalWaktu(track.waktu)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Informasi Pemesan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pemesan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Penerima</p>
                <p className="font-medium">{pesanan.namaPenerima}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telepon Penerima
                </p>
                <p className="font-medium">{pesanan.teleponPenerima}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Alamat Pengiriman
                </p>
                <p className="text-sm mt-1">{pesanan.alamatPengiriman}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ringkasan Pembayaran */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ringkasan Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga per Unit</span>
                <span className="font-medium">{formatRupiah(pesanan.hargaTotal / pesanan.jumlah)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Cetak</span>
                <span className="font-medium">{pesanan.jumlah}x</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg text-[#0d7377]">
                  {formatRupiah(pesanan.hargaTotal)}
                </span>
              </div>

              {pesanan.pembayaran && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status Pembayaran</span>
                    <Badge variant={pesanan.pembayaran.status === "selesai" ? "default" : "secondary"}>
                      {pesanan.pembayaran.status}
                    </Badge>
                  </div>
                  {pesanan.pembayaran.metodePembayaran && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Metode</span>
                      <span>{pesanan.pembayaran.metodePembayaran}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informasi Waktu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Tanggal Pesanan</p>
                <p>{formatTanggalWaktu(pesanan.tanggalPesan)}</p>
              </div>
              {pesanan.estimasiSelesai && (
                <div>
                  <p className="text-muted-foreground">Estimasi Selesai</p>
                  <p>{formatTanggal(pesanan.estimasiSelesai)}</p>
                </div>
              )}
              {pesanan.tanggalSelesai && (
                <div>
                  <p className="text-muted-foreground">Tanggal Selesai</p>
                  <p>{formatTanggalWaktu(pesanan.tanggalSelesai)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Terima Pesanan */}
      <Dialog open={showTerimaDialog} onOpenChange={setShowTerimaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Pesanan</DialogTitle>
            <DialogDescription>
              Anda akan menerima pesanan ini dan memulai proses produksi. Pastikan semua spesifikasi sudah sesuai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan (Opsional)</Label>
              <Textarea
                id="catatan"
                placeholder="Tambahkan catatan untuk pesanan ini..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTerimaDialog(false);
                setCatatan("");
              }}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleTerimaPesanan}
              disabled={isProcessing}
              className="bg-[#0d7377] hover:bg-[#0a5c5f]"
            >
              {isProcessing ? "Memproses..." : "Terima Pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tolak Pesanan */}
      <Dialog open={showTolakDialog} onOpenChange={setShowTolakDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pesanan</DialogTitle>
            <DialogDescription>
              Anda akan menolak pesanan ini. Mohon berikan alasan penolakan yang jelas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alasan">Alasan Penolakan *</Label>
              <Textarea
                id="alasan"
                placeholder="Jelaskan alasan penolakan..."
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTolakDialog(false);
                setAlasan("");
              }}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleTolakPesanan}
              disabled={isProcessing || !alasan.trim()}
              variant="destructive"
            >
              {isProcessing ? "Memproses..." : "Tolak Pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
