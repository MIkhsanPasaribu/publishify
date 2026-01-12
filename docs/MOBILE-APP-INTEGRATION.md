# 📱 Integrasi Aplikasi Mobile Flutter - Publishify

## ✅ Apa yang Sudah Ditambahkan

### 1. Section Download Mobile App di Landing Page
- **Lokasi**: `frontend/components/landing/mobile-app-section.tsx`
- **Fitur**:
  - ✅ Phone mockup visual
  - ✅ Button download Android & iOS
  - ✅ Daftar fitur mobile app
  - ✅ Rating & statistik download
  - ✅ QR Code placeholder
  - ✅ Responsive design

### 2. Folder Download
- **Lokasi**: `frontend/public/downloads/`
- Tempat upload file APK Flutter

### 3. Landing Page Updated
- **File**: `frontend/app/page.tsx`
- Section mobile app ditambahkan sebelum CTA Section

---

## 🚀 Cara Deploy Aplikasi Flutter

### Step 1: Build APK Flutter (Release)

```bash
cd path/ke/flutter-app
flutter build apk --release
```

File APK akan ada di: `build/app/outputs/flutter-apk/app-release.apk`

### Step 2: Upload APK ke Frontend

```bash
# Copy APK ke folder downloads
cp build/app/outputs/flutter-apk/app-release.apk d:/Website/publishify/frontend/public/downloads/publishify.apk
```

### Step 3: Test di Local

1. **Jalankan frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Buka browser**: http://localhost:3000

3. **Scroll ke section "Download Aplikasi Mobile"**

4. **Klik button "Download untuk Android"** - akan download APK

### Step 4: Update Link (Opsional)

Jika sudah upload ke Google Play Store atau App Store, edit file:
`frontend/components/landing/mobile-app-section.tsx`

```typescript
const handleDownloadAndroid = () => {
  // Ganti dengan link Play Store
  window.open("https://play.google.com/store/apps/details?id=com.publishify.app", "_blank");
};

const handleDownloadIOS = () => {
  // Ganti dengan link App Store
  window.open("https://apps.apple.com/app/publishify/id123456789", "_blank");
};
```

---

## 📦 Deploy ke VM Production

### Step 1: Commit & Push

```bash
git add .
git commit -m "feat: tambah section download mobile app Flutter di landing page"
git push origin feature/deployment-scripts
```

### Step 2: Deploy ke VM

```bash
# SSH ke VM
ssh publishify@74.225.221.140

# Pull latest code
cd ~/publishify
git pull origin feature/deployment-scripts

# Upload APK (dari local)
scp publishify.apk publishify@74.225.221.140:~/publishify/frontend/public/downloads/

# Build frontend
cd ~/publishify/frontend
~/.bun/bin/bun run build

# Restart frontend
killall -9 bun
cd ~/publishify/frontend
nohup ~/.bun/bin/bun run start > frontend.log 2>&1 &
```

### Step 3: Test Production

Akses: http://74.225.221.140:3000

---

## 🎨 Customization

### Ubah Warna & Style

Edit `frontend/components/landing/mobile-app-section.tsx`:

```typescript
// Background gradient
className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50"

// Button Android
className="bg-gradient-to-r from-green-600 to-green-700"

// Phone mockup colors
className="bg-gradient-to-br from-blue-600 to-purple-600"
```

### Ganti Screenshot App

Replace placeholder dengan screenshot real:

```typescript
<div className="absolute inset-0">
  <img 
    src="/images/app-screenshot.png" 
    alt="Publishify Mobile App"
    className="w-full h-full object-cover"
  />
</div>
```

### Tambah QR Code Real

Gunakan library seperti `react-qr-code`:

```bash
npm install react-qr-code
```

```typescript
import QRCode from "react-qr-code";

<QRCode value="https://publishify.com/download" size={128} />
```

---

## 📊 Analytics & Tracking

Tambahkan tracking untuk button download:

```typescript
const handleDownloadAndroid = () => {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'download_android', {
      event_category: 'mobile_app',
      event_label: 'android_apk'
    });
  }
  
  window.open("/downloads/publishify.apk", "_blank");
};
```

---

## ✨ Preview Section Mobile App

Section ini memiliki:

1. **Header** - Judul & deskripsi section
2. **Phone Mockup** - Visual smartphone dengan app preview
3. **Fitur Cards** - 3 kartu fitur utama:
   - Baca Buku Favorit
   - Kelola Naskah
   - Notifikasi Real-time
4. **Download Buttons**:
   - Android (hijau, primary)
   - iOS (outline, secondary)
5. **Stats** - Rating 4.8 & 10K+ downloads
6. **QR Code** - Untuk download cepat

---

## 🔗 Links & Resources

- **Flutter App Code**: (tambahkan link repo Flutter Anda)
- **APK Build Guide**: https://docs.flutter.dev/deployment/android
- **iOS Build Guide**: https://docs.flutter.dev/deployment/ios
- **Play Store Upload**: https://play.google.com/console

---

## 📝 Next Steps

1. ✅ Build Flutter APK release
2. ✅ Upload ke `frontend/public/downloads/publishify.apk`
3. ✅ Test di local (http://localhost:3000)
4. ⏳ Update links ke Play Store / App Store (setelah publish)
5. ⏳ Commit & push ke Git
6. ⏳ Deploy ke VM production
7. ⏳ Test di production (http://74.225.221.140:3000)

---

## 🐛 Troubleshooting

### APK tidak bisa download?
- Pastikan file ada di `frontend/public/downloads/publishify.apk`
- Cek permission file (chmod 644)
- Cek network tab di browser untuk error 404

### Button tidak muncul?
- Clear browser cache
- Restart dev server
- Cek console untuk error

### Style tidak sesuai?
- Pastikan Tailwind CSS loaded
- Cek className untuk typo
- Test dengan `npm run build` untuk production

---

**Created**: January 13, 2026
**Status**: ✅ Ready for Testing
