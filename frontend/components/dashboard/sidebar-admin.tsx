"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Eye,
  BookCheck,
  Library,
  BookOpen,
  Tags,
  Printer,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

// Interface untuk menu item
interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

// Interface untuk menu section
interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  defaultOpen?: boolean;
}

export function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Manajemen Naskah"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { pengguna, logout } = useAuthStore();

  // Toggle section
  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  // Cek apakah path aktif
  const isActive = (href: string) => pathname === href;
  const isSectionActive = (items: MenuItem[]) =>
    items.some((item) => item.href && pathname === item.href);

  // Menu Sections untuk Admin
  const menuSections: MenuSection[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      items: [
        {
          label: "Overview",
          icon: <LayoutDashboard className="w-4 h-4" />,
          href: "/dashboard/admin",
        },
      ],
      defaultOpen: true,
    },
    {
      title: "Manajemen Naskah",
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          label: "Antrean Review",
          icon: <ClipboardList className="w-4 h-4" />,
          href: "/dashboard/admin/antrian-review",
        },
        {
          label: "Monitoring Review",
          icon: <Eye className="w-4 h-4" />,
          href: "/dashboard/admin/monitoring",
        },
        {
          label: "Naskah Siap Terbit",
          icon: <BookCheck className="w-4 h-4" />,
          href: "/dashboard/admin/naskah-siap-terbit",
        },
        {
          label: "Semua Naskah",
          icon: <Library className="w-4 h-4" />,
          href: "/dashboard/admin/review",
        },
      ],
      defaultOpen: true,
    },
    {
      title: "Katalog Buku",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        {
          label: "Buku Terbit",
          icon: <BookOpen className="w-4 h-4" />,
          href: "/dashboard/admin/buku",
        },
        {
          label: "Master Kategori",
          icon: <Tags className="w-4 h-4" />,
          href: "/dashboard/admin/master/kategori",
        },
      ],
    },
    {
      title: "Percetakan & Order",
      icon: <Printer className="w-5 h-5" />,
      items: [
        {
          label: "Pesanan Cetak",
          icon: <ShoppingCart className="w-4 h-4" />,
          href: "/dashboard/admin/pesanan",
        },
        {
          label: "Pengiriman",
          icon: <Truck className="w-4 h-4" />,
          href: "/dashboard/admin/pengiriman",
        },
      ],
    },
    {
      title: "Manajemen Pengguna",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          label: "Kelola Pengguna",
          icon: <Users className="w-4 h-4" />,
          href: "/dashboard/admin/pengguna",
        },
      ],
    },
    {
      title: "Pengaturan",
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          label: "Pengaturan Akun",
          icon: <Settings className="w-4 h-4" />,
          href: "/dashboard/admin/pengaturan",
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/");
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const active = item.href ? isActive(item.href) : false;
    const paddingLeft = depth > 0 ? `pl-${4 + depth * 4}` : "pl-4";

    if (item.href) {
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
            active
              ? "bg-teal-500/20 text-teal-100 border-l-4 border-teal-400"
              : "hover:bg-white/10 text-white/70 hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : paddingLeft}`}
          title={isCollapsed ? item.label : ""}
        >
          {item.icon}
          {!isCollapsed && <span className="font-medium">{item.label}</span>}
        </Link>
      );
    }

    return null;
  };

  // Render menu section
  const renderSection = (section: MenuSection) => {
    const isOpen = openSections.includes(section.title) || isCollapsed;
    const sectionActive = isSectionActive(section.items);

    return (
      <div key={section.title} className="mb-2">
        {/* Section Header */}
        <button
          onClick={() => !isCollapsed && toggleSection(section.title)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
            sectionActive
              ? "bg-white/15 text-white"
              : "hover:bg-white/10 text-white/80 hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
          title={isCollapsed ? section.title : ""}
        >
          <div className="flex items-center gap-3">
            {section.icon}
            {!isCollapsed && (
              <span className="font-semibold text-sm">{section.title}</span>
            )}
          </div>
          {!isCollapsed && (
            <span className="transition-transform duration-200">
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
        </button>

        {/* Section Items */}
        {(isOpen || isCollapsed) && (
          <div
            className={`mt-1 space-y-1 ${
              !isCollapsed ? "ml-2 border-l-2 border-white/10" : ""
            }`}
          >
            {section.items.map((item) => renderMenuItem(item, 1))}
          </div>
        )}
      </div>
    );
  };

  // Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <span className="text-lg font-bold block">Publishify</span>
                <span className="text-xs text-teal-200">Admin Panel</span>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && pengguna && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-400/30 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {pengguna.profilPengguna?.namaDepan?.[0] || pengguna.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {pengguna.profilPengguna?.namaDepan || "Admin"}
              </p>
              <p className="text-xs text-teal-200 truncate">{pengguna.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-white/20">
        {menuSections.map(renderSection)}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-500/20 text-red-200 hover:text-red-100 ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <div className="p-3 border-t border-white/10 hidden md:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5 rotate-90" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-teal-600 text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-teal-700 via-teal-800 to-teal-900 text-white transition-all duration-300 z-40 shadow-2xl ${
          isCollapsed ? "w-20" : "w-72"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <SidebarContent />
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all animate-in zoom-in-95">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Yakin ingin keluar?
              </h2>
              <p className="text-gray-600">
                Sesi Anda akan berakhir dan Anda harus login kembali untuk mengakses dashboard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
