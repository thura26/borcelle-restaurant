# 🍜 Borcelle Restaurant — 7-Levels Spicy Noodle

> **Bringing The Fire Of Korean Spice To Yangon Since 2019. Every Dish, A Pilgrimage.**

A modern, high-performance restaurant website for **Borcelle** — featuring signature 7-level spicy noodles, K-BBQ, bibimbap, and full e-commerce + reservation workflows. Built with React 19, Vite, Tailwind CSS and GSAP.

**[Live Demo](#) • [Report Bug](https://github.com/thura26/borcelle-restaurant/issues) • [Request Feature](https://github.com/thura26/borcelle-restaurant/issues)**

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📑 Table of Contents

- [English](#-english)
  - [Features](#-features)
  - [Tech Stack](#️-tech-stack)
  - [Project Structure](#-project-structure)
  - [Getting Started](#-getting-started)
  - [Available Scripts](#-available-scripts)
  - [Routing & Pages](#-routing--pages)
  - [Admin Dashboard](#-admin-dashboard)
  - [Theming & Design System](#-theming--design-system)
  - [Data & Content](#-data--content)
  - [Build & Deployment](#-build--deployment)
- [License](#-license)

---

## 🌐 English

### ✨ Features

**Customer-facing**
- **Immersive Landing** — `Hero`, `SoulGallery`, `CuisineGrid`, `JourneyBanner`, `CraftedGallery` with GSAP `ScrollTrigger` reveal animations (`src/App.tsx:52-64`)
- **Ticker Marquee** — infinite scrolling food categories (`src/components/Ticker.tsx`, `src/lib/data.ts:212`)
- **Interactive Menu** — 6 tabs (SPICY NOODLES / BIBIMBAP / K-BBQ / FRIED / SOUPS / DRINKS) with 72+ items, prices in MMK, dotted-line pricing UI
- **Testimonials** & **Chef** storytelling sections
- **Reservation System** — date/time/guest form with React Context (`src/context/ReservationContext.tsx`)
- **Cart & Checkout** — `CartContext` + `OrderContext` + `/checkout` page with promo/coupon support
- **Auth** — login/register modal, role-based access (`admin` / `user`), protected routes (`src/components/ProtectedRoute.tsx`)
- **Account** — user order history & reservation list at `/account`
- **Toasts, Audit log, Theme** providers for polished UX

**Admin Dashboard** (`/admin` — `RequireAdmin` guard)
- Overview with `recharts` charts & `StatsCard`
- **Products / Categories / Menu** CRUD + CSV import/export (`src/lib/csv.ts`) + AI menu generator (`src/lib/aiMenu.ts`)
- **Orders / Reservations** management with status updates
- **Promos, Users, Settings, Audit Log, Account** pages
- `DataTable`, `ImageUploader`, `AdminCharts` reusable components

**DX**
- Type-safe with TypeScript, linted with `oxlint` (`oxlint-tsgolint` ready)
- Responsive, accessible, custom scrollbar, marquee pause-on-hover

### 🛠️ Tech Stack

| Category | Tech |
|---|---|
| **Framework** | React 19.2, React Router 7.18, React DOM 19.2 |
| **Build** | Vite 8.2 + `@vitejs/plugin-react` 6.1 |
| **Language** | TypeScript ~6.0 |
| **Styling** | Tailwind CSS 3.4, PostCSS + Autoprefixer, `Poppins` font |
| **Animation** | GSAP 3.15 (`ScrollTrigger`, `ScrollToPlugin`) |
| **Icons** | lucide-react 1.38 |
| **Charts** | recharts 2.15 |
| **Lint** | oxlint 1.79 |

> See `package.json:12-31` and `vite.config.ts:5` for exact versions.

### 📁 Project Structure

```
.
├── index.html                 # Entry HTML, title: "Borcelle Restaurant — 7-Levels Spicy Noodle"
├── vite.config.ts             # Vite + React plugin, chunkSizeWarningLimit: 800
├── tailwind.config.js         # Theme: primary #C1272E, background #FFFBF5, etc.
├── postcss.config.js
├── tsconfig.json / tsconfig.app.json
├── public/
│   └── borcelle-logo.svg
└── src/
    ├── main.tsx               # StrictMode + BrowserRouter
    ├── App.tsx                # Routes + 12 providers + GSAP setup
    ├── index.css              # Tailwind + custom utilities, marquee, scrollbar
    ├── components/
    │   ├── Navbar.tsx, Hero.tsx, Ticker.tsx, SoulGallery.tsx, CuisineGrid.tsx
    │   ├── JourneyBanner.tsx, Testimonials.tsx, CraftedGallery.tsx
    │   ├── MenuList.tsx, Chef.tsx, Reservation.tsx, Footer.tsx
    │   ├── AuthModal.tsx, ProtectedRoute.tsx, Logo.tsx
    │   └── admin/             # DataTable, StatsCard, AdminCharts, ImageUploader, AIMenuGenerator
    ├── pages/
    │   ├── Checkout.tsx, Account.tsx
    │   └── admin/             # DashboardOverview, AdminProducts/Categories/Menu/Orders/Reservations/Promos/Users/Settings/Audit/Account + AdminLayout
    ├── context/               # Theme, Toast, Audit, Settings, Auth, Reservation, Order, Product, Category, Menu, Promo, Cart
    ├── hooks/useScrollSpy.ts
    └── lib/
        ├── brand.ts           # BRAND { name: "Borcelle", tagline: "7-Levels Spicy Noodle" }
        ├── data.ts            # cuisineItems, menuData (72 items), testimonials, tickerItems
        ├── aiMenu.ts / aiMenuPrompts.ts
        ├── csv.ts, validators.ts
```

### 🚀 Getting Started

**Prerequisites:** Node.js 18+ (20 LTS recommended), npm 9+

```bash
# 1. Clone
git clone https://github.com/thura26/borcelle-restaurant.git
cd borcelle-restaurant

# 2. Install
npm install

# 3. Run dev server (http://localhost:5173)
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview

# 6. Lint
npm run lint
```

No `.env` required for local mock data. If you add AI features, create `.env` from `.env.example` (if present) and add your keys.

### 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc -b && vite build` | Type-check + production build to `dist/` |
| `preview` | `vite preview` | Preview `dist/` locally |
| `lint` | `oxlint` | Lint with Oxlint |

### 🧭 Routing & Pages

| Path | Component | Guard |
|---|---|---|
| `/` | `Home` — Navbar + Hero + Ticker + SoulGallery + CuisineGrid + JourneyBanner + Testimonials + CraftedGallery + MenuList + Chef + Reservation + Footer | public |
| `/checkout` | `Checkout` (cart + order) | public (auth optional) |
| `/account` | `Account` (user orders/reservations) | public |
| `/admin` | `AdminLayout` → `DashboardOverview` | `RequireAdmin` |
| `/admin/products`, `/admin/categories`, `/admin/menu`, `/admin/orders`, `/admin/reservations`, `/admin/promos`, `/admin/users`, `/admin/settings`, `/admin/audit`, `/admin/account` | admin modules | `RequireAdmin` |
| `*` | 404 with Back Home | — |

### 🔐 Admin Dashboard

- Default admin email: `borcelle.admin@gmail.com` (`src/lib/brand.ts:9`)
- Auth is context-mocked (no backend). `AuthContext` holds `user.role`. Extend with your API / Firebase / Supabase.
- Navigate to `/admin` after login as admin — auto-redirect handled in `App.tsx:108`.

### 🎨 Theming & Design System

`tailwind.config.js:7-21`

```js
colors: {
  primary: "#C1272E", "primary-hover": "#A91E24",
  background: "#FFFBF5", surface: "#FFF0E6", "surface-hover": "#FFD8B8",
  dark: "#1A1E1D", muted: "#6B7280",
  accent: "#C9A86A", "accent-hover": "#B8944F"
}
fontFamily: { poppins: ["Poppins","sans-serif"] }
```

CSS variables mirror the palette in `src/index.css:15-25`. Dark mode via `class` strategy (`darkMode: "class"`).

### 📦 Data & Content

All menu content is in `src/lib/data.ts`:

- `cuisineCategories`, `cuisineItems` (9 featured items)
- `menuData` — 6 tabs × 12 items (prices as `"18,000 MMK"` strings)
- `testimonials`, `soulGalleryImages`, `tickerItems`

Edit that single file to update the whole menu. `ProductContext` / `MenuContext` expose it via React Context.

### 📦 Build & Deployment

```bash
npm run build # -> dist/
```

`dist/` is gitignored. Deploy `dist/` to **Vercel**, **Netlify**, or **GitHub Pages** (with `vite` base config). For Pages, set `base` in `vite.config.ts` if repo name != `username.github.io`.

---

