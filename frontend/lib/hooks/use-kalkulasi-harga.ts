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

    // 1. Hitung biaya kertas per lembar (convert ke number untuk safety)
    let hargaKertasPerLembar = 0;
    switch (formatKertas) {
      case "A4":
        hargaKertasPerLembar = Number(tarif.hargaKertasA4) || 0;
        break;
      case "A5":
        hargaKertasPerLembar = Number(tarif.hargaKertasA5) || 0;
        break;
      case "B5":
        hargaKertasPerLembar = Number(tarif.hargaKertasB5) || 0;
        break;
    }

    // 2. Hitung biaya cover per unit (convert ke number untuk safety)
    let hargaCoverPerUnit = 0;
    switch (jenisCover) {
      case "SOFTCOVER":
        hargaCoverPerUnit = Number(tarif.hargaSoftcover) || 0;
        break;
      case "HARDCOVER":
        hargaCoverPerUnit = Number(tarif.hargaHardcover) || 0;
        break;
    }

    // 3. Biaya jilid (convert ke number untuk safety)
    const hargaJilid = Number(tarif.biayaJilid) || 0;

    // 4. Hitung total per unit
    const biayaKertasPerUnit = hargaKertasPerLembar * jumlahHalaman;
    const biayaCoverPerUnit = hargaCoverPerUnit;
    const biayaJilidPerUnit = hargaJilid;
    const biayaPerUnit = biayaKertasPerUnit + biayaCoverPerUnit + biayaJilidPerUnit;
    
    // 5. Hitung total untuk semua buku
    const totalBiayaKertas = biayaKertasPerUnit * jumlahBuku;
    const totalBiayaCover = biayaCoverPerUnit * jumlahBuku;
    const totalBiayaJilid = biayaJilidPerUnit * jumlahBuku;
    const totalHarga = biayaPerUnit * jumlahBuku;

    setEstimasi({
      biayaKertas: totalBiayaKertas,
      biayaCover: totalBiayaCover,
      biayaJilid: totalBiayaJilid,
      biayaPerUnit,
      totalHarga,
      breakdown: [
        { label: `Kertas (${jumlahHalaman} hal × ${jumlahBuku} buku)`, nilai: totalBiayaKertas },
        { label: `Cover (${jumlahBuku} buku)`, nilai: totalBiayaCover },
        { label: `Jilid (${jumlahBuku} buku)`, nilai: totalBiayaJilid },
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
