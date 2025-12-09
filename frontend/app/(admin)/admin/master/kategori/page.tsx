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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              Master Kategori & Genre
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola kategori dan genre buku untuk sistem klasifikasi
            </p>
          </div>
          <Button
            onClick={() => setModalTambah(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah {activeTab === "kategori" ? "Kategori" : "Genre"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FolderTree className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-purple-700 font-medium">Total Kategori</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{dummyKategori.length}</p>
              <p className="text-xs text-purple-600 mt-2">
                {dummyKategori.filter((k) => k.aktif).length} aktif
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Tags className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <p className="text-sm text-pink-700 font-medium">Total Genre</p>
              <p className="text-3xl font-bold text-pink-900 mt-1">{dummyGenre.length}</p>
              <p className="text-xs text-pink-600 mt-2">
                {dummyGenre.filter((g) => g.aktif).length} aktif
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-700 font-medium">Total Buku</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {dummyKategori.reduce((acc, k) => acc + k.jumlahBuku, 0)}
              </p>
              <p className="text-xs text-blue-600 mt-2">Terdistribusi dalam kategori</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("kategori")}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === "kategori"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FolderTree className="w-4 h-4 inline mr-2" />
            Kategori
          </button>
          <button
            onClick={() => setActiveTab("genre")}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === "genre"
                ? "bg-white text-pink-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Tags className="w-4 h-4 inline mr-2" />
            Genre
          </button>
        </div>

        {/* Search */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={`Cari ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Nama
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Slug
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Deskripsi
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Jumlah Buku
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              activeTab === "kategori"
                                ? "bg-purple-100"
                                : "bg-pink-100"
                            }`}
                          >
                            {activeTab === "kategori" ? (
                              <FolderTree
                                className={`w-4 h-4 ${
                                  activeTab === "kategori"
                                    ? "text-purple-600"
                                    : "text-pink-600"
                                }`}
                              />
                            ) : (
                              <Tags className="w-4 h-4 text-pink-600" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{item.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {item.deskripsi}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="font-mono">
                          {item.jumlahBuku}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          className={
                            item.aktif
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
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
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                <Tags className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Fitur dalam pengembangan
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Data yang ditampilkan adalah data dummy. Integrasi CRUD dengan backend akan ditambahkan
                untuk mengelola kategori dan genre secara dinamis.
              </p>
            </div>
          </CardContent>
        </Card>
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
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                placeholder="Deskripsi singkat"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTambah(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                setModalTambah(false);
                setFormData({ nama: "", deskripsi: "" });
              }}
              className={activeTab === "kategori" ? "bg-purple-600" : "bg-pink-600"}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
