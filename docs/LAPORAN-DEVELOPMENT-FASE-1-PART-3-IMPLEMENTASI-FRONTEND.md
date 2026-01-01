# LAPORAN DEVELOPMENT STEP BY STEP SISTEM PUBLISHIFY

# FASE 1: PART 3 - IMPLEMENTASI FRONTEND

**Dokumen**: Part 3 dari 4  
**Fokus**: Tutorial Implementasi Frontend Step by Step  
**Tech Stack**: Next.js 14+ (App Router) + React 19+ + shadcn/ui + TypeScript

---

## D. IMPLEMENTASI FRONTEND (LANJUTAN)

Bagian ini mendokumentasikan implementasi frontend yang terintegrasi dengan backend yang telah kami bangun di Part 2.

### D.6 Setup Project Frontend

#### D.6.1 Inisialisasi Next.js dengan App Router

💻 **Create Next.js Project:**

```bash
# Kembali ke root project
cd ..

# Create Next.js app dengan App Router
bunx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigasi ke folder frontend
cd frontend
```

**Configuration Prompts:**

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No (@/* default)
```

Struktur yang terbentuk:

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   └── (empty, akan kita isi)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

#### D.6.2 Instalasi Dependencies Frontend

💻 **Install Core Dependencies:**

```bash
# UI Library (shadcn/ui dependencies)
bun add class-variance-authority clsx tailwind-merge
bun add @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot \
  @radix-ui/react-toast @radix-ui/react-avatar

# State Management
bun add zustand @tanstack/react-query

# Form Handling
bun add react-hook-form @hookform/resolvers zod

# HTTP Client
bun add axios

# Real-time Communication
bun add socket.io-client

# Utilities
bun add date-fns lucide-react sonner

# Rich Text Editor (untuk naskah editor)
bun add @tiptap/react @tiptap/starter-kit

# File Upload
bun add react-dropzone

# Charts (untuk dashboard analytics)
bun add recharts
```

💻 **Install Dev Dependencies:**

```bash
bun add -d @types/node typescript eslint prettier \
  eslint-config-prettier prettier-plugin-tailwindcss
```

#### D.6.3 Setup shadcn/ui

shadcn/ui adalah component library yang kami pilih karena:

- Fully customizable (copy-paste components, bukan npm package)
- Built dengan Radix UI primitives (accessible by default)
- Tailwind CSS based (consistent styling)
- TypeScript native

💻 **Initialize shadcn/ui:**

```bash
bunx shadcn-ui@latest init
```

**Configuration:**

```
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? › Yes
```

Ini akan membuat:

- `components.json` → shadcn/ui configuration
- `src/components/ui/` → Folder untuk UI components
- Updated `tailwind.config.ts` dengan shadcn theme

💻 **Install Essential Components:**

```bash
# Button, Input, Label (form basics)
bunx shadcn-ui@latest add button input label

# Card components
bunx shadcn-ui@latest add card

# Dialog (modal)
bunx shadcn-ui@latest add dialog

# Dropdown Menu
bunx shadcn-ui@latest add dropdown-menu

# Form components
bunx shadcn-ui@latest add form

# Toast (notifications)
bunx shadcn-ui@latest add toast

# Avatar
bunx shadcn-ui@latest add avatar

# Badge
bunx shadcn-ui@latest add badge

# Select
bunx shadcn-ui@latest add select

# Tabs
bunx shadcn-ui@latest add tabs

# Table (untuk data display)
bunx shadcn-ui@latest add table

# Skeleton (loading states)
bunx shadcn-ui@latest add skeleton
```

> 📁 **Components**: Semua components tersimpan di `src/components/ui/`

### D.7 Konfigurasi Environment dan API Client

#### D.7.1 Environment Variables

> 📁 **File**: `frontend/.env.local`

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=http://localhost:4000

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[YOUR-GOOGLE-CLIENT-ID]

# Application
NEXT_PUBLIC_APP_NAME=Publishify
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### D.7.2 Create API Client

> 📁 **File**: `frontend/src/lib/api/client.ts`

```typescript
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor untuk attach token
apiClient.interceptors.request.use(
  (config) => {
    // Get token dari localStorage atau Zustand store
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return data langsung
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);

        // Retry original request dengan token baru
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh gagal, redirect ke login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**Key Features:**

- Auto-attach JWT token ke setiap request
- Auto-refresh expired tokens
- Auto-redirect ke login jika refresh gagal
- Centralized error handling

#### D.7.3 API Modules

> 📁 **File**: `frontend/src/lib/api/auth.ts`

```typescript
import apiClient from "./client";

export interface RegisterData {
  email: string;
  kataSandi: string;
  konfirmasiKataSandi: string;
  namaDepan?: string;
  namaBelakang?: string;
  telepon?: string;
}

export interface LoginData {
  email: string;
  kataSandi: string;
}

export const authApi = {
  register: (data: RegisterData) => apiClient.post("/auth/register", data),

  login: (data: LoginData) => apiClient.post("/auth/login", data),

  logout: () => apiClient.post("/auth/logout"),

  refreshToken: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),

  googleAuth: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },
};
```

> 📁 **File**: `frontend/src/lib/api/pengguna.ts`

```typescript
import apiClient from "./client";

export const penggunaApi = {
  getProfil: () => apiClient.get("/pengguna/profil"),

  updateProfil: (data: any) => apiClient.put("/pengguna/profil", data),

  getPenulisProfile: (id: string) => apiClient.get(`/pengguna/penulis/${id}`),

  updatePenulisProfile: (data: any) =>
    apiClient.put("/pengguna/penulis/profil", data),
};
```

### D.8 Setup State Management

#### D.8.1 Zustand Store untuk Authentication

> 📁 **File**: `frontend/src/stores/use-auth-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Pengguna {
  id: string;
  email: string;
  roles: string[];
  profil: {
    namaDepan?: string;
    namaBelakang?: string;
    urlAvatar?: string;
  };
}

interface AuthState {
  pengguna: Pengguna | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (data: {
    pengguna: Pengguna;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
  updatePengguna: (pengguna: Partial<Pengguna>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      pengguna: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (data) => {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        set({
          pengguna: data.pengguna,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          pengguna: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updatePengguna: (updatedData) =>
        set((state) => ({
          pengguna: state.pengguna
            ? { ...state.pengguna, ...updatedData }
            : null,
        })),

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        set({ accessToken, refreshToken });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        // Hanya persist data user, bukan tokens (tokens di localStorage terpisah)
        pengguna: state.pengguna,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### D.8.2 React Query Provider

> 📁 **File**: `frontend/src/components/providers/react-query-provider.tsx`

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 menit
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### D.9 Implementasi Authentication Pages

#### D.9.1 Login Page

> 📁 **File**: `frontend/src/app/(auth)/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/use-auth-store";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  kataSandi: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      kataSandi: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(data);

      // Login ke Zustand store
      login(response.data);

      toast.success("Login berhasil!");

      // Redirect berdasarkan role
      const roles = response.data.pengguna.roles;
      if (roles.includes("admin")) {
        router.push("/dashboard/admin");
      } else if (roles.includes("editor")) {
        router.push("/dashboard/editor");
      } else if (roles.includes("percetakan")) {
        router.push("/dashboard/percetakan");
      } else {
        router.push("/dashboard/penulis");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.pesan || "Login gagal. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authApi.googleAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Masuk ke Publishify
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Masukkan email dan kata sandi Anda untuk melanjutkan
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                {...form.register("email")}
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="kataSandi">Kata Sandi</Label>
                <Link
                  href="/lupa-password"
                  className="text-sm text-primary hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="kataSandi"
                type="password"
                placeholder="••••••••"
                {...form.register("kataSandi")}
                disabled={isLoading}
              />
              {form.formState.errors.kataSandi && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.kataSandi.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              {/* Google Icon SVG */}
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

