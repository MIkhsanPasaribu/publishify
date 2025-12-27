// Types untuk sistem tarif fleksibel baru

export interface ParameterHarga {
  id: string;
  idPercetakan: string;
  namaKombinasi: string;
  deskripsi?: string | null;
  hargaKertasA4: number;
  hargaKertasA5: number;
  hargaKertasB5: number;
  hargaSoftcover: number;
  hargaHardcover: number;
  biayaJilid: number;
  minimumPesanan: number;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

// Untuk response dari GET /percetakan/daftar
export interface PercetakanDenganTarif {
  id: string;
  email: string;
  nama: string;
  alamat?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  tarifAktif: ParameterHarga | null;
}

// Untuk response dari GET /percetakan/tarif/:id
export interface DetailTarifPercetakan {
  percetakan: {
    id: string;
    nama: string;
  };
  tarif: ParameterHarga;
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
