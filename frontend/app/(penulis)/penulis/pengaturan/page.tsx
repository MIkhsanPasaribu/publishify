"use client";

import { useState } from "react";
import Image from "next/image";

type TabType = "profil" | "akun" | "penulis" | "keamanan" | "notifikasi";

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profil");
  const [isEditing, setIsEditing] = useState(false);

  // Data Profil Pengguna
  const [profilData, setProfilData] = useState({
    namaDepan: "Daffar",
    namaBelakang: "Robbani",
    namaTampilan: "daffarobbani",
    bio: "Penulis pemula yang passionate tentang cerita fantasi dan petualangan.",
    urlAvatar: "",
    tanggalLahir: "2000-01-15",
    jenisKelamin: "Laki-laki",
    alamat: "Jl. Merdeka No. 123",
    kota: "Padang",
    provinsi: "Sumatera Barat",
    kodePos: "25116",
  });

  // Data Akun
  const [akunData, setAkunData] = useState({
    email: "daffar@example.com",
    telepon: "+62812345678",
    emailDiverifikasi: true,
    loginTerakhir: "2025-11-04T10:30:00",
  });

  // Data Profil Penulis
  const [penulisData, setPenulisData] = useState({
    namaPena: "D. Robbani",
    biografi: "Seorang penulis yang fokus pada genre fantasi dan sci-fi. Telah menulis sejak 2020 dan terus berkembang dalam dunia literasi.",
    spesialisasi: ["Fantasy", "Sci-Fi", "Adventure"],
    namaRekeningBank: "Daffar Robbani",
    namaBank: "Bank BCA",
    nomorRekeningBank: "1234567890",
    npwp: "12.345.678.9-012.345",
  });

  // Data Keamanan
  const [keamananData, setKeamananData] = useState({
    kataSandiLama: "",
    kataSandiBaru: "",
    konfirmasiKataSandi: "",
  });

  // Data Notifikasi
  const [notifikasiData, setNotifikasiData] = useState({
    emailNotifikasi: true,
    naskahDiReview: true,
    naskahDisetujui: true,
    pesananCetak: true,
    pembayaran: true,
    komentarBaru: false,
    promosiPenawaran: false,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const tabs = [
    { id: "profil" as TabType, label: "Profil Pribadi", icon: "👤" },
    { id: "akun" as TabType, label: "Akun", icon: "⚙️" },
    { id: "penulis" as TabType, label: "Profil Penulis", icon: "✍️" },
    { id: "keamanan" as TabType, label: "Keamanan", icon: "🔒" },
    { id: "notifikasi" as TabType, label: "Notifikasi", icon: "🔔" },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimpan = () => {
    // TODO: Implementasi save ke API
    console.log("Data yang akan disimpan:", {
      profil: profilData,
      akun: akunData,
      penulis: penulisData,
      keamanan: keamananData,
      notifikasi: notifikasiData,
    });
    setIsEditing(false);
    alert("Perubahan berhasil disimpan!");
  };

  const handleToggleSpesialisasi = (item: string) => {
    setPenulisData((prev) => ({
      ...prev,
      spesialisasi: prev.spesialisasi.includes(item)
        ? prev.spesialisasi.filter((s) => s !== item)
        : [...prev.spesialisasi, item],
    }));
  };

  const spesialisasiOptions = [
    "Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", 
    "Thriller", "Historical", "Adventure", "Comedy", "Drama"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pengaturan Akun
            </h1>
            <p className="text-gray-600">
              Kelola informasi profil dan preferensi akun Anda
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white rounded-lg hover:from-[#0d9488] hover:to-[#0a7a73] transition-all shadow-lg hover:shadow-xl"
            >
              Edit Profil
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSimpan}
                className="px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white rounded-lg hover:from-[#0d9488] hover:to-[#0a7a73] transition-all shadow-lg hover:shadow-xl"
              >
                Simpan Perubahan
              </button>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#14b8a6] text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Tab: Profil Pribadi */}
          {activeTab === "profil" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Informasi Pribadi
                </h2>

                {/* Avatar Section */}
                <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                      {avatarPreview || profilData.urlAvatar ? (
                        <Image
                          src={avatarPreview || profilData.urlAvatar}
                          alt="Avatar"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span>
                          {profilData.namaDepan.charAt(0)}
                          {profilData.namaBelakang.charAt(0)}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#14b8a6] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0d9488] transition-colors shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Foto Profil
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Foto profil akan ditampilkan di halaman publik dan komentar Anda
                    </p>
                    {isEditing && (
                      <p className="text-xs text-gray-400">
                        Rekomendasi: JPG atau PNG, maksimal 2MB, rasio 1:1
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Depan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profilData.namaDepan}
                      onChange={(e) =>
                        setProfilData({ ...profilData, namaDepan: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Belakang
                    </label>
                    <input
                      type="text"
                      value={profilData.namaBelakang}
                      onChange={(e) =>
                        setProfilData({ ...profilData, namaBelakang: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={profilData.namaTampilan}
                      onChange={(e) =>
                        setProfilData({ ...profilData, namaTampilan: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={profilData.tanggalLahir}
                      onChange={(e) =>
                        setProfilData({ ...profilData, tanggalLahir: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      value={profilData.jenisKelamin}
                      onChange={(e) =>
                        setProfilData({ ...profilData, jenisKelamin: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profilData.bio}
                      onChange={(e) =>
                        setProfilData({ ...profilData, bio: e.target.value })
                      }
                      disabled={!isEditing}
                      rows={4}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <input
                      type="text"
                      value={profilData.alamat}
                      onChange={(e) =>
                        setProfilData({ ...profilData, alamat: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={profilData.kota}
                      onChange={(e) =>
                        setProfilData({ ...profilData, kota: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={profilData.provinsi}
                      onChange={(e) =>
                        setProfilData({ ...profilData, provinsi: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={profilData.kodePos}
                      onChange={(e) =>
                        setProfilData({ ...profilData, kodePos: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        !isEditing && "bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Akun */}
          {activeTab === "akun" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Informasi Akun
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={akunData.email}
                          onChange={(e) =>
                            setAkunData({ ...akunData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                            !isEditing && "bg-gray-50 text-gray-600"
                          }`}
                        />
                        {akunData.emailDiverifikasi && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      {akunData.emailDiverifikasi ? (
                        <p className="text-xs text-green-600 mt-1">✓ Email terverifikasi</p>
                      ) : (
                        <button className="text-xs text-[#14b8a6] hover:underline mt-1">
                          Verifikasi email
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={akunData.telepon}
                        onChange={(e) =>
                          setAkunData({ ...akunData, telepon: e.target.value })
                        }
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                          !isEditing && "bg-gray-50 text-gray-600"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Login Terakhir</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(akunData.loginTerakhir).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Status Akun</h3>
                      </div>
                      <p className="text-sm text-gray-600">Aktif & Terverifikasi</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Tipe Akun</h3>
                      </div>
                      <p className="text-sm text-gray-600">Penulis Premium</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Profil Penulis */}
          {activeTab === "penulis" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Informasi Penulis
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Pena
                      </label>
                      <input
                        type="text"
                        value={penulisData.namaPena}
                        onChange={(e) =>
                          setPenulisData({ ...penulisData, namaPena: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Nama yang akan ditampilkan di buku"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                          !isEditing && "bg-gray-50 text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biografi Penulis
                      </label>
                      <textarea
                        value={penulisData.biografi}
                        onChange={(e) =>
                          setPenulisData({ ...penulisData, biografi: e.target.value })
                        }
                        disabled={!isEditing}
                        rows={5}
                        placeholder="Ceritakan tentang perjalanan Anda sebagai penulis..."
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none ${
                          !isEditing && "bg-gray-50 text-gray-600"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Spesialisasi Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Spesialisasi Genre
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {spesialisasiOptions.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => isEditing && handleToggleSpesialisasi(genre)}
                          disabled={!isEditing}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            penulisData.spesialisasi.includes(genre)
                              ? "bg-[#14b8a6] text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          } ${!isEditing && "cursor-default"}`}
                        >
                          {genre}
                          {penulisData.spesialisasi.includes(genre) && (
                            <span className="ml-2">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Informasi Pembayaran Royalti */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Informasi Pembayaran Royalti
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Pemilik Rekening
                        </label>
                        <input
                          type="text"
                          value={penulisData.namaRekeningBank}
                          onChange={(e) =>
                            setPenulisData({
                              ...penulisData,
                              namaRekeningBank: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                            !isEditing && "bg-gray-50 text-gray-600"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Bank
                        </label>
                        <input
                          type="text"
                          value={penulisData.namaBank}
                          onChange={(e) =>
                            setPenulisData({ ...penulisData, namaBank: e.target.value })
                          }
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                            !isEditing && "bg-gray-50 text-gray-600"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nomor Rekening
                        </label>
                        <input
                          type="text"
                          value={penulisData.nomorRekeningBank}
                          onChange={(e) =>
                            setPenulisData({
                              ...penulisData,
                              nomorRekeningBank: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                            !isEditing && "bg-gray-50 text-gray-600"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NPWP (Opsional)
                        </label>
                        <input
                          type="text"
                          value={penulisData.npwp}
                          onChange={(e) =>
                            setPenulisData({ ...penulisData, npwp: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="00.000.000.0-000.000"
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                            !isEditing && "bg-gray-50 text-gray-600"
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Informasi ini digunakan untuk pembayaran royalti dari penjualan buku Anda
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === "keamanan" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Keamanan Akun
                </h2>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Ubah Kata Sandi</h4>
                        <p className="text-sm text-yellow-700">
                          Pastikan kata sandi baru Anda kuat dan unik. Minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kata Sandi Lama <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={keamananData.kataSandiLama}
                        onChange={(e) =>
                          setKeamananData({
                            ...keamananData,
                            kataSandiLama: e.target.value,
                          })
                        }
                        placeholder="Masukkan kata sandi lama"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kata Sandi Baru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={keamananData.kataSandiBaru}
                        onChange={(e) =>
                          setKeamananData({
                            ...keamananData,
                            kataSandiBaru: e.target.value,
                          })
                        }
                        placeholder="Masukkan kata sandi baru"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={keamananData.konfirmasiKataSandi}
                        onChange={(e) =>
                          setKeamananData({
                            ...keamananData,
                            konfirmasiKataSandi: e.target.value,
                          })
                        }
                        placeholder="Konfirmasi kata sandi baru"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-6 py-3 bg-[#14b8a6] text-white rounded-lg hover:bg-[#0d9488] transition-colors"
                  >
                    Update Kata Sandi
                  </button>

                  {/* Two-Factor Authentication */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Autentikasi Dua Faktor (2FA)
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Tingkatkan Keamanan Akun
                        </h4>
                        <p className="text-sm text-gray-600">
                          Aktifkan verifikasi 2 langkah untuk perlindungan ekstra
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Aktifkan
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sesi Aktif
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Windows PC</h4>
                            <p className="text-sm text-gray-600">Padang, Indonesia • Saat ini</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Notifikasi */}
          {activeTab === "notifikasi" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Preferensi Notifikasi
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        Notifikasi Email
                      </h4>
                      <p className="text-sm text-gray-600">
                        Terima notifikasi melalui email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifikasiData.emailNotifikasi}
                        onChange={(e) =>
                          setNotifikasiData({
                            ...notifikasiData,
                            emailNotifikasi: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14b8a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14b8a6]"></div>
                    </label>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Notifikasi tentang:
                    </h3>

                    {[
                      {
                        key: "naskahDiReview",
                        label: "Naskah Sedang Di-review",
                        desc: "Notifikasi saat editor mulai me-review naskah Anda",
                      },
                      {
                        key: "naskahDisetujui",
                        label: "Naskah Disetujui",
                        desc: "Notifikasi saat naskah Anda disetujui untuk diterbitkan",
                      },
                      {
                        key: "pesananCetak",
                        label: "Pesanan Cetak",
                        desc: "Update status pesanan cetak dan pengiriman",
                      },
                      {
                        key: "pembayaran",
                        label: "Pembayaran & Royalti",
                        desc: "Notifikasi pembayaran royalti dan transaksi",
                      },
                      {
                        key: "komentarBaru",
                        label: "Komentar Baru",
                        desc: "Notifikasi saat ada pembaca yang berkomentar",
                      },
                      {
                        key: "promosiPenawaran",
                        label: "Promosi & Penawaran",
                        desc: "Info promosi dan penawaran menarik",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#14b8a6]/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notifikasiData[item.key as keyof typeof notifikasiData] as boolean
                            }
                            onChange={(e) =>
                              setNotifikasiData({
                                ...notifikasiData,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14b8a6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14b8a6]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
