// Types untuk sistem tarif fleksibel baru

export interface ParameterHarga {
  id: string;
  idPercetakan: string;
  hargaKertasA4: number;
  hargaKertasA5: number;
  hargaKertasB5: number;
  hargaSoftcover: number;
  hargaHardcover: number;
  biayaJilid: number;
  minimumPesanan: number;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface KombinasiTarif {
  id: string;
  idPercetakan: string;
  namaKombinasi: string;
  deskripsi?: string;
  hargaKertasA4: number;
  hargaKertasA5: number;
  hargaKertasB5?: number;
  hargaSoftcover: number;
  hargaHardcover: number;
  biayaJilid: number;
  minimumPesanan: number;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface FormParameterHarga {
  hargaKertasA4: number;
  hargaKertasA5: number;
  hargaKertasB5?: number;
  hargaSoftcover: number;
  hargaHardcover: number;
  biayaJilid: number;
  minimumPesanan: number;
}

export interface FormKombinasiTarif {
  namaKombinasi: string;
  deskripsi?: string;
  hargaKertasA4: number;
  hargaKertasA5: number;
  hargaKertasB5?: number;
  hargaSoftcover: number;
  hargaHardcover: number;
  biayaJilid: number;
  minimumPesanan: number;
  aktif?: boolean;
}