> 📸 **Screenshot**: `docs/screenshots/development/login-page-ui.png`

#### D.9.2 Register Page

Implementasi register page serupa dengan login, dengan form fields tambahan untuk nama, telepon, dll.

> 📁 **File**: `frontend/src/app/(auth)/register/page.tsx`

Register form menggunakan validation schema yang lebih complex dengan konfirmasi password matching.

### D.10 Implementasi Dashboard Layouts

#### D.10.1 Dashboard Layout dengan Sidebar

> 📁 **File**: `frontend/src/app/(dashboard)/layout.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect jika belum login
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Atau loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

#### D.10.2 Sidebar Navigation Component

> 📁 **File**: `frontend/src/components/layouts/sidebar.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  BookOpen,
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  Printer,
  Package,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { pengguna } = useAuthStore();

  // Determine navigation based on roles
  const navItems = getNavItems(pengguna?.roles || []);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <BookOpen className="h-8 w-8 text-primary mr-2" />
        <span className="text-xl font-bold">Publishify</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info (bottom) */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {pengguna?.profil?.namaDepan?.[0] || "U"}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {pengguna?.profil?.namaDepan} {pengguna?.profil?.namaBelakang}
            </p>
            <p className="text-xs text-gray-500">{pengguna?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNavItems(roles: string[]) {
  const isPenulis = roles.includes("penulis");
  const isEditor = roles.includes("editor");
  const isPercetakan = roles.includes("percetakan");
  const isAdmin = roles.includes("admin");

  const items = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["penulis", "editor", "percetakan", "admin"],
    },
  ];

  if (isPenulis) {
    items.push(
      {
        label: "Naskah Saya",
        href: "/dashboard/penulis/naskah",
        icon: FileText,
        roles: ["penulis"],
      },
      {
        label: "Buat Naskah",
        href: "/dashboard/penulis/naskah/baru",
        icon: BookOpen,
        roles: ["penulis"],
      }
    );
  }

  if (isEditor) {
    items.push(
      {
        label: "Naskah Masuk",
        href: "/dashboard/editor/naskah",
        icon: FileText,
        roles: ["editor"],
      },
      {
        label: "Review Saya",
        href: "/dashboard/editor/review",
        icon: BookOpen,
        roles: ["editor"],
      }
    );
  }

  if (isPercetakan) {
    items.push(
      {
        label: "Pesanan Masuk",
        href: "/dashboard/percetakan/pesanan",
        icon: Package,
        roles: ["percetakan"],
      },
      {
        label: "Produksi",
        href: "/dashboard/percetakan/produksi",
        icon: Printer,
        roles: ["percetakan"],
      }
    );
  }

  if (isAdmin) {
    items.push(
      {
        label: "Kelola Pengguna",
        href: "/dashboard/admin/pengguna",
        icon: Users,
        roles: ["admin"],
      },
      {
        label: "Kelola Naskah",
        href: "/dashboard/admin/naskah",
        icon: FileText,
        roles: ["admin"],
      },
      {
        label: "Pengaturan",
        href: "/dashboard/admin/pengaturan",
        icon: Settings,
        roles: ["admin"],
      }
    );
  }

  // Filter items berdasarkan role user
  return items.filter((item) =>
    item.roles.some((role) => roles.includes(role))
  );
}
```

### D.11 Implementasi Custom Hooks

#### D.11.1 useAuth Hook

> 📁 **File**: `frontend/src/hooks/use-auth.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/use-auth-store";
import { penggunaApi } from "@/lib/api/pengguna";

