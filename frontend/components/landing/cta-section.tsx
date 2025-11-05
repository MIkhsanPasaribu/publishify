"use client";

import Link from "next/link";
import { useState } from "react";

export function CTASection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d7377] via-[#14b8a6] to-[#32e0c4]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold text-sm uppercase tracking-wider">
            Mulai Sekarang
          </span>
        </div>
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Siap Menerbitkan <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
            Buku Anda?
          </span>
        </h2>
        
        <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto">
          Bergabunglah dengan ribuan penulis lainnya dan mulai perjalanan Anda
          menjadi penulis profesional hari ini.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative w-full sm:w-auto bg-white text-[#0d7377] px-10 py-5 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 overflow-hidden ${
              isHovered ? "transform scale-105" : ""
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Daftar Sekarang Gratis
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isHovered ? "translate-x-2" : ""
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link
            href="/login"
            className="w-full sm:w-auto bg-transparent text-white px-10 py-5 rounded-xl hover:bg-white/10 transition-all duration-300 font-bold text-lg border-2 border-white backdrop-blur-sm"
          >
            Sudah Punya Akun? Masuk
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">1,000+</div>
            <div className="text-white/80 text-sm">Penulis Aktif</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-white/80 text-sm">Buku Diterbitkan</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-white/80 text-sm">Kepuasan</div>
          </div>
        </div>
      </div>
    </section>
  );
}
