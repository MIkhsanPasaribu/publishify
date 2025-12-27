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
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header dengan Gradient */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Katalog Buku Terbit
            </h1>
            <p className="text-sm sm:text-base text-teal-50">
              Kelola semua buku yang sudah diterbitkan di platform
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Buku */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Buku</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalBuku}</p>
                <p className="text-xs text-slate-500 mt-1">Buku aktif di katalog</p>
              </div>
            </div>
          </div>

          {/* Total Terjual */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Terjual</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {totalTerjual.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-slate-500 mt-1">Eksemplar terjual</p>
              </div>
            </div>
          </div>

          {/* Total Pendapatan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Pendapatan</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {formatRupiah(totalPendapatan)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Gross revenue</p>
              </div>
            </div>
          </div>

          {/* Rata-rata Harga */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Rata-rata Harga</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {formatRupiah(Math.round(totalPendapatan / totalTerjual / totalBuku))}
                </p>
                <p className="text-xs text-slate-500 mt-1">Per eksemplar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Cari buku berdasarkan judul, ISBN, atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="w-full md:w-48 border-slate-300 focus:border-teal-500 focus:ring-teal-500">
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
        </div>

        {/* Book List */}
        <div className="grid grid-cols-1 gap-4">
          {dummyBuku.map((buku) => (
            <div
              key={buku.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6"
            >
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
                      <h3 className="text-xl font-bold text-slate-900">{buku.judul}</h3>
                      <p className="text-slate-600">{buku.penulis}</p>
                    </div>
                    <Badge
                      className={
                        buku.publik
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      }
                    >
                      {buku.publik ? "Publik" : "Draft"}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">ISBN</p>
                      <p className="font-mono font-medium text-slate-900">{buku.isbn}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Kategori</p>
                      <p className="font-medium text-slate-900">{buku.kategori}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Harga Jual</p>
                      <p className="font-semibold text-green-600">
                        {formatRupiah(buku.hargaJual)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Terjual</p>
                      <p className="font-semibold text-slate-900">{buku.totalTerjual.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Diterbitkan</p>
                      <p className="font-medium text-slate-900">{formatTanggal(buku.diterbitkanPada)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Lihat di Katalog
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Info */}
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookCheck className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Fitur dalam pengembangan
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Halaman ini menampilkan data dummy. Integrasi dengan backend akan ditambahkan
              untuk menampilkan buku yang sudah diterbitkan secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
