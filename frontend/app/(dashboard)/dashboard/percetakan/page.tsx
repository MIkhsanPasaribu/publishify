"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { ambilStatistikDashboard, ambilDaftarPesanan } from "@/lib/api/percetakan";
import type { StatistikDashboard, PesananCetak } from "@/types/percetakan";
import Link from "next/link";

export default function DashboardPercetakanPage() {
  const [statistik, setStatistik] = useState<StatistikDashboard | null>(null);
  const [pesananTerbaru, setPesananTerbaru] = useState<PesananCetak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load statistik
        const resStatistik = await ambilStatistikDashboard();
        if (resStatistik.sukses) {
          setStatistik(resStatistik.data);
        }

        // Load pesanan terbaru (limit 5)
        const resPesanan = await ambilDaftarPesanan({ limit: 5, halaman: 1 });
        if (resPesanan.sukses) {
          setPesananTerbaru(resPesanan.data);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Pesanan",
      value: statistik?.totalPesanan || 0,
      icon: Package,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: null,
    },
    {
      title: "Pesanan Baru",
      value: statistik?.pesananBaru || 0,
      icon: AlertCircle,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      trend: null,
    },
    {
      title: "Dalam Produksi",
      value: statistik?.dalamProduksi || 0,
      icon: Clock,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: null,
    },
    {
      title: "Selesai",
      value: statistik?.selesai || 0,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: "+12%",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Dashboard Percetakan
        </h1>
        <p className="text-gray-600 mt-1">
          Selamat datang kembali! Berikut ringkasan pesanan Anda hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.trend}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <p className="text-teal-100 text-sm mb-1">Revenue Hari Ini</p>
          <p className="text-3xl font-bold">
            Rp {(statistik?.revenueHariIni || 0).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Revenue Bulan Ini</p>
          <p className="text-3xl font-bold">
            Rp {(statistik?.revenueBulanIni || 0).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">
            Rp {(statistik?.totalRevenue || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Pesanan Terbaru */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Pesanan Terbaru
          </h2>
          <Link
            href="/dashboard/percetakan/pesanan"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {pesananTerbaru.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pesananTerbaru.map((pesanan) => (
              <Link
                key={pesanan.id}
                href={`/dashboard/percetakan/pesanan/${pesanan.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        {pesanan.nomorPesanan}
                      </span>
                      <StatusBadge status={pesanan.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {pesanan.naskah?.judul || "Judul tidak tersedia"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {pesanan.jumlah} eksemplar • {pesanan.formatKertas}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rp {pesanan.hargaTotal.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(pesanan.tanggalPesan).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Component untuk Badge Status
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    tertunda: {
      label: "Tertunda",
      className: "bg-yellow-100 text-yellow-800",
    },
    diterima: {
      label: "Diterima",
      className: "bg-blue-100 text-blue-800",
    },
    dalam_produksi: {
      label: "Produksi",
      className: "bg-purple-100 text-purple-800",
    },
    kontrol_kualitas: {
      label: "QC",
      className: "bg-indigo-100 text-indigo-800",
    },
    siap: {
      label: "Siap Kirim",
      className: "bg-teal-100 text-teal-800",
    },
    dikirim: {
      label: "Dikirim",
      className: "bg-cyan-100 text-cyan-800",
    },
    terkirim: {
      label: "Selesai",
      className: "bg-green-100 text-green-800",
    },
    dibatalkan: {
      label: "Dibatalkan",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
