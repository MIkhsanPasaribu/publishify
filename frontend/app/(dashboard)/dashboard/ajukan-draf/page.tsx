"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload";
import { naskahApi } from "@/lib/api/naskah";

type ModeInput = "tulis" | "upload";

export default function AjukanDrafPage() {
  const [modeInput, setModeInput] = useState<ModeInput>("tulis");
  const router = useRouter();
  const [formData, setFormData] = useState({
    judul: "",
    subJudul: "",
    sinopsis: "",
    idKategori: "",
    idGenre: "",
    bahasaTulis: "id",
    kontenTeks: "",
  });
  
  const [fileSampul, setFileSampul] = useState<File | null>(null);
  const [fileNaskah, setFileNaskah] = useState<File | null>(null);
  const [previewSampul, setPreviewSampul] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progressSampul, setProgressSampul] = useState(0);
  const [progressNaskah, setProgressNaskah] = useState(0);

  // Kategori & Genre statis (UUID sesuai DB)
  const kategoriList = [
    { id: "03c0aa00-6d3d-4c7c-9694-9dfcd3c3b42f", nama: "Non-Fiksi" },
    { id: "cb2147c6-09eb-48a8-b112-b085e3f9cdb7", nama: "Fiksi" },
    { id: "ef3616a6-1386-4bba-92c0-ed185bfc3c54", nama: "Mystery" },
    { id: "fd9195e1-3aa3-41cf-bbee-d1923ea958dc", nama: "Romance" },
  ] as const;

  const genreList = [
    { id: "1f912990-9b2b-4cc3-8812-24a3047ed462", nama: "Sci-Fi" },
    { id: "2c99601a-9221-406c-a913-5714d7a4e5ca", nama: "Horror" },
    { id: "73217ab6-9d3a-4708-97cb-7d77d20c92a0", nama: "Comedy" },
    { id: "b01e0c30-205f-4143-a443-5b65514d4fec", nama: "Thriller" },
    { id: "fa24d2e8-f4a2-4667-bbf7-60eae33c8129", nama: "Fantasy" },
  ] as const;

  const bahasaList = [
    { kode: "id", nama: "Bahasa Indonesia" },
    { kode: "en", nama: "English" },
    { kode: "jv", nama: "Bahasa Jawa" },
    { kode: "su", nama: "Bahasa Sunda" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSampulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSampul(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSampul(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNaskahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFileNaskah(file);
    } else {
      toast.error("Hanya file PDF yang diperbolehkan");
    }
  };

  // Tidak fetch dari backend; gunakan daftar statis di atas

  const minimalKataSinopsisTerpenuhi = useMemo(() => {
    const kata = formData.sinopsis.trim().split(/\s+/).filter(Boolean).length;
    return kata >= 50;
  }, [formData.sinopsis]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi
    if (!formData.judul || !formData.sinopsis || !formData.idKategori || !formData.idGenre) {
      toast.error("Mohon lengkapi field yang wajib diisi");
      return;
    }

    if (!minimalKataSinopsisTerpenuhi) {
      toast.error("Sinopsis minimal 50 kata");
      return;
    }

    if (modeInput === "upload" && !fileNaskah) {
      toast.error("Mohon upload file naskah PDF");
      return;
    }

    if (modeInput === "tulis" && !formData.kontenTeks) {
      toast.error("Mohon tulis konten naskah");
      return;
    }

    setLoading(true);
    setProgressSampul(0);
    setProgressNaskah(0);

    try {
      let urlSampul: string | undefined;
      let urlFile: string | undefined;

      // Upload sampul jika ada
      if (fileSampul) {
        const res = await uploadApi.uploadFile(
          fileSampul,
          "sampul",
          "Sampul naskah",
          undefined,
          (p) => setProgressSampul(p)
        );
        urlSampul = res.urlPublik || res.url;
      }

      // Siapkan file naskah
      if (modeInput === "upload" && fileNaskah) {
        const res = await uploadApi.uploadFile(
          fileNaskah,
          "naskah",
          "File naskah (PDF)",
          undefined,
          (p) => setProgressNaskah(p)
        );
        urlFile = res.urlPublik || res.url;
      } else if (modeInput === "tulis") {
        const blob = new Blob([formData.kontenTeks], { type: "text/plain;charset=utf-8" });
        const nama = `${slugify(formData.judul) || "naskah"}.txt`;
        const fileTxt = new File([blob], nama, { type: "text/plain" });
        const res = await uploadApi.uploadFile(
          fileTxt,
          "naskah",
          "Naskah teks",
          undefined,
          (p) => setProgressNaskah(p)
        );
        urlFile = res.urlPublik || res.url;
      }

      // Validasi UUID untuk idKategori & idGenre (hindari kirim dummy)
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRe.test(formData.idKategori) || !uuidRe.test(formData.idGenre)) {
        toast.error("Kategori/Genre tidak valid. Mohon pilih opsi yang tersedia.");
        return;
      }

      const hitungJumlahKata = formData.kontenTeks
        ? formData.kontenTeks.trim().split(/\s+/).filter(Boolean).length
        : undefined;
      const jumlahKata = hitungJumlahKata && hitungJumlahKata >= 100 ? hitungJumlahKata : undefined;

      // Submit naskah
      await naskahApi.buatNaskah({
        judul: formData.judul,
        subJudul: formData.subJudul || undefined,
        sinopsis: formData.sinopsis,
        idKategori: formData.idKategori,
        idGenre: formData.idGenre,
        bahasaTulis: formData.bahasaTulis,
        jumlahKata,
        urlSampul,
        urlFile,
        publik: false,
      });

      toast.success("Naskah berhasil diajukan sebagai draft");
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.pesan || err?.message || "Gagal mengajukan naskah";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const hitungKata = (teks: string) => {
    return teks.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajukan Draf Baru
          </h1>
          <p className="text-gray-600">
            Buat dan ajukan naskah baru untuk proses review
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mode Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pilih Mode Pengisian Naskah
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setModeInput("tulis")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  modeInput === "tulis"
                    ? "border-[#14b8a6] bg-[#14b8a6]/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className={`w-12 h-12 ${
                      modeInput === "tulis" ? "text-[#14b8a6]" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Tulis Langsung
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tulis naskah langsung di editor
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setModeInput("upload")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  modeInput === "upload"
                    ? "border-[#14b8a6] bg-[#14b8a6]/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className={`w-12 h-12 ${
                      modeInput === "upload" ? "text-[#14b8a6]" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Upload File PDF
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload naskah dalam format PDF
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Informasi Dasar Naskah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Informasi Dasar Naskah
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri - Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Naskah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul naskah"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                    required
                  />
                </div>

                {/* Sub Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Judul (Opsional)
                  </label>
                  <input
                    type="text"
                    name="subJudul"
                    value={formData.subJudul}
                    onChange={handleInputChange}
                    placeholder="Masukkan sub judul naskah"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                  />
                </div>

                {/* Kategori & Genre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idKategori"
                      value={formData.idKategori}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoriList.map((kat) => (
                        <option key={kat.id} value={kat.id}>
                          {kat.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idGenre"
                      value={formData.idGenre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Genre</option>
                      {genreList.map((gen) => (
                        <option key={gen.id} value={gen.id}>
                          {gen.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bahasa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bahasa Naskah
                  </label>
                  <select
                    name="bahasaTulis"
                    value={formData.bahasaTulis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                  >
                    {bahasaList.map((bahasa) => (
                      <option key={bahasa.kode} value={bahasa.kode}>
                        {bahasa.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sinopsis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sinopsis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="sinopsis"
                    value={formData.sinopsis}
                    onChange={handleInputChange}
                    placeholder="Tulis sinopsis atau ringkasan naskah (minimal 50 kata)"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {hitungKata(formData.sinopsis)} kata
                  </p>
                </div>
              </div>

              {/* Kolom Kanan - Upload Sampul */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover/Sampul Buku
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#14b8a6] transition-colors">
                  {previewSampul ? (
                    <div className="relative">
                      <Image
                        src={previewSampul}
                        alt="Preview Sampul"
                        width={200}
                        height={300}
                        className="mx-auto rounded-lg shadow-md mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFileSampul(null);
                          setPreviewSampul("");
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">
                        Klik untuk upload cover
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG (Max. 2MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSampulChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {fileSampul && progressSampul > 0 && progressSampul < 100 && (
                  <div className="mt-2 text-xs text-gray-600">Upload sampul: {progressSampul}%</div>
                )}
              </div>
            </div>
          </div>

          {/* Konten Naskah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Konten Naskah
            </h2>

            {modeInput === "tulis" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tulis Naskah <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="kontenTeks"
                  value={formData.kontenTeks}
                  onChange={handleInputChange}
                  placeholder="Mulai menulis naskah Anda di sini..."
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none font-serif text-base leading-relaxed"
                  required
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>{hitungKata(formData.kontenTeks)} kata</span>
                  <span>
                    {formData.kontenTeks.length} karakter
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File Naskah (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#14b8a6] transition-colors">
                  {fileNaskah ? (
                    <div className="space-y-4">
                      <svg
                        className="w-16 h-16 text-[#14b8a6] mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">
                          {fileNaskah.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(fileNaskah.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileNaskah(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Hapus File
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">
                        Klik untuk upload file PDF
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        PDF (Max. 10MB)
                      </p>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleNaskahChange}
                        className="hidden"
                      />
                      <span className="inline-block px-6 py-2 bg-[#14b8a6] text-white rounded-lg hover:bg-[#0d9488] transition-colors">
                        Pilih File
                      </span>
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * File PDF akan disimpan dengan lebih efisien di server
                </p>
                {fileNaskah && progressNaskah > 0 && progressNaskah < 100 && (
                  <div className="mt-2 text-xs text-gray-600">Upload naskah: {progressNaskah}%</div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit as any}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Simpan Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white hover:from-[#0d9488] hover:to-[#0a7a73]"
                }`}
              >
                {loading ? "Mengirim..." : "Ajukan untuk Review"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
