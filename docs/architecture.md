# AumEstate Studio — System Architecture

> คู่มืออธิบายโครงสร้างโปรเจกต์ตั้งแต่ต้น สำหรับการเรียนรู้และอ้างอิง

---

## 1. Architecture Pattern คืออะไร?

โปรเจกต์นี้ใช้ **Next.js App Router Pattern** (Feature-based, Server-first)

| Pattern | ลักษณะ | โปรเจกต์นี้? |
|---|---|---|
| MVC | Model / View / Controller | ❌ |
| MVP | Model / View / Presenter | ❌ |
| **App Router Pattern** | Folder = Route, Server-first | ✅ |

---

### MVC — Model View Controller
```
User Action → Controller → Model → View
```
- **Model** — ข้อมูล + business logic (เช่น database, calculation)
- **View** — แสดงผลเท่านั้น ไม่รู้จัก logic
- **Controller** — รับ input จาก User → สั่ง Model → เลือก View

**ตัวอย่าง:** Laravel, Ruby on Rails, Express.js
**ข้อดี:** แยก concern ชัดเจน
**ข้อเสีย:** View กับ Model อาจคุยกันตรงๆ ได้ → test ยากขึ้น

---

### MVP — Model View Presenter
```
User Action → View → Presenter → Model
                          ↓
                        View (update ผ่าน Presenter เท่านั้น)
```
- เหมือน MVC แต่ **View กับ Model ห้ามคุยกันโดยตรง**
- **Presenter** เป็นตัวกลางทั้งหมด → test ง่ายกว่ามาก

**ตัวอย่าง:** Android (แบบเก่า), WinForms
**ข้อดี:** test ง่าย เพราะ Presenter เป็น pure logic ไม่มี UI
**ข้อเสีย:** Presenter อาจใหญ่มาก (God Object)

---

### App Router Pattern — โปรเจกต์นี้ใช้
```
URL → Folder Structure → Server Component (ดึงข้อมูล + render)
                               ↓ (ส่วนที่ต้องการ interactivity)
                         Client Component (state + events)
```
- **ไม่มี Controller** — routing คือ folder structure อัตโนมัติ
- **Model** = `lib/mock-data.ts` (ข้อมูลทั้งหมด)
- **View + Data fetching** = Server Component จัดการเองเลย
- **Interactive UI** = แยกเป็น Client Component เฉพาะส่วนที่จำเป็น

**ตัวอย่าง:** Next.js 13+, Remix
**ข้อดี:** เร็ว (render บน Server), SEO ดี, code น้อยกว่า
**ข้อเสีย:** ต้องเข้าใจ Server vs Client boundary

---

### เปรียบเทียบ 3 Pattern

| | MVC | MVP | App Router |
|---|---|---|---|
| Routing | Controller จัดการ | Controller/Presenter | Folder = URL (อัตโนมัติ) |
| ดึงข้อมูล | Controller | Presenter | Server Component |
| UI State | View | View (ผ่าน Presenter) | Client Component |
| Test | ปานกลาง | ง่าย | ง่าย (Server = pure fn) |
| Render | Client-side | Client-side | Server-side (default) |

---

## 2. Entry Point — ไฟล์แรกที่ถูกเรียก

```
React ธรรมดา:   index.html → main.tsx → <App /> → Router → Pages
Next.js:         Browser → app/layout.tsx → app/page.tsx
```

### ลำดับการโหลด:
```
1. Browser เข้า URL "/"
2. Next.js Server รับ request
3. app/layout.tsx  ← ไฟล์แรกสุด (Root Shell — Navbar + Footer)
4. app/page.tsx    ← ใส่ใน {children} ของ layout
5. HTML สำเร็จรูปส่งกลับ browser
```

---

## 3. Routing — เปรียบเทียบ React vs Next.js

### React Router (createBrowserRouter):
```typescript
const router = createBrowserRouter([
  { path: "/",             element: <HomePage /> },
  { path: "/listings",     element: <ListingsPage /> },
  { path: "/listings/:id", element: <PropertyDetail /> },
  { path: "/contact",      element: <ContactPage /> },
]);
```

