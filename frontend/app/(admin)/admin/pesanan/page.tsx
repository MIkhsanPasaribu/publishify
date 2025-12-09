"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Printer,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dummy data
const dummyPesanan = [
  {
    id: "1",
    nomorPesanan: "PO-2024-001234",
    judulBuku: "Filosofi Kopi",
    pemesan: "John Doe",
    jumlah: 50,
    hargaTotal: 2250000,
    status: "tertunda",
    tanggalPesan: "2024-12-08T10:30:00",
  },
  {
    id: "2",
    nomorPesanan: "PO-2024-001235",
    judulBuku: "Laskar Pelangi",
    pemesan: "Jane Smith",
    jumlah: 100,
    hargaTotal: 4750000,
    status: "diterima",
    tanggalPesan: "2024-12-07T14:20:00",
  },
  {
    id: "3",
    nomorPesanan: "PO-2024-001236",
    judulBuku: "Negeri 5 Menara",
    pemesan: "Ahmad Fuadi",
    jumlah: 75,
    hargaTotal: 3187500,
    status: "dalam_produksi",
    tanggalPesan: "2024-12-06T09:15:00",
  },
  {
    id: "4",
    nomorPesanan: "PO-2024-001237",
    judulBuku: "Bumi Manusia",
    pemesan: "Dewi Lestari",
    jumlah: 30,
    hargaTotal: 1350000,
    status: "siap",
    tanggalPesan: "2024-12-05T16:45:00",
  },
  {
    id: "5",
    nomorPesanan: "PO-2024-001238",
    judulBuku: "Pulang",
    pemesan: "Tere Liye",
    jumlah: 200,
    hargaTotal: 8900000,
    status: "dikirim",
    tanggalPesan: "2024-12-04T11:00:00",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  tertunda: { label: "Tertunda", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
  diterima: { label: "Diterima", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  dalam_produksi: { label: "Dalam Produksi", color: "bg-purple-100 text-purple-800 border-purple-200", icon: <Printer className="w-3 h-3" /> },
  siap: { label: "Siap Kirim", color: "bg-green-100 text-green-800 border-green-200", icon: <Package className="w-3 h-3" /> },
  dikirim: { label: "Dikirim", color: "bg-teal-100 text-teal-800 border-teal-200", icon: <TrendingUp className="w-3 h-3" /> },
  terkirim: { label: "Terkirim", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="w-3 h-3" /> },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PesananCetakAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const filteredPesanan = dummyPesanan.filter((pesanan) => {
    const matchSearch =
      pesanan.nomorPesanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesanan.judulBuku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesanan.pemesan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "semua" || pesanan.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalPesanan = dummyPesanan.length;
  const pesananBaru = dummyPesanan.filter((p) => p.status === "tertunda").length;
  const dalamProduksi = dummyPesanan.filter((p) => p.status === "dalam_produksi").length;
  const totalPendapatan = dummyPesanan.reduce((acc, p) => acc + p.hargaTotal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Pesanan Cetak
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola pesanan cetak dari penulis dan pemesan
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-orange-700 font-medium">Total Pesanan</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{totalPesanan}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                {pesananBaru > 0 && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {pesananBaru}
                  </span>
                )}
              </div>
              <p className="text-sm text-yellow-700 font-medium">Menunggu Verifikasi</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{pesananBaru}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Printer className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-purple-700 font-medium">Dalam Produksi</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{dalamProduksi}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-700 font-medium">Total Nilai Pesanan</p>
              <p className="text-xl font-bold text-green-900 mt-1">{formatRupiah(totalPendapatan)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nomor pesanan, judul buku, atau pemesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="tertunda">Tertunda</SelectItem>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="dalam_produksi">Dalam Produksi</SelectItem>
                  <SelectItem value="siap">Siap Kirim</SelectItem>
                  <SelectItem value="dikirim">Dikirim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pesanan List */}
        <Card className="border-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      No. Pesanan
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Buku
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Pemesan
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Jumlah
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Tanggal
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPesanan.map((pesanan) => {
                    const status = statusConfig[pesanan.status];
                    return (
                      <tr key={pesanan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {pesanan.nomorPesanan}
                          </code>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {pesanan.judulBuku}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{pesanan.pemesan}</td>
                        <td className="px-6 py-4 text-center font-semibold">
                          {pesanan.jumlah}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          {formatRupiah(pesanan.hargaTotal)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={`${status.color} gap-1`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {formatTanggal(pesanan.tanggalPesan)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Fitur dalam pengembangan
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Data yang ditampilkan adalah data dummy. Integrasi dengan backend percetakan
                akan ditambahkan untuk mengelola pesanan cetak secara real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
