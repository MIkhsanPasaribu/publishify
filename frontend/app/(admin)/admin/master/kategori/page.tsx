"use client";

import { useState } from "react";
import {
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  BookOpen,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Dummy data
const dummyKategori = [
  { id: "1", nama: "Novel", slug: "novel", deskripsi: "Karya fiksi naratif panjang", aktif: true, jumlahBuku: 45 },
  { id: "2", nama: "Non-Fiksi", slug: "non-fiksi", deskripsi: "Buku berdasarkan fakta", aktif: true, jumlahBuku: 32 },
  { id: "3", nama: "Buku Anak", slug: "buku-anak", deskripsi: "Buku untuk pembaca muda", aktif: true, jumlahBuku: 28 },
  { id: "4", nama: "Biografi", slug: "biografi", deskripsi: "Kisah hidup tokoh", aktif: true, jumlahBuku: 15 },
  { id: "5", nama: "Sejarah", slug: "sejarah", deskripsi: "Buku tentang sejarah", aktif: false, jumlahBuku: 8 },
];

const dummyGenre = [
  { id: "1", nama: "Fiksi", slug: "fiksi", deskripsi: "Cerita rekaan", aktif: true, jumlahBuku: 67 },
  { id: "2", nama: "Romantis", slug: "romantis", deskripsi: "Cerita percintaan", aktif: true, jumlahBuku: 34 },
  { id: "3", nama: "Thriller", slug: "thriller", deskripsi: "Cerita menegangkan", aktif: true, jumlahBuku: 22 },
  { id: "4", nama: "Komedi", slug: "komedi", deskripsi: "Cerita lucu", aktif: true, jumlahBuku: 18 },
  { id: "5", nama: "Horor", slug: "horor", deskripsi: "Cerita seram", aktif: true, jumlahBuku: 12 },
  { id: "6", nama: "Religi", slug: "religi", deskripsi: "Konten keagamaan", aktif: true, jumlahBuku: 25 },
  { id: "7", nama: "Self-Help", slug: "self-help", deskripsi: "Pengembangan diri", aktif: true, jumlahBuku: 30 },
];

export default function MasterKategoriPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"kategori" | "genre">("kategori");
  const [modalTambah, setModalTambah] = useState(false);
  const [formData, setFormData] = useState({ nama: "", deskripsi: "" });

  const dataAktif = activeTab === "kategori" ? dummyKategori : dummyGenre;
  const filteredData = dataAktif.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header dengan Gradient */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Master Kategori & Genre
            </h1>
            <p className="text-sm sm:text-base text-teal-50">
              Kelola kategori dan genre buku untuk sistem klasifikasi
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Kategori */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderTree className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Kategori</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{dummyKategori.length}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {dummyKategori.filter((k) => k.aktif).length} aktif
                </p>
              </div>
            </div>
          </div>

          {/* Total Genre */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tags className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Genre</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{dummyGenre.length}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {dummyGenre.filter((g) => g.aktif).length} aktif
                </p>
              </div>
            </div>
          </div>

          {/* Total Buku */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Buku</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {dummyKategori.reduce((acc, k) => acc + k.jumlahBuku, 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Terdistribusi dalam kategori</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setModalTambah(true)}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah {activeTab === "kategori" ? "Kategori" : "Genre"}
          </Button>
        </div>

        {/* Tab Switcher - Responsive Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab("kategori")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "kategori"
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md ring-2 ring-teal-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FolderTree className="w-4 h-4" />
                <span className="font-semibold">Kategori</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("genre")}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === "genre"
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md ring-2 ring-teal-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Tags className="w-4 h-4" />
                <span className="font-semibold">Genre</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              placeholder={`Cari ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 sm:py-3 w-full border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Jumlah Buku
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            activeTab === "kategori"
                              ? "bg-teal-100"
                              : "bg-amber-100"
                          }`}
                        >
                          {activeTab === "kategori" ? (
                            <FolderTree
                              className="w-4 h-4 text-teal-600"
                            />
                          ) : (
                            <Tags className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {item.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {item.deskripsi}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="font-mono border-slate-300 text-slate-700">
                        {item.jumlahBuku}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={
                          item.aktif
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }
                      >
                        {item.aktif ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Nonaktif
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="ghost" className="hover:bg-slate-100">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Tags className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Fitur dalam pengembangan
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Data yang ditampilkan adalah data dummy. Integrasi CRUD dengan backend akan ditambahkan
              untuk mengelola kategori dan genre secara dinamis.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah */}
      <Dialog open={modalTambah} onOpenChange={setModalTambah}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Tambah {activeTab === "kategori" ? "Kategori" : "Genre"} Baru
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambahkan {activeTab} baru ke sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                placeholder={`Nama ${activeTab}`}
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="mt-1.5 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                placeholder="Deskripsi singkat"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="mt-1.5 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTambah(false)} className="border-slate-300 hover:bg-slate-50">
              Batal
            </Button>
            <Button
              onClick={() => {
                setModalTambah(false);
                setFormData({ nama: "", deskripsi: "" });
              }}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
