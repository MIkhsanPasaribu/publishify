# Publishify Mobile App Downloads

## Cara Upload APK Flutter

1. Build aplikasi Flutter Anda:
   ```bash
   flutter build apk --release
   ```

2. Copy file APK dari `build/app/outputs/flutter-apk/app-release.apk`

3. Rename menjadi `publishify.apk`

4. Upload ke folder ini (`frontend/public/downloads/publishify.apk`)

## Cara Update Link Download

Edit file `frontend/components/landing/mobile-app-section.tsx`:

```typescript
const handleDownloadAndroid = () => {
  // Ganti dengan link Google Play Store atau APK langsung
  window.open("/downloads/publishify.apk", "_blank");
};

const handleDownloadIOS = () => {
  // Ganti dengan link App Store
  window.open("https://apps.apple.com/app/publishify", "_blank");
};
```

## Testing di Local

Setelah upload APK, test download dengan mengakses:
- http://localhost:3000 (scroll ke section "Download Aplikasi Mobile")
