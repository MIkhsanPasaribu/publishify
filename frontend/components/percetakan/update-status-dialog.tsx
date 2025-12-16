"use client";

import { useState } from "react";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStatusPesanan } from "@/lib/api/percetakan";
import { toast } from "sonner";

interface UpdateStatusDialogProps {
  pesananId: string;
  nomorPesanan: string;
  statusSaatIni: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STATUS_FLOW: Record<string, string[]> = {
  diterima: ["dalam_produksi"],
  dalam_produksi: ["kontrol_kualitas"],
  kontrol_kualitas: ["siap"],
  siap: ["dikirim"],
  dikirim: ["terkirim"],
};

const STATUS_LABELS: Record<string, string> = {
  dalam_produksi: "Dalam Produksi",
  kontrol_kualitas: "Quality Control",
  siap: "Siap Kirim",
  dikirim: "Dikirim",
  terkirim: "Terkirim",
};

export function UpdateStatusDialog({
  pesananId,
  nomorPesanan,
  statusSaatIni,
  open,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [statusBaru, setStatusBaru] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  const statusOptions = STATUS_FLOW[statusSaatIni] || [];

  const handleUpdate = async () => {
    if (!statusBaru) {
      toast.error("Pilih status baru terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      await updateStatusPesanan(pesananId, {
        status: statusBaru as any,
        catatan: catatan || undefined,
      });

      toast.success("Status pesanan berhasil diperbarui!");

      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setStatusBaru("");
      setCatatan("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.pesan || "Gagal memperbarui status pesanan"
      );
    } finally {
      setLoading(false);
    }
  };

  if (statusOptions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Status Pesanan</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-gray-500">
            <PackageCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>Pesanan sudah mencapai status akhir</p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Status Pesanan</DialogTitle>
          <DialogDescription>
            <div className="space-y-1 mt-2">
              <p>
                <span className="font-medium">No. Pesanan:</span> {nomorPesanan}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {STATUS_LABELS[statusSaatIni] || statusSaatIni}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Status baru</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pilih Status Baru */}
          <div className="space-y-2">
            <Label htmlFor="status">Status Baru *</Label>
            <Select value={statusBaru} onValueChange={setStatusBaru}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status baru" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catatan (Opsional) */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan (opsional)</Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan..."
              rows={3}
            />
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
            onClick={handleUpdate}
            disabled={!statusBaru || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Memperbarui..." : "Perbarui Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
