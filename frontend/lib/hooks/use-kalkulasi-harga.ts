"use client";

import { useState, useEffect } from "react";
import { ambilTarifPercetakan } from "@/lib/api/percetakan";
import type { ParameterHarga } from "@/types/tarif";

interface EstimasiHarga {
  biayaKertas: number;
  biayaCover: number;
  biayaJilid: number;
  biayaPerUnit: number;
  totalHarga: number;
  breakdown: {
    label: string;
    nilai: number;
  }[];
}

interface KalkulasiParams {
  idPercetakan?: string;
  formatKertas?: "A4" | "A5" | "B5";
  jenisCover?: "SOFTCOVER" | "HARDCOVER";
  jumlahHalaman?: number;
  jumlahBuku?: number;
}

export function useKalkulasiHarga(params: KalkulasiParams) {
  const [tarif, setTarif] = useState<ParameterHarga | null>(null);
  const [estimasi, setEstimasi] = useState<EstimasiHarga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { idPercetakan, formatKertas, jenisCover, jumlahHalaman = 100, jumlahBuku = 1 } = params;

  // Load tarif percetakan
  useEffect(() => {
    if (!idPercetakan) {
      setTarif(null);
      setEstimasi(null);
      return;
    }

    const loadTarif = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ambilTarifPercetakan(idPercetakan);
        
        if (response.sukses) {
          setTarif(response.data.tarif);
        } else {
          setError("Gagal memuat tarif percetakan");
        }
      } catch (err) {
        console.error("Error load tarif:", err);
        setError("Terjadi kesalahan saat memuat tarif");
      } finally {
        setLoading(false);
      }
    };

    loadTarif();
  }, [idPercetakan]);

  // Kalkulasi estimasi harga
  useEffect(() => {
    if (!tarif || !formatKertas || !jenisCover || !jumlahBuku) {
      setEstimasi(null);
      return;
    }

    // 1. Hitung biaya kertas per lembar
    let hargaKertasPerLembar = 0;
    switch (formatKertas) {
      case "A4":
        hargaKertasPerLembar = tarif.hargaKertasA4;
        break;
      case "A5":
        hargaKertasPerLembar = tarif.hargaKertasA5;
        break;
      case "B5":
        hargaKertasPerLembar = tarif.hargaKertasB5;
        break;
    }

    // 2. Hitung biaya cover per unit
    let hargaCoverPerUnit = 0;
    switch (jenisCover) {
      case "SOFTCOVER":
        hargaCoverPerUnit = tarif.hargaSoftcover;
        break;
      case "HARDCOVER":
        hargaCoverPerUnit = tarif.hargaHardcover;
        break;
    }

    // 3. Biaya jilid
    const hargaJilid = tarif.biayaJilid;

    // 4. Hitung total
    const biayaKertas = hargaKertasPerLembar * jumlahHalaman;
    const biayaCover = hargaCoverPerUnit;
    const biayaJilid = hargaJilid;
    const biayaPerUnit = biayaKertas + biayaCover + biayaJilid;
    const totalHarga = biayaPerUnit * jumlahBuku;

    setEstimasi({
      biayaKertas,
      biayaCover,
      biayaJilid,
      biayaPerUnit,
      totalHarga,
      breakdown: [
        { label: "Kertas", nilai: biayaKertas },
        { label: "Cover", nilai: biayaCover },
        { label: "Jilid", nilai: biayaJilid },
      ],
    });
  }, [tarif, formatKertas, jenisCover, jumlahHalaman, jumlahBuku]);

  return {
    tarif,
    estimasi,
    loading,
    error,
    minimumPesanan: tarif?.minimumPesanan || 1,
  };
}
