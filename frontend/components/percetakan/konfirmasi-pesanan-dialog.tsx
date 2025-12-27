"use client";

import { useState } from "react";
import { Check, X, Clock } from "lucide-react";
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
import { konfirmasiPesanan } from "@/lib/api/percetakan";
import { toast } from "sonner";

interface KonfirmasiPesananDialogProps {
  pesananId: string;
  nomorPesanan: string;
  judul: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function KonfirmasiPesananDialog({
  pesananId,
  nomorPesanan,
  judul,
  open,
  onOpenChange,
  onSuccess,
}: KonfirmasiPesananDialogProps) {
  const [keputusan, setKeputusan] = useState<"diterima" | "ditolak" | null>(
    null
  );
  const [estimasiSelesai, setEstimasiSelesai] = useState("");
  const [alasan, setAlasan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKonfirmasi = async () => {
    if (!keputusan) {
      toast.error("Pilih keputusan terlebih dahulu");
      return;
    }

    if (keputusan === "diterima" && !estimasiSelesai) {
      toast.error("Estimasi selesai wajib diisi untuk pesanan diterima");
      return;
    }

    if (keputusan === "ditolak" && !alasan) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }

    try {
      setLoading(true);

      // Konversi datetime-local ke ISO 8601
      const estimasiISO = keputusan === "diterima" && estimasiSelesai
        ? new Date(estimasiSelesai).toISOString()
        : undefined;

      const payload = {
        diterima: keputusan === "diterima",
        estimasiSelesai: estimasiISO,
        catatan: keputusan === "ditolak" ? alasan : undefined,
      };

      console.log("🔍 [DEBUG] Payload yang akan dikirim:", payload);
      console.log("🔍 [DEBUG] Pesanan ID:", pesananId);

      await konfirmasiPesanan(pesananId, payload);

      toast.success(
        keputusan === "diterima"
          ? "Pesanan berhasil diterima!"
          : "Pesanan berhasil ditolak"
      );

      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setKeputusan(null);
      setEstimasiSelesai("");
      setAlasan("");
    } catch (error: any) {
      console.error("Error konfirmasi pesanan:", error);
      console.error("Response data:", error.response?.data);
      
      const errorMessage = error.response?.data?.pesan 
        || error.response?.data?.message
        || "Gagal mengkonfirmasi pesanan";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pesanan</DialogTitle>
          <DialogDescription>
            Terima atau tolak pesanan cetak berikut
          </DialogDescription>
        </DialogHeader>

        {/* Info Pesanan */}
        <div className="space-y-1 rounded-lg bg-gray-50 p-3 text-sm">
          <div>
            <span className="font-medium">No. Pesanan:</span> {nomorPesanan}
          </div>
          <div>
            <span className="font-medium">Naskah:</span> {judul}
          </div>
        </div>

        <div className="space-y-6 py-2">
          {/* Pilihan Keputusan */}
          <div className="space-y-3">
            <Label>Keputusan *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={keputusan === "diterima" ? "default" : "outline"}
                className={
                  keputusan === "diterima"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                onClick={() => setKeputusan("diterima")}
              >
                <Check className="h-4 w-4 mr-2" />
                Terima Pesanan
              </Button>
              <Button
                type="button"
                variant={keputusan === "ditolak" ? "destructive" : "outline"}
                onClick={() => setKeputusan("ditolak")}
              >
                <X className="h-4 w-4 mr-2" />
                Tolak Pesanan
              </Button>
            </div>
          </div>

          {/* Form Terima */}
          {keputusan === "diterima" && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="estimasi">Estimasi Selesai *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimasi"
                  type="datetime-local"
                  value={estimasiSelesai}
                  onChange={(e) => setEstimasiSelesai(e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Perkiraan waktu pesanan selesai diproduksi
              </p>
            </div>
          )}

          {/* Form Tolak */}
          {keputusan === "ditolak" && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="alasan">Alasan Penolakan *</Label>
              <Textarea
                id="alasan"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan alasan penolakan pesanan..."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Alasan ini akan dikirimkan ke penulis
              </p>
            </div>
          )}
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
            onClick={handleKonfirmasi}
            disabled={!keputusan || loading}
            className={
              keputusan === "diterima"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {loading ? "Memproses..." : "Konfirmasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
