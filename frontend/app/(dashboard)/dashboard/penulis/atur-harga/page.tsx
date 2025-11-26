"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Book, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/use-auth-store";
import { ambilDaftarNaskahAdmin, aturHargaJual } from "@/lib/api/admin";
import type { Naskah } from "@/types/admin";

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

export default function AturHargaJualPage() {
  const router = useRouter();
  const { pengguna } = useAuthStore();
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [showAturHargaDialog, setShowAturHargaDialog] = useState(false);
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [hargaJual, setHargaJual] = useState("");

  // Check authorization
  useEffect(() => {
    if (!pengguna || !pengguna.peran?.includes("penulis")) {
      router.push("/dashboard");
    }
  }, [pengguna, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!pengguna) return;

      try {
        setIsLoading(true);
        // Ambil naskah yang statusnya "diterbitkan" tapi belum ada harga jual
        const response = await ambilDaftarNaskahAdmin({
          status: "diterbitkan",
          limit: 100,
        });
        
        // Filter: hanya naskah milik penulis ini yang belum set harga
        const naskahBelumSetHarga = response.data.filter(
          (n) => n.idPenulis === pengguna.id && (!n.hargaJual || n.hargaJual === 0)
        );
        
        setNaskahList(naskahBelumSetHarga);
      } catch (error) {
        console.error("Error fetching naskah:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pengguna]);

  // Handle atur harga
  const handleAturHarga = (naskah: Naskah) => {
    setSelectedNaskah(naskah);
    setHargaJual("");
    setShowAturHargaDialog(true);
  };

  // Submit atur harga
  const handleSubmitAturHarga = async () => {
    if (!selectedNaskah || !hargaJual) return;

    const hargaJualNumber = parseFloat(hargaJual);
    const biayaProduksi = selectedNaskah.biayaProduksi || 0;

    // Validasi: harga jual harus lebih besar dari biaya produksi
    if (hargaJualNumber <= biayaProduksi) {
      alert(`Harga jual harus lebih besar dari biaya produksi (${formatRupiah(biayaProduksi)})`);
      return;
    }

    try {
      setIsProcessing(true);
      
      await aturHargaJual(selectedNaskah.id, hargaJualNumber);

      // Remove from list (karena sudah set harga)
      setNaskahList((prev) => prev.filter((n) => n.id !== selectedNaskah.id));
      
      // Close dialog
      setShowAturHargaDialog(false);
      setSelectedNaskah(null);
      setHargaJual("");

      alert("Harga jual berhasil ditetapkan! Buku Anda sekarang tersedia di katalog.");
    } catch (error: any) {
      console.error("Error atur harga jual:", error);
      alert(error.response?.data?.pesan || "Gagal mengatur harga jual. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate margin
  const calculateMargin = () => {
    if (!selectedNaskah || !hargaJual) return 0;
    const hargaJualNumber = parseFloat(hargaJual);
    const biayaProduksi = selectedNaskah.biayaProduksi || 0;
    return hargaJualNumber - biayaProduksi;
  };

  const calculateMarginPercentage = () => {
    if (!selectedNaskah || !hargaJual) return 0;
    const hargaJualNumber = parseFloat(hargaJual);
    const biayaProduksi = selectedNaskah.biayaProduksi || 0;
    if (biayaProduksi === 0) return 0;
    return ((hargaJualNumber - biayaProduksi) / biayaProduksi) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Atur Harga Jual Buku</h1>
        <p className="text-muted-foreground">
          Tentukan harga jual untuk buku yang sudah diterbitkan
        </p>
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900">Cara Kerja Harga Jual</p>
              <p className="text-sm text-blue-800">
                Admin telah menetapkan biaya produksi untuk setiap buku. Anda bebas menentukan harga jual,
                namun harga harus lebih tinggi dari biaya produksi. Selisihnya adalah keuntungan Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Penetapan Harga</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{naskahList.length}</div>
            <p className="text-xs text-muted-foreground">Buku yang sudah diterbitkan</p>
          </CardContent>
        </Card>
      </div>

      {/* List Naskah */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Buku yang Perlu Harga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {naskahList.length === 0 ? (
            <div className="text-center py-12">
              <Check className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <p className="text-lg font-medium">Semua Buku Sudah Memiliki Harga!</p>
              <p className="text-muted-foreground mt-2">
                Tidak ada buku yang perlu ditetapkan harga saat ini
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {naskahList.map((naskah) => (
                <Card key={naskah.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        {/* Cover Preview */}
                        <div className="w-20 h-28 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {naskah.urlSampul ? (
                            <img
                              src={naskah.urlSampul}
                              alt={naskah.judul}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Book className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-bold text-lg">{naskah.judul}</h3>
                            {naskah.subJudul && (
                              <p className="text-sm text-muted-foreground">{naskah.subJudul}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Badge variant="default">ISBN: {naskah.isbn}</Badge>
                            <Badge variant="secondary">{naskah.kategori?.nama}</Badge>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-amber-900">
                              💰 Biaya Produksi: {formatRupiah(naskah.biayaProduksi || 0)}
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Tentukan harga jual Anda. Selisihnya adalah keuntungan Anda.
                            </p>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Diterbitkan: {naskah.diterbitkanPada ? formatTanggal(naskah.diterbitkanPada) : "-"}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleAturHarga(naskah)}
                        className="bg-[#0d7377] hover:bg-[#0a5c5f] ml-4"
                      >
                        Atur Harga
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Atur Harga */}
      <Dialog open={showAturHargaDialog} onOpenChange={setShowAturHargaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Harga Jual</DialogTitle>
            <DialogDescription>
              Tentukan harga jual untuk buku ini
            </DialogDescription>
          </DialogHeader>

          {selectedNaskah && (
            <div className="space-y-4 py-4">
              {/* Info Naskah */}
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <p className="font-medium">{selectedNaskah.judul}</p>
                <p className="text-sm text-muted-foreground">ISBN: {selectedNaskah.isbn}</p>
              </div>

              {/* Biaya Produksi */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium">Biaya Produksi (Modal)</p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatRupiah(selectedNaskah.biayaProduksi || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ditetapkan oleh admin
                </p>
              </div>

              {/* Form Harga Jual */}
              <div className="space-y-2">
                <Label htmlFor="hargaJual">Harga Jual (Rp) *</Label>
                <Input
                  id="hargaJual"
                  type="number"
                  placeholder="50000"
                  value={hargaJual}
                  onChange={(e) => setHargaJual(e.target.value)}
                  required
                  min={selectedNaskah.biayaProduksi || 0}
                  step="1000"
                />
              </div>

              {/* Kalkulasi Margin */}
              {hargaJual && parseFloat(hargaJual) > (selectedNaskah.biayaProduksi || 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">Estimasi Keuntungan</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatRupiah(calculateMargin())}
                  </p>
                  <p className="text-xs text-green-600">
                    Margin: {calculateMarginPercentage().toFixed(1)}% dari modal
                  </p>
                </div>
              )}

              {hargaJual && parseFloat(hargaJual) <= (selectedNaskah.biayaProduksi || 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900">⚠️ Harga Terlalu Rendah</p>
                  <p className="text-xs text-red-600">
                    Harga jual harus lebih tinggi dari biaya produksi
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAturHargaDialog(false);
                setSelectedNaskah(null);
                setHargaJual("");
              }}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitAturHarga}
              disabled={
                isProcessing ||
                !hargaJual ||
                parseFloat(hargaJual) <= (selectedNaskah?.biayaProduksi || 0)
              }
              className="bg-[#0d7377] hover:bg-[#0a5c5f]"
            >
              {isProcessing ? "Memproses..." : "Tetapkan Harga"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
