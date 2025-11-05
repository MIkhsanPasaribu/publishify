"use client";

import { useState } from "react";

export function TestimoniSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const testimoni = [
    {
      nama: "Siti Aminah",
      peran: "Penulis Novel",
      avatar: "SA",
      rating: 5,
      komentar:
        "Publishify benar-benar membantu saya mewujudkan impian menjadi penulis. Prosesnya mudah dan editor sangat profesional!",
    },
    {
      nama: "Budi Santoso",
      peran: "Penulis Non-Fiksi",
      avatar: "BS",
      rating: 5,
      komentar:
        "Platform yang luar biasa! Dari menulis hingga mencetak buku, semuanya bisa dilakukan dalam satu tempat.",
    },
    {
      nama: "Rina Wijaya",
      peran: "Penulis Anak",
      avatar: "RW",
      rating: 5,
      komentar:
        "Tim editor sangat membantu dalam meningkatkan kualitas naskah saya. Sangat direkomendasikan!",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-[#14b8a6] font-semibold text-sm uppercase tracking-wider">Testimoni</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Apa Kata <span className="text-[#14b8a6]">Mereka</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ribuan penulis telah mempercayai Publishify untuk menerbitkan karya
            mereka
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimoni.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border-2 transition-all duration-500 ${
                hoveredCard === index
                  ? "border-[#14b8a6] shadow-2xl transform -translate-y-2 scale-105"
                  : "border-gray-100 shadow-lg"
              }`}
            >
              {/* Quote Icon */}
              <div className={`mb-4 transition-all duration-300 ${
                hoveredCard === index ? "scale-110 rotate-12" : ""
              }`}>
                <svg className="w-10 h-10 text-[#14b8a6] opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 fill-current transition-all duration-300 ${
                      hoveredCard === index ? "text-[#14b8a6] scale-110" : "text-yellow-400"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed text-lg font-light italic">
                "{item.komentar}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  hoveredCard === index
                    ? "bg-gradient-to-br from-[#14b8a6] to-[#0d7377] text-white scale-110"
                    : "bg-teal-100 text-[#0d7377]"
                }`}>
                  {item.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    {item.nama}
                  </div>
                  <div className="text-sm text-[#14b8a6] font-medium">{item.peran}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
