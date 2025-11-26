"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Book, Package, MapPin, CreditCard, Loader2 } from "lucide-react";
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
import { useAuthStore } from "@/stores/use-auth-store";
import { ambilNaskahById } from "@/lib/api/naskah";
import { buatPesananCetak } from "@/lib/api/percetakan";
import type { Naskah } from "@/lib/api/naskah";
import { formatRupiah } from "@/lib/utils";

// Konstanta Harga
const HARGA_PER_HALAMAN = 150;
const BIAYA_JILID_SOFTCOVER = 20000;
const BIAYA_JILID_HARDCOVER = 50000;
const MARGIN_PLATFORM = 0.1; // 10%
const ESTIMASI_ONGKIR = 15000;
const BERAT_PER_BUKU = 300; // gram

interface FormData {
  jumlahEksemplar: number;
  ukuran: string;
  jenisKertas: string;
  jenisCover: string;
  finishing: string[];
  alamatLengkap: string;
  namaPenerima: string;
  teleponPenerima: string;
  kurir: string;
}

export default function CetakFisikPage() {
  const params = useParams();
  const router = useRouter();
  const { pengguna } = useAuthStore();
  
  const [naskah, setNaskah] = useState<Naskah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    jumlahEksemplar: 1,
    ukuran: "A5",
    jenisKertas: "Bookpaper",
    jenisCover: "Soft Cover",
    finishing: [],
    alamatLengkap: "",
    namaPenerima: "",
    teleponPenerima: "",
    kurir: "JNE",
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
          alert("Hanya naskah yang sudah diterbitkan yang dapat dicetak");
          router.push("/dashboard/buku-terbit");
          return;
        }

        setNaskah(response.data);
      } catch (error) {
        console.error("Error fetching naskah:", error);
        alert("Gagal memuat data naskah");
        router.push("/dashboard/buku-terbit");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNaskah();
  }, [params.id, router]);

  // Kalkulator Harga Real-time
  const hitungBiaya = () => {
    if (!naskah?.jumlahHalaman) return { biayaCetak: 0, biayaJilid: 0, biayaLayanan: 0, ongkir: 0, total: 0 };

    const biayaCetakPerBuku = naskah.jumlahHalaman * HARGA_PER_HALAMAN;
    const biayaJilidPerBuku = formData.jenisCover === "Hard Cover" ? BIAYA_JILID_HARDCOVER : BIAYA_JILID_SOFTCOVER;
    const subtotalPerBuku = biayaCetakPerBuku + biayaJilidPerBuku;
    
    const biayaCetak = subtotalPerBuku * formData.jumlahEksemplar;
    const biayaJilid = biayaJilidPerBuku * formData.jumlahEksemplar;
    const biayaLayanan = biayaCetak * MARGIN_PLATFORM;
    const ongkir = ESTIMASI_ONGKIR;
    const total = biayaCetak + biayaLayanan + ongkir;

    return { biayaCetak, biayaJilid, biayaLayanan, ongkir, total };
  };

  const biaya = hitungBiaya();
  const beratTotal = formData.jumlahEksemplar * BERAT_PER_BUKU;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!naskah) return;
    if (formData.jumlahEksemplar < 1) {
      alert("Jumlah eksemplar minimal 1");
      return;
    }
    if (!formData.alamatLengkap.trim()) {
      alert("Alamat lengkap harus diisi");
      return;
    }
    if (!formData.namaPenerima.trim()) {
      alert("Nama penerima harus diisi");
      return;
    }
    if (!formData.teleponPenerima.trim()) {
      alert("Nomor telepon harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        idNaskah: naskah.id,
        jumlah: formData.jumlahEksemplar,
        formatKertas: formData.ukuran,
        jenisKertas: formData.jenisKertas,
        jenisCover: formData.jenisCover,
        finishingTambahan: formData.finishing,
        catatan: `Pengiriman via ${formData.kurir}`,
        hargaTotal: biaya.total,
        // Data pengiriman
        alamatPengiriman: formData.alamatLengkap,
        namaPenerima: formData.namaPenerima,
        teleponPenerima: formData.teleponPenerima,
      };

      const response = await buatPesananCetak(payload);

      if (response.sukses) {
        alert("Pesanan cetak berhasil dibuat!");
        router.push("/dashboard/pesanan");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.pesan || "Gagal membuat pesanan cetak");
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
            <p className="text-gray-600 mt-1">Atur spesifikasi dan buat pesanan cetak</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Kolom Kiri - Formulir (2 kolom) */}
            <div className="md:col-span-2 space-y-6">
              {/* Card Spesifikasi Cetak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#0d7377]" />
                    Spesifikasi Cetak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Jumlah Eksemplar */}
                    <div>
                      <Label htmlFor="jumlah">Jumlah Eksemplar *</Label>
                      <Input
                        id="jumlah"
                        type="number"
                        min="1"
                        value={formData.jumlahEksemplar}
                        onChange={(e) => setFormData({ ...formData, jumlahEksemplar: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimasi berat total: {beratTotal}g ({(beratTotal / 1000).toFixed(1)} kg)
                      </p>
                    </div>

                    {/* Ukuran Kertas */}
                    <div>
                      <Label htmlFor="ukuran">Ukuran Kertas *</Label>
                      <Select
                        value={formData.ukuran}
                        onValueChange={(value) => setFormData({ ...formData, ukuran: value })}
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
                        onValueChange={(value) => setFormData({ ...formData, jenisKertas: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih jenis kertas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bookpaper">Bookpaper</SelectItem>
                          <SelectItem value="HVS 70gr">HVS 70gr</SelectItem>
                          <SelectItem value="HVS 80gr">HVS 80gr</SelectItem>
                          <SelectItem value="Art Paper 120gr">Art Paper 120gr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Jenis Jilid */}
                    <div>
                      <Label htmlFor="jilid">Jenis Jilid/Cover *</Label>
                      <Select
                        value={formData.jenisCover}
                        onValueChange={(value) => setFormData({ ...formData, jenisCover: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Pilih jilid" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soft Cover">Soft Cover (+{formatRupiah(BIAYA_JILID_SOFTCOVER)})</SelectItem>
                          <SelectItem value="Hard Cover">Hard Cover (+{formatRupiah(BIAYA_JILID_HARDCOVER)})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <p className="text-sm text-teal-800">
                      <strong>Catatan:</strong> Spesifikasi di atas adalah standar untuk hasil optimal. 
                      Jumlah halaman buku Anda: <strong>{naskah.jumlahHalaman} halaman</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Pengiriman */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#0d7377]" />
                    Informasi Pengiriman
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

                  <div>
                    <Label htmlFor="kurir">Pilih Kurir *</Label>
                    <Select
                      value={formData.kurir}
                      onValueChange={(value) => setFormData({ ...formData, kurir: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih kurir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JNE">JNE - Reguler</SelectItem>
                        <SelectItem value="J&T">J&T Express</SelectItem>
                        <SelectItem value="SiCepat">SiCepat</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimasi ongkir: {formatRupiah(ESTIMASI_ONGKIR)} (akan dikonfirmasi setelah pesanan)
                    </p>
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
                      Ringkasan Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biaya Cetak ({formData.jumlahEksemplar}x)</span>
                        <span className="font-medium">{formatRupiah(biaya.biayaCetak)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimasi Ongkir</span>
                        <span className="font-medium">{formatRupiah(biaya.ongkir)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biaya Layanan (10%)</span>
                        <span className="font-medium">{formatRupiah(biaya.biayaLayanan)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Bayar</span>
                        <span className="text-2xl font-bold text-[#0d7377]">
                          {formatRupiah(biaya.total)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
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
                      Dengan membuat pesanan, Anda menyetujui syarat dan ketentuan yang berlaku
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
