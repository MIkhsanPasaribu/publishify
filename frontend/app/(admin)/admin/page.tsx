"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/client";
import {
  BookOpen,
  Clock,
  ClipboardCheck,
  Users,
  FileText,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Printer,
  Settings,
  Eye,
  BookMarked,
  UserCheck,
  Activity,
  ArrowUpRight,
  Calendar,
  RefreshCw
} from "lucide-react";

// ================================
// INTERFACES
// ================================

interface StatistikAdmin {
  totalNaskah: number;
  naskahDiajukan: number;
  naskahDalamReview: number;
  naskahDisetujui: number;
  naskahDiterbitkan: number;
  totalEditor: number;
  totalPenulis: number;
  totalPercetakan: number;
  reviewAktif: number;
}

interface AktivitasTerbaru {
  id: string;
  tipe: "naskah" | "review" | "pengguna";
  judul: string;
  penulis?: string;
  waktu: string;
  status: string;
}

// ================================
// MAIN COMPONENT
// ================================

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistik, setStatistik] = useState<StatistikAdmin>({
    totalNaskah: 0,
    naskahDiajukan: 0,
    naskahDalamReview: 0,
    naskahDisetujui: 0,
    naskahDiterbitkan: 0,
    totalEditor: 0,
    totalPenulis: 0,
    totalPercetakan: 0,
    reviewAktif: 0,
  });
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState<AktivitasTerbaru[]>([]);

  useEffect(() => {
    fetchStatistik();
  }, []);

  const fetchStatistik = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const results = await Promise.allSettled([
        api.get("/naskah/admin/semua", { params: { limit: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get("/pengguna").catch(() => ({ data: { data: [] } })),
        api.get("/review").catch(() => ({ data: { data: [] } })),
      ]);

      const naskahList = results[0].status === "fulfilled" && results[0].value?.data?.data 
        ? results[0].value.data.data 
        : [];
      
      const penggunaList = results[1].status === "fulfilled" && results[1].value?.data?.data 
        ? results[1].value.data.data 
        : [];
      
      const reviewList = results[2].status === "fulfilled" && results[2].value?.data?.data 
        ? results[2].value.data.data 
        : [];

      setStatistik({
        totalNaskah: naskahList.length,
        naskahDiajukan: naskahList.filter((n: any) => n.status === "diajukan").length,
        naskahDalamReview: naskahList.filter((n: any) => n.status === "dalam_review").length,
        naskahDisetujui: naskahList.filter((n: any) => n.status === "disetujui").length,
        naskahDiterbitkan: naskahList.filter((n: any) => n.status === "diterbitkan").length,
        totalEditor: penggunaList.filter((u: any) =>
          u.peranPengguna?.some((p: any) => p.jenisPeran === "editor" && p.aktif)
        ).length,
        totalPenulis: penggunaList.filter((u: any) =>
          u.peranPengguna?.some((p: any) => p.jenisPeran === "penulis" && p.aktif)
        ).length,
        totalPercetakan: penggunaList.filter((u: any) =>
          u.peranPengguna?.some((p: any) => p.jenisPeran === "percetakan" && p.aktif)
        ).length,
        reviewAktif: reviewList.filter(
          (r: any) => r.status === "ditugaskan" || r.status === "dalam_proses"
        ).length,
      });

      // Generate aktivitas terbaru dari naskah
      const aktivitas: AktivitasTerbaru[] = naskahList.slice(0, 5).map((n: any) => ({
        id: n.id,
        tipe: "naskah" as const,
        judul: n.judul,
        penulis: n.penulis?.profilPengguna?.namaDepan || n.penulis?.email?.split("@")[0] || "Anonim",
        waktu: formatWaktu(n.diperbaruiPada || n.dibuatPada),
        status: n.status,
      }));
      setAktivitasTerbaru(aktivitas);
    } catch (error) {
      console.error("Error fetching statistik:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatWaktu = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
      diajukan: { bg: "bg-amber-100", text: "text-amber-700", label: "Diajukan" },
      dalam_review: { bg: "bg-blue-100", text: "text-blue-700", label: "Review" },
      perlu_revisi: { bg: "bg-orange-100", text: "text-orange-700", label: "Revisi" },
      disetujui: { bg: "bg-green-100", text: "text-green-700", label: "Disetujui" },
      diterbitkan: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Terbit" },
      ditolak: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Kartu statistik
  const statsCards = [
    {
      title: "Total Naskah",
      value: statistik.totalNaskah,
      icon: FileText,
      color: "blue",
      lightBg: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/admin/review",
    },
    {
      title: "Menunggu Review",
      value: statistik.naskahDiajukan,
      icon: Clock,
      color: "amber",
      lightBg: "bg-amber-50",
      iconColor: "text-amber-600",
      link: "/admin/antrian-review",
      highlight: statistik.naskahDiajukan > 0,
    },
    {
      title: "Dalam Review",
      value: statistik.naskahDalamReview,
      icon: ClipboardCheck,
      color: "purple",
      lightBg: "bg-purple-50",
      iconColor: "text-purple-600",
      link: "/admin/monitoring",
    },
    {
      title: "Siap Terbit",
      value: statistik.naskahDisetujui,
      icon: CheckCircle2,
      color: "green",
      lightBg: "bg-green-50",
      iconColor: "text-green-600",
      link: "/admin/naskah-siap-terbit",
      highlight: statistik.naskahDisetujui > 0,
    },
    {
      title: "Sudah Terbit",
      value: statistik.naskahDiterbitkan,
      icon: BookMarked,
      color: "emerald",
      lightBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      link: "/admin/buku",
    },
    {
      title: "Review Aktif",
      value: statistik.reviewAktif,
      icon: Activity,
      color: "indigo",
      lightBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      link: "/admin/monitoring",
    },
  ];

  // Menu aksi cepat
  const quickActions = [
    {
      title: "Antrean Review",
      description: `${statistik.naskahDiajukan} naskah menunggu`,
      icon: Clock,
      color: "amber",
      link: "/admin/antrian-review",
    },
    {
      title: "Monitoring Review",
      description: `${statistik.reviewAktif} review aktif`,
      icon: Eye,
      color: "blue",
      link: "/admin/monitoring",
    },
    {
      title: "Naskah Siap Terbit",
      description: `${statistik.naskahDisetujui} siap dipublikasi`,
      icon: BookOpen,
      color: "green",
      link: "/admin/naskah-siap-terbit",
    },
    {
      title: "Katalog Buku",
      description: `${statistik.naskahDiterbitkan} buku terbit`,
      icon: BookMarked,
      color: "emerald",
      link: "/admin/buku",
    },
    {
      title: "Kelola Pengguna",
      description: `${statistik.totalPenulis + statistik.totalEditor + statistik.totalPercetakan} pengguna`,
      icon: Users,
      color: "purple",
      link: "/admin/pengguna",
    },
    {
      title: "Pengaturan",
      description: "Konfigurasi sistem",
      icon: Settings,
      color: "gray",
      link: "/admin/pengaturan",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string; hover: string }> = {
      amber: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-600", hover: "hover:border-amber-400" },
      blue: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-600", hover: "hover:border-blue-400" },
      green: { border: "border-green-200", bg: "bg-green-50", text: "text-green-600", hover: "hover:border-green-400" },
      emerald: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-600", hover: "hover:border-emerald-400" },
      purple: { border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-600", hover: "hover:border-purple-400" },
      gray: { border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-600", hover: "hover:border-gray-400" },
      indigo: { border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-600", hover: "hover:border-indigo-400" },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang di panel administrasi Publishify
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("id-ID", { 
              weekday: "long", 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </div>
          <button
            onClick={() => fetchStatistik(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={index}
              onClick={() => router.push(card.link)}
              className={`relative p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all text-left group ${
                card.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""
              }`}
            >
              {card.highlight && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
              <div className={`w-10 h-10 ${card.lightBg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : card.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{card.title}</p>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aksi Cepat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colors = getColorClasses(action.color);
              return (
                <button
                  key={index}
                  onClick={() => router.push(action.link)}
                  className={`flex flex-col p-4 border-2 ${colors.border} rounded-xl ${colors.hover} hover:${colors.bg} transition-all group text-left`}
                >
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Pengguna */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Ringkasan Pengguna
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Penulis</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{loading ? "..." : statistik.totalPenulis}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Editor</span>
              </div>
              <span className="text-lg font-bold text-green-600">{loading ? "..." : statistik.totalEditor}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Printer className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Percetakan</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{loading ? "..." : statistik.totalPercetakan}</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/admin/pengguna")}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Lihat semua pengguna
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Aktivitas Terbaru & Status Naskah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Aktivitas Terbaru
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : aktivitasTerbaru.length > 0 ? (
            <div className="space-y-3">
              {aktivitasTerbaru.map((aktivitas) => (
                <button
                  key={aktivitas.id}
                  onClick={() => router.push(`/admin/review`)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{aktivitas.judul}</p>
                    <p className="text-xs text-gray-500">
                      oleh {aktivitas.penulis} • {aktivitas.waktu}
                    </p>
                  </div>
                  {getStatusBadge(aktivitas.status)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">Belum ada aktivitas</p>
            </div>
          )}
        </div>

        {/* Status Naskah */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Distribusi Status Naskah
          </h2>
          <div className="space-y-4">
            {/* Progress bars */}
            {[
              { label: "Diajukan", value: statistik.naskahDiajukan, color: "bg-amber-500" },
              { label: "Dalam Review", value: statistik.naskahDalamReview, color: "bg-blue-500" },
              { label: "Disetujui", value: statistik.naskahDisetujui, color: "bg-green-500" },
              { label: "Diterbitkan", value: statistik.naskahDiterbitkan, color: "bg-emerald-500" },
            ].map((item, index) => {
              const percentage = statistik.totalNaskah > 0 
                ? Math.round((item.value / statistik.totalNaskah) * 100) 
                : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {loading ? "..." : item.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Naskah</span>
              <span className="font-bold text-gray-900">{loading ? "..." : statistik.totalNaskah}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Butuh Bantuan?</h3>
            <p className="text-indigo-100 text-sm mt-1">
              Lihat dokumentasi atau hubungi tim support untuk bantuan lebih lanjut.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              Dokumentasi
            </button>
            <button className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors">
              Hubungi Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
