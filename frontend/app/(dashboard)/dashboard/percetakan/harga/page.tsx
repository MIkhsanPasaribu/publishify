"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Settings, TrendingUp } from "lucide-react";
import {
  simpanParameterHarga,
  ambilParameterHarga,
  ambilSemuaKombinasi,
  buatKombinasiTarif,
  toggleAktifKombinasi,
  hapusKombinasi,
} from "@/lib/api/percetakan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import type { FormParameterHarga, FormKombinasiTarif, KombinasiTarif } from "@/types/tarif";

export default function KelolaHargaPage() {
  const queryClient = useQueryClient();
  const [isFormKombinasiOpen, setIsFormKombinasiOpen] = useState(false);
  const [isEditingParameter, setIsEditingParameter] = useState(false);

  // State untuk form parameter harga
  const [formParameter, setFormParameter] = useState<FormParameterHarga>({
    hargaKertasA4: 0,
    hargaKertasA5: 0,
    hargaKertasB5: 0,
    hargaSoftcover: 0,
    hargaHardcover: 0,
    biayaJilid: 0,
    minimumPesanan: 1,
  });

  // State untuk form kombinasi tarif
  const [formKombinasi, setFormKombinasi] = useState<FormKombinasiTarif>({
    namaKombinasi: "",
    deskripsi: "",
    formatBuku: "A5",
    jenisKertas: "HVS_80gr",
    jenisCover: "SOFTCOVER",
    aktif: false,
  });

  // Query parameter harga
  const { data: parameterData, isLoading: loadingParameter } = useQuery({
    queryKey: ["parameter-harga"],
    queryFn: ambilParameterHarga,
  });

  // Query kombinasi tarif
  const { data: kombinasiData, isLoading: loadingKombinasi } = useQuery({
    queryKey: ["kombinasi-tarif"],
    queryFn: ambilSemuaKombinasi,
  });

  // Mutation simpan parameter
  const simpanParameterMutation = useMutation({
    mutationFn: simpanParameterHarga,
    onSuccess: (response) => {
      toast.success(response.pesan || "Parameter harga berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["parameter-harga"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal menyimpan parameter harga");
    },
  });

  // Mutation buat kombinasi
  const buatKombinasiMutation = useMutation({
    mutationFn: buatKombinasiTarif,
    onSuccess: (response) => {
      toast.success(response.pesan || "Kombinasi tarif berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["kombinasi-tarif"] });
      setIsFormKombinasiOpen(false);
      setFormKombinasi({
        namaKombinasi: "",
        deskripsi: "",
        formatBuku: "A5",
        jenisKertas: "HVS_80gr",
        jenisCover: "SOFTCOVER",
        aktif: false,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal membuat kombinasi tarif");
    },
  });

  // Mutation toggle aktif
  const toggleAktifMutation = useMutation({
    mutationFn: ({ id, aktif }: { id: string; aktif: boolean }) =>
      toggleAktifKombinasi(id, aktif),
    onSuccess: (response) => {
      toast.success(response.pesan || "Status kombinasi berhasil diubah");
      queryClient.invalidateQueries({ queryKey: ["kombinasi-tarif"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal mengubah status kombinasi");
    },
  });

  // Mutation hapus kombinasi
  const hapusKombinasiMutation = useMutation({
    mutationFn: hapusKombinasi,
    onSuccess: (response) => {
      toast.success(response.pesan || "Kombinasi tarif berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["kombinasi-tarif"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal menghapus kombinasi tarif");
    },
  });

  // Load parameter harga ke form saat data tersedia
  useState(() => {
    if (parameterData?.data) {
      setFormParameter({
        hargaKertasA4: Number(parameterData.data.hargaKertasA4),
        hargaKertasA5: Number(parameterData.data.hargaKertasA5),
        hargaKertasB5: Number(parameterData.data.hargaKertasB5),
        hargaSoftcover: Number(parameterData.data.hargaSoftcover),
        hargaHardcover: Number(parameterData.data.hargaHardcover),
        biayaJilid: Number(parameterData.data.biayaJilid),
        minimumPesanan: parameterData.data.minimumPesanan,
      });
    }
  });

  const handleSimpanParameter = () => {
    if (formParameter.hargaKertasA4 <= 0 || formParameter.hargaKertasA5 <= 0) {
      toast.error("Harga kertas A4 dan A5 harus diisi");
      return;
    }
    if (formParameter.hargaSoftcover <= 0 || formParameter.hargaHardcover <= 0) {
      toast.error("Harga softcover dan hardcover harus diisi");
      return;
    }
    if (formParameter.biayaJilid <= 0) {
      toast.error("Biaya jilid harus diisi");
      return;
    }

    simpanParameterMutation.mutate(formParameter);
    setIsEditingParameter(false);
  };

  const handleBuatKombinasi = () => {
    if (!formKombinasi.namaKombinasi) {
      toast.error("Nama kombinasi harus diisi");
      return;
    }

    buatKombinasiMutation.mutate(formKombinasi);
  };

  const kombinasiList: KombinasiTarif[] = kombinasiData?.data || [];
  const kombinasiAktif = kombinasiList.find((k) => k.aktif);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kelola Harga Cetak</h1>
        <p className="text-muted-foreground">
          Atur parameter harga dan buat kombinasi tarif untuk pesanan cetak buku
        </p>
      </div>

      {/* Preview atau Form Parameter Harga */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Parameter Harga Komponen
              </CardTitle>
              <CardDescription>
                {isEditingParameter 
                  ? "Tentukan harga per komponen. Kombinasi tarif akan menggunakan harga ini."
                  : "Harga dasar untuk setiap komponen cetak buku"
                }
              </CardDescription>
            </div>
            {!isEditingParameter ? (
              <Button
                onClick={() => setIsEditingParameter(true)}
                variant={parameterData?.data ? "outline" : "default"}
              >
                <Settings className="mr-2 h-4 w-4" />
                {parameterData?.data ? "Edit Parameter" : "Atur Parameter Harga"}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditingParameter(false)}
                  variant="outline"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSimpanParameter}
                  disabled={simpanParameterMutation.isPending || loadingParameter}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {simpanParameterMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditingParameter && parameterData?.data ? (
            // Preview Mode - Read Only
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Format Kertas (per lembar)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground">Kertas A4</Label>
                    <p className="text-2xl font-bold">
                      {formatRupiah(Number(parameterData.data.hargaKertasA4))}
                    </p>
                    <p className="text-xs text-muted-foreground">per lembar</p>
                  </div>
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground">Kertas A5</Label>
                    <p className="text-2xl font-bold">
                      {formatRupiah(Number(parameterData.data.hargaKertasA5))}
                    </p>
                    <p className="text-xs text-muted-foreground">per lembar</p>
                  </div>
                  {parameterData.data.hargaKertasB5 && (
                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                      <Label className="text-muted-foreground">Kertas B5</Label>
                      <p className="text-2xl font-bold">
                        {formatRupiah(Number(parameterData.data.hargaKertasB5))}
                      </p>
                      <p className="text-xs text-muted-foreground">per lembar</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Jenis Cover (per unit)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground">Softcover</Label>
                    <p className="text-2xl font-bold">
                      {formatRupiah(Number(parameterData.data.hargaSoftcover))}
                    </p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground">Hardcover</Label>
                    <p className="text-2xl font-bold">
                      {formatRupiah(Number(parameterData.data.hargaHardcover))}
                    </p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Biaya Tambahan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground">Biaya Jilid</Label>
                    <p className="text-2xl font-bold">
                      {formatRupiah(Number(parameterData.data.biayaJilid))}
                    </p>
                    <p className="text-xs text-muted-foreground">per buku</p>
                  </div>
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground">Minimum Pesanan</Label>
                    <p className="text-2xl font-bold">
                      {parameterData.data.minimumPesanan} buku
                    </p>
                    <p className="text-xs text-muted-foreground">minimal order</p>
                  </div>
                </div>
              </div>
            </div>
          ) : !isEditingParameter && !parameterData?.data ? (
            // Empty State
            <div className="py-12 text-center">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Belum Ada Parameter Harga</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Atur parameter harga terlebih dahulu untuk mulai membuat kombinasi tarif
              </p>
              <Button
                onClick={() => setIsEditingParameter(true)}
                className="mt-6"
              >
                <Settings className="mr-2 h-4 w-4" />
                Atur Parameter Harga
              </Button>
            </div>
          ) : (
            // Edit Form
            <>
          {/* Format Kertas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Format Kertas (per lembar)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hargaA4">Harga Kertas A4</Label>
                <Input
                  id="hargaA4"
                  type="number"
                  placeholder="150"
                  value={formParameter.hargaKertasA4 || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaKertasA4: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Contoh: Rp 150/lembar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaA5">Harga Kertas A5</Label>
                <Input
                  id="hargaA5"
                  type="number"
                  placeholder="100"
                  value={formParameter.hargaKertasA5 || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaKertasA5: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Contoh: Rp 100/lembar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaB5">Harga Kertas B5 (opsional)</Label>
                <Input
                  id="hargaB5"
                  type="number"
                  placeholder="125"
                  value={formParameter.hargaKertasB5 || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaKertasB5: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Contoh: Rp 125/lembar</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Jenis Cover */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Jenis Cover (per unit)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hargaSoftcover">Harga Softcover</Label>
                <Input
                  id="hargaSoftcover"
                  type="number"
                  placeholder="5000"
                  value={formParameter.hargaSoftcover || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaSoftcover: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Contoh: Rp 5.000/buku</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaHardcover">Harga Hardcover</Label>
                <Input
                  id="hargaHardcover"
                  type="number"
                  placeholder="15000"
                  value={formParameter.hargaHardcover || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaHardcover: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Contoh: Rp 15.000/buku</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Jilid & Minimal Order */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Biaya Tambahan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="biayaJilid">Biaya Jilid</Label>
                <Input
                  id="biayaJilid"
                  type="number"
                  placeholder="7000"
                  value={formParameter.biayaJilid || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, biayaJilid: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Contoh: Rp 7.000/buku</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumPesanan">Minimum Pesanan</Label>
                <Input
                  id="minimumPesanan"
                  type="number"
                  placeholder="10"
                  min="1"
                  value={formParameter.minimumPesanan || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, minimumPesanan: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Minimum jumlah buku per pesanan</p>
              </div>
            </div>
          </div>
          </>
          )}
        </CardContent>
      </Card>

      {/* Kombinasi Tarif Aktif */}
      {kombinasiAktif && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Kombinasi Tarif Aktif
            </CardTitle>
            <CardDescription>
              Kombinasi ini digunakan untuk kalkulasi harga pesanan baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Kombinasi</p>
                <p className="font-semibold">{kombinasiAktif.namaKombinasi}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spesifikasi</p>
                <p className="font-semibold">
                  {kombinasiAktif.formatBuku} · {kombinasiAktif.jenisKertas} · {kombinasiAktif.jenisCover}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga per Halaman</p>
                <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.hargaPerHalaman))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Biaya Cover</p>
                <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.biayaCover))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daftar Kombinasi Tarif */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kombinasi Tarif</CardTitle>
              <CardDescription>
                Buat berbagai kombinasi harga. Hanya 1 kombinasi yang dapat diaktifkan.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsFormKombinasiOpen(!isFormKombinasiOpen)}
              disabled={!parameterData?.data}
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Kombinasi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!parameterData?.data && (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Silakan atur parameter harga terlebih dahulu</p>
            </div>
          )}

          {/* Form Buat Kombinasi */}
          {isFormKombinasiOpen && parameterData?.data && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Buat Kombinasi Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="namaKombinasi">Nama Kombinasi *</Label>
                    <Input
                      id="namaKombinasi"
                      placeholder="Contoh: Harga Normal, Promo Desember"
                      value={formKombinasi.namaKombinasi}
                      onChange={(e) =>
                        setFormKombinasi({ ...formKombinasi, namaKombinasi: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formatBuku">Format Buku *</Label>
                    <Select
                      value={formKombinasi.formatBuku}
                      onValueChange={(value: any) =>
                        setFormKombinasi({ ...formKombinasi, formatBuku: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (21 × 29.7 cm)</SelectItem>
                        <SelectItem value="A5">A5 (14.8 × 21 cm)</SelectItem>
                        <SelectItem value="B5">B5 (17.6 × 25 cm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenisKertas">Jenis Kertas *</Label>
                    <Select
                      value={formKombinasi.jenisKertas}
                      onValueChange={(value: any) =>
                        setFormKombinasi({ ...formKombinasi, jenisKertas: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HVS_70gr">HVS 70gr</SelectItem>
                        <SelectItem value="HVS_80gr">HVS 80gr</SelectItem>
                        <SelectItem value="BOOKPAPER">Bookpaper</SelectItem>
                        <SelectItem value="ART_PAPER">Art Paper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenisCover">Jenis Cover *</Label>
                    <Select
                      value={formKombinasi.jenisCover}
                      onValueChange={(value: any) =>
                        setFormKombinasi({ ...formKombinasi, jenisCover: value })
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
                    <Textarea
                      id="deskripsi"
                      placeholder="Contoh: Tarif standar untuk pesanan reguler"
                      value={formKombinasi.deskripsi}
                      onChange={(e) =>
                        setFormKombinasi({ ...formKombinasi, deskripsi: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Switch
                      id="aktif"
                      checked={formKombinasi.aktif}
                      onCheckedChange={(checked: boolean) =>
                        setFormKombinasi({ ...formKombinasi, aktif: checked })
                      }
                    />
                    <Label htmlFor="aktif">Aktifkan kombinasi ini setelah dibuat</Label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsFormKombinasiOpen(false)}
                    disabled={buatKombinasiMutation.isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleBuatKombinasi}
                    disabled={buatKombinasiMutation.isPending}
                  >
                    {buatKombinasiMutation.isPending ? "Membuat..." : "Buat Kombinasi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List Kombinasi */}
          <div className="space-y-3">
            {loadingKombinasi ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat kombinasi tarif...</p>
              </div>
            ) : kombinasiList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Belum ada kombinasi tarif. Buat kombinasi pertama Anda!</p>
              </div>
            ) : (
              kombinasiList.map((kombinasi) => (
                <Card key={kombinasi.id} className={kombinasi.aktif ? "border-green-500" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{kombinasi.namaKombinasi}</h4>
                          {kombinasi.aktif && (
                            <Badge variant="default" className="bg-green-600">
                              Aktif
                            </Badge>
                          )}
                        </div>
                        {kombinasi.deskripsi && (
                          <p className="text-sm text-muted-foreground">{kombinasi.deskripsi}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline">{kombinasi.formatBuku}</Badge>
                          <Badge variant="outline">{kombinasi.jenisKertas}</Badge>
                          <Badge variant="outline">{kombinasi.jenisCover}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm pt-2">
                          <div>
                            <p className="text-muted-foreground">Per Halaman</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.hargaPerHalaman))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cover</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.biayaCover))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Jilid</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.biayaJilid))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min. Order</p>
                            <p className="font-medium">{kombinasi.minimumPesanan} buku</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={kombinasi.aktif}
                            onCheckedChange={(checked: boolean) =>
                              toggleAktifMutation.mutate({ id: kombinasi.id, aktif: checked })
                            }
                            disabled={toggleAktifMutation.isPending}
                          />
                          <Label className="text-sm">
                            {kombinasi.aktif ? "Aktif" : "Nonaktif"}
                          </Label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Hapus kombinasi ini?")) {
                              hapusKombinasiMutation.mutate(kombinasi.id);
                            }
                          }}
                          disabled={hapusKombinasiMutation.isPending || kombinasi.aktif}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
