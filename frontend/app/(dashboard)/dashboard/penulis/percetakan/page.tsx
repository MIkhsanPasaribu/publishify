/**
 * Dashboard Percetakan - Penulis
 * Overview statistik pesanan dan quick actions
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Plus,
  TrendingUp,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import type { StatistikDashboardPercetakan, PesananCetak } from "@/types/percetakan";

export default function DashboardPercetakanPenulis() {
  const [statistik, setStatistik] = useState<StatistikDashboardPercetakan | null>(null);
  const [pesananTerbaru, setPesananTerbaru] = useState<PesananCetak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambilData();
  }, []);

  async function ambilData() {
    try {
      // TODO: Ganti dengan API call yang sebenarnya
      // const stats = await percetakanApi.ambilStatistik();
      // const pesanan = await percetakanApi.ambilDaftarPesanan({ limit: 5 });

      // Dummy data untuk development
      setStatistik({
        totalPesanan: 12,
        pesananBaru: 2,
        pesananAktif: 5,
        pesananSelesai: 7,
        totalRevenue: 15000000,
        statusBreakdown: {
          tertunda: 2,
          diterima: 1,
          dalam_produksi: 1,
          terkirim: 7,
          dibatalkan: 0,
        },
      });

      setPesananTerbaru([]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total Pesanan",
      value: statistik?.totalPesanan || 0,
      icon: Package,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Pesanan Aktif",
      value: statistik?.pesananAktif || 0,
      icon: Clock,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    {
      label: "Dalam Pengiriman",
      value:
        (statistik?.statusBreakdown?.dikirim || 0) +
        (statistik?.statusBreakdown?.dalam_produksi || 0),
      icon: Truck,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Selesai",
      value: statistik?.pesananSelesai || 0,
      icon: CheckCircle2,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-700",
    },
  ];

  const quickActions = [
    {
      label: "Buat Pesanan Baru",
      description: "Cetak naskah yang sudah diterbitkan",
      href: "/dashboard/penulis/percetakan/buat",
      icon: Plus,
      color: "bg-teal-600 hover:bg-teal-700",
    },
    {
      label: "Lihat Semua Pesanan",
      description: "Kelola dan tracking pesanan Anda",
      href: "/dashboard/penulis/percetakan/pesanan",
      icon: Package,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Naskah Diterbitkan",
      description: "Lihat naskah yang siap dicetak",
      href: "/dashboard/penulis/percetakan/naskah",
      icon: BookOpen,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Percetakan
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola pesanan cetak buku Anda dengan mudah
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`p-6 rounded-xl text-white ${action.color} transition-all hover:shadow-lg group`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
                  <p className="text-sm text-white text-opacity-90">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      {statistik?.statusBreakdown && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status Pesanan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistik.statusBreakdown).map(([status, count]) => (
              <div
                key={status}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {status.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Pesanan Terbaru
          </h2>
          <Link
            href="/dashboard/penulis/percetakan/pesanan"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Lihat Semua →
          </Link>
        </div>

        {pesananTerbaru.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Belum ada pesanan cetak</p>
            <Link
              href="/dashboard/penulis/percetakan/buat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Buat Pesanan Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pesananTerbaru.map((pesanan) => (
              <Link
                key={pesanan.id}
                href={`/dashboard/penulis/percetakan/pesanan/${pesanan.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Package className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {pesanan.nomorPesanan}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pesanan.naskah?.judul || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {pesanan.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-teal-900 mb-1">
              Informasi Penting
            </h3>
            <p className="text-sm text-teal-700">
              Pastikan naskah Anda sudah dalam status <strong>"diterbitkan"</strong> sebelum membuat pesanan cetak. Pesanan yang sudah dikonfirmasi oleh percetakan tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
