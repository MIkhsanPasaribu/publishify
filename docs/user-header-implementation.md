# Implementasi User Header Component - Publishify

## 📋 Overview

UserHeader adalah komponen reusable yang menampilkan informasi user dan navigasi di bagian atas dashboard untuk semua role (Penulis, Editor, Percetakan, Admin).

## 🎯 Fitur

### 1. **User Avatar**
- Menampilkan initial nama user dalam circle dengan gradient
- Gradient: `from-teal-500 to-cyan-500`
- Shadow: `shadow-lg shadow-teal-500/20`
- Responsive: Hidden di mobile, visible di tablet+

### 2. **User Information**
- **Nama**: Diambil dari `profilPengguna.namaTampilan` atau gabungan nama depan+belakang
- **Role**: Ditampilkan dalam Bahasa Indonesia (Penulis, Editor, Percetakan, Administrator)
- **Responsive**: Font size menyesuaikan dengan ukuran layar

### 3. **Notification Button**
- Icon: Bell (Lucide React)
- Badge merah jika ada notifikasi unread
- Hover effect dengan background teal
- Counter badge untuk jumlah notifikasi

### 4. **User Dropdown Menu**
Menggunakan Radix UI `@radix-ui/react-dropdown-menu`:

**Menu Items:**
- 👤 Profil Saya
- ⚙️ Pengaturan
- ❓ Bantuan
- ---
- 🚪 Keluar (Logout)

**Animations:**
- Slide-in dari kanan atas
- Smooth fade in/out
- Hover states pada setiap item

### 5. **Logout Functionality**
- Menggunakan `useAuthStore().logout()`
- Redirect ke `/login` setelah logout
- Clear semua session data

## 📁 File Structure

```
frontend/
├── components/
│   ├── shared/
│   │   └── user-header.tsx        # Main header component
│   └── ui/
│       └── dropdown-menu.tsx      # Radix UI dropdown wrapper
├── app/
│   ├── (penulis)/
│   │   └── penulis/
│   │       └── layout.tsx         # Integrated UserHeader
│   ├── (editor)/
│   │   └── editor/
│   │       └── layout.tsx         # Integrated UserHeader
│   ├── (percetakan)/
│   │   └── percetakan/
│   │       └── layout.tsx         # Integrated UserHeader
│   └── (admin)/
│       └── admin/
│           └── layout.tsx         # Integrated UserHeader
```

## 🔧 Implementation Details

### Component Props

```typescript
interface UserHeaderProps {
  userName?: string;
  userRole?: "penulis" | "editor" | "percetakan" | "admin";
  className?: string;
}
```

### Usage in Layout

```tsx
import UserHeader from "@/components/shared/user-header";

export default function PenulisLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <UserHeader userRole="penulis" />
        {children}
      </main>
    </div>
  );
}
```

### Display Name Priority

1. `userName` prop (jika provided)
2. `pengguna.profilPengguna.namaTampilan`
3. `pengguna.profilPengguna.namaDepan + namaBelakang`
4. `pengguna.email.split('@')[0]`
5. Default: `"Pengguna"`

### Role Labels Mapping

```typescript
const roleLabels = {
  penulis: "Penulis",
  editor: "Editor",
  percetakan: "Percetakan",
  admin: "Administrator",
};
```

## 🎨 Design System

### Colors (Teal/Cyan Gradient)
- **Primary Gradient**: `from-teal-500 to-cyan-500`
- **Hover State**: `hover:from-teal-600 hover:to-cyan-600`
- **Shadow**: `shadow-teal-500/20`
- **Text**: 
  - Primary: `text-slate-900`
  - Secondary: `text-slate-500`
  - Hover: `hover:text-teal-600`

### Spacing & Layout
- **Header Height**: `h-16` (64px)
- **Avatar Size**: `h-10 w-10` (40x40px)
- **Padding**: `px-4 sm:px-6 lg:px-8`
- **Gap**: `space-x-2 sm:space-x-3`

### Typography
- **Nama User**: `text-base sm:text-lg font-semibold`
- **Role Label**: `text-xs sm:text-sm text-slate-500`
- **Menu Items**: `text-sm`

