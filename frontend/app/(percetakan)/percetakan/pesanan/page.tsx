"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Printer,
  AlertCircle,
  Check,
  Play,
} from "lucide-react";
import { KonfirmasiPesananDialog } from "@/components/percetakan/konfirmasi-pesanan-dialog";
import { UpdateStatusDialog } from "@/components/percetakan/update-status-dialog";
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

// Data pesanan akan diambil dari API

const STATUS_CONFIG = {
  tertunda: {
    label: "Tertunda",
    icon: AlertCircle,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500",
  },
  diterima: {
    label: "Diterima",
    icon: CheckCircle2,
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    dotColor: "bg-cyan-500",
  },
  dalam_produksi: {
    label: "Dalam Produksi",
    icon: Printer,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  kontrol_kualitas: {
    label: "Quality Control",
    icon: CheckCircle2,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  siap: {
    label: "Siap Kirim",
    icon: Package,
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  dikirim: {
    label: "Dikirim",
    icon: Package,
    color: "bg-teal-100 text-teal-800 border-teal-200",
    dotColor: "bg-teal-500",
  },
  selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    dotColor: "bg-gray-500",
  },
};

function formatTanggal(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DaftarPesananPercetakanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  // State untuk data dari API
  const [pesananData] = useState<any[]>([]);

  // State untuk dialog
  const [selectedPesanan, setSelectedPesanan] = useState<any>(null);
  const [showKonfirmasiDialog, setShowKonfirmasiDialog] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);

  // TODO: Fetch data dari API
  // useEffect(() => {
  //   fetchPesanan();
  // }, []);

  const handleRefresh = () => {
    // TODO: Re-fetch data
    console.log("Refresh data");
  };

  // Filter data
  const filteredPesanan = pesananData.filter((pesanan) => {
    const matchSearch =
      pesanan.nomorPesanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesanan.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesanan.pemesan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "semua" || pesanan.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Statistik
  const stats = {
    total: pesananData.length,
    tertunda: pesananData.filter((p) => p.status === "tertunda").length,
    produksi: pesananData.filter((p) => p.status === "dalam_produksi").length,
    qc: pesananData.filter((p) => p.status === "kontrol_kualitas").length,
    siap: pesananData.filter((p) => p.status === "siap").length,
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Gradient Header Panel */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📦</span>
                Kelola Pesanan Cetak
              </h1>
              <p className="text-sm text-teal-50">
                Pantau dan kelola semua pesanan cetak dari penulis
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200 bg-amber-50/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-amber-700 mb-1">Tertunda</p>
              <p className="text-2xl font-bold text-amber-800">{stats.tertunda}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-blue-700 mb-1">Produksi</p>
              <p className="text-2xl font-bold text-blue-800">{stats.produksi}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-purple-50/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-purple-700 mb-1">QC</p>
              <p className="text-2xl font-bold text-purple-800">{stats.qc}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 bg-green-50/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-green-700 mb-1">Siap Kirim</p>
              <p className="text-2xl font-bold text-green-800">{stats.siap}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Cari pesanan, pemesan, atau judul buku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-64 h-11">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="tertunda">Tertunda</SelectItem>
                  <SelectItem value="diterima">Diterima</SelectItem>
                  <SelectItem value="dalam_produksi">Dalam Produksi</SelectItem>
                  <SelectItem value="kontrol_kualitas">Quality Control</SelectItem>
                  <SelectItem value="siap">Siap Kirim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table Pesanan */}
        <Card className="border-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Pesanan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Pemesan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Spesifikasi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPesanan.map((pesanan) => {
                    const config = STATUS_CONFIG[pesanan.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = config.icon;

                    return (
                      <tr
                        key={pesanan.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-sm text-gray-900 mb-1">
                            {pesanan.judul}
                          </div>
                          <div className="text-xs text-gray-600 font-mono">
                            {pesanan.nomorPesanan}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTanggal(pesanan.tanggalPesan)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{pesanan.pemesan}</div>
                          <div className="text-xs text-gray-500">{pesanan.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {pesanan.jumlah} eks
                          </div>
                          <div className="text-xs text-gray-600">
                            {pesanan.formatKertas} • {pesanan.jenisKertas}
                          </div>
                          <div className="text-xs text-gray-600">
                            {pesanan.jenisCover}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${config.color} border flex items-center gap-1.5 w-fit`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
                            <StatusIcon className="h-3 w-3" />
                            <span className="text-xs">{config.label}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${pesanan.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {pesanan.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Tombol Konfirmasi untuk status tertunda */}
                            {pesanan.status === "tertunda" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPesanan(pesanan);
                                  setShowKonfirmasiDialog(true);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Konfirmasi
                              </Button>
                            )}
                            
                            {/* Tombol Update Status untuk status lainnya */}
                            {pesanan.status !== "tertunda" && 
                             pesanan.status !== "terkirim" && 
                             pesanan.status !== "dibatalkan" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPesanan(pesanan);
                                  setShowUpdateStatusDialog(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Update Status
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Konfirmasi Pesanan */}
      {selectedPesanan && (
        <KonfirmasiPesananDialog
          pesananId={selectedPesanan.id}
          nomorPesanan={selectedPesanan.nomorPesanan}
          judul={selectedPesanan.judul}
          open={showKonfirmasiDialog}
          onOpenChange={setShowKonfirmasiDialog}
          onSuccess={handleRefresh}
        />
      )}

      {/* Dialog Update Status */}
      {selectedPesanan && (
        <UpdateStatusDialog
          pesananId={selectedPesanan.id}
          nomorPesanan={selectedPesanan.nomorPesanan}
          statusSaatIni={selectedPesanan.status}
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          onSuccess={handleRefresh}
        />
      )}
      </div>
    </div>
  );
}
