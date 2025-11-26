"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, Search, Book, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/use-auth-store";
import { ambilDaftarNaskahAdmin, terbitkanNaskah } from "@/lib/api/admin";
import type { Naskah, TerbitkanNaskahDto } from "@/types/admin";

// Helper function untuk format tanggal
function formatTanggal(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function KelolaNaskahPage() {
  const router = useRouter();
  const { pengguna } = useAuthStore();
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state
  const [showTerbitkanDialog, setShowTerbitkanDialog] = useState(false);
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [isbn, setIsbn] = useState("");
  const [biayaProduksi, setBiayaProduksi] = useState("");

  // Check authorization
  useEffect(() => {
    if (!pengguna || !pengguna.peran.includes("admin")) {
      router.push("/dashboard");
    }
  }, [pengguna, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Hanya ambil naskah yang statusnya "disetujui"
        const response = await ambilDaftarNaskahAdmin({
          status: "disetujui",
          limit: 100,
        });
        setNaskahList(response.data);
      } catch (error) {
        console.error("Error fetching naskah:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan search
  const filteredNaskah = naskahList.filter((naskah) => {
    const query = searchQuery.toLowerCase();
    return (
      naskah.judul.toLowerCase().includes(query) ||
      naskah.penulis?.profilPengguna?.namaDepan?.toLowerCase().includes(query) ||
      naskah.penulis?.profilPengguna?.namaBelakang?.toLowerCase().includes(query)
    );
  });

  // Handle terbitkan
  const handleTerbitkan = (naskah: Naskah) => {
    setSelectedNaskah(naskah);
    setIsbn("");
    setBiayaProduksi("");
    setShowTerbitkanDialog(true);
  };

  // Submit terbitkan
  const handleSubmitTerbitkan = async () => {
    if (!selectedNaskah || !isbn.trim() || !biayaProduksi) return;

    try {
      setIsProcessing(true);
      
      const dto: TerbitkanNaskahDto = {
        isbn: isbn.trim(),
        biayaProduksi: parseFloat(biayaProduksi),
      };

      await terbitkanNaskah(selectedNaskah.id, dto);

      // Remove from list (karena sudah diterbitkan)
      setNaskahList((prev) => prev.filter((n) => n.id !== selectedNaskah.id));
      
      // Close dialog
      setShowTerbitkanDialog(false);
      setSelectedNaskah(null);
      setIsbn("");
      setBiayaProduksi("");

      alert("Naskah berhasil diterbitkan! Penulis akan mendapat notifikasi untuk mengatur harga jual.");
    } catch (error: any) {
      console.error("Error terbitkan naskah:", error);
      alert(error.response?.data?.pesan || "Gagal menerbitkan naskah. Silakan coba lagi.");
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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kelola Penerbitan Naskah</h1>
        <p className="text-muted-foreground">
          Terbitkan naskah yang sudah disetujui editor dengan mengisi ISBN dan biaya produksi
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Diterbitkan</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{naskahList.length}</div>
            <p className="text-xs text-muted-foreground">Naskah yang sudah disetujui editor</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Naskah Disetujui</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari judul atau penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {filteredNaskah.length === 0 ? (
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Tidak ada naskah yang cocok dengan pencarian" : "Tidak ada naskah yang perlu diterbitkan"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Judul</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Penulis</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kategori</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Disetujui</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredNaskah.map((naskah) => (
                    <tr key={naskah.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{naskah.judul}</div>
                        {naskah.subJudul && (
                          <div className="text-sm text-muted-foreground">{naskah.subJudul}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {naskah.penulis?.profilPengguna?.namaDepan}{" "}
                        {naskah.penulis?.profilPengguna?.namaBelakang}
                      </td>
                      <td className="px-4 py-3">{naskah.kategori?.nama}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatTanggal(naskah.diperbaruiPada)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Disetujui Editor
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleTerbitkan(naskah)}
                          className="bg-[#0d7377] hover:bg-[#0a5c5f]"
                        >
                          Terbitkan
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Terbitkan */}
      <Dialog open={showTerbitkanDialog} onOpenChange={setShowTerbitkanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terbitkan Naskah</DialogTitle>
            <DialogDescription>
              Masukkan nomor ISBN dan biaya produksi untuk menerbitkan naskah ini
            </DialogDescription>
          </DialogHeader>

          {selectedNaskah && (
            <div className="space-y-4 py-4">
              {/* Info Naskah */}
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <p className="font-medium">{selectedNaskah.judul}</p>
                <p className="text-sm text-muted-foreground">
                  Penulis: {selectedNaskah.penulis?.profilPengguna?.namaDepan}{" "}
                  {selectedNaskah.penulis?.profilPengguna?.namaBelakang}
                </p>
              </div>

              {/* Form ISBN */}
              <div className="space-y-2">
                <Label htmlFor="isbn">Nomor ISBN *</Label>
                <Input
                  id="isbn"
                  placeholder="978-602-xxxxx-x-x"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  ISBN yang sudah diurus di Perpusnas
                </p>
              </div>

              {/* Form Biaya Produksi */}
              <div className="space-y-2">
                <Label htmlFor="biayaProduksi">Biaya Produksi (Rp) *</Label>
                <Input
                  id="biayaProduksi"
                  type="number"
                  placeholder="30000"
                  value={biayaProduksi}
                  onChange={(e) => setBiayaProduksi(e.target.value)}
                  required
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Penulis akan diminta untuk mengatur harga jual berdasarkan biaya ini
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTerbitkanDialog(false);
                setSelectedNaskah(null);
                setIsbn("");
                setBiayaProduksi("");
              }}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitTerbitkan}
              disabled={isProcessing || !isbn.trim() || !biayaProduksi}
              className="bg-[#0d7377] hover:bg-[#0a5c5f]"
            >
              {isProcessing ? "Memproses..." : "Terbitkan Naskah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
