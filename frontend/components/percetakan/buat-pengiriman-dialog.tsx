"use client";

import { useState } from "react";
import { Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buatPengiriman } from "@/lib/api/percetakan";
import { toast } from "sonner";

interface BuatPengirimanDialogProps {
  pesananId: string;
  nomorPesanan: string;
  defaultAlamat?: string;
  defaultNama?: string;
  defaultTelepon?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BuatPengirimanDialog({
  pesananId,
  nomorPesanan,
  defaultAlamat = "",
  defaultNama = "",
  defaultTelepon = "",
  open,
  onOpenChange,
  onSuccess,
}: BuatPengirimanDialogProps) {
  const [namaEkspedisi, setNamaEkspedisi] = useState("");
  const [nomorResi, setNomorResi] = useState("");
  const [biayaPengiriman, setBiayaPengiriman] = useState("");
  const [alamatTujuan, setAlamatTujuan] = useState(defaultAlamat);
  const [namaPenerima, setNamaPenerima] = useState(defaultNama);
  const [teleponPenerima, setTeleponPenerima] = useState(defaultTelepon);
  const [estimasiTiba, setEstimasiTiba] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuatPengiriman = async () => {
    // Validasi
    if (!namaEkspedisi || !biayaPengiriman || !alamatTujuan || !namaPenerima || !teleponPenerima) {
      toast.error("Semua field wajib diisi kecuali nomor resi dan estimasi tiba");
      return;
    }

    const biaya = parseInt(biayaPengiriman);
    if (isNaN(biaya) || biaya <= 0) {
      toast.error("Biaya pengiriman harus berupa angka positif");
      return;
    }

    try {
      setLoading(true);

      await buatPengiriman(pesananId, {
        namaEkspedisi,
        nomorResi: nomorResi || undefined,
        biayaPengiriman: biaya,
        alamatTujuan,
        namaPenerima,
        teleponPenerima,
        estimasiTiba: estimasiTiba || undefined,
      });

      toast.success("Data pengiriman berhasil dibuat!");

      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setNamaEkspedisi("");
      setNomorResi("");
      setBiayaPengiriman("");
      setEstimasiTiba("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.pesan || "Gagal membuat data pengiriman"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Buat Data Pengiriman
          </DialogTitle>
          <DialogDescription>
            No. Pesanan: <span className="font-medium">{nomorPesanan}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Ekspedisi */}
          <div className="space-y-2">
            <Label htmlFor="ekspedisi">Nama Ekspedisi *</Label>
            <Input
              id="ekspedisi"
              value={namaEkspedisi}
              onChange={(e) => setNamaEkspedisi(e.target.value)}
              placeholder="JNE, JNT, SiCepat, dll"
            />
          </div>

          {/* Nomor Resi */}
          <div className="space-y-2">
            <Label htmlFor="resi">Nomor Resi (opsional)</Label>
            <Input
              id="resi"
              value={nomorResi}
              onChange={(e) => setNomorResi(e.target.value)}
              placeholder="Isi jika sudah ada nomor resi"
            />
            <p className="text-xs text-gray-500">
              Bisa diisi setelah paket diserahkan ke kurir
            </p>
          </div>

          {/* Biaya Pengiriman */}
          <div className="space-y-2">
            <Label htmlFor="biaya">Biaya Pengiriman *</Label>
            <Input
              id="biaya"
              type="number"
              value={biayaPengiriman}
              onChange={(e) => setBiayaPengiriman(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Estimasi Tiba */}
          <div className="space-y-2">
            <Label htmlFor="estimasi">Estimasi Tiba (opsional)</Label>
            <Input
              id="estimasi"
              type="datetime-local"
              value={estimasiTiba}
              onChange={(e) => setEstimasiTiba(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />
              Data Penerima
            </div>

            {/* Nama Penerima */}
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Penerima *</Label>
              <Input
                id="nama"
                value={namaPenerima}
                onChange={(e) => setNamaPenerima(e.target.value)}
                placeholder="Nama lengkap penerima"
              />
            </div>

            {/* Telepon Penerima */}
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon Penerima *</Label>
              <Input
                id="telepon"
                type="tel"
                value={teleponPenerima}
                onChange={(e) => setTeleponPenerima(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Alamat Tujuan */}
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat Tujuan *</Label>
              <Textarea
                id="alamat"
                value={alamatTujuan}
                onChange={(e) => setAlamatTujuan(e.target.value)}
                placeholder="Alamat lengkap pengiriman"
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleBuatPengiriman}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Truck className="h-4 w-4 mr-2" />
            {loading ? "Membuat..." : "Buat Pengiriman"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