### Next.js App Router — ไม่ต้องเขียน config เลย!
```
โครงสร้าง Folder = Route อัตโนมัติ

app/
├── page.tsx               →  URL: /
├── listings/
│   ├── page.tsx           →  URL: /listings
│   └── [id]/              ←  [bracket] = dynamic segment (เหมือน :id)
│       └── page.tsx       →  URL: /listings/villa-001, /listings/condo-002
├── contact/
│   └── page.tsx           →  URL: /contact
├── robots.ts              →  URL: /robots.txt   (auto-generated)
├── sitemap.ts             →  URL: /sitemap.xml  (auto-generated)
└── not-found.tsx          →  URL: 404           (auto)
```

| Concept | React Router | Next.js App Router |
|---|---|---|
| กำหนด routes | เขียน config object | สร้าง folder + `page.tsx` |
| Dynamic route | `path: "/blog/:id"` | folder ชื่อ `[id]` |
| อ่าน params | `useParams()` | `await params` (Next.js 15) |
| Navigate | `useNavigate()` | `useRouter()` จาก `next/navigation` |
| Link | `<Link to="/page">` | `<Link href="/page">` |
| Data fetching | `useEffect + fetch` | async Server Component โดยตรง |
| Layout ครอบทุกหน้า | ทำเองใน App.tsx | `layout.tsx` อัตโนมัติ |

---

## 4. Component Hierarchy (ภาพรวม)

```
Browser Request
│
└── app/layout.tsx  (Root Shell — ครอบทุกหน้าในเว็บ)
    ├── <Navbar />                    → components/Navbar.tsx
    ├── <main> {children} </main>     ← เปลี่ยนตาม URL
    │   │
    │   ├── [URL: /]
    │   │   app/page.tsx (Server Component)
    │   │   ├── Hero + <SearchBar />  → components/SearchBar.tsx
    │   │   ├── Stats Bar
    │   │   ├── Featured Properties
    │   │   │   └── <PropertyCard /> x4 → components/PropertyCard.tsx
    │   │   ├── Browse by Location
    │   │   ├── Why Choose Us
    │   │   └── CTA Section
    │   │
    │   ├── [URL: /listings]
    │   │   app/listings/page.tsx (Server Component)
    │   │   └── <Suspense>
    │   │       └── <ListingsClient /> → components/ListingsClient.tsx
    │   │           ├── <FilterSidebar /> → components/FilterSidebar.tsx
    │   │           └── <PropertyCard /> x12 → components/PropertyCard.tsx
    │   │
    │   ├── [URL: /listings/:id]
    │   │   app/listings/[id]/page.tsx (Server Component, async)
    │   │   ├── Breadcrumb
    │   │   ├── <ImageGallery />     → components/ImageGallery.tsx
    │   │   ├── Property Details
    │   │   ├── Amenities Grid
    │   │   └── Sticky Sidebar (Price + Agent)
    │   │
    │   └── [URL: /contact]
    │       app/contact/page.tsx (Server Component)
    │       ├── Hero
    │       ├── <ContactForm />      → components/ContactForm.tsx
    │       ├── Office Info Cards
    │       ├── Agent Cards
    │       └── FAQ Accordion
    │
    └── <Footer />                    → components/Footer.tsx
```

---

## 5. อธิบายแต่ละไฟล์

