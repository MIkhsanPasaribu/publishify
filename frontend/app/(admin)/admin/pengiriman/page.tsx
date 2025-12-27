"use client";

import { useState } from "react";
import {
  Truck,
  Search,
  Filter,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Phone,
  Copy,
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
const dummyPengiriman = [
  {
    id: "1",
    nomorPesanan: "PO-2024-001234",
    judulBuku: "Filosofi Kopi",
    penerima: "John Doe",
    alamat: "Jl. Sudirman No. 123, Jakarta Pusat, 10110",
    telepon: "08123456789",
    ekspedisi: "JNE",
    nomorResi: "JNE123456789",
    status: "dalam_perjalanan",
    tanggalKirim: "2024-12-07T10:00:00",
    estimasiTiba: "2024-12-10T17:00:00",
  },
  {
    id: "2",
    nomorPesanan: "PO-2024-001235",
    judulBuku: "Laskar Pelangi",
    penerima: "Jane Smith",
    alamat: "Jl. Gatot Subroto No. 456, Bandung, 40123",
    telepon: "08234567890",
    ekspedisi: "SiCepat",
    nomorResi: "SCP987654321",
    status: "terkirim",
    tanggalKirim: "2024-12-05T09:00:00",
    estimasiTiba: "2024-12-07T12:00:00",
  },
  {
    id: "3",
    nomorPesanan: "PO-2024-001236",
    judulBuku: "Negeri 5 Menara",
    penerima: "Ahmad Fuadi",
    alamat: "Jl. Asia Afrika No. 789, Surabaya, 60123",
    telepon: "08345678901",
    ekspedisi: "J&T",
    nomorResi: "JT456789012",
    status: "diproses",
    tanggalKirim: null,
    estimasiTiba: null,
  },
  {
    id: "4",
    nomorPesanan: "PO-2024-001237",
    judulBuku: "Bumi Manusia",
    penerima: "Dewi Lestari",
    alamat: "Jl. Malioboro No. 111, Yogyakarta, 55123",
    telepon: "08456789012",
    ekspedisi: "AnterAja",
    nomorResi: "AA789012345",
    status: "dalam_perjalanan",
    tanggalKirim: "2024-12-08T14:00:00",
    estimasiTiba: "2024-12-11T10:00:00",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  diproses: { label: "Diproses", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-3 h-3" /> },
  dalam_perjalanan: { label: "Dalam Perjalanan", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Truck className="w-3 h-3" /> },
  terkirim: { label: "Terkirim", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  gagal: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> },
};

function formatTanggal(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PengirimanAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const filteredPengiriman = dummyPengiriman.filter((item) => {
    const matchSearch =
      item.nomorPesanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorResi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.penerima.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "semua" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalPengiriman = dummyPengiriman.length;
  const dalamPerjalanan = dummyPengiriman.filter((p) => p.status === "dalam_perjalanan").length;
  const terkirim = dummyPengiriman.filter((p) => p.status === "terkirim").length;
  const diproses = dummyPengiriman.filter((p) => p.status === "diproses").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Monitoring Pengiriman
            </h1>
            <p className="text-gray-600 mt-2">
              Lacak status pengiriman pesanan ke pemesan
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-700 font-medium">Total Pengiriman</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalPengiriman}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-yellow-700 font-medium">Diproses</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{diproses}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <Truck className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <p className="text-sm text-cyan-700 font-medium">Dalam Perjalanan</p>
              <p className="text-3xl font-bold text-cyan-900 mt-1">{dalamPerjalanan}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-700 font-medium">Terkirim</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{terkirim}</p>
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
                  placeholder="Cari berdasarkan nomor pesanan, resi, atau penerima..."
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
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="dalam_perjalanan">Dalam Perjalanan</SelectItem>
                  <SelectItem value="terkirim">Terkirim</SelectItem>
                  <SelectItem value="gagal">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pengiriman List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPengiriman.map((item) => {
            const status = statusConfig[item.status];
            return (
              <Card key={item.id} className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          item.status === "terkirim"
                            ? "bg-green-100"
                            : item.status === "dalam_perjalanan"
                            ? "bg-blue-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <Truck
                          className={`w-8 h-8 ${
                            item.status === "terkirim"
                              ? "text-green-600"
                              : item.status === "dalam_perjalanan"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {item.nomorPesanan}
                            </code>
                            <Badge className={`${status.color} gap-1`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{item.judulBuku}</h3>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Penerima</p>
                            <p className="font-medium">{item.penerima}</p>
                            <p className="text-sm text-gray-600">{item.alamat}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Package className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Ekspedisi & Resi</p>
                            <p className="font-medium">{item.ekspedisi}</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                                {item.nomorResi}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => navigator.clipboard.writeText(item.nomorResi)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Waktu</p>
                            <p className="text-sm">
                              <span className="text-gray-500">Kirim:</span>{" "}
                              {formatTanggal(item.tanggalKirim)}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">Estimasi:</span>{" "}
                              {formatTanggal(item.estimasiTiba)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Detail
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Lacak Resi
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Hubungi
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Fitur dalam pengembangan
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Data yang ditampilkan adalah data dummy. Integrasi tracking real-time dengan
                ekspedisi akan ditambahkan untuk monitoring pengiriman yang akurat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
