"use client";

import { Smartphone, Download, Star, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MobileAppSection() {
  const handleDownloadAndroid = () => {
    // Use API route to bypass middleware and force download
    window.location.href = "/api/download/apk";
  };

  const handleDownloadIOS = () => {
    // Link ke App Store atau TestFlight
    window.open("https://apps.apple.com/app/publishify", "_blank");
  };

  const fiturMobile = [
    {
      icon: BookOpen,
      judul: "Baca Buku Favorit",
      deskripsi: "Akses ribuan buku digital kapan saja, dimana saja",
    },
    {
      icon: Users,
      judul: "Kelola Naskah",
      deskripsi: "Kelola naskah dan proses penerbitan dari smartphone",
    },
    {
      icon: Star,
      judul: "Notifikasi Real-time",
      deskripsi: "Dapatkan update status naskah dan pesanan secara langsung",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Download Aplikasi Mobile Publishify
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Akses semua fitur Publishify langsung dari smartphone Anda.
              Tersedia untuk Android dan iOS.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - App Preview */}
            <div className="relative">
              <div className="relative z-10">
                {/* Phone Mockup */}
                <div className="relative mx-auto w-64 h-[500px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] shadow-2xl p-3">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Screen Content - App Screenshot Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <BookOpen className="h-20 w-20 mx-auto mb-4 opacity-90" />
                        <h3 className="text-xl font-bold mb-2">Publishify</h3>
                        <p className="text-sm opacity-90">
                          Platform Penerbitan Digital
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-white/10 backdrop-blur-sm flex items-center justify-between px-6 text-white text-xs">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-3 border border-white rounded-sm" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Home Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 -z-10" />
            </div>

            {/* Right Side - Download Options */}
            <div className="space-y-6">
              {/* Fitur Mobile */}
              <div className="grid gap-4 mb-8">
                {fiturMobile.map((fitur, index) => {
                  const Icon = fitur.icon;
                  return (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {fitur.judul}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {fitur.deskripsi}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleDownloadAndroid}
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download untuk Android
                </Button>

                <Button
                  onClick={handleDownloadIOS}
                  variant="outline"
                  className="w-full h-14 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download untuk iOS
                </Button>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center justify-center gap-8 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      4.8
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600">Downloads</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section (Optional) */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Atau scan QR Code untuk download langsung
            </p>
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                {/* QR Code placeholder - nanti bisa diganti dengan QR code generator */}
                <div className="text-center text-gray-400">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">QR Code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
