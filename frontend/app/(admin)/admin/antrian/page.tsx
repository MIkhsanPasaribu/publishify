"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api/client";
import { reviewApi } from "@/lib/api/review";

// ================================
// INTERFACES
// ================================

interface Naskah {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  status: string;
  dibuatPada: string;
  diperbaruiPada: string;
  penulis: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
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

interface Editor {
  id: string;
  email: string;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
  };
  peranPengguna?: Array<{
    jenisPeran: string;
    aktif: boolean;
  }>;
}

interface ResponseSukses<T> {
  sukses: boolean;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

// ================================
// MAIN COMPONENT
// ================================

export default function AntrianReviewPage() {
  // States
  const [loading, setLoading] = useState(true);
  const [loadingEditor, setLoadingEditor] = useState(true);
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [editorList, setEditorList] = useState<Editor[]>([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [selectedEditor, setSelectedEditor] = useState<string>("");
  const [sedangTugaskan, setSedangTugaskan] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchNaskahDiajukan();
    fetchEditorList();
  }, []);

  // ================================
  // API CALLS
  // ================================

  const fetchNaskahDiajukan = async () => {
    setLoading(true);
    try {
      const response = await api.get<ResponseSukses<Naskah[]>>("/naskah", {
        params: {
          status: "diajukan",
        },
      });

      if (response.data.sukses) {
        setNaskahList(response.data.data || []);
      } else {
        setNaskahList([]);
      }
    } catch (error: any) {
      console.error("Error fetching naskah:", error);
      toast.error(error.response?.data?.pesan || "Gagal memuat daftar naskah yang diajukan");
      setNaskahList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEditorList = async () => {
    setLoadingEditor(true);
    try {
      // Endpoint untuk ambil user dengan role editor
      const response = await api.get<ResponseSukses<Editor[]>>("/pengguna", {
        params: {
          peran: "editor",
        },
      });

      if (response.data.sukses) {
        // Filter hanya yang aktif sebagai editor
        const activeEditors = (response.data.data || []).filter((user) =>
          user.peranPengguna?.some((peran) => peran.jenisPeran === "editor" && peran.aktif)
        );
        setEditorList(activeEditors);
      } else {
        setEditorList([]);
      }
    } catch (error: any) {
      console.error("Error fetching editors:", error);
      toast.error(error.response?.data?.pesan || "Gagal memuat daftar editor");
      setEditorList([]);
    } finally {
      setLoadingEditor(false);
    }
  };

  // ================================
  // HANDLERS
  // ================================

  const handleOpenModal = (naskah: Naskah) => {
    setSelectedNaskah(naskah);
    setSelectedEditor("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNaskah(null);
    setSelectedEditor("");
  };

  const handleTugaskan = async () => {
    if (!selectedNaskah || !selectedEditor) {
      toast.error("Pilih editor terlebih dahulu");
      return;
    }

    setSedangTugaskan(true);
    try {
      // Get admin user data
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        toast.error("Sesi login tidak ditemukan");
        return;
      }

      const userData = JSON.parse(userDataStr);

      // Call API to assign review
      await reviewApi.tugaskanReview({
        idNaskah: selectedNaskah.id,
        idEditor: selectedEditor,
        catatan: `Ditugaskan oleh admin ${userData.email} pada ${new Date().toLocaleString("id-ID")}`,
      });

      toast.success(
        `Berhasil menugaskan review "${selectedNaskah.judul}" ke editor terpilih`
      );

      // Close modal
      handleCloseModal();

      // Refresh list (naskah akan hilang karena status berubah)
      setTimeout(() => {
        fetchNaskahDiajukan();
      }, 500);
    } catch (error: any) {
      console.error("Error tugaskan review:", error);
      
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.pesan || "Naskah tidak valid untuk ditugaskan");
      } else if (error.response?.status === 409) {
        toast.error("Naskah ini sudah memiliki review aktif");
      } else if (error.response?.status === 404) {
        toast.error("Naskah atau editor tidak ditemukan");
      } else {
        toast.error("Gagal menugaskan review. Silakan coba lagi.");
      }
    } finally {
      setSedangTugaskan(false);
    }
  };

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getNamaPenulis = (penulis: Naskah["penulis"]) => {
    if (penulis.profilPengguna?.namaDepan || penulis.profilPengguna?.namaBelakang) {
      return `${penulis.profilPengguna.namaDepan || ""} ${penulis.profilPengguna.namaBelakang || ""}`.trim();
    }
    return penulis.email;
  };

  const getNamaEditor = (editor: Editor) => {
    if (editor.profilPengguna?.namaDepan || editor.profilPengguna?.namaBelakang) {
      return `${editor.profilPengguna.namaDepan || ""} ${editor.profilPengguna.namaBelakang || ""}`.trim();
    }
    return editor.email;
  };

  // ================================
  // RENDER
  // ================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 Antrian Review - Belum Ditugaskan
          </h1>
          <p className="text-gray-600">
            Naskah yang sudah diajukan penulis dan menunggu untuk ditugaskan ke editor
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Cara Menugaskan Review</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Pilih naskah yang ingin ditugaskan dari tabel di bawah</li>
                <li>Klik tombol "Tugaskan" pada kolom aksi</li>
                <li>Pilih editor yang akan mengerjakan review naskah tersebut</li>
                <li>Klik "Simpan Penugasan" untuk konfirmasi</li>
                <li>Naskah akan masuk ke daftar review editor yang dipilih</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu Penugasan</p>
                <p className="text-2xl font-bold text-gray-900">{naskahList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Editor Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{editorList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Naskah</p>
                <p className="text-2xl font-bold text-gray-900">{naskahList.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Daftar Naskah Siap Ditugaskan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="font-semibold text-orange-600">Diajukan</span>
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4">Memuat data...</p>
            </div>
          ) : naskahList.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium mb-2">Tidak ada naskah menunggu</p>
              <p className="text-gray-400 text-sm">
                Semua naskah yang diajukan sudah ditugaskan ke editor
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Judul Naskah
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Penulis
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal Diajukan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {naskahList.map((naskah, index) => (
                    <tr key={naskah.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{naskah.judul}</p>
                          {naskah.subJudul && (
                            <p className="text-xs text-gray-500 mt-0.5">{naskah.subJudul}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{getNamaPenulis(naskah.penulis)}</p>
                          <p className="text-xs text-gray-500">{naskah.penulis.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {naskah.kategori?.nama || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatTanggal(naskah.diperbaruiPada)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenModal(naskah)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Tugaskan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Tips:</strong> Pastikan editor yang dipilih memiliki kapasitas dan keahlian
            yang sesuai dengan kategori naskah
          </p>
        </div>
      </div>

      {/* ================================ */}
      {/* MODAL TUGASKAN */}
      {/* ================================ */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Tugaskan Review Naskah</h3>
                <button
                  onClick={handleCloseModal}
                  disabled={sedangTugaskan}
                  className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Naskah Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Naskah yang akan ditugaskan:</p>
                <p className="font-semibold text-gray-900 text-lg">{selectedNaskah?.judul}</p>
                {selectedNaskah?.subJudul && (
                  <p className="text-sm text-gray-600 mt-1">{selectedNaskah.subJudul}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {selectedNaskah && getNamaPenulis(selectedNaskah.penulis)}
                  </span>
                  {selectedNaskah?.kategori && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {selectedNaskah.kategori.nama}
                    </span>
                  )}
                </div>
              </div>

              {/* Editor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pilih Editor <span className="text-red-500">*</span>
                </label>
                
                {loadingEditor ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : editorList.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-800">
                      ⚠️ Tidak ada editor tersedia. Silakan tambah user dengan role editor terlebih dahulu.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedEditor}
                    onChange={(e) => setSelectedEditor(e.target.value)}
                    disabled={sedangTugaskan}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Pilih Editor --</option>
                    {editorList.map((editor) => (
                      <option key={editor.id} value={editor.id}>
                        {getNamaEditor(editor)} ({editor.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-yellow-800">
                    <strong>Perhatian:</strong> Setelah ditugaskan, naskah akan masuk ke daftar review editor
                    dan status berubah menjadi "Dalam Review".
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                disabled={sedangTugaskan}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleTugaskan}
                disabled={sedangTugaskan || !selectedEditor || editorList.length === 0}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  sedangTugaskan || !selectedEditor || editorList.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {sedangTugaskan ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simpan Penugasan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
