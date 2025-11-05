import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// Instance axios utama
export const api = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Inject Authorization token jika ada
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

// Global error handler (opsional)
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError<any>) => {
    const pesanDefault = "Terjadi kesalahan pada koneksi. Mohon coba lagi.";
    if (error.response) {
      // Respons dari server dengan status error
      const data = error.response.data;
      const pesan = data?.pesan || data?.message || pesanDefault;
      return Promise.reject(new Error(pesan));
    }
    if (error.request) {
      return Promise.reject(new Error("Server tidak merespon. Periksa koneksi Anda."));
    }
    return Promise.reject(new Error(pesanDefault));
  }
);

export default api;
