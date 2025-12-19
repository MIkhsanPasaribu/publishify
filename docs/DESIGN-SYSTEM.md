# Design System - Publishify

## 🎨 Overview

Design system modern, minimalis, dan konsisten untuk aplikasi Publishify. Implementasi pertama di halaman `/penulis/draf`.

## 🎭 Design Principles

### 1. **Modern & Minimalis**
- Clean layout dengan white space yang cukup
- Fokus pada konten, bukan dekorasi berlebihan
- Subtle shadows dan borders untuk depth
- Smooth transitions dan micro-interactions

### 2. **Hierarchy yang Jelas**
- Typography scale yang konsisten
- Visual separation antara sections
- Clear call-to-action buttons
- Status badges yang mudah dibaca

### 3. **User-Centric**
- Loading states yang informatif
- Empty states yang engaging
- Error handling yang friendly
- Search & filter yang intuitif

### 4. **Responsive & Accessible**
- Mobile-first approach
- Grid system yang flexible
- Color contrast yang baik
- Keyboard navigation support

---

## 🎨 Color Palette

### Primary Colors
```css
/* Teal/Cyan - Main brand color */
--teal-50:  #f0fdfa
--teal-100: #ccfbf1
--teal-200: #99f6e4
--teal-500: #14b8a6 /* Primary */
--teal-600: #0d9488 /* Hover */
--teal-700: #0f766e /* Active */

--cyan-600: #0891b2 /* Gradient pair */
```

### Neutral Colors
```css
/* Slate - Modern gray palette */
--slate-50:  #f8fafc /* Background subtle */
--slate-100: #f1f5f9 /* Background light */
--slate-200: #e2e8f0 /* Borders */
--slate-400: #94a3b8 /* Placeholder */
--slate-600: #475569 /* Secondary text */
--slate-700: #334155 /* Body text */
--slate-900: #0f172a /* Headings */
```

### Semantic Colors
```css
/* Status colors */
--amber-50:  #fffbeb /* In review bg */
--amber-700: #b45309 /* In review text */

--orange-50:  #fff7ed /* Revision bg */
--orange-700: #c2410c /* Revision text */

--red-50:  #fef2f2 /* Error/rejected bg */
--red-600: #dc2626 /* Error/rejected primary */
--red-700: #b91c1c /* Error/rejected text */

--blue-50:  #eff6ff /* Info bg */
--blue-700: #1d4ed8 /* Info text */
```

---

## 📐 Spacing System

Menggunakan spacing scale 4px base:

```css
--spacing-1:  0.25rem  /* 4px */
--spacing-2:  0.5rem   /* 8px */
--spacing-3:  0.75rem  /* 12px */
--spacing-4:  1rem     /* 16px */
--spacing-6:  1.5rem   /* 24px */
--spacing-8:  2rem     /* 32px */
--spacing-12: 3rem     /* 48px */
--spacing-16: 4rem     /* 64px */
--spacing-20: 5rem     /* 80px */
```

### Padding Convention
- **Cards**: `p-6` (24px)
- **Buttons**: `px-6 py-3` (24px × 12px)
- **Container**: `px-6 py-8` (24px × 32px)
- **Sections**: `mb-6` atau `mb-8`

---

## 🔤 Typography

### Font Family
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale
```css
/* Headings */
--text-3xl: 1.875rem  /* 30px - Page title */
--text-2xl: 1.5rem    /* 24px - Section title */
--text-xl:  1.25rem   /* 20px - Card title */
--text-lg:  1.125rem  /* 18px - Subtitle */

/* Body */
--text-base: 1rem     /* 16px - Body text */
--text-sm:   0.875rem /* 14px - Helper text */
--text-xs:   0.75rem  /* 12px - Labels, badges */
```

### Font Weights
```css
--font-normal:    400  /* Body text */
--font-medium:    500  /* Buttons, emphasis */
--font-semibold:  600  /* Subtle headings */
--font-bold:      700  /* Headings */
```

### Line Heights
```css
--leading-tight:   1.25  /* Headings */
--leading-normal:  1.5   /* Body text */
--leading-relaxed: 1.625 /* Long-form content */
```

---

## 🎯 Components

### 1. **Buttons**

