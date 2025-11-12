"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/client";

// DOKUMENTASI: docs/editor-naskah-masuk-review.md
// Halaman ini mengambil data dari tabel review_naskah dengan status 'ditugaskan'

interface ReviewNaskah {
  id: string;
  idNaskah: string;
  idEditor: string;
  status: "ditugaskan" | "dalam_proses" | "selesai" | "dibatalkan";
  ditugaskanPada: string;
  naskah: {
    id: string;
    judul: string;
    status: string;
    urlSampul?: string;
    penulis: {
      id: string;
      email: string;
      profilPengguna?: {
        namaDepan?: string;
        namaBelakang?: string;
      };
    };
  };
  _count: {
    feedback: number;
  };
}

export default function NaskahMasukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviewList, setReviewList] = useState<ReviewNaskah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReviewNaskah();
  }, []);

  const fetchReviewNaskah = async () => {
    setLoading(true);
    try {
      // Ambil review dari tabel review_naskah dengan status 'ditugaskan'
      const { data } = await api.get("/review/editor/saya", {
        params: {
          limit: 100,
          status: "ditugaskan", // Filter berdasarkan tabel review_naskah
        },
      });

      console.log("📋 Review naskah masuk:", data);
      setReviewList(data.data || []);
    } catch (error: any) {
      console.error("Error fetching review:", error);
      toast.error("Gagal memuat daftar naskah masuk");
    } finally {
      setLoading(false);
    }
  };

  const getNamaPenulis = (penulis: ReviewNaskah["naskah"]["penulis"]) => {
    if (penulis.profilPengguna) {
      const { namaDepan, namaBelakang } = penulis.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || penulis.email;
    }
    return penulis.email;
  };

  const filteredReview = reviewList.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const namaPenulis = getNamaPenulis(review.naskah.penulis);
    return (
      review.naskah.judul.toLowerCase().includes(query) ||
      namaPenulis.toLowerCase().includes(query)
    );
  });

  const formatWaktuRelative = (iso: string) => {
    const now = new Date();
    const date = new Date(iso);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Naskah Masuk</h1>
          <p className="text-gray-600 mt-1">
            Daftar naskah yang ditugaskan untuk direview
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ditugaskan</p>
              <p className="text-2xl font-bold text-gray-900">{reviewList.length}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari judul naskah atau penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : filteredReview.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">Tidak ada naskah masuk</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Belum ada naskah yang ditugaskan untuk Anda review"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReview.map((review) => {
              const namaPenulis = getNamaPenulis(review.naskah.penulis);

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Cover */}
                    {review.naskah.urlSampul ? (
                      <img
                        src={review.naskah.urlSampul}
                        alt={review.naskah.judul}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {review.naskah.judul}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Ditugaskan
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{namaPenulis}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatWaktuRelative(review.ditugaskanPada)}</span>
                        </div>
                        {review._count.feedback > 0 && (
                          <span className="text-purple-600">
                            {review._count.feedback} feedback
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/dashboard/editor/review/${review.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                        >
                          Mulai Review
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/editor/naskah/${review.naskah.id}`)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
        )}
      </div>
    </div>
  );
}
