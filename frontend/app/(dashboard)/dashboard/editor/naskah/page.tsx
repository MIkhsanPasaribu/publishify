"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Naskah {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  status: string;
  urlSampul?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  dibuatPada: string;
  penulis: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
    profilPenulis?: {
      namaPena?: string;
    };
  };
  kategori?: {
    id: string;
    nama: string;
  };
  genre?: {
    id: string;
    nama: string;
  };
}

interface ResponseSukses<T> {
  sukses: boolean;
  pesan: string;
  data: T;
  metadata?: {
    total: number;
    halaman: number;
    limit: number;
    totalHalaman: number;
  };
}

export default function NaskahMasukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [halaman, setHalaman] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalHalaman, setTotalHalaman] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNaskah();
  }, [halaman]);

  const fetchNaskah = async () => {
    setLoading(true);
    try {
      // Ambil naskah dengan status 'diajukan' (siap untuk direview)
      const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah", {
        params: {
          halaman,
          limit,
          status: "diajukan", // Hanya naskah yang sudah diajukan
        },
      });
      
      setNaskahList(data.data);
      
      if (data.metadata) {
        setTotal(data.metadata.total);
        setTotalHalaman(data.metadata.totalHalaman);
      }
    } catch (error: any) {
      console.error("Error fetching naskah:", error);
      toast.error("Gagal memuat daftar naskah");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setHalaman(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredNaskah = naskahList.filter((naskah) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      naskah.judul.toLowerCase().includes(query) ||
      naskah.sinopsis.toLowerCase().includes(query)
    );
  });

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  const formatWaktuRelative = (iso: string) => {
    if (!iso) return "-";
    const now = new Date();
    const date = new Date(iso);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return formatTanggal(iso);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/editor")}
                className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📥 Naskah Masuk</h1>
                <p className="text-gray-600 mt-1">Naskah yang siap untuk direview</p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Informasi</h3>
                <p className="text-sm text-blue-800">
                  Berikut adalah daftar naskah yang telah diajukan oleh penulis. 
                  Anda dapat melihat detail naskah dan mendownload file untuk referensi. 
                  <strong> Admin akan menugaskan review kepada Anda melalui sistem.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau sinopsis naskah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Naskah List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredNaskah.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">Tidak ada naskah masuk</p>
            <p className="text-gray-400 text-sm">
              {searchQuery 
                ? `Tidak ada naskah yang cocok dengan pencarian "${searchQuery}"`
                : "Belum ada naskah yang diajukan untuk direview"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {filteredNaskah.map((naskah) => {
                const namaPenulis = naskah.penulis.profilPenulis?.namaPena || 
                                   `${naskah.penulis.profilPengguna?.namaDepan || ''} ${naskah.penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
                                   naskah.penulis.email;

                return (
                  <div
                    key={naskah.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all group"
                  >
                    <div className="flex gap-6">
                      {/* Cover Image */}
                      {naskah.urlSampul ? (
                        <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={naskah.urlSampul}
                            alt={naskah.judul}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                              {naskah.judul}
                            </h3>
                            {naskah.subJudul && (
                              <p className="text-gray-600 text-sm mt-1 line-clamp-1">{naskah.subJudul}</p>
                            )}
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-medium whitespace-nowrap">
                            📋 Siap Review
                          </span>
                        </div>

                        {/* Info Penulis & Metadata */}
                        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">{namaPenulis}</span>
                          </span>
                          {naskah.kategori && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {naskah.kategori.nama}
                            </span>
                          )}
                          {naskah.genre && (
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {naskah.genre.nama}
                            </span>
                          )}
                          {naskah.jumlahHalaman && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {naskah.jumlahHalaman} halaman
                            </span>
                          )}
                          {naskah.jumlahKata && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {naskah.jumlahKata.toLocaleString()} kata
                            </span>
                          )}
                        </div>

                        {/* Sinopsis */}
                        <p className="text-gray-700 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {naskah.sinopsis}
                        </p>

                        {/* Footer: Waktu & Action */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Diajukan {formatWaktuRelative(naskah.dibuatPada)}
                          </span>

                          <button
                            onClick={() => router.push(`/dashboard/editor/naskah/${naskah.id}`)}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalHalaman > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan <span className="font-medium">{((halaman - 1) * limit) + 1}</span> - <span className="font-medium">{Math.min(halaman * limit, total)}</span> dari <span className="font-medium">{total}</span> naskah
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(halaman - 1)}
                      disabled={halaman === 1}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${halaman === 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-purple-600 text-white hover:bg-purple-700"
                        }
                      `}
                    >
                      Sebelumnya
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalHalaman }, (_, i) => i + 1)
                        .filter(page => {
                          return page === 1 || 
                                 page === totalHalaman || 
                                 (page >= halaman - 1 && page <= halaman + 1);
                        })
                        .map((page, idx, arr) => {
                          const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1;
                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsisBefore && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`
                                  w-10 h-10 rounded-lg text-sm font-medium transition-all
                                  ${page === halaman
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }
                                `}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => handlePageChange(halaman + 1)}
                      disabled={halaman === totalHalaman}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${halaman === totalHalaman
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-purple-600 text-white hover:bg-purple-700"
                        }
                      `}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
