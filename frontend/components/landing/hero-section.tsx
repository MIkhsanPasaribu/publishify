"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#14b8a6] rounded-full opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0d7377] rounded-full opacity-5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#32e0c4] rounded-full opacity-5 blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo Besar */}
          <div
            className={`transition-all duration-1000 transform ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-10 scale-95"
            }`}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
              <Image
                src="/logo.png"
                alt="Publishify Logo"
                width={300}
                height={300}
                className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 relative z-10 drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Publishify Text */}
          <div
            className={`mt-8 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0d7377] mb-4 tracking-tight">
              Publishify
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] mx-auto rounded-full"></div>
          </div>

          {/* Tagline */}
          <div
            className={`mt-8 transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 font-light max-w-3xl leading-relaxed">
              Platform Penerbitan Naskah <span className="text-[#14b8a6] font-medium">Terpadu</span>
            </p>
            <p className="text-lg sm:text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
              Wujudkan impian Anda menjadi penulis profesional dengan sistem yang mudah, cepat, dan terintegrasi
            </p>
          </div>

          {/* Scroll Indicator */}
          <div
            className={`mt-16 transition-all duration-1000 delay-600 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <span className="text-sm text-gray-400 font-medium">Scroll untuk melihat lebih banyak</span>
              <svg
                className="w-6 h-6 text-[#14b8a6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
