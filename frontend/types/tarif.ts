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
  idParameter: string;
  namaKombinasi: string;
  deskripsi?: string;
  formatBuku: 'A4' | 'A5' | 'B5';
  jenisKertas: 'HVS_70gr' | 'HVS_80gr' | 'BOOKPAPER' | 'ART_PAPER';
  jenisCover: 'SOFTCOVER' | 'HARDCOVER';
  hargaPerHalaman: number;
  biayaCover: number;
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
  formatBuku: 'A4' | 'A5' | 'B5';
  jenisKertas: 'HVS_70gr' | 'HVS_80gr' | 'BOOKPAPER' | 'ART_PAPER';
  jenisCover: 'SOFTCOVER' | 'HARDCOVER';
  aktif?: boolean;
}