### Responsive Breakpoints
- **Mobile (<640px)**: Avatar hidden, compact layout
- **Tablet (≥640px)**: Avatar visible, full layout
- **Desktop (≥1024px)**: Maximum padding

## 🔄 Animations (Framer Motion)

### Header Animation
```typescript
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
```

### Dropdown Animation
- **Scale**: `scale-95` to `scale-100`
- **Duration**: 200ms
- **Easing**: `ease-out`

## 📦 Dependencies

### Required Packages
```json
{
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "framer-motion": "^11.0.0",
  "lucide-react": "latest"
}
```

### Installation
```bash
npm install @radix-ui/react-dropdown-menu
```

## 🧪 Testing Checklist

### Functionality Tests
- [ ] User name displays correctly from store
- [ ] Role label shows in Bahasa Indonesia
- [ ] Avatar shows correct initial letter
- [ ] Notification button is clickable
- [ ] Dropdown menu opens/closes properly
- [ ] Logout redirects to `/login` page
- [ ] Session data cleared after logout

### Visual Tests
- [ ] Header aligns properly with sidebar
- [ ] Gradient colors match dashboard theme
- [ ] Responsive layout works on all screen sizes
- [ ] Hover states work on all interactive elements
- [ ] Animations are smooth (no jank)
- [ ] Dropdown menu positioned correctly
- [ ] Avatar circle is perfectly round

### Accessibility Tests
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states are visible
- [ ] ARIA labels present where needed
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA standards

## 🐛 Known Issues & Solutions

### Issue 1: TypeScript Array Type Error
**Problem**: `pengguna?.peran` could be array type
**Solution**: Type cast with assertion
```typescript
const displayRole = (userRole || 
  (Array.isArray(pengguna?.peran) ? pengguna?.peran[0] : pengguna?.peran) || 
  "penulis") as "penulis" | "editor" | "percetakan" | "admin";
```

### Issue 2: Missing Dropdown Component
**Problem**: `@/components/ui/dropdown-menu` not found
**Solution**: Created wrapper component with all Radix UI primitives

## 🚀 Future Enhancements

### Phase 1: Notification System
- [ ] Integrate real notification count from backend
- [ ] Show notification list in dropdown
- [ ] Mark as read functionality
- [ ] WebSocket real-time updates

### Phase 2: Profile & Settings
- [ ] Create profile page (`/profile`)
- [ ] Create settings page (`/settings`)
- [ ] Update navigation links

### Phase 3: Advanced Features
- [ ] User status indicator (online/offline)
- [ ] Quick actions menu
- [ ] Search bar in header
- [ ] Dark mode toggle
- [ ] Language selector (ID/EN)

## 📚 Related Documentation

- [Backend Notifikasi Module](./backend-todo-list.md)
- [Dashboard Layout Guide](./LAPORAN_PROGRESS_FRONTEND.md)
- [Design System](./API-PERFORMANCE-BEST-PRACTICES.md)
- [Authentication Flow](./GOOGLE-OAUTH-SETUP-GUIDE.md)

## ✅ Implementation Status

- [x] UserHeader component created
- [x] Dropdown menu UI component created
- [x] Integrated in Penulis layout
- [x] Integrated in Editor layout
- [x] Integrated in Percetakan layout
- [x] Integrated in Admin layout
- [x] Logout functionality working
- [x] Responsive design implemented
- [x] TypeScript errors fixed
- [ ] Notification system connected
- [ ] Profile page created
- [ ] Settings page created

## 📝 Notes

### Styling Consistency
- Pastikan gradient teal/cyan konsisten di semua komponen
- Gunakan `shadow-teal-500/20` untuk shadow effects
- Border color: `border-slate-200`
- Background: `bg-white`

### Performance Tips
- UserHeader di-render di layout level (tidak re-render setiap route change)
- Framer Motion animations di-optimasi dengan `initial` props
- Dropdown menu lazy-loaded oleh Radix UI

### Security
- Logout harus clear semua tokens (localStorage, cookies)
- Redirect ke login page immediately
- No sensitive data in frontend state after logout

---

**Last Updated**: 2024
**Author**: Publishify Development Team
**Version**: 1.0.0
