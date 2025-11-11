"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Login Info, 2: Profile Info, 3: Additional Info
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1 - Login Info
    email: "",
    kataSandi: "",
    konfirmasiKataSandi: "",
    telepon: "",
    jenisPeran: "penulis" as "penulis" | "editor" | "percetakan",
    
    // Step 2 - Profile Info
    namaDepan: "",
    namaBelakang: "",
    namaTampilan: "",
    bio: "",
    tanggalLahir: "",
    jenisKelamin: "",
    
    // Step 3 - Address Info
    alamat: "",
    kota: "",
    provinsi: "",
    kodePos: "",
  });  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validasi kekuatan password berdasarkan requirement backend
  const passwordValidation = useMemo(() => {
    const password = formData.kataSandi;
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      isValid: password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
    };
  }, [formData.kataSandi]);

  // Hitung strength level (0-4)
  const passwordStrength = useMemo(() => {
    const checks = [
      passwordValidation.minLength,
      passwordValidation.hasUpperCase,
      passwordValidation.hasLowerCase,
      passwordValidation.hasNumber,
    ];
    return checks.filter(Boolean).length;
  }, [passwordValidation]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-300";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Lemah";
    if (passwordStrength === 3) return "Sedang";
    return "Kuat";
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi password strength sebelum submit
    if (!passwordValidation.isValid) {
      toast.error("Kata sandi harus memenuhi semua persyaratan keamanan");
      return;
    }
    
    if (formData.kataSandi !== formData.konfirmasiKataSandi) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        email: formData.email,
        kataSandi: formData.kataSandi,
        konfirmasiKataSandi: formData.konfirmasiKataSandi,
        namaDepan: formData.namaDepan,
        namaBelakang: formData.namaBelakang || undefined,
        telepon: formData.telepon || undefined,
        jenisPeran: formData.jenisPeran,
      });
      toast.success("Registrasi berhasil. Silakan login.");
      router.replace("/login");
    } catch (err: any) {
      toast.error(err?.message || "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log("Google sign in");
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Side - Tagline */}
      <div className="text-left space-y-6 px-8">
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Self-Publish
          <br />
          Your Ideas
          <br />
          Easily
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Bergabung dengan Publishify dan mulai perjalanan Anda menjadi penulis
          profesional
        </p>
        
        {/* Progress Indicator */}
        <div className="space-y-3 pt-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? "bg-[#14b8a6] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              1
            </div>
            <div className={`text-sm font-medium ${step >= 1 ? "text-[#14b8a6]" : "text-gray-500"}`}>
              Informasi Akun
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? "bg-[#14b8a6] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              2
            </div>
            <div className={`text-sm font-medium ${step >= 2 ? "text-[#14b8a6]" : "text-gray-500"}`}>
              Profil Pribadi
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? "bg-[#14b8a6] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              3
            </div>
            <div className={`text-sm font-medium ${step >= 3 ? "text-[#14b8a6]" : "text-gray-500"}`}>
              Alamat Lengkap
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#14b8a6] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Buat Akun Publishify
          </h2>
          <p className="text-gray-600">
            Langkah {step} dari 3 - {step === 1 ? "Informasi Akun" : step === 2 ? "Profil Pribadi" : "Alamat Lengkap"}
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={step === 3 ? handleSubmit : handleNextStep} className="space-y-4">
          
          {/* STEP 1: Account Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telepon"
                  placeholder="08xxxxxxxxxx"
                  value={formData.telepon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  required
                />
              </div>

              {/* Jenis Peran Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daftar Sebagai <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenisPeran"
                  value={formData.jenisPeran}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700 bg-white"
                  required
                >
                  <option value="penulis">Penulis</option>
                  <option value="editor">Editor</option>
                  <option value="percetakan">Percetakan</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih peran yang sesuai dengan kebutuhan Anda
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="kataSandi"
                    placeholder="Minimal 8 karakter"
                    value={formData.kataSandi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.kataSandi && (
                  <div className="mt-3 space-y-2">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 2 ? "text-red-600" :
                        passwordStrength === 3 ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {passwordValidation.minLength ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span>Minimal 8 karakter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {passwordValidation.hasUpperCase ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span>Mengandung huruf besar (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {passwordValidation.hasLowerCase ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span>Mengandung huruf kecil (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {passwordValidation.hasNumber ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span>Mengandung angka (0-9)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="konfirmasiKataSandi"
                    placeholder="Ulangi password"
                    value={formData.konfirmasiKataSandi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Profile Information */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* First Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Depan
                  </label>
                  <input
                    type="text"
                    name="namaDepan"
                    placeholder="Nama depan"
                    value={formData.namaDepan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Belakang
                  </label>
                  <input
                    type="text"
                    name="namaBelakang"
                    placeholder="Nama belakang"
                    value={formData.namaBelakang}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  name="namaTampilan"
                  placeholder="Nama yang akan ditampilkan"
                  value={formData.namaTampilan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / Tentang Saya
                </label>
                <textarea
                  name="bio"
                  placeholder="Ceritakan sedikit tentang diri Anda..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700 resize-none"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <select
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Address Information */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  name="alamat"
                  placeholder="Jalan, nomor rumah, RT/RW, dll"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700 resize-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  name="kota"
                  placeholder="Contoh: Jakarta"
                  value={formData.kota}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="provinsi"
                  placeholder="Contoh: DKI Jakarta"
                  value={formData.provinsi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="kodePos"
                  placeholder="Contoh: 12345"
                  value={formData.kodePos}
                  onChange={handleInputChange}
                  maxLength={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold"
              >
                Kembali
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-[#14b8a6] text-white py-3 rounded-lg hover:bg-[#0d9488] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {step === 3 ? (loading ? "Memproses..." : "Daftar") : "Lanjut"}
            </button>
          </div>
        </form>

        {/* Divider */}
        {step === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau</span>
              </div>
            </div>

            {/* Development Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-yellow-700">
                    <strong>Mode Dev:</strong> OAuth tidak tersedia. Email verifikasi di-skip otomatis.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Sign In Button - DISABLED */}
            {/* <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="..." />
              </svg>
              <span>Continue with Google</span>
            </button> */}
          </>
        )}

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-[#14b8a6] font-semibold hover:text-[#0d9488] transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
