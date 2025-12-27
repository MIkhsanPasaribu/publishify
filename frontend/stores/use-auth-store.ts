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
          
          console.log("✅ Login response:", {
            email: pengguna.email,
            peran: pengguna.peran,
            accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : "null",
          });
          
          // Persist tokens ke localStorage untuk interceptor
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            
            // PENTING: Set cookie untuk middleware Next.js
            const isSecure = window.location.protocol === 'https:';
            const secureFlag = isSecure ? 'Secure; ' : '';
            
            document.cookie = `token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; ${secureFlag}`;
            document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; ${secureFlag}`;
            
            console.log("💾 Token disimpan ke localStorage dan cookie", {
              cookieSet: document.cookie.includes('token='),
            });
          }
          
          set({ accessToken, refreshToken, pengguna, loading: false });
          console.log("📝 State updated di Zustand");
        } catch (err: any) {
          console.error("❌ Login error di store:", err);
          set({ error: err?.message || "Gagal login", loading: false });
          throw err;
        }
      },
      logout() {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          
          // Hapus cookies juga
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
          
          // Set cookie untuk middleware
          const isSecure = window.location.protocol === 'https:';
          const secureFlag = isSecure ? 'Secure; ' : '';
          
          document.cookie = `token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; ${secureFlag}`;
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; ${secureFlag}`;
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
