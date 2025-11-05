"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { naskahApi, type Naskah } from "@/lib/api/naskah";

type TabKey = "semua" | "in_review" | "revision_needed" | "rejected";

const labelStatus: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100" },
  in_review: { label: "Dalam Review", color: "text-amber-800", bg: "bg-amber-100" },
  revision_needed: { label: "Butuh Revisi", color: "text-orange-800", bg: "bg-orange-100" },
  rejected: { label: "Ditolak", color: "text-gray-500", bg: "bg-gray-200" },
};

function formatTanggal(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function DrafSayaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [allDrafts, setAllDrafts] = useState<Naskah[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await naskahApi.ambilNaskahSaya();
      // Sort terbaru berdasarkan dibuatPada
      const list = [...(res.data || [])].sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1));
      setAllDrafts(list);
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || "Gagal memuat draf");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDrafts = useMemo(() => {
    if (activeTab === "semua") return allDrafts;
    return allDrafts.filter((n) => n.status === activeTab);
  }, [allDrafts, activeTab]);

  const onLihatDetail = (id: string) => router.push(`/dashboard/draf/${id}`);
  const onEdit = (id: string) => router.push(`/dashboard/draf/edit/${id}`);
  const onHapus = async (id: string) => {
    // Konfirmasi sederhana
    const konfirmasi = window.confirm("Yakin ingin menghapus draf ini?");
    if (!konfirmasi) return;
    try {
      await naskahApi.hapusNaskah(id);
      toast.success("Draf berhasil dihapus");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || "Gagal menghapus draf");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Draf Saya</h1>
          <p className="text-gray-600 mt-1">Pantau progres naskah dan lanjutkan aksi yang diperlukan</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
          <div className="flex gap-2">
            {([
              { key: "semua", label: "Semua" },
              { key: "in_review", label: "Dalam Review" },
              { key: "revision_needed", label: "Butuh Revisi" },
              { key: "rejected", label: "Ditolak" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === t.key
                    ? "bg-[#14b8a6] text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="ml-auto pr-2 text-sm text-gray-500 self-center">
              {loading ? "Memuat…" : `${filteredDrafts.length} draf`}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredDrafts.length === 0 && !loading && (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-600">
              Belum ada draf pada tab ini.
            </div>
          )}

          {filteredDrafts.map((n) => {
            const st = labelStatus[n.status] || { label: n.status, color: "text-gray-700", bg: "bg-gray-100" };
            return (
              <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{n.judul}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Diajukan pada {formatTanggal(n.dibuatPada)}
                  </div>
                </div>

                <div className="flex gap-2 md:justify-end">
                  {/* IN_REVIEW: tombol disabled, abu-abu */}
                  {n.status === "in_review" && (
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      Lihat Detail
                    </button>
                  )}

                  {/* REVISION_NEEDED: CTA aktif */}
                  {n.status === "revision_needed" && (
                    <button
                      onClick={() => onEdit(n.id)}
                      className="px-4 py-2 rounded-lg bg-[#14b8a6] text-white hover:bg-[#0d9488]"
                    >
                      Lihat Feedback & Edit
                    </button>
                  )}

                  {/* REJECTED: Hapus aktif */}
                  {n.status === "rejected" && (
                    <button
                      onClick={() => onHapus(n.id)}
                      className="px-4 py-2 rounded-lg text-white bg-rose-600 hover:bg-rose-700"
                    >
                      Hapus
                    </button>
                  )}

                  {/* Default fallback: hanya lihat detail */}
                  {!["in_review", "revision_needed", "rejected"].includes(n.status) && (
                    <button
                      onClick={() => onLihatDetail(n.id)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Lihat Detail
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
