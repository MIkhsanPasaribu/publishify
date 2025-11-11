"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    kataSandi: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.kataSandi);
      toast.success("Login berhasil. Selamat datang kembali!");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Email atau kata sandi salah");
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
          Masuk ke akun Publishify Anda dan lanjutkan perjalanan menulis Anda
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-6">
        {/* User Avatar Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#14b8a6] rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* Create Account Button */}
        <Link
          href="/register"
          className="block w-full bg-[#14b8a6] text-white py-4 rounded-lg hover:bg-[#0d9488] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
        >
          Create Publishify Account
        </Link>

        {/* Google Sign In Button - DISABLED FOR DEVELOPMENT */}
        {/* Uncomment when OAuth is configured in backend */}
        {/* <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-[#14b8a6] text-white py-4 rounded-lg hover:bg-[#0d9488] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
        >
          <span>Continue with Google</span>
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="..." />
          </svg>
        </button> */}

        {/* Development Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Mode Development:</strong> Google OAuth tidak tersedia. Gunakan login email/password.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Login dengan Email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-gray-300 pr-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.01L12 12 2 6.01V6zm0 2.238V18a2 2 0 002 2h16a2 2 0 002-2V8.238l-9.553 5.506a2 2 0 01-1.894 0L2 8.238z" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-gray-300 pr-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.kataSandi}
              onChange={(e) => setFormData({ ...formData, kataSandi: e.target.value })}
              className="w-full pl-16 pr-14 py-4 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-start">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-[#14b8a6] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#0d7377] text-white py-4 rounded-lg hover:bg-[#0a5c5f] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#14b8a6] font-semibold hover:text-[#0d9488] transition-colors"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
