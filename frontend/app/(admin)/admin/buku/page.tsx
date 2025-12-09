"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  Tag,
  DollarSign,
  BookCheck,
  TrendingUp,
  BarChart3,
  Download,
  ExternalLink,
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

// Dummy data untuk UI
const dummyBuku = [
  {
    id: "1",
    judul: "Filosofi Kopi",
    penulis: "Dewi Lestari",
    isbn: "978-602-12345-1-2",
    kategori: "Novel",
    genre: "Fiksi",
    hargaJual: 89000,
    biayaProduksi: 45000,
    totalTerjual: 1250,
    urlSampul: null,
    diterbitkanPada: "2024-01-15",
    publik: true,
  },
  {
    id: "2",
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    isbn: "978-602-12345-2-3",
    kategori: "Novel",
    genre: "Inspirasi",
    hargaJual: 95000,
    biayaProduksi: 48000,
    totalTerjual: 2340,
    urlSampul: null,
    diterbitkanPada: "2024-02-20",
    publik: true,
  },
  {
    id: "3",
    judul: "Negeri 5 Menara",
    penulis: "Ahmad Fuadi",
    isbn: "978-602-12345-3-4",
    kategori: "Novel",
    genre: "Religi",
    hargaJual: 85000,
    biayaProduksi: 42000,
    totalTerjual: 890,
    urlSampul: null,
    diterbitkanPada: "2024-03-10",
    publik: true,
  },
];

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
  });
}

export default function BukuTerbitAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");

  // Stats
  const totalBuku = dummyBuku.length;
  const totalTerjual = dummyBuku.reduce((acc, b) => acc + b.totalTerjual, 0);
  const totalPendapatan = dummyBuku.reduce((acc, b) => acc + b.hargaJual * b.totalTerjual, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
              Katalog Buku Terbit
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola semua buku yang sudah diterbitkan di platform
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <p className="text-sm text-teal-700 font-medium">Total Buku</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalBuku}</p>
              <p className="text-xs text-teal-600 mt-2">Buku aktif di katalog</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-700 font-medium">Total Terjual</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {totalTerjual.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-blue-600 mt-2">Eksemplar terjual</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-700 font-medium">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {formatRupiah(totalPendapatan)}
              </p>
              <p className="text-xs text-green-600 mt-2">Gross revenue</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-purple-700 font-medium">Rata-rata Harga</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatRupiah(Math.round(totalPendapatan / totalTerjual / totalBuku))}
              </p>
              <p className="text-xs text-purple-600 mt-2">Per eksemplar</p>
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
                  placeholder="Cari buku berdasarkan judul, ISBN, atau penulis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  <SelectItem value="novel">Novel</SelectItem>
                  <SelectItem value="nonfiksi">Non-Fiksi</SelectItem>
                  <SelectItem value="anak">Buku Anak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Book List */}
        <div className="grid grid-cols-1 gap-4">
          {dummyBuku.map((buku) => (
            <Card
              key={buku.id}
              className="border-2 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Cover */}
                  <div className="flex-shrink-0">
                    <div className="w-28 h-40 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-lg flex items-center justify-center shadow-md">
                      <BookOpen className="h-10 w-10 text-teal-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{buku.judul}</h3>
                        <p className="text-gray-600">{buku.penulis}</p>
                      </div>
                      <Badge
                        className={
                          buku.publik
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {buku.publik ? "Publik" : "Draft"}
                      </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">ISBN</p>
                        <p className="font-mono font-medium">{buku.isbn}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Kategori</p>
                        <p className="font-medium">{buku.kategori}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Harga Jual</p>
                        <p className="font-semibold text-green-600">
                          {formatRupiah(buku.hargaJual)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Terjual</p>
                        <p className="font-semibold">{buku.totalTerjual.toLocaleString("id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Diterbitkan</p>
                        <p className="font-medium">{formatTanggal(buku.diterbitkanPada)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Lihat di Katalog
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State Info */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <BookCheck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Fitur dalam pengembangan
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Halaman ini menampilkan data dummy. Integrasi dengan backend akan ditambahkan
                untuk menampilkan buku yang sudah diterbitkan secara real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
