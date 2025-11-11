import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, Pengguna } from "@/lib/api/auth";

interface AuthState {
  pengguna: Pengguna | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, kataSandi: string) => Promise<void>;
  logout: () => void;
  setPengguna: (p: Pengguna | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      pengguna: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
      async login(email: string, kataSandi: string) {
        set({ loading: true, error: null });
        try {
          const res = await authApi.login({ email, kataSandi });
          const { accessToken, refreshToken, pengguna } = res.data;
          
          console.log("Login response:", { pengguna, peran: pengguna.peran });
          
          // Persist tokens ke localStorage untuk interceptor
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
          }
          set({ accessToken, refreshToken, pengguna, loading: false });
        } catch (err: any) {
          set({ error: err?.message || "Gagal login", loading: false });
          throw err;
        }
      },
      logout() {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        set({ pengguna: null, accessToken: null, refreshToken: null });
      },
      setPengguna(p) {
        set({ pengguna: p });
      },
      setTokens(accessToken: string, refreshToken: string) {
        // Simpan tokens ke state dan localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: "publishify-auth",
      partialize: (state) => ({
        pengguna: state.pengguna,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
