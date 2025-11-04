import api from "./client";

// Tipe response standar backend
export interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
}

export interface ResponseError {
  sukses: false;
  pesan: string;
  error: {
    kode: string;
    detail?: string;
    field?: string;
    timestamp: string;
  };
}

export interface Pengguna {
  id: string;
  email: string;
  telepon?: string;
  aktif: boolean;
  terverifikasi: boolean;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
    namaTampilan?: string;
    urlAvatar?: string;
  };
}

export interface LoginPayload {
  email: string;
  kataSandi: string;
}

export interface RegisterPayload {
  email: string;
  kataSandi: string;
  konfirmasiKataSandi: string;
  telepon?: string;
  namaDepan: string;
  namaBelakang?: string;
  jenisPeran?: 'penulis' | 'editor' | 'percetakan';
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  pengguna: Pengguna;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<ResponseSukses<Pengguna>> {
    const { data } = await api.post<ResponseSukses<Pengguna>>("/auth/daftar", payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<ResponseSukses<LoginResult>> {
    const { data } = await api.post<ResponseSukses<LoginResult>>("/auth/login", payload);
    return data;
  },

  async refresh(refreshToken: string): Promise<ResponseSukses<{ accessToken: string }>> {
    const { data } = await api.post<ResponseSukses<{ accessToken: string }>>("/auth/refresh", { refreshToken });
    return data;
  },
};
