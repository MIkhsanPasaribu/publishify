"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifikasiEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    // Simulasi verifikasi - nanti connect ke API
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-teal-600 animate-spin mb-4" />
            <h1 className="text-2xl font-bold mb-2">Memverifikasi Email</h1>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Email Terverifikasi!</h1>
            <p className="text-gray-600 mb-6">
              Akun Anda berhasil diverifikasi. Silakan login untuk melanjutkan.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Login Sekarang
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifikasi Gagal</h1>
            <p className="text-gray-600 mb-6">
              Link verifikasi tidak valid atau sudah kadaluarsa.
            </p>
            <Button onClick={() => router.push("/register")} variant="outline" className="w-full">
              Kembali ke Registrasi
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function VerifikasiEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </Card>
      </div>
    }>
      <VerifikasiEmailContent />
    </Suspense>
  );
}
