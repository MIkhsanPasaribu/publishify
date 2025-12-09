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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
            Pengaturan Akun
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola profil dan preferensi akun admin Anda
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                  {formProfil.namaDepan?.[0] || pengguna?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formProfil.namaDepan || "Admin"} {formProfil.namaBelakang}
                </h2>
                <p className="text-gray-600">{pengguna?.email}</p>
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
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profil" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Informasi Profil
              </CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda yang akan ditampilkan di sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
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
                  className="bg-teal-600 hover:bg-teal-700"
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
            </CardContent>
          </Card>
        )}

        {activeTab === "keamanan" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                Keamanan Akun
              </CardTitle>
              <CardDescription>
                Kelola password dan pengaturan keamanan akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="passwordLama">Password Lama</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="passwordBaru">Password Baru</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="passwordBaru"
                    type={showPassword ? "text" : "password"}
                    value={formPassword.passwordBaru}
                    onChange={(e) => setFormPassword({ ...formPassword, passwordBaru: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
              </div>

              <div>
                <Label htmlFor="konfirmasiPassword">Konfirmasi Password Baru</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  className="bg-teal-600 hover:bg-teal-700"
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
            </CardContent>
          </Card>
        )}

        {activeTab === "notifikasi" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                Preferensi Notifikasi
              </CardTitle>
              <CardDescription>
                Atur notifikasi yang ingin Anda terima
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => toast.success("Preferensi notifikasi disimpan")}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Preferensi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