#### Primary Button (Gradient)
```tsx
<button className="
  inline-flex items-center gap-2 
  px-6 py-3 
  bg-gradient-to-r from-teal-600 to-cyan-600 
  text-white font-medium 
  rounded-xl 
  shadow-lg shadow-teal-500/20 
  hover:shadow-xl hover:shadow-teal-500/30 
  transition-all duration-200
">
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="
  px-6 py-3 
  border-2 border-slate-200 
  text-slate-700 font-medium 
  rounded-xl 
  hover:bg-slate-50 
  transition-colors
">
  Button Text
</button>
```

#### Icon Button
```tsx
<button className="
  inline-flex items-center justify-center 
  w-11 h-11 
  bg-slate-100 text-slate-700 
  rounded-xl 
  hover:bg-slate-200 
  transition-colors
">
  <Icon className="w-4 h-4" />
</button>
```

#### Destructive Button
```tsx
<button className="
  inline-flex items-center justify-center 
  w-11 h-11 
  bg-red-50 text-red-600 
  rounded-xl 
  hover:bg-red-100 
  transition-colors
">
  <Trash2 className="w-4 h-4" />
</button>
```

### 2. **Cards**

#### Modern Card with Hover Effect
```tsx
<div className="
  group 
  bg-white rounded-2xl 
  border border-slate-200 
  hover:border-teal-200 
  hover:shadow-xl hover:shadow-teal-500/10 
  transition-all duration-300 
  overflow-hidden
">
  {/* Content */}
</div>
```

### 3. **Badges**

#### Status Badge
```tsx
<span className={`
  inline-flex items-center gap-2 
  px-3 py-1.5 
  rounded-lg 
  text-xs font-semibold 
  ${colorClasses}
`}>
  <Icon className="w-4 h-4" />
  Status Text
</span>
```

**Status Badge Variants:**
- Draft: `bg-slate-100 text-slate-700`
- In Review: `bg-amber-100 text-amber-700`
- Revision: `bg-orange-100 text-orange-700`
- Rejected: `bg-red-100 text-red-700`

#### Count Badge
```tsx
<span className="
  ml-1 px-2 py-0.5 
  rounded-full 
  text-xs font-semibold 
  bg-teal-100 text-teal-700
">
  Count
</span>
```

### 4. **Tabs**

#### Modern Tab with Animation
```tsx
<button className={`
  relative px-6 py-4 
  font-medium text-sm 
  transition-all duration-200
  ${isActive 
    ? 'text-teal-600' 
    : 'text-slate-600 hover:text-slate-900'
  }
`}>
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4" />
    Tab Label
    <span className={`
      ml-1 px-2 py-0.5 
      rounded-full text-xs font-semibold
      ${isActive 
        ? 'bg-teal-100 text-teal-700' 
        : 'bg-slate-100 text-slate-600'
      }
    `}>
      Count
    </span>
  </div>
  {isActive && (
    <motion.div
      layoutId="activeTab"
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-cyan-600"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  )}
</button>
```

### 5. **Search Input**

```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
  <input
    type="text"
    placeholder="Cari..."
    className="
      w-full pl-12 pr-4 py-3 
      bg-slate-50 
      border border-slate-200 
      rounded-xl 
      text-slate-900 
      placeholder:text-slate-400 
      focus:outline-none 
      focus:ring-2 focus:ring-teal-500 
      focus:border-transparent 
      transition-all
    "
  />
</div>
```

### 6. **Empty State**

```tsx
<div className="flex flex-col items-center justify-center py-20">
  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
    <Icon className="w-10 h-10 text-slate-400" />
  </div>
  <h3 className="text-xl font-semibold text-slate-900 mb-2">
    Empty State Title
  </h3>
  <p className="text-slate-600 text-center max-w-md mb-8">
    Empty state description
  </p>
  <button>Call to Action</button>
</div>
```

### 7. **Skeleton Loading**

```tsx
<div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
  <div className="h-6 bg-slate-200 rounded w-20 mb-4"></div>
  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
  <div className="space-y-2 mb-4">
    <div className="h-4 bg-slate-200 rounded w-full"></div>
    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
  </div>
</div>
```

---

## ✨ Animations with Framer Motion

### 1. **Card Hover**
```tsx
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2 }}
>
  {/* Card content */}
</motion.div>
```

### 2. **Button Interactions**
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Button
</motion.button>
```

### 3. **Fade In on Mount**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
  {/* Content */}
</motion.div>
```

### 4. **Layout Animations**
```tsx
<motion.div 
  layout
  className="grid"
>
  {items.map(item => (
    <motion.div 
      key={item.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Item */}
    </motion.div>
  ))}
</motion.div>
```

### 5. **Tab Indicator Animation**
```tsx
<motion.div
  layoutId="activeTab"
  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-cyan-600"
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```

