"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, MapPin, DollarSign } from "lucide-react";
import { ambilDaftarPercetakan } from "@/lib/api/percetakan";
import type { PercetakanDenganTarif } from "@/types/tarif";
import { toast } from "sonner";

interface PilihPercetakanProps {
  onSelect: (percetakan: PercetakanDenganTarif) => void;
  selectedId?: string | null;
}

export function PilihPercetakan({ onSelect, selectedId }: PilihPercetakanProps) {
  const [percetakanList, setPercetakanList] = useState<PercetakanDenganTarif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPercetakan();
  }, []);

  const loadPercetakan = async () => {
    try {
      setLoading(true);
      const response = await ambilDaftarPercetakan();
      
      if (response.sukses) {
        setPercetakanList(response.data);
      } else {
        toast.error("Gagal memuat daftar percetakan");
      }
    } catch (error) {
      console.error("Error load percetakan:", error);
      toast.error("Terjadi kesalahan saat memuat percetakan");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (percetakan: PercetakanDenganTarif) => {
    if (!percetakan.tarifAktif) {
      toast.error("Percetakan ini belum memiliki tarif aktif");
      return;
    }
    onSelect(percetakan);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (percetakanList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">
          Belum ada percetakan yang tersedia
        </p>
        <p className="text-sm text-muted-foreground">
          Silakan hubungi admin untuk informasi lebih lanjut
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pilih Percetakan</h3>
        <Badge variant="outline">{percetakanList.length} Tersedia</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {percetakanList.map((percetakan) => {
          const isSelected = selectedId === percetakan.id;
          const hasTarif = !!percetakan.tarifAktif;

          return (
            <Card
              key={percetakan.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : hasTarif
                  ? "hover:border-primary/50"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => hasTarif && handleSelect(percetakan)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{percetakan.nama}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  {percetakan.tarifAktif && (
                    <Badge variant="secondary" className="ml-2">
                      Min. {percetakan.tarifAktif.minimumPesanan} buku
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Alamat */}
                {(percetakan.alamat || percetakan.kota) && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {percetakan.alamat && `${percetakan.alamat}, `}
                      {percetakan.kota}
                      {percetakan.provinsi && `, ${percetakan.provinsi}`}
                    </span>
                  </div>
                )}

                {/* Info Tarif */}
                {percetakan.tarifAktif ? (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">
                        {percetakan.tarifAktif.namaKombinasi}
                      </span>
                    </div>

                    {percetakan.tarifAktif.deskripsi && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {percetakan.tarifAktif.deskripsi}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Kertas A5</p>
                        <p className="font-semibold">
                          Rp {percetakan.tarifAktif.hargaKertasA5.toLocaleString()}/lembar
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kertas A4</p>
                        <p className="font-semibold">
                          Rp {percetakan.tarifAktif.hargaKertasA4.toLocaleString()}/lembar
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Softcover</p>
                        <p className="font-semibold">
                          Rp {percetakan.tarifAktif.hargaSoftcover.toLocaleString()}/unit
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hardcover</p>
                        <p className="font-semibold">
                          Rp {percetakan.tarifAktif.hargaHardcover.toLocaleString()}/unit
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">Biaya Jilid</p>
                      <p className="font-semibold text-sm">
                        Rp {percetakan.tarifAktif.biayaJilid.toLocaleString()}/unit
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Tarif belum tersedia
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
