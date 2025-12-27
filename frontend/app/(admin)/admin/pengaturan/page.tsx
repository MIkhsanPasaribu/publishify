"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  Mail,
  Key,
  Save,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";

export default function PengaturanAdminPage() {
  const { pengguna } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profil" | "keamanan" | "notifikasi">("profil");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formProfil, setFormProfil] = useState({
    namaDepan: pengguna?.profilPengguna?.namaDepan || "",
    namaBelakang: pengguna?.profilPengguna?.namaBelakang || "",
    email: pengguna?.email || "",
    telepon: pengguna?.telepon || "",
  });

  const [formPassword, setFormPassword] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  const [notifikasiSettings, setNotifikasiSettings] = useState({
    emailNaskahBaru: true,
    emailReviewSelesai: true,
    emailPesananBaru: true,
    pushNotifikasi: false,
  });

  const handleSaveProfil = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("Profil berhasil diperbarui");
  };

  const handleSavePassword = async () => {
    if (formPassword.passwordBaru !== formPassword.konfirmasiPassword) {
      toast.error("Password baru tidak cocok dengan konfirmasi");
      return;
    }
    if (formPassword.passwordBaru.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setFormPassword({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
    toast.success("Password berhasil diubah");
  };

  const tabs = [
    { id: "profil", label: "Profil", icon: <User className="w-4 h-4" /> },
    { id: "keamanan", label: "Keamanan", icon: <Lock className="w-4 h-4" /> },
    { id: "notifikasi", label: "Notifikasi", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header dengan Gradient */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Pengaturan Akun
            </h1>
            <p className="text-sm sm:text-base text-teal-50">
              Kelola profil dan preferensi akun admin Anda
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                  {formProfil.namaDepan?.[0] || pengguna?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-slate-200 hover:bg-slate-50 transition-colors">
                  <Camera className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {formProfil.namaDepan || "Admin"} {formProfil.namaBelakang}
                </h2>
                <p className="text-slate-600">{pengguna?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrator
                  </Badge>
                  {pengguna?.terverifikasi && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profil" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Informasi Profil
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Perbarui informasi profil Anda yang akan ditampilkan di sistem
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="namaDepan">Nama Depan</Label>
                  <Input
                    id="namaDepan"
                    value={formProfil.namaDepan}
                    onChange={(e) => setFormProfil({ ...formProfil, namaDepan: e.target.value })}
                    placeholder="Nama depan"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="namaBelakang">Nama Belakang</Label>
                  <Input
                    id="namaBelakang"
                    value={formProfil.namaBelakang}
                    onChange={(e) => setFormProfil({ ...formProfil, namaBelakang: e.target.value })}
                    placeholder="Nama belakang"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formProfil.email}
                    onChange={(e) => setFormProfil({ ...formProfil, email: e.target.value })}
                    placeholder="email@example.com"
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah</p>
              </div>

              <div>
                <Label htmlFor="telepon">Nomor Telepon</Label>
                <Input
                  id="telepon"
                  value={formProfil.telepon}
                  onChange={(e) => setFormProfil({ ...formProfil, telepon: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfil}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  {isLoading ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "keamanan" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                Keamanan Akun
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Kelola password dan pengaturan keamanan akun Anda
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <Label htmlFor="passwordLama">Password Lama</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="passwordLama"
                    type={showPassword ? "text" : "password"}
                    value={formPassword.passwordLama}
                    onChange={(e) => setFormPassword({ ...formPassword, passwordLama: e.target.value })}
                    placeholder="Masukkan password lama"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="passwordBaru">Password Baru</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="passwordBaru"
                    type={showPassword ? "text" : "password"}
                    value={formPassword.passwordBaru}
                    onChange={(e) => setFormPassword({ ...formPassword, passwordBaru: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter</p>
              </div>

              <div>
                <Label htmlFor="konfirmasiPassword">Konfirmasi Password Baru</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="konfirmasiPassword"
                    type={showPassword ? "text" : "password"}
                    value={formPassword.konfirmasiPassword}
                    onChange={(e) =>
                      setFormPassword({ ...formPassword, konfirmasiPassword: e.target.value })
                    }
                    placeholder="Ulangi password baru"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePassword}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  {isLoading ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Ubah Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifikasi" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                Preferensi Notifikasi
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Atur notifikasi yang ingin Anda terima
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: "emailNaskahBaru",
                    label: "Naskah Baru Diajukan",
                    description: "Terima email saat ada naskah baru yang diajukan untuk review",
                  },
                  {
                    key: "emailReviewSelesai",
                    label: "Review Selesai",
                    description: "Terima email saat editor menyelesaikan review naskah",
                  },
                  {
                    key: "emailPesananBaru",
                    label: "Pesanan Cetak Baru",
                    description: "Terima email saat ada pesanan cetak baru masuk",
                  },
                  {
                    key: "pushNotifikasi",
                    label: "Push Notification",
                    description: "Terima notifikasi push di browser (memerlukan izin)",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifikasiSettings[item.key as keyof typeof notifikasiSettings]}
                        onChange={(e) =>
                          setNotifikasiSettings({
                            ...notifikasiSettings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => toast.success("Preferensi notifikasi disimpan")}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Preferensi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
