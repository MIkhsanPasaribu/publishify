"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/client";

// Lihat dokumentasi: docs/editor-naskah-masuk-review.md

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
      const { data } = await api.get("/review/editor/saya", {
        params: {
          limit: 100,
          status: "ditugaskan",
        },
      });
      setReviewList(data.data || []);
    } catch (error: any) {
      console.error("Error fetching review:", error);
      toast.error("Gagal memuat daftar naskah masuk");
    } finally {
      setLoading(false);
    }
  };

  const filteredReview = reviewList.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const namaPenulis = review.naskah.penulis.profilPengguna
      ? \ \.trim()
      : review.naskah.penulis.email;
    return review.naskah.judul.toLowerCase().includes(query) || namaPenulis.toLowerCase().includes(query);
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Naskah Masuk</h1>
      <input
        type="text"
        placeholder="Cari naskah..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      {loading ? (
        <p>Loading...</p>
      ) : filteredReview.length === 0 ? (
        <p>Tidak ada naskah masuk</p>
      ) : (
        <div>
          {filteredReview.map((review) => (
            <div key={review.id} className="border p-4 mb-2 rounded">
              <h3 className="font-bold">{review.naskah.judul}</h3>
              <p>Status: {review.status}</p>
              <button
                onClick={() => router.push(/dashboard/editor/review/\)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Mulai Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
