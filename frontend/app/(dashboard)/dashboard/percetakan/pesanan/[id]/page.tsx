"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  FileText,
  Download,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  ambilDetailPesanan,
  terimaPesanan,
  tolakPesanan,
} from "@/lib/api/percetakan";
import type { PesananCetak } from "@/types/percetakan";
import Link from "next/link";
import Image from "next/image";

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [pesanan, setPesanan] = useState<PesananCetak | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTolakModal, setShowTolakModal] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState("");

  useEffect(() => {
    if (id) {
      loadDetailPesanan();
    }
  }, [id]);

  async function loadDetailPesanan() {
    try {
      setLoading(true);
      const response = await ambilDetailPesanan(id);
      if (response.sukses) {
        setPesanan(response.data);
      }
    } catch (error) {
      console.error("Error loading detail pesanan:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTerimaPesanan() {
    if (!window.confirm("Apakah Anda yakin ingin menerima pesanan ini?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await terimaPesanan(id);
      if (response.sukses) {
        alert("Pesanan berhasil diterima!");
        loadDetailPesanan();
      }
    } catch (error: any) {
      alert(error.response?.data?.pesan || "Gagal menerima pesanan");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTolakPesanan() {
    if (!alasanTolak.trim()) {
      alert("Silakan masukkan alasan penolakan");
      return;
    }

    try {
      setActionLoading(true);
      const response = await tolakPesanan(id, alasanTolak);
      if (response.sukses) {
        alert("Pesanan berhasil ditolak");
        setShowTolakModal(false);
        loadDetailPesanan();
      }
    } catch (error: any) {
      alert(error.response?.data?.pesan || "Gagal menolak pesanan");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!pesanan) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Pesanan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Pesanan yang Anda cari tidak dapat ditemukan
          </p>
          <Link
            href="/dashboard/percetakan/pesanan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const isPending = pesanan.status === "tertunda";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/percetakan/pesanan"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pesanan.nomorPesanan}
            </h1>
            <p className="text-gray-600 mt-1">Detail Pesanan Cetak</p>
          </div>
        </div>
        <StatusBadge status={pesanan.status} />
      </div>

      {/* Action Buttons - Only for Pending Orders */}
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pesanan Baru</h3>
                <p className="text-sm text-gray-600">
                  Tindakan diperlukan: Terima atau tolak pesanan ini
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTolakModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Tolak
              </button>
              <button
                onClick={handleTerimaPesanan}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Terima Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Naskah */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Informasi Naskah
            </h2>
            <div className="flex gap-4">
              {pesanan.naskah?.urlSampul && (
                <div className="flex-shrink-0">
                  <Image
                    src={pesanan.naskah.urlSampul}
                    alt={pesanan.naskah.judul}
                    width={120}
                    height={160}
                    className="rounded-lg object-cover shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Judul</p>
                  <p className="font-semibold text-gray-900">
                    {pesanan.naskah?.judul || "-"}
                  </p>
                </div>
                {pesanan.naskah?.subJudul && (
                  <div>
                    <p className="text-sm text-gray-600">Subjudul</p>
                    <p className="text-gray-900">{pesanan.naskah.subJudul}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ISBN</p>
                    <p className="text-gray-900">
                      {pesanan.naskah?.isbn || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jumlah Halaman</p>
                    <p className="text-gray-900">
                      {pesanan.naskah?.jumlahHalaman || 0} halaman
                    </p>
                  </div>
                </div>
                {pesanan.naskah?.urlFile && (
                  <a
                    href={pesanan.naskah.urlFile}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download File Naskah
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Spesifikasi Cetak */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Spesifikasi Cetak
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Jumlah Eksemplar</p>
                <p className="font-semibold text-gray-900">{pesanan.jumlah} eksemplar</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Format Kertas</p>
                <p className="font-semibold text-gray-900">{pesanan.formatKertas}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Kertas</p>
                <p className="font-semibold text-gray-900">{pesanan.jenisKertas}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Cover</p>
                <p className="font-semibold text-gray-900">{pesanan.jenisCover}</p>
              </div>
            </div>
            {pesanan.finishingTambahan && pesanan.finishingTambahan.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Finishing Tambahan</p>
                <div className="flex flex-wrap gap-2">
                  {pesanan.finishingTambahan.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pesanan.catatan && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Catatan</p>
                <p className="text-gray-900 mt-1">{pesanan.catatan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informasi Pemesan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Informasi Pemesan
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium text-gray-900">
                  {pesanan.pemesan?.profilPengguna?.namaDepan}{" "}
                  {pesanan.pemesan?.profilPengguna?.namaBelakang}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{pesanan.pemesan?.email}</p>
              </div>
              {pesanan.pemesan?.telepon && (
                <div>
                  <p className="text-sm text-gray-600">Telepon</p>
                  <p className="text-gray-900">{pesanan.pemesan.telepon}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Pesanan
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Tanggal Pesanan</p>
                <p className="font-medium text-gray-900">
                  {new Date(pesanan.tanggalPesan).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {pesanan.estimasiSelesai && (
                <div className="flex justify-between">
                  <p className="text-gray-600">Estimasi Selesai</p>
                  <p className="font-medium text-gray-900">
                    {new Date(pesanan.estimasiSelesai).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">Total</p>
                  <p className="text-2xl font-bold text-teal-600">
                    Rp {pesanan.hargaTotal.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tolak Pesanan */}
      {showTolakModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tolak Pesanan
            </h3>
            <p className="text-gray-600 mb-4">
              Silakan berikan alasan penolakan pesanan ini:
            </p>
            <textarea
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTolakModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleTolakPesanan}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Tolak Pesanan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component untuk Badge Status
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    tertunda: {
      label: "Tertunda",
      className: "bg-yellow-100 text-yellow-800",
    },
    diterima: {
      label: "Diterima",
      className: "bg-blue-100 text-blue-800",
    },
    dalam_produksi: {
      label: "Produksi",
      className: "bg-purple-100 text-purple-800",
    },
    kontrol_kualitas: {
      label: "QC",
      className: "bg-indigo-100 text-indigo-800",
    },
    siap: {
      label: "Siap Kirim",
      className: "bg-teal-100 text-teal-800",
    },
    dikirim: {
      label: "Dikirim",
      className: "bg-cyan-100 text-cyan-800",
    },
    terkirim: {
      label: "Selesai",
      className: "bg-green-100 text-green-800",
    },
    dibatalkan: {
      label: "Dibatalkan",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