---

## 🏗️ Layout Structure

### Page Layout
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
  {/* Header Section */}
  <div className="bg-white border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header content */}
    </div>
  </div>

  {/* Content Section */}
  <div className="max-w-7xl mx-auto px-6 py-8">
    {/* Main content */}
  </div>
</div>
```

### Grid System
```tsx
// 3-column grid (responsive)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
sm:  640px  /* Small devices */
md:  768px  /* Tablets */
lg:  1024px /* Desktop */
xl:  1280px /* Large desktop */
2xl: 1536px /* Extra large */
```

### Responsive Grid Example
```tsx
<div className="
  grid 
  grid-cols-1        /* Mobile: 1 column */
  md:grid-cols-2     /* Tablet: 2 columns */
  lg:grid-cols-3     /* Desktop: 3 columns */
  gap-6
">
  {/* Items */}
</div>
```

---

## 🎨 Shadows

### Shadow Scale
```css
/* Subtle shadows for depth */
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)

/* Colored shadows for emphasis */
shadow-teal-500/20:  rgba(20, 184, 166, 0.2)
shadow-teal-500/30:  rgba(20, 184, 166, 0.3)
```

### Usage
```tsx
// Card hover shadow
<div className="
  shadow-lg 
  hover:shadow-xl hover:shadow-teal-500/10
">
  {/* Content */}
</div>

// Button shadow
<button className="
  shadow-lg shadow-teal-500/20 
  hover:shadow-xl hover:shadow-teal-500/30
">
  Button
</button>
```

---

## 🔄 Border Radius

```css
rounded-lg:  0.5rem   /* 8px - Small elements */
rounded-xl:  0.75rem  /* 12px - Buttons, inputs */
rounded-2xl: 1rem     /* 16px - Cards */
rounded-full:         /* Badges, avatars */
```

---

## ✅ Implementation Checklist

### Phase 1: Core Components ✅
- [x] Modern button variants
- [x] Card with hover effects
- [x] Status badges dengan icons
- [x] Search input dengan icons
- [x] Tab navigation dengan animation
- [x] Skeleton loading states
- [x] Empty state component

### Phase 2: Animations ✅
- [x] Button hover/tap effects
- [x] Card hover lift effect
- [x] Fade in on mount
- [x] Tab indicator transition
- [x] Layout animations (grid)

### Phase 3: Pages Implemented ✅
- [x] `/penulis/draf` - Modern redesign complete

### Phase 4: To Be Applied
- [ ] `/penulis/buku-terbit`
- [ ] `/penulis/pesanan-cetak`
- [ ] `/penulis/naskah/buat`
- [ ] `/penulis/profil`
- [ ] `/editor/*` pages
- [ ] `/percetakan/*` pages
- [ ] `/admin/*` pages

---

## 📦 Dependencies

### Required Packages
```json
{
  "framer-motion": "^11.0.0",  // Animations
  "lucide-react": "^0.312.0",   // Icons
  "tailwindcss": "^3.4.1",      // Styling
  "tailwind-merge": "^2.2.0",   // Class merging
  "sonner": "^1.3.1"            // Toast notifications
}
```

---

## 🎯 Best Practices

### 1. **Consistency**
- Gunakan spacing system yang sama
- Gunakan color palette yang defined
- Gunakan border radius yang konsisten
- Gunakan shadow scale yang sama

### 2. **Performance**
- Lazy load images
- Optimize animations (use `transform` and `opacity`)
- Avoid layout shifts
- Use skeleton loading

### 3. **Accessibility**
- Maintain color contrast ratio 4.5:1
- Add ARIA labels
- Keyboard navigation support
- Focus visible states

### 4. **Code Organization**
- Extract reusable components
- Use TypeScript for type safety
- Document component props
- Keep components small and focused

---

## 🚀 Next Steps

1. **Create Component Library**
   - Extract components ke `/components/ui`
   - Add Storybook documentation
   - Create variant props

2. **Extend to Other Pages**
   - Apply design system to remaining pages
   - Maintain consistency across roles

3. **Dark Mode Support**
   - Add dark mode variants
   - Use CSS variables for theming

4. **Accessibility Audit**
   - Test keyboard navigation
   - Check color contrast
   - Add screen reader support

---

**Last Updated**: January 2025  
**Status**: ✅ Phase 1 Complete - Implemented in `/penulis/draf`  
**Next Target**: `/penulis/buku-terbit` page
