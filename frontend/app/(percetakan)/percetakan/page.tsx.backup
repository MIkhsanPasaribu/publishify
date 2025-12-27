"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { ambilStatistikPercetakan, ambilDaftarPesanan } from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPercetakanPage() {
  const router = useRouter();
  const { pengguna } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [statistik, setStatistik] = useState<any>(null);
  const [pesananTerbaru, setPesananTerbaru] = useState<PesananCetak[]>([]);

  useEffect(() => {
    // Cek apakah user memiliki role percetakan
    const hasRolePercetakan = pengguna?.peran?.includes("percetakan") || 
      pengguna?.peranPengguna?.some(p => p.jenisPeran === "percetakan" && p.aktif);

    if (!hasRolePercetakan) {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [pengguna, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, pesananResponse] = await Promise.all([
        ambilStatistikPercetakan(),
        ambilDaftarPesanan({ limit: 5, halaman: 1 }),
      ]);

      if (statsResponse.sukses) {
        setStatistik(statsResponse.data);
      }

      if (pesananResponse.sukses) {
        setPesananTerbaru(pesananResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      tertunda: { label: "Tertunda", className: "bg-yellow-100 text-yellow-800" },
      diterima: { label: "Diterima", className: "bg-blue-100 text-blue-800" },
      dalam_produksi: { label: "Dalam Produksi", className: "bg-purple-100 text-purple-800" },
      kontrol_kualitas: { label: "QC", className: "bg-indigo-100 text-indigo-800" },
      siap: { label: "Siap", className: "bg-green-100 text-green-800" },
      dikirim: { label: "Dikirim", className: "bg-teal-100 text-teal-800" },
      terkirim: { label: "Terkirim", className: "bg-green-100 text-green-800" },
      dibatalkan: { label: "Dibatalkan", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.tertunda;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Percetakan</h1>
        <p className="text-gray-600 mt-2">Kelola pesanan cetak dan produksi</p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {statistik?.totalPesanan || 0}
              </p>
              <span className="text-sm text-gray-500">pesanan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pesanan Tertunda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-yellow-600">
                {statistik?.pesananTertunda || 0}
              </p>
              <span className="text-sm text-gray-500">perlu konfirmasi</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dalam Produksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-purple-600">
                {statistik?.pesananDalamProduksi || 0}
              </p>
              <span className="text-sm text-gray-500">sedang diproses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600">
                {formatRupiah(statistik?.revenueBulanIni || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pesanan Terbaru */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              Pesanan Terbaru
            </CardTitle>
            <Link
              href="/dashboard/percetakan/pesanan"
              className="text-sm font-medium text-[#0d7377] hover:text-[#0a5c5f] transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pesananTerbaru.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Pesanan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Naskah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemesan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pesananTerbaru.map((pesanan) => (
                    <tr key={pesanan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pesanan.nomorPesanan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pesanan.naskah?.judul || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pesanan.ukuranKertas} • {pesanan.jenisKertas}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pesanan.pemesan?.profilPengguna?.namaTampilan || 
                           pesanan.pemesan?.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pesanan.jumlahCetak} eks
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatRupiah(pesanan.totalHarga)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pesanan.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTanggal(pesanan.dibuatPada)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/dashboard/percetakan/pesanan/${pesanan.id}`}
                          className="text-[#0d7377] hover:text-[#0a5c5f] font-medium"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/dashboard/percetakan/pesanan?status=tertunda"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pesanan Tertunda</h3>
              <p className="text-sm text-gray-600">Konfirmasi pesanan baru</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/percetakan/pesanan?status=dalam_produksi"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Dalam Produksi</h3>
              <p className="text-sm text-gray-600">Pantau proses produksi</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/percetakan/pembayaran"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pembayaran</h3>
              <p className="text-sm text-gray-600">Verifikasi pembayaran</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
