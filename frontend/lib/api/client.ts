import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Base API URL dari environment variable
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Axios instance dengan konfigurasi default
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor untuk menambahkan token ke header
 */
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log request untuk debugging (hanya di development)
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor untuk handle error dan refresh token
 */
api.interceptors.response.use(
  (response) => {
    // Log response untuk debugging (hanya di development)
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log error untuk debugging
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      });
      
      // Log full error for debugging
      console.error("Full error object:", error);
    }
    
    const originalRequest = error.config as any;

    // Jika error 401 dan belum retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Coba refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;

          // Simpan token baru
          localStorage.setItem("accessToken", accessToken);

          // Retry request dengan token baru
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Jika refresh token gagal, redirect ke login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Standard response interface
 */
export interface Response<T = any> {
  sukses: boolean;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

/**
 * Helper function: Sanitize query params untuk memastikan tipe data yang benar
 * Prisma strict dengan tipe data, jadi halaman & limit harus number, bukan string
 */
export function sanitizeParams(params?: Record<string, any>): Record<string, any> {
  if (!params) return {};
  
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    
    // Convert numeric fields to number
    if (key === 'halaman' || key === 'limit' || key === 'page' || key === 'take' || key === 'skip') {
      cleaned[key] = Number(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

export default api;
