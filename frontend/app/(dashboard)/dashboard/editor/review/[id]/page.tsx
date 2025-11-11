"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { reviewApi, type Review, type FeedbackReview, type Rekomendasi } from "@/lib/api/review";

export default function DetailReviewPage() {
  const router = useRouter();
  const params = useParams();
  const idReview = params.id as string;

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form feedback
  const [aspek, setAspek] = useState("");
  const [komentar, setKomentar] = useState("");
  const [skor, setSkor] = useState<number>(3);

  // Form submit review
  const [rekomendasi, setRekomendasi] = useState<Rekomendasi>("revisi");
  const [catatanUmum, setCatatanUmum] = useState("");

  useEffect(() => {
    fetchReview();
  }, [idReview]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.ambilReviewById(idReview);
      setReview(res.data);
    } catch (error: any) {
      console.error("Error fetching review:", error);
      toast.error("Gagal memuat detail review");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleTambahFeedback = async () => {
    if (!aspek.trim() || !komentar.trim()) {
      toast.error("Aspek dan komentar harus diisi");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.tambahFeedback(idReview, {
        aspek: aspek.trim(),
        komentar: komentar.trim(),
        skor,
      });
      toast.success("Feedback berhasil ditambahkan");
      setShowFeedbackModal(false);
      setAspek("");
      setKomentar("");
      setSkor(3);
      fetchReview(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!catatanUmum.trim()) {
      toast.error("Catatan umum harus diisi");
      return;
    }

    if (!review?.feedback || review.feedback.length === 0) {
      toast.error("Minimal harus ada 1 feedback sebelum submit review");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.submitReview(idReview, {
        rekomendasi,
        catatanUmum: catatanUmum.trim(),
      });
      toast.success(`Review berhasil disubmit dengan rekomendasi: ${rekomendasi}`);
      setShowSubmitModal(false);
      router.push("/dashboard/editor/review");
    } catch (error: any) {
      toast.error(error.message || "Gagal submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      ditugaskan: { label: "Ditugaskan", className: "bg-blue-100 text-blue-800" },
      dalam_proses: { label: "Dalam Proses", className: "bg-amber-100 text-amber-800" },
      selesai: { label: "Selesai", className: "bg-green-100 text-green-800" },
      dibatalkan: { label: "Dibatalkan", className: "bg-gray-100 text-gray-800" },
    };
    return badges[status] || badges.ditugaskan;
  };

  const skorStars = (nilai: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < nilai ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="bg-white rounded-xl p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const badge = statusBadge(review.status);
  const namaPenulis = review.naskah.penulis.profilPenulis?.namaPena || 
                     `${review.naskah.penulis.profilPengguna?.namaDepan || ''} ${review.naskah.penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
                     review.naskah.penulis.email;

  const canAddFeedback = review.status === "ditugaskan" || review.status === "dalam_proses";
  const canSubmit = canAddFeedback && review.feedback && review.feedback.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Detail Review Naskah</h1>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Naskah Detail */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Naskah */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {review.naskah.urlSampul && (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                  <img
                    src={review.naskah.urlSampul}
                    alt={review.naskah.judul}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{review.naskah.judul}</h2>
                {review.naskah.subJudul && (
                  <p className="text-lg text-gray-600 mb-4">{review.naskah.subJudul}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{namaPenulis}</span>
                  </span>
                  {review.naskah.kategori && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {review.naskah.kategori.nama}
                    </span>
                  )}
                  {review.naskah.genre && (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {review.naskah.genre.nama}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  {review.naskah.jumlahHalaman && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Jumlah Halaman</div>
                      <div className="text-lg font-semibold text-gray-900">{review.naskah.jumlahHalaman}</div>
                    </div>
                  )}
                  {review.naskah.jumlahKata && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Jumlah Kata</div>
                      <div className="text-lg font-semibold text-gray-900">{review.naskah.jumlahKata.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Sinopsis</h3>
                  <p className="text-gray-700 leading-relaxed">{review.naskah.sinopsis}</p>
                </div>

                {review.naskah.urlFile && (
                  <a
                    href={review.naskah.urlFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Buka File Naskah
                  </a>
                )}
              </div>
            </div>

            {/* Feedback List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Feedback Review</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {review.feedback?.length || 0} feedback telah diberikan
                  </p>
                </div>
                {canAddFeedback && (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Feedback
                  </button>
                )}
              </div>

              <div className="divide-y divide-gray-200">
                {(!review.feedback || review.feedback.length === 0) ? (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <p className="text-gray-500 font-medium mb-1">Belum ada feedback</p>
                    <p className="text-gray-400 text-sm">Mulai tambahkan feedback untuk naskah ini</p>
                  </div>
                ) : (
                  review.feedback.map((fb, idx) => (
                    <div key={fb.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{fb.aspek}</h4>
                            <p className="text-xs text-gray-500">{formatTanggal(fb.dibuatPada)}</p>
                          </div>
                        </div>
                        {fb.skor && (
                          <div className="flex items-center gap-1">
                            {skorStars(fb.skor)}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed pl-11">{fb.komentar}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Actions & Info */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Timeline Review</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {(review.dimulaiPada || review.selesaiPada) && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900 text-sm">Ditugaskan</p>
                    <p className="text-xs text-gray-500">{formatTanggal(review.ditugaskanPada)}</p>
                  </div>
                </div>

                {review.dimulaiPada && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {review.selesaiPada && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 text-sm">Dimulai</p>
                      <p className="text-xs text-gray-500">{formatTanggal(review.dimulaiPada)}</p>
                    </div>
                  </div>
                )}

                {review.selesaiPada && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Selesai</p>
                      <p className="text-xs text-gray-500">{formatTanggal(review.selesaiPada)}</p>
                      {review.rekomendasi && (
                        <p className="text-xs font-medium text-purple-600 mt-1">
                          Rekomendasi: {review.rekomendasi === "setujui" ? "Disetujui" : review.rekomendasi === "revisi" ? "Perlu Revisi" : "Ditolak"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan Umum (jika sudah submit) */}
            {review.catatanUmum && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Catatan Umum
                </h3>
                <p className="text-amber-900 text-sm leading-relaxed">{review.catatanUmum}</p>
              </div>
            )}

            {/* Action Buttons */}
            {canSubmit && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Submit Review & Keputusan
              </button>
            )}

            {review.status === "selesai" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-green-900 mb-1">Review Selesai</p>
                <p className="text-sm text-green-700">Keputusan telah diberikan</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Tambah Feedback */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tambah Feedback</h2>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspek yang Direview <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aspek}
                    onChange={(e) => setAspek(e.target.value)}
                    placeholder="Contoh: Alur Cerita, Karakter, Gaya Bahasa, Tata Bahasa"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skor (Opsional)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((nilai) => (
                      <button
                        key={nilai}
                        onClick={() => setSkor(nilai)}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <svg
                          className={`w-8 h-8 ${nilai <= skor ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{skor}/5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Komentar Detail <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={komentar}
                    onChange={(e) => setKomentar(e.target.value)}
                    placeholder="Berikan komentar detail tentang aspek yang direview..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleTambahFeedback}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Tambah Feedback"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Submit Review */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Submit Review & Keputusan</h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Perhatian:</strong> Setelah submit, keputusan tidak dapat diubah. Pastikan semua feedback sudah lengkap.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rekomendasi <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setRekomendasi("setujui")}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        rekomendasi === "setujui"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <div className="font-semibold text-gray-900">Setujui</div>
                      <div className="text-xs text-gray-600 mt-1">Terbitkan naskah</div>
                    </button>
                    <button
                      onClick={() => setRekomendasi("revisi")}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        rekomendasi === "revisi"
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">📝</div>
                      <div className="font-semibold text-gray-900">Revisi</div>
                      <div className="text-xs text-gray-600 mt-1">Perlu perbaikan</div>
                    </button>
                    <button
                      onClick={() => setRekomendasi("tolak")}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        rekomendasi === "tolak"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">❌</div>
                      <div className="font-semibold text-gray-900">Tolak</div>
                      <div className="text-xs text-gray-600 mt-1">Tidak layak terbit</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Umum <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={catatanUmum}
                    onChange={(e) => setCatatanUmum(e.target.value)}
                    placeholder="Berikan kesimpulan umum dari review Anda dan alasan rekomendasi..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Total feedback: {review.feedback?.length || 0} • Pastikan semua aspek penting sudah direview
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50"
                  >
                    {submitting ? "Mengirim..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
