"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Book, Package, MapPin, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/use-auth-store";
import { ambilNaskahById } from "@/lib/api/naskah";
import { buatPesananCetak } from "@/lib/api/percetakan";
import { PilihPercetakan } from "@/components/percetakan/pilih-percetakan";
import { useKalkulasiHarga } from "@/lib/hooks/use-kalkulasi-harga";
import type { Naskah } from "@/lib/api/naskah";
import type { PercetakanDenganTarif } from "@/types/tarif";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";

interface FormData {
  idPercetakan: string;
  jumlahEksemplar: number;
  ukuran: "A4" | "A5" | "B5";
  jenisKertas: "HVS" | "BOOKPAPER" | "ART_PAPER";
  jenisCover: "SOFTCOVER" | "HARDCOVER";
  finishing: string[];
  alamatLengkap: string;
  namaPenerima: string;
  teleponPenerima: string;
}

export default function CetakFisikPage() {
  const params = useParams();
  const router = useRouter();
  const { pengguna } = useAuthStore();
  
  const [naskah, setNaskah] = useState<Naskah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPercetakan, setSelectedPercetakan] = useState<PercetakanDenganTarif | null>(null);

  const [formData, setFormData] = useState<FormData>({
    idPercetakan: "",
    jumlahEksemplar: 10,
    ukuran: "A5",
    jenisKertas: "HVS",
    jenisCover: "SOFTCOVER",
    finishing: [],
    alamatLengkap: "",
    namaPenerima: "",
    teleponPenerima: "",
  });

  // Hook untuk kalkulasi harga otomatis
  const { estimasi, minimumPesanan, loading: loadingHarga } = useKalkulasiHarga({
    idPercetakan: formData.idPercetakan,
    formatKertas: formData.ukuran,
    jenisCover: formData.jenisCover,
    jumlahHalaman: naskah?.jumlahHalaman || 100,
    jumlahBuku: formData.jumlahEksemplar,
  });

  // Fetch data naskah
  useEffect(() => {
    const fetchNaskah = async () => {
      if (!params.id || typeof params.id !== "string") return;

      try {
        setIsLoading(true);
        const response = await ambilNaskahById(params.id);
        
        // Validasi status naskah harus diterbitkan
        if (response.data.status !== "diterbitkan") {
          toast.error("Hanya naskah yang sudah diterbitkan yang dapat dicetak");
          router.push("/dashboard/buku-terbit");
          return;
        }

        setNaskah(response.data);
        
        // Auto-fill data penerima dari profil
        if (pengguna?.profilPengguna) {
          const profil = pengguna.profilPengguna;
          setFormData(prev => ({
            ...prev,
            namaPenerima: profil.namaTampilan || 
                         `${profil.namaDepan || ''} ${profil.namaBelakang || ''}`.trim(),
            alamatLengkap: profil.alamat || '',
          }));
        }
        if (pengguna?.telepon) {
          setFormData(prev => ({
            ...prev,
            teleponPenerima: pengguna.telepon || '',
          }));
        }
      } catch (error) {
        console.error("Error fetching naskah:", error);
        toast.error("Gagal memuat data naskah");
        router.push("/dashboard/buku-terbit");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNaskah();
  }, [params.id, router, pengguna]);

  // Handle pilih percetakan
  const handleSelectPercetakan = (percetakan: PercetakanDenganTarif) => {
    setSelectedPercetakan(percetakan);
    setFormData(prev => ({
      ...prev,
      idPercetakan: percetakan.id,
      jumlahEksemplar: Math.max(
        prev.jumlahEksemplar,
        percetakan.tarifAktif?.minimumPesanan || 1
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!naskah) {
      toast.error("Data naskah tidak ditemukan");
      return;
    }

    if (!formData.idPercetakan) {
      toast.error("Pilih percetakan terlebih dahulu");
      return;
    }

    if (formData.jumlahEksemplar < minimumPesanan) {
      toast.error(`Jumlah pesanan minimal ${minimumPesanan} eksemplar`);
      return;
    }

    if (!formData.alamatLengkap.trim()) {
      toast.error("Alamat pengiriman harus diisi");
      return;
    }

    if (!formData.namaPenerima.trim()) {
      toast.error("Nama penerima harus diisi");
      return;
    }

    if (!formData.teleponPenerima.trim()) {
      toast.error("Nomor telepon harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        idNaskah: naskah.id,
        idPercetakan: formData.idPercetakan,
        jumlah: formData.jumlahEksemplar,
        formatKertas: formData.ukuran,
        jenisKertas: formData.jenisKertas,
        jenisCover: formData.jenisCover,
        finishingTambahan: formData.finishing.length > 0 ? formData.finishing : undefined,
        catatan: undefined,
        alamatPengiriman: formData.alamatLengkap,
        namaPenerima: formData.namaPenerima,
        teleponPenerima: formData.teleponPenerima,
      };

      const response = await buatPesananCetak(payload);

      if (response.sukses) {
        toast.success("Pesanan cetak berhasil dibuat!");
        router.push("/dashboard/pesanan");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.pesan || "Gagal membuat pesanan cetak");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#0d7377]" />
      </div>
    );
  }

  if (!naskah) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Naskah tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cetak Fisik Buku</h1>
            <p className="text-gray-600 mt-1">{naskah.judul}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Pilih Percetakan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#0d7377]" />
                Langkah 1: Pilih Percetakan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih percetakan untuk melihat harga dan membuat pesanan
              </p>
            </CardHeader>
            <CardContent>
              <PilihPercetakan
                onSelect={handleSelectPercetakan}
                selectedId={formData.idPercetakan}
              />
            </CardContent>
          </Card>

          {/* Show form only if percetakan selected */}
          {formData.idPercetakan && selectedPercetakan && (
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Kolom Kiri - Formulir (2 kolom) */}
                <div className="md:col-span-2 space-y-6">
                  {/* Card Spesifikasi Cetak */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-[#0d7377]" />
                        Langkah 2: Spesifikasi Cetak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Alert Minimum Pesanan */}
                      {minimumPesanan > 1 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Minimum Pesanan</p>
                            <p className="text-sm">
                              Percetakan {selectedPercetakan.nama} memiliki minimum pesanan {minimumPesanan} eksemplar
                            </p>
                          </div>
                        </Alert>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Jumlah Eksemplar */}
                        <div>
                          <Label htmlFor="jumlah">Jumlah Eksemplar *</Label>
                          <Input
                            id="jumlah"
                            type="number"
                            min={minimumPesanan}
                            value={formData.jumlahEksemplar}
                            onChange={(e) => {
                              const nilai = parseInt(e.target.value) || minimumPesanan;
                              setFormData({ ...formData, jumlahEksemplar: Math.max(nilai, minimumPesanan) });
                            }}
                            className="mt-1"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimal {minimumPesanan} eksemplar
                          </p>
                        </div>

                        {/* Ukuran Kertas */}
                        <div>
                          <Label htmlFor="ukuran">Ukuran Kertas *</Label>
                          <Select
                            value={formData.ukuran}
                            onValueChange={(value) => setFormData({ ...formData, ukuran: value as "A4" | "A5" | "B5" })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih ukuran" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A5">A5 (14.8 x 21 cm)</SelectItem>
                              <SelectItem value="A4">A4 (21 x 29.7 cm)</SelectItem>
                              <SelectItem value="B5">B5 (17.6 x 25 cm)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Jenis Kertas */}
                        <div>
                          <Label htmlFor="kertas">Jenis Kertas Isi *</Label>
                          <Select
                            value={formData.jenisKertas}
                            onValueChange={(value) => 
                              setFormData({ ...formData, jenisKertas: value as "HVS" | "BOOKPAPER" | "ART_PAPER" })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih jenis kertas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BOOKPAPER">Bookpaper</SelectItem>
                              <SelectItem value="HVS">HVS</SelectItem>
                              <SelectItem value="ART_PAPER">Art Paper</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Jenis Cover */}
                        <div>
                          <Label htmlFor="jilid">Jenis Cover *</Label>
                          <Select
                            value={formData.jenisCover}
                            onValueChange={(value) => 
                              setFormData({ ...formData, jenisCover: value as "SOFTCOVER" | "HARDCOVER" })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih jenis cover" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SOFTCOVER">Soft Cover</SelectItem>
                              <SelectItem value="HARDCOVER">Hard Cover</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <p className="text-sm text-teal-800">
                          <strong>Info Naskah:</strong> Jumlah halaman {naskah.jumlahHalaman} halaman
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Pengiriman */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#0d7377]" />
                        Langkah 3: Informasi Pengiriman
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="namaPenerima">Nama Penerima *</Label>
                        <Input
                          id="namaPenerima"
                          value={formData.namaPenerima}
                          onChange={(e) => setFormData({ ...formData, namaPenerima: e.target.value })}
                          placeholder="Nama lengkap penerima"
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="telepon">Nomor Telepon *</Label>
                        <Input
                          id="telepon"
                          type="tel"
                          value={formData.teleponPenerima}
                          onChange={(e) => setFormData({ ...formData, teleponPenerima: e.target.value })}
                          placeholder="08xxx"
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="alamat">Alamat Lengkap *</Label>
                        <Textarea
                          id="alamat"
                          value={formData.alamatLengkap}
                          onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
                          placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos"
                          className="mt-1"
                          rows={4}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Kolom Kanan - Ringkasan (Sticky) */}
                <div className="md:col-span-1">
                  <div className="sticky top-8 space-y-6">
                    {/* Card Info Buku */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Book className="h-5 w-5 text-[#0d7377]" />
                          Informasi Buku
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {naskah.urlSampul && (
                          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={naskah.urlSampul}
                              alt={naskah.judul}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{naskah.judul}</h3>
                          {naskah.isbn && (
                            <p className="text-sm text-muted-foreground mt-1">ISBN: {naskah.isbn}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {naskah.jumlahHalaman} halaman
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card Ringkasan Harga */}
                    <Card className="border-[#0d7377] border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CreditCard className="h-5 w-5 text-[#0d7377]" />
                          Estimasi Harga
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {loadingHarga ? (
                          <div className="text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#0d7377]" />
                            <p className="text-sm text-muted-foreground mt-2">Menghitung harga...</p>
                          </div>
                        ) : estimasi ? (
                          <>
                            <div className="space-y-2 text-sm">
                              {estimasi.breakdown.map((item) => (
                                <div key={item.label} className="flex justify-between">
                                  <span className="text-muted-foreground">{item.label}</span>
                                  <span className="font-medium">{formatRupiah(item.nilai)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total Harga</span>
                                <span className="text-2xl font-bold text-[#0d7377]">
                                  {formatRupiah(estimasi.totalHarga)}
                                </span>
                              </div>
                            </div>

                            <Button
                              type="submit"
                              disabled={isSubmitting || formData.jumlahEksemplar < minimumPesanan}
                              className="w-full bg-gradient-to-r from-[#0d7377] to-[#0a5c5f] hover:from-[#0a5c5f] hover:to-[#084a4c] text-white font-semibold py-6 text-lg"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                "Buat Pesanan Cetak"
                              )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                              Harga sudah termasuk biaya cetak dan jilid
                            </p>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">
                              Pilih spesifikasi untuk melihat estimasi harga
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
