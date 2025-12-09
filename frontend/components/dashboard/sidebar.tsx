"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Ambil data pengguna untuk cek role
  const { pengguna } = useAuthStore();
  
  // Helper untuk cek apakah user memiliki role tertentu
  const hasRole = (role: "penulis" | "editor" | "percetakan" | "admin") => {
    if (!pengguna) return false;
    
    // Cek dari peran (format array string dari backend login)
    if (pengguna.peran && pengguna.peran.includes(role)) {
      return true;
    }
    
    // Cek dari peranPengguna (format lengkap)
    if (pengguna.peranPengguna) {
      return pengguna.peranPengguna.some(
        (peran) => peran.jenisPeran === role && peran.aktif
      );
    }
    
    return false;
  };

  // Menu untuk Penulis
  const menuPenulis = [
    {
      label: "Beranda",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/dashboard",
    },
    {
      label: "Ajukan Draf Baru",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: "/dashboard/ajukan-draf",
    },
    {
      label: "Draf Saya",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/dashboard/draf",
    },
    {
      label: "Buku Terbit",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: "/dashboard/buku-terbit",
    },
    {
      label: "Atur Harga Jual",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: "/dashboard/penulis/atur-harga",
    },
    {
      label: "Riwayat Pesanan Cetak",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
      href: "/dashboard/pesanan-cetak",
    },
  ];

  // Menu untuk Editor
  const menuEditor = [
    {
      label: "Dashboard Editor",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      href: "/dashboard/editor",
    },
    {
      label: "Daftar Review",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: "/dashboard/editor/review",
    },
  ];

  // Menu untuk Percetakan
  const menuPercetakan = [
    {
      label: "Dashboard Percetakan",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/dashboard/percetakan",
    },
    {
      label: "Daftar Pesanan",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/dashboard/percetakan/pesanan",
    },
    {
      label: "Pembayaran",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: "/dashboard/percetakan/pembayaran",
    },
  ];

  // Menu untuk Admin
  const menuAdmin = [
    {
      label: "Dashboard Admin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/admin",
    },
    {
      label: "Semua Naskah",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: "/admin/review",
    },
    {
      label: "Antrian Review",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: "/admin/antrian-review",
    },
    {
      label: "Kelola Pengguna",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      href: "/admin/pengguna",
    },
    {
      label: "Monitoring Review",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      href: "/admin/monitoring",
    },
  ];

  // Gabungkan menu berdasarkan role
  const menuItems = [
    ...(hasRole("penulis") ? menuPenulis : []),
    ...(hasRole("editor") ? menuEditor : []),
    ...(hasRole("percetakan") ? menuPercetakan : []),
    ...(hasRole("admin") ? menuAdmin : []),
  ];

  const bottomMenuItems = [
    {
      label: "Pengaturan Akun",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: "/dashboard/pengaturan",
    },
    {
      label: "Logout",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      href: "/logout",
      isLogout: true,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0d7377] to-[#0a5c5f] text-white transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/logo.png"
                  alt="Publishify Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 transition-transform group-hover:scale-110"
                />
                <span className="text-xl font-bold">Publishify</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/" className="mx-auto">
                <Image
                  src="/logo.png"
                  alt="Publishify Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </Link>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#14b8a6] text-white shadow-lg"
                        : "hover:bg-white/10 text-white/80 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? item.label : ""}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-6 border-t border-white/10"></div>

          {/* Bottom Menu Items */}
          <ul className="space-y-2">
            {bottomMenuItems.map((item, index) => (
              <li key={index}>
                {item.isLogout ? (
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-500 text-white/80 hover:text-white ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="font-medium text-red-200">
                        {item.label}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/10 text-white/80 hover:text-white ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all">
            {/* Emoticon */}
            <div className="text-center mb-6">
              <div className="text-7xl mb-4 animate-bounce">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Yakin ingin keluar?
              </h2>
              <p className="text-gray-600">
                Kami akan merindukanmu! Pastikan semua pekerjaanmu sudah tersimpan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                ❌ Batalkan
              </button>
              <button
                onClick={() => {
                  // Hapus token dari localStorage
                  localStorage.removeItem("token");
                  // Redirect ke landing page
                  router.push("/");
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                ✅ Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
