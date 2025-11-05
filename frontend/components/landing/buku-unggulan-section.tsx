"use client";

import { useState } from "react";

interface BukuCard {
  id: string;
  judul: string;
  penulis: string;
  urlSampul?: string;
  kategori?: string;
  genre?: string;
}

const banyakDibeli: BukuCard[] = [
  {
    id: "bs1",
    judul: "Rahasia Hutan Senja",
    penulis: "Rina Amelia",
    urlSampul:
      "https://images.unsplash.com/photo-1544937950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    kategori: "Fiksi",
    genre: "Fantasi",
  },
  {
    id: "bs2",
    judul: "Memoar di Balik Kota",
    penulis: "Budi Santoso",
    urlSampul:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    kategori: "Non-Fiksi",
    genre: "Biografi",
  },
  {
    id: "bs3",
    judul: "Garis Waktu Asa",
    penulis: "Ayu Lestari",
    urlSampul:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop",
    kategori: "Fiksi",
    genre: "Romansa",
  },
  {
    id: "bs4",
    judul: "Teorema Rasa Kopi",
    penulis: "Dimas Saputra",
    urlSampul:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    kategori: "Fiksi",
    genre: "Slice of Life",
  },
];

const unggulan: BukuCard[] = [
  {
    id: "ft1",
    judul: "Berkebun di Balkon",
    penulis: "Sinta Dewi",
    urlSampul:
      "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=800&auto=format&fit=crop",
    kategori: "Non-Fiksi",
    genre: "Hobi",
  },
  {
    id: "ft2",
    judul: "Langkah Kecil Maraton",
    penulis: "Andi Pratama",
    urlSampul:
      "https://images.unsplash.com/photo-1546549039-49e05b8b56d5?q=80&w=800&auto=format&fit=crop",
    kategori: "Non-Fiksi",
    genre: "Kesehatan",
  },
  {
    id: "ft3",
    judul: "Merajut Kata",
    penulis: "Nadia Putri",
    urlSampul:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop",
    kategori: "Fiksi",
    genre: "Puisi",
  },
  {
    id: "ft4",
    judul: "Seni Presentasi",
    penulis: "Rafi Akbar",
    urlSampul:
      "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?q=80&w=800&auto=format&fit=crop",
    kategori: "Non-Fiksi",
    genre: "Karier",
  },
];

export function BukuUnggulanSection() {
  const [tab, setTab] = useState<"banyak_dibeli" | "unggulan">("banyak_dibeli");
  const data = tab === "banyak_dibeli" ? banyakDibeli : unggulan;
  const labelTab = tab === "banyak_dibeli" ? "Banyak Dibeli" : "Unggulan";

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[#14b8a6] font-semibold text-sm uppercase tracking-wider">
            Karya Buku
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900">
            Buku <span className="text-[#14b8a6]">{labelTab}</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Jelajahi koleksi buku kami yang paling populer dan pilihan editor.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setTab("banyak_dibeli")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              tab === "banyak_dibeli"
                ? "bg-[#14b8a6] text-white border-[#14b8a6] shadow"
                : "text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Banyak Dibeli
          </button>
          <button
            onClick={() => setTab("unggulan")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              tab === "unggulan"
                ? "bg-[#14b8a6] text-white border-[#14b8a6] shadow"
                : "text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Unggulan
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((buku) => (
            <div
              key={buku.id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[3/4] bg-gray-100">
                {buku.urlSampul ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={buku.urlSampul}
                    alt={`Sampul ${buku.judul}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                    <span className="text-sm">Tidak ada sampul</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-white/90 line-clamp-1">
                    {buku.kategori || "-"} {buku.genre ? `• ${buku.genre}` : ""}
                  </div>
                </div>
                <div className="absolute left-3 top-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-900 shadow">
                    {tab === "banyak_dibeli" ? "Banyak Dibeli" : "Unggulan"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                  {buku.judul}
                </h3>
                <div className="mt-1 text-sm text-gray-600">oleh {buku.penulis}</div>

                <div className="mt-4 flex gap-2">
                  <a
                    href="#"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#14b8a6] text-white hover:bg-[#0d9488]"
                  >
                    Lihat Detail
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Bagikan
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