### `app/layout.tsx` — Root Shell
**ทำหน้าที่:** กรอบของทุกหน้า — ใส่ Navbar + Footer ครั้งเดียว ทุกหน้าได้ใช้อัตโนมัติ
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>  {/* ← เนื้อหาแต่ละหน้าอยู่ตรงนี้ */}
        <Footer />
      </body>
    </html>
  );
}
```

---

### `app/page.tsx` — Homepage (Server Component)
**ทำหน้าที่:** หน้าแรกของเว็บ, อ่านข้อมูล featured properties โดยตรง
**Data:** `getFeaturedProperties()` จาก `lib/mock-data.ts`
**Sections:** Hero → Stats → Featured Properties → Browse by Location → Why Choose Us → CTA

---

### `app/listings/page.tsx` — Listings Index (Server Component)
**ทำหน้าที่:** เล็กมาก (32 บรรทัด) — แค่ wrap `<ListingsClient>` ด้วย `<Suspense>`
**ทำไมต้อง Suspense?** เพราะ `ListingsClient` ใช้ `useSearchParams()` — Next.js บังคับ

```typescript
export default function ListingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ListingsClient />
    </Suspense>
  );
}
```

---

### `components/ListingsClient.tsx` — Listings Brain (Client Component)
**ทำหน้าที่:** "สมอง" ของหน้า listings ทั้งหมด
**ความรับผิดชอบ:**
1. อ่าน URL params `?location=` ด้วย `useSearchParams()`
2. จัดการ filter state (location, price, area, types, amenities)
3. คำนวณ filtered properties ด้วย `useMemo`
4. จัดการ sort (featured / price / rating / newest)
5. Toggle Grid/List view
6. Render FilterSidebar + PropertyCard

**Data flow:**
```
URL ?location= → useSearchParams() → setFilters()
FilterSidebar onChange → setFilters()
useMemo → filtered + sorted properties
PropertyCard[] แสดงผล
```

---

### `app/listings/[id]/page.tsx` — Property Detail (Server Component, async)
**ทำหน้าที่:** หน้า detail ของ property แต่ละชิ้น
**Next.js 15 pattern:**
```typescript
export default async function PropertyDetailPage({ params }) {
  const { id } = await params;           // ← ต้อง await (Next.js 15)
  const property = getPropertyById(id);
  if (!property) notFound();
}

export async function generateStaticParams() {
  return properties.map(p => ({ id: p.id }));  // SSG pre-render
}
```

**Layout:** 2 คอลัมน์ — [Gallery + Details] [Sticky Sidebar]
**พิเศษ:** JSON-LD structured data สำหรับ Google Rich Results

---

### `components/FilterSidebar.tsx` — Filter UI (Client Component)
**Export พิเศษ:**
```typescript
export interface FilterValues { ... }    // type shared กับ ListingsClient
export const DEFAULT_FILTERS: FilterValues = { ... }
```
**Controls:** Location search, Price range slider, Area slider, Type buttons (4), Amenity checkboxes (12), Reset button

---

### `components/PropertyCard.tsx` — Reusable Card (Client Component)
**ใช้ใน:** homepage (featured=true) + listings page
**Feature:** Type badge, bookmark toggle, star rating, price, View Details link

---

### `components/ImageGallery.tsx` — Gallery + Lightbox (Client Component)
**State:**
- `currentIndex` — รูปที่แสดงอยู่
- `isLightboxOpen` — เปิด/ปิด fullscreen modal
**UI:** Main image + nav arrows + thumbnail strip → click → lightbox overlay

---

### `components/SearchBar.tsx` — Hero Search (Client Component)
```typescript
// เมื่อกด Search:
router.push(`/listings?location=${encodeURIComponent(query)}`);
// → navigate + ListingsClient อ่าน param แล้ว filter อัตโนมัติ
```

---

### `components/ContactForm.tsx` — Form (Client Component)
**Feature:** Form fields, dropdown subject, fake submit (1.2s delay), success state
**ไม่มี backend** — simulate เท่านั้น

---

### `components/Navbar.tsx` — Navigation (Client Component)
**Feature:** Sticky, logo, desktop nav links, search bar, mobile hamburger menu, active route highlight

---

### `components/Footer.tsx` — Footer (Server Component)
**Feature:** Brand + social links, 4 categories of footer links, copyright

---

### `lib/mock-data.ts` — Data Layer (แทน Database)
```typescript
// Types
export type PropertyType = 'House' | 'Villa' | 'Apartment' | 'Condo';
export interface Property { ... }   // id, name, type, price, images, agent, ...
export interface Agent { ... }      // id, name, phone, email, rating, ...

