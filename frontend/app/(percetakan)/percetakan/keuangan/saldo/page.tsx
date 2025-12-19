"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  CreditCard,
  Building2,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/utils";

// Data akan diambil dari API

const STATUS_CONFIG = {
  selesai: { label: "Selesai", color: "bg-green-100 text-green-800" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
};

const TIPE_CONFIG = {
  pemasukan: { label: "Pemasukan", icon: ArrowDownRight, color: "text-green-600" },
  pengeluaran: { label: "Pengeluaran", icon: ArrowUpRight, color: "text-red-600" },
};

export default function SaldoPercetakanPage() {
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [jumlahPenarikan, setJumlahPenarikan] = useState("");
  const [keteranganPenarikan, setKeteranganPenarikan] = useState("");
  const [filterTipe, setFilterTipe] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  // State untuk data dari API
  const [saldoData, setSaldoData] = useState({
    tersedia: 0,
    pending: 0,
    totalPendapatan: 0,
    totalDitarik: 0,
  });

  const [rekeningBank, setRekeningBank] = useState({
    namaBank: "-",
    nomorRekening: "-",
    atasNama: "-",
  });

  const [transaksi, setTransaksi] = useState<any[]>([]);

  // TODO: Fetch data dari API
  // useEffect(() => {
  //   fetchSaldoData();
  //   fetchRekeningBank();
  //   fetchTransaksi();
  // }, []);

  const handleWithdraw = () => {
    // TODO: Implement withdraw logic
    console.log("Penarikan:", { jumlahPenarikan, keteranganPenarikan });
    setOpenWithdraw(false);
    setJumlahPenarikan("");
    setKeteranganPenarikan("");
  };

  const filteredTransaksi = transaksi.filter((t) => {
    const tipeMatch = filterTipe === "semua" || t.tipe === filterTipe;
    const statusMatch = filterStatus === "semua" || t.status === filterStatus;
    return tipeMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Saldo & Keuangan
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola saldo dan riwayat transaksi percetakan
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
              <DialogTrigger>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg gap-2">
                  <Wallet className="h-4 w-4" />
                  Tarik Dana
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Penarikan Dana</DialogTitle>
                  <DialogDescription>
                    Tarik dana dari saldo tersedia ke rekening bank terdaftar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Saldo Tersedia</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {formatRupiah(saldoData.tersedia)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlah">Jumlah Penarikan</Label>
                    <Input
                      id="jumlah"
                      type="number"
                      placeholder="Masukkan jumlah"
                      value={jumlahPenarikan}
                      onChange={(e) => setJumlahPenarikan(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Minimum penarikan: Rp 100.000
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                    <Input
                      id="keterangan"
                      placeholder="Keterangan penarikan"
                      value={keteranganPenarikan}
                      onChange={(e) => setKeteranganPenarikan(e.target.value)}
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-medium">
                      <Building2 className="h-4 w-4" />
                      Rekening Tujuan
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{rekeningBank.namaBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">No. Rekening:</span>
                        <span className="font-medium">{rekeningBank.nomorRekening}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Atas Nama:</span>
                        <span className="font-medium">{rekeningBank.atasNama}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenWithdraw(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleWithdraw}
                    disabled={!jumlahPenarikan || Number(jumlahPenarikan) < 100000}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Ajukan Penarikan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Saldo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Saldo Tersedia</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatRupiah(saldoData.tersedia)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Bisa ditarik</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <RefreshCw className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Saldo Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatRupiah(saldoData.pending)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Pesanan dalam proses</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Pendapatan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatRupiah(saldoData.totalPendapatan)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Keseluruhan</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Ditarik</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatRupiah(saldoData.totalDitarik)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Penarikan dana</p>
            </CardContent>
          </Card>
        </div>

        {/* Rekening Bank */}
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-700" />
              Rekening Bank Terdaftar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nama Bank</p>
                <p className="text-lg font-semibold">{rekeningBank.namaBank}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nomor Rekening</p>
                <p className="text-lg font-semibold">{rekeningBank.nomorRekening}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Atas Nama</p>
                <p className="text-lg font-semibold">{rekeningBank.atasNama}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                Update Rekening
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Riwayat Transaksi */}
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-700" />
                Riwayat Transaksi
              </CardTitle>
              <div className="flex flex-wrap gap-3">
                <Select value={filterTipe} onValueChange={setFilterTipe}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Tipe</SelectItem>
                    <SelectItem value="pemasukan">Pemasukan</SelectItem>
                    <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransaksi.map((transaksi) => {
                    const TipeIcon = TIPE_CONFIG[transaksi.tipe as keyof typeof TIPE_CONFIG].icon;
                    return (
                      <TableRow key={transaksi.id}>
                        <TableCell className="font-medium">
                          {format(transaksi.tanggal, "dd MMM yyyy", { locale: id })}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {transaksi.referensi}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TipeIcon className={`h-4 w-4 ${TIPE_CONFIG[transaksi.tipe as keyof typeof TIPE_CONFIG].color}`} />
                            <span className={TIPE_CONFIG[transaksi.tipe as keyof typeof TIPE_CONFIG].color}>
                              {TIPE_CONFIG[transaksi.tipe as keyof typeof TIPE_CONFIG].label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <span className={transaksi.tipe === "pemasukan" ? "text-green-600" : "text-red-600"}>
                            {transaksi.tipe === "pemasukan" ? "+" : "-"}
                            {formatRupiah(transaksi.jumlah)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_CONFIG[transaksi.status as keyof typeof STATUS_CONFIG].color}>
                            {STATUS_CONFIG[transaksi.status as keyof typeof STATUS_CONFIG].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-gray-600 truncate">
                            {transaksi.keterangan}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredTransaksi.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada transaksi yang sesuai filter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
