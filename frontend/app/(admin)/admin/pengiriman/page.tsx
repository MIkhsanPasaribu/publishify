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
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Gradient Header */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Monitoring Pengiriman
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Lacak status pengiriman pesanan ke pemesan
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{totalPengiriman}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Total Pengiriman</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{diproses}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Diproses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{dalamPerjalanan}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Dalam Perjalanan</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{terkirim}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">Terkirim</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                placeholder="Cari berdasarkan nomor pesanan, resi, atau penerima..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500">
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
        </div>

        {/* Pengiriman List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPengiriman.map((item) => {
            const status = statusConfig[item.status];
            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-4 sm:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${
                        item.status === "terkirim"
                          ? "bg-green-100"
                          : item.status === "dalam_perjalanan"
                          ? "bg-cyan-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <Truck
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          item.status === "terkirim"
                            ? "text-green-600"
                            : item.status === "dalam_perjalanan"
                            ? "text-cyan-600"
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
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                          <code className="text-xs sm:text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                            {item.nomorPesanan}
                          </code>
                          <Badge className={`${status.color} gap-1 text-xs`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">{item.judulBuku}</h3>
                        </div>
                      </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">Penerima</p>
                          <p className="text-sm font-medium text-slate-900">{item.penerima}</p>
                          <p className="text-xs sm:text-sm text-slate-600">{item.alamat}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">Ekspedisi & Resi</p>
                          <p className="text-sm font-medium text-slate-900">{item.ekspedisi}</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs sm:text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {item.nomorResi}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-teal-50 hover:text-teal-600"
                              onClick={() => navigator.clipboard.writeText(item.nomorResi)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">Waktu</p>
                          <p className="text-xs sm:text-sm text-slate-700">
                            <span className="text-slate-500">Kirim:</span>{" "}
                            {formatTanggal(item.tanggalKirim)}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-700">
                            <span className="text-slate-500">Estimasi:</span>{" "}
                            {formatTanggal(item.estimasiTiba)}
                          </p>
                          </div>
                        </div>
                      </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button size="sm" variant="outline" className="hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300">
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Lacak Resi
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300">
                        <Phone className="w-4 h-4 mr-2" />
                        Hubungi
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-6 sm:p-8">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2">
              Fitur dalam pengembangan
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Data yang ditampilkan adalah data dummy. Integrasi tracking real-time dengan
              ekspedisi akan ditambahkan untuk monitoring pengiriman yang akurat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