// Data
export const properties: Property[] = [ /* 12 properties */ ];
export const agents: Agent[] = [ /* 3 agents */ ];

// Helper functions
export function getPropertyById(id: string): Property | undefined
export function getFeaturedProperties(): Property[]
```

**12 Properties:** Beverly Hills Villa, Pasadena House, LA Loft, Santa Monica Condo, Malibu Beachfront, West Hollywood Penthouse, Pasadena Bungalow, Calabasas Farmhouse, Silver Lake Loft, LA Tudor, Palm Springs Villa, SF Condo
**3 Agents:** Sarah Johnson (4.9★), Michael Chen (4.8★), Emily Rodriguez (4.7★)

---

### `app/robots.ts` + `app/sitemap.ts` — SEO Auto-files
```typescript
// robots.ts → /robots.txt (บอก Google bot)
// sitemap.ts → /sitemap.xml (บอก Google ว่ามีหน้าอะไร)
// sitemap รวม 12 property pages อัตโนมัติ
```

---

## 6. Server vs Client Component Rules

**Server Component (default)** — ดีกว่า เร็วกว่า ใช้เมื่อ:
- แสดงข้อมูล static
- อ่านข้อมูลจาก database/API
- ไม่ต้องการ interactivity

**Client Component (`'use client'`)** — ใช้เมื่อ:
- ต้องการ `useState` / `useEffect`
- มี event handlers (`onClick`, `onChange`)
- ใช้ `useRouter` / `useSearchParams` / `usePathname`
- ต้องการ browser APIs

---

## 7. Data Flow Summary

```
lib/mock-data.ts
       │
       ├─→ Server Components (direct import, no fetch needed)
       │        app/page.tsx → getFeaturedProperties()
       │        [id]/page.tsx → getPropertyById(id)
       │        contact/page.tsx → agents[]
       │
       └─→ Client Components (import ใน ListingsClient)
                ListingsClient → properties[] → filter → display
```

---

## 8. Setting Guide — สร้าง Project แบบนี้ตั้งแต่ต้น

### Step 1: Create Project
```bash
npx create-next-app@latest my-project \
  --typescript --tailwind --app --turbopack --no-src-dir
# ตอบ: Use App Router? → Yes
# ตอบ: Import alias? → @/*
```

### Step 2: เพิ่ม Route ใหม่ (ง่ายมาก)
```bash
# หน้า static /about
mkdir -p app/about && touch app/about/page.tsx

# หน้า dynamic /blog/:slug
mkdir -p "app/blog/[slug]" && touch "app/blog/[slug]/page.tsx"
```

### Step 3: Template Server Component (หน้าธรรมดา)
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
};

export default function MyPage() {
  return <div>Content</div>;
}
```

### Step 4: Template Dynamic Route (Next.js 15)
```typescript
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Item ${id}` };
}

export async function generateStaticParams() {
  return [{ id: 'item-1' }, { id: 'item-2' }];
}

export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  return <div>Detail: {id}</div>;
}
```

### Step 5: Navigate ระหว่างหน้า
```typescript
// Declarative link
import Link from 'next/link';
<Link href="/listings">Go to Listings</Link>
<Link href={`/listings/${id}`}>View Detail</Link>

// Programmatic navigate (ใน Client Component เท่านั้น)
'use client';
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/listings?location=Bangkok');

// อ่าน URL params (ใน Client Component)
import { useSearchParams, useParams } from 'next/navigation';
const searchParams = useSearchParams();
const location = searchParams.get('location');
```

---

## 9. Tailwind v4 Quick Reference

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(...);  /* → ใช้ bg-brand-500, text-brand-500 */
  --radius-card: 0.875rem;        /* → ใช้ rounded-card */
  --font-sans: ...;               /* → ใช้ font-sans */
}
```

**สำคัญ:** ไม่มี `tailwind.config.js` — config ทุกอย่างอยู่ใน CSS เท่านั้น
