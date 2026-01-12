# 📱 Publishify Mobile App - APK Build Info

## Build Information
- **Build Date**: January 13, 2026
- **APK Size**: 53.1 MB (55,640,321 bytes)
- **Build Type**: Release
- **Flutter Version**: 3.35.2
- **Kotlin**: Included

## File Location
- **Development**: `frontend/public/downloads/publishify.apk`
- **Production**: Will be served from `https://your-domain.com/downloads/publishify.apk`

## Download URLs

### Local Development
```
http://localhost:3000/downloads/publishify.apk
```

### Production (after deployment)
```
http://74.225.221.140:3000/downloads/publishify.apk
```

### With Domain (if configured)
```
https://publishify.com/downloads/publishify.apk
```

## Installation Steps

### For Android Users:
1. Click "Download untuk Android" button on landing page
2. APK file will be downloaded (publishify.apk)
3. Open downloaded file
4. If prompted, enable "Install from Unknown Sources" in Settings
5. Tap "Install"
6. Open Publishify app

## Security Note
Make sure users enable "Install apps from unknown sources" on their Android device:
- Settings > Security > Unknown Sources (Android 7 and below)
- Settings > Apps > Special access > Install unknown apps (Android 8+)

## Update APK
To update the APK with a new version:

```bash
# 1. Build new version
cd mobile
flutter build apk --release

# 2. Copy to frontend
copy build\app\outputs\flutter-apk\app-release.apk ..\frontend\public\downloads\publishify.apk

# 3. Commit and deploy
git add frontend/public/downloads/publishify.apk
git commit -m "update: Publishify mobile app v0.1.1"
git push
```

## App Features
- ✅ Full API integration with backend
- ✅ Real-time notifications via Socket.io
- ✅ Offline mode with SharedPreferences
- ✅ File upload/download support
- ✅ Material Design UI

## Technical Details
- **Package Name**: com.publishify.app (likely)
- **Min SDK**: Configured in Flutter
- **Target SDK**: Latest
- **Permissions**: Internet, Storage, File Access

---

**Last Updated**: January 13, 2026
