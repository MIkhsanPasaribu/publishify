"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Home,
  ClipboardList,
} from "lucide-react";

export default function PercetakanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/dashboard/percetakan",
      icon: Home,
      label: "Dashboard",
      badge: null,
    },
    {
      href: "/dashboard/percetakan/pesanan",
      icon: Package,
      label: "Pesanan",
      badge: null,
    },
    {
      href: "/dashboard/percetakan/produksi",
      icon: ClipboardList,
      label: "Produksi",
      badge: null,
    },
    {
      href: "/dashboard/percetakan/pengiriman",
      icon: Truck,
      label: "Pengiriman",
      badge: null,
    },
    {
      href: "/dashboard/percetakan/pembayaran",
      icon: CreditCard,
      label: "Pembayaran",
      badge: null,
    },
    {
      href: "/dashboard/percetakan/laporan",
      icon: BarChart3,
      label: "Laporan",
      badge: null,
    },
    {
      href: "/dashboard/percetakan/pengaturan",
      icon: Settings,
      label: "Pengaturan",
      badge: null,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/percetakan") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/dashboard/percetakan" className="flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600" />
            <span className="font-bold text-lg text-gray-900">Percetakan</span>
          </Link>
          <button
            onClick={() => setSidebarTerbuka(!sidebarTerbuka)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarTerbuka ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarTerbuka ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200">
          <Package className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="font-bold text-lg text-gray-900">Publishify</h1>
            <p className="text-xs text-gray-500">Percetakan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarTerbuka(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    active
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            href="/dashboard/pengaturan"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-teal-700 font-medium">P</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Percetakan
              </p>
              <p className="text-xs text-gray-500 truncate">
                percetakan@publishify.com
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarTerbuka && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarTerbuka(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
