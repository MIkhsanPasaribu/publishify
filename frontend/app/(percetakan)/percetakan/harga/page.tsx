"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Settings, TrendingUp } from "lucide-react";
import {
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

  // State untuk form parameter harga dengan info skema
  const [formParameter, setFormParameter] = useState<FormParameterHarga>({
    hargaKertasA4: 0,
    hargaKertasA5: 0,
    hargaKertasB5: 0,
    hargaSoftcover: 0,
    hargaHardcover: 0,
    biayaJilid: 0,
    minimumPesanan: 1,
  });

  // State untuk info skema tarif (hanya nama dan deskripsi)
  const [infoSkema, setInfoSkema] = useState({
    namaSkema: "",
    deskripsi: "",
  });

  // State untuk form kombinasi tarif (tidak digunakan lagi, tapi tetap ada untuk backward compatibility)
  const [formKombinasi, setFormKombinasi] = useState<FormKombinasiTarif>({
    namaKombinasi: "",
    deskripsi: "",
    hargaKertasA4: 0,
    hargaKertasA5: 0,
    hargaKertasB5: 0,
    hargaSoftcover: 0,
    hargaHardcover: 0,
    biayaJilid: 0,
    minimumPesanan: 1,
    aktif: false,
  });

  // Query kombinasi tarif (tidak perlu query parameter harga lagi)
  const { data: kombinasiData, isLoading: loadingKombinasi } = useQuery({
    queryKey: ["kombinasi-tarif"],
    queryFn: ambilSemuaKombinasi,
  });

  // Tidak perlu mutation simpan parameter lagi (langsung buat kombinasi/skema)

  // Mutation buat kombinasi/skema tarif
  const buatKombinasiMutation = useMutation({
    mutationFn: buatKombinasiTarif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kombinasi-tarif"] });
      setIsFormKombinasiOpen(false);
      // Reset form kombinasi (untuk backward compatibility)
      setFormKombinasi({
        namaKombinasi: "",
        deskripsi: "",
        hargaKertasA4: 0,
        hargaKertasA5: 0,
        hargaKertasB5: 0,
        hargaSoftcover: 0,
        hargaHardcover: 0,
        biayaJilid: 0,
        minimumPesanan: 1,
        aktif: false,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal membuat skema tarif");
      throw error;
    },
  });

  // Mutation toggle aktif
  const toggleAktifMutation = useMutation({
    mutationFn: ({ id, aktif }: { id: string; aktif: boolean }) =>
      toggleAktifKombinasi(id, aktif),
    onSuccess: (response) => {
      toast.success(response.pesan || "Status skema tarif berhasil diubah");
      queryClient.invalidateQueries({ queryKey: ["kombinasi-tarif"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal mengubah status skema tarif");
    },
  });

  // Mutation hapus kombinasi
  const hapusKombinasiMutation = useMutation({
    mutationFn: hapusKombinasi,
    onSuccess: (response) => {
      toast.success(response.pesan || "Skema tarif berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["kombinasi-tarif"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal menghapus skema tarif");
    },
  });



  const handleSimpanParameter = async () => {
    // Validasi nama skema
    if (!infoSkema.namaSkema.trim()) {
      toast.error("Nama skema tarif wajib diisi");
      return;
    }

    // Validasi harga komponen
    if (formParameter.hargaKertasA4 <= 0 || formParameter.hargaKertasA5 <= 0) {
      toast.error("Harga kertas A4 dan A5 wajib diisi dengan nilai yang valid");
      return;
    }
    if (formParameter.hargaSoftcover <= 0 || formParameter.hargaHardcover <= 0) {
      toast.error("Harga softcover dan hardcover wajib diisi dengan nilai yang valid");
      return;
    }
    if (formParameter.biayaJilid <= 0) {
      toast.error("Biaya jilid wajib diisi dengan nilai yang valid");
      return;
    }

    // Gabungkan data skema + komponen harga
    const dataSkemaTarif = {
      namaKombinasi: infoSkema.namaSkema,
      deskripsi: infoSkema.deskripsi,
      hargaKertasA4: formParameter.hargaKertasA4,
      hargaKertasA5: formParameter.hargaKertasA5,
      hargaKertasB5: formParameter.hargaKertasB5,
      hargaSoftcover: formParameter.hargaSoftcover,
      hargaHardcover: formParameter.hargaHardcover,
      biayaJilid: formParameter.biayaJilid,
      minimumPesanan: formParameter.minimumPesanan,
      aktif: true,
    };

    try {
      // Buat skema tarif langsung (tidak ada pemisahan parameter dan kombinasi)
      await buatKombinasiMutation.mutateAsync(dataSkemaTarif);

      // Reset form
      setFormParameter({
        hargaKertasA4: 0,
        hargaKertasA5: 0,
        hargaKertasB5: 0,
        hargaSoftcover: 0,
        hargaHardcover: 0,
        biayaJilid: 0,
        minimumPesanan: 1,
      });
      setInfoSkema({
        namaSkema: "",
        deskripsi: "",
      });
      setIsEditingParameter(false);
      
      toast.success("Skema tarif berhasil dibuat dan diaktifkan");
    } catch (error) {
      // Error sudah ditangani oleh mutation
    }
  };

  const handleBuatKombinasi = () => {
    if (!formKombinasi.namaKombinasi) {
      toast.error("Nama skema tarif wajib diisi");
      return;
    }

    buatKombinasiMutation.mutate(formKombinasi);
  };

  const kombinasiList: KombinasiTarif[] = kombinasiData?.data || [];
  const kombinasiAktif = kombinasiList.find((k) => k.aktif);

  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Gradient Header Panel */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">💰</span>
                Kelola Skema Tarif
              </h1>
              <p className="text-sm text-teal-50">
                Buat berbagai skema tarif dengan harga yang berbeda
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Preview atau Form Parameter Harga */}
        <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Komponen Harga Dasar
                </CardTitle>
                <CardDescription>
                  {isEditingParameter 
                  ? "Buat skema tarif baru dengan nama dan harga komponen. Contoh: 'Tarif Standar' dengan harga normal, atau 'Tarif Diskon' dengan harga lebih murah."
                  : "Setiap skema tarif memiliki nama dan komponen harga yang berbeda."
                }
              </CardDescription>
            </div>
            {!isEditingParameter ? (
              <Button
                onClick={() => setIsEditingParameter(true)}
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Buat Skema Tarif Baru
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsEditingParameter(false);
                    // Reset form
                    setFormParameter({
                      hargaKertasA4: 0,
                      hargaKertasA5: 0,
                      hargaKertasB5: 0,
                      hargaSoftcover: 0,
                      hargaHardcover: 0,
                      biayaJilid: 0,
                      minimumPesanan: 1,
                    });
                    setInfoSkema({
                      namaSkema: "",
                      deskripsi: "",
                    });
                  }}
                  variant="outline"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSimpanParameter}
                  disabled={buatKombinasiMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {buatKombinasiMutation.isPending ? "Menyimpan..." : "Simpan & Aktifkan"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditingParameter ? (
            // Info State - Tidak ada form yang terbuka
            <div className="py-12 text-center">
              <Plus className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Siap Membuat Skema Tarif?</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
                Klik tombol "Buat Skema Tarif Baru" di atas untuk memulai.<br />
                Buat berbagai skema dengan harga berbeda, contoh:<br />
                <span className="font-medium">"Tarif Standar"</span> (harga normal) atau <span className="font-medium">"Tarif Diskon"</span> (harga lebih murah).<br />
                <span className="text-xs">Skema yang baru dibuat akan langsung aktif.</span>
              </p>
            </div>
          ) : (
            // Edit Form
            <>
          {/* Informasi Skema Tarif */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <Label htmlFor="namaSkema" className="text-base font-semibold">Nama Skema Tarif *</Label>
              <Input
                id="namaSkema"
                placeholder="Contoh: Tarif Standar, Tarif Diskon, Tarif Premium"
                value={infoSkema.namaSkema}
                onChange={(e) =>
                  setInfoSkema({ ...infoSkema, namaSkema: e.target.value })
                }
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Berikan nama yang jelas untuk membedakan skema tarif (contoh: "Tarif Standar" dengan harga normal, "Tarif Diskon" dengan harga lebih murah)
              </p>
            </div>
          </div>

          <Separator />

          {/* Format Kertas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Format Kertas (per lembar)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hargaA4">Harga Kertas A4</Label>
                <Input
                  id="hargaA4"
                  type="number"
                  placeholder="400"
                  value={formParameter.hargaKertasA4 || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaKertasA4: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Standar: 400 | Diskon: 100</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaA5">Harga Kertas A5</Label>
                <Input
                  id="hargaA5"
                  type="number"
                  placeholder="250"
                  value={formParameter.hargaKertasA5 || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaKertasA5: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Standar: 250 | Diskon: 50</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaB5">Harga Kertas B5 (opsional)</Label>
                <Input
                  id="hargaB5"
                  type="number"
                  placeholder="200"
                  value={formParameter.hargaKertasB5 || ""}
                  onChange={(e) =>
                    setFormParameter({ ...formParameter, hargaKertasB5: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">Standar: 200 | Diskon: 75</p>
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
              Skema Tarif Aktif
            </CardTitle>
            <CardDescription>
              Skema ini digunakan untuk perhitungan biaya pesanan cetak saat ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Skema</p>
                <p className="text-xl font-bold">{kombinasiAktif.namaKombinasi}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Kertas A4</p>
                  <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.hargaKertasA4))}/lembar</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Kertas A5</p>
                  <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.hargaKertasA5))}/lembar</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Softcover</p>
                  <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.hargaSoftcover))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Hardcover</p>
                  <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.hargaHardcover))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Biaya Jilid</p>
                  <p className="font-semibold">{formatRupiah(Number(kombinasiAktif.biayaJilid))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Minimum Pesanan</p>
                  <p className="font-semibold">{kombinasiAktif.minimumPesanan} buku</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daftar Skema Tarif */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Skema Tarif</CardTitle>
              <CardDescription>
                Daftar semua skema tarif yang pernah dibuat. Klik toggle untuk mengaktifkan skema tertentu.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form kombinasi manual sudah tidak diperlukan - skema dibuat dari form utama di atas */}

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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm pt-2 mt-3 border-t pt-3">
                          <div>
                            <p className="text-muted-foreground text-xs">Kertas A4</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.hargaKertasA4))}/lembar
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Kertas A5</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.hargaKertasA5))}/lembar
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Softcover</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.hargaSoftcover))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Hardcover</p>
                            <p className="font-medium">
                              {formatRupiah(Number(kombinasi.hargaHardcover))}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Biaya Jilid</p>
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
    </div>
  );
}