export function useAuth() {
  const { pengguna, isAuthenticated, logout } = useAuthStore();

  // Fetch fresh user data on mount
  const { data, isLoading } = useQuery({
    queryKey: ["pengguna", "profil"],
    queryFn: () => penggunaApi.getProfil(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    pengguna: data?.data || pengguna,
    isAuthenticated,
    isLoading,
    logout,
  };
}
```

#### D.11.2 useProtectedRoute Hook

> 📁 **File**: `frontend/src/hooks/use-protected-route.ts`

```typescript
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";

export function useProtectedRoute(requiredRoles?: string[]) {
  const router = useRouter();
  const { isAuthenticated, pengguna } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requiredRoles && pengguna) {
      const hasRequiredRole = requiredRoles.some((role) =>
        pengguna.roles.includes(role)
      );

      if (!hasRequiredRole) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, pengguna, requiredRoles, router]);

  return { isAuthenticated, pengguna };
}
```

### D.12 Konfigurasi Next.js

#### D.12.1 Next.js Config

> 📁 **File**: `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*", // Proxy ke backend untuk development
      },
    ];
  },
};

module.exports = nextConfig;
```

**Key Configuration:**

- `images.remotePatterns` → Allow images dari Supabase Storage dan Google (OAuth avatars)
- `rewrites` → Proxy `/api/*` requests ke backend untuk menghindari CORS di development

---

**Catatan:**

Dokumen ini adalah **Part 3** dari Laporan Development Step by Step Fase 1. Untuk bagian pengujian dan evaluasi, lanjut ke **Part 4**.

> 📸 **Screenshot Placeholders:**
>
> - Login page UI: `docs/screenshots/development/login-page-ui.png`
> - Dashboard penulis: `docs/screenshots/development/dashboard-penulis.png`
> - Sidebar navigation: `docs/screenshots/development/sidebar-nav.png`
> - Form validation: `docs/screenshots/development/form-validation-demo.png`

---

_Dokumen dilanjutkan ke Part 4: Pengujian Sistem, Evaluasi, dan Kesimpulan_
