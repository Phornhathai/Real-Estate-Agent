# AumEstate Studio — Claude Code Guide

## Project Overview
Next.js 15 real estate website (mock data, no backend). 12 properties, 3 agents, full SEO.

## Tech Stack
- **Next.js 15.1.6** — App Router + Turbopack (`next dev --turbopack`)
- **React 19** — Server Components by default
- **TypeScript** — strict mode, `@/*` alias → `./`
- **Tailwind CSS v4** — CSS-first config, NO `tailwind.config.js`

---

## Architecture Pattern: Next.js App Router (Feature-based, Server-first)

### Routing Rules
**Folder structure = URL** — ไม่ต้องเขียน route config เหมือน React Router

```
app/page.tsx               → /
app/listings/page.tsx      → /listings
app/listings/[id]/page.tsx → /listings/:id  ← [bracket] = dynamic segment
app/contact/page.tsx       → /contact
app/robots.ts              → /robots.txt    (auto-generated)
app/sitemap.ts             → /sitemap.xml   (auto-generated)
app/not-found.tsx          → 404 page       (auto)
```

### Entry Point Flow
```
Browser Request → app/layout.tsx (Root Shell — Navbar + Footer)
                        ↓ {children}
                  app/page.tsx (or whichever route matches)
```

---

## Component Hierarchy

```
layout.tsx (Server)
├── Navbar           (Client) — usePathname, mobile menu
├── {children}
│   ├── [/]          app/page.tsx (Server)
│   │   ├── SearchBar            (Client)
│   │   └── PropertyCard x4     (Client)
│   ├── [/listings]  app/listings/page.tsx (Server)
│   │   └── Suspense
│   │       └── ListingsClient  (Client) ← filter + sort brain
│   │           ├── FilterSidebar (Client)
│   │           └── PropertyCard x12 (Client)
│   ├── [/listings/:id] app/listings/[id]/page.tsx (Server, async)
│   │   └── ImageGallery        (Client) ← lightbox
│   └── [/contact]  app/contact/page.tsx (Server)
│       └── ContactForm         (Client)
└── Footer           (Server) — static only
```

---

## Server vs Client Components

| File | Type | เหตุผล |
|---|---|---|
| `app/layout.tsx` | Server | Static shell |
| `app/page.tsx` | Server | อ่าน data โดยตรง |
| `app/listings/page.tsx` | Server | Wrap Suspense เท่านั้น |
| `app/listings/[id]/page.tsx` | Server (async) | await params + getPropertyById |
| `app/contact/page.tsx` | Server | ส่วนใหญ่ static |
| `components/Navbar.tsx` | **Client** | usePathname, hamburger state |
| `components/Footer.tsx` | Server | Static links |
| `components/PropertyCard.tsx` | **Client** | bookmark toggle |
| `components/SearchBar.tsx` | **Client** | useRouter, dropdown |
| `components/FilterSidebar.tsx` | **Client** | filter state |
| `components/ListingsClient.tsx` | **Client** | useSearchParams, sort |
| `components/ImageGallery.tsx` | **Client** | lightbox state |
| `components/ContactForm.tsx` | **Client** | form state |

**Rule:** ถ้าต้องการ `useState` / `useEffect` / event handlers / `useRouter` / `useSearchParams` → ต้องมี `'use client'` บนสุด

---

## Data Flow

```
lib/mock-data.ts  ←  แหล่งข้อมูลเดียว (แทน Database + API)
        ↓
Server Components อ่านโดยตรง (import):
  app/page.tsx             → getFeaturedProperties()
  app/listings/[id]/page.tsx → getPropertyById(id)
  app/contact/page.tsx     → agents[]

URL State (Filter sync):
  SearchBar → router.push("/listings?location=Bangkok")
  ListingsClient → useSearchParams() อ่าน ?location= → ส่งเข้า FilterSidebar
```

---

## Key Next.js 15 Patterns ที่ใช้ในโปรเจกต์

```typescript
// 1. Dynamic route params เป็น Promise ต้อง await
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // ← Next.js 15 required
}

// 2. SSG — บอก Next.js ล่วงหน้าว่ามี id อะไรบ้าง
export async function generateStaticParams() {
  return properties.map(p => ({ id: p.id }));
}

// 3. Dynamic Metadata
export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Property ${id}` };
}

// 4. Suspense required เมื่อใช้ useSearchParams()
<Suspense fallback={<Loading />}>
  <ListingsClient />  {/* uses useSearchParams inside */}
</Suspense>
```

---

## Tailwind v4 Rules (สำคัญ!)
- **ไม่มี** `tailwind.config.js` — config ทุกอย่างอยู่ใน `app/globals.css`
- Entry: `@import "tailwindcss";`
- Custom tokens อยู่ใน `@theme {}` block:
  - `--color-brand-500` → `text-brand-500`, `bg-brand-500`
  - `--radius-card` → `rounded-card`
  - `--font-sans`
- PostCSS: `postcss.config.mjs` ใช้ `@tailwindcss/postcss`

---

## File Reference Quick Map

| ต้องการทำอะไร | ไฟล์ที่ต้องดู |
|---|---|
| เพิ่ม/แก้ Property หรือ Agent | `lib/mock-data.ts` |
| แก้ filter logic | `components/ListingsClient.tsx` |
| แก้ filter UI | `components/FilterSidebar.tsx` |
| แก้ property card | `components/PropertyCard.tsx` |
| แก้หน้า detail property | `app/listings/[id]/page.tsx` |
| แก้ gallery / lightbox | `components/ImageGallery.tsx` |
| แก้ contact form | `components/ContactForm.tsx` |
| แก้ colors / fonts / tokens | `app/globals.css` |
| แก้ Navbar / Footer | `components/Navbar.tsx`, `components/Footer.tsx` |
| แก้ Next.js image domains | `next.config.ts` |
| แก้ SEO global | `app/layout.tsx` (metadata export) |
| แก้ sitemap | `app/sitemap.ts` |
