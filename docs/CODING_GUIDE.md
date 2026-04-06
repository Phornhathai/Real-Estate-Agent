# AumEstate Studio — Coding Guide (ฝึกเขียนตาม Project)

> เอกสารนี้ออกแบบมาเพื่อให้คุณเขียนโค้ดตามได้ตั้งแต่ไฟล์แรก จนถึงไฟล์สุดท้าย
> เน้นเข้าใจ **Routing**, **Rendering**, **API**, และ **Data Flow** ของ Next.js
> พร้อมเปรียบเทียบกับ React JS ตลอดทาง

---

## 📋 สารบัญ

1. [สร้างโปรเจกต์](#step-0-สร้างโปรเจกต์)
2. [ลำดับการเขียนไฟล์ (22 ไฟล์)](#ลำดับการเขียนไฟล์)
3. [Phase 1: Config & Styling](#phase-1-config--styling)
4. [Phase 2: Data Layer](#phase-2-data-layer)
5. [Phase 3: Layout Shell](#phase-3-layout-shell-ทำงานก่อนทุกหน้า)
6. [Phase 4: Shared Components](#phase-4-shared-components)
7. [Phase 5: Home Page](#phase-5-home-page)
8. [Phase 6: Listings Page (Filter)](#phase-6-listings-page-filter)
9. [Phase 7: Property Detail](#phase-7-property-detail-page)
10. [Phase 8: Contact Page + React Hook Form](#phase-8-contact-page--react-hook-form)
11. [Phase 9: SEO & Error](#phase-9-seo--error-handling)
12. [Phase 10: API Route (Unsplash)](#phase-10-api-route-unsplash)
13. [Routing Deep Dive](#️-routing-deep-dive)
14. [Rendering Deep Dive](#️-rendering-deep-dive-server-vs-client)
15. [API & Networking Deep Dive](#-api--networking-deep-dive)
16. [Data Flow Diagram](#-data-flow-diagram)
17. [React JS vs Next.js Cheat Sheet](#-react-js-vs-nextjs-cheat-sheet)

---

## Step 0: สร้างโปรเจกต์

```bash
# สร้าง Next.js project ใหม่ (ไม่ต้องใช้ Vite!)
npx create-next-app@latest aum-estate-studio

# ตอน prompt ถาม → เลือก:
# ✔ TypeScript?           → Yes
# ✔ ESLint?               → Yes
# ✔ Tailwind CSS?         → Yes
# ✔ `src/` directory?     → No
# ✔ App Router?           → Yes   ← สำคัญมาก!
# ✔ Turbopack?            → Yes
# ✔ import alias?         → @/*

# เข้าโปรเจกต์
cd aum-estate-studio

# ติดตั้ง React Hook Form (สำหรับ Contact Form)
npm install react-hook-form

# รัน dev server
npm run dev
# → เปิด http://localhost:3000
```

### ไฟล์ที่ Next.js สร้างให้อัตโนมัติ (ไม่ต้องเขียนเอง)

```
├── package.json         ← auto (แก้เพิ่ม dependencies ได้)
├── tsconfig.json        ← auto
├── next-env.d.ts        ← auto (ห้ามแก้!)
├── .gitignore           ← auto
├── public/              ← auto (ใส่รูป static ได้)
└── node_modules/        ← auto (npm install)
```

---

## ลำดับการเขียนไฟล์

```
Phase 1: Config & Styling (เขียนก่อน — ตั้งค่าพื้นฐาน)
  ├── 1. next.config.ts          ← ตั้งค่า Image domains + Turbopack
  ├── 2. postcss.config.mjs      ← ตั้งค่า Tailwind v4
  └── 3. app/globals.css         ← สี, font, design tokens

Phase 2: Data Layer (เตรียมข้อมูลก่อนสร้าง UI)
  └── 4. lib/mock-data.ts        ← 12 properties + 3 agents + helper functions

Phase 3: Layout Shell (โครงร่างที่ครอบทุกหน้า)
  ├── 5. app/layout.tsx          ← Root Layout (Navbar + Footer + SEO)
  ├── 6. components/Navbar.tsx   ← Client Component (usePathname)
  └── 7. components/Footer.tsx   ← Server Component (static)

Phase 4: Shared Components (ใช้ร่วมกันข้ามหน้า)
  ├── 8. components/PropertyCard.tsx   ← Card แสดง property
  └── 9. components/SearchBar.tsx      ← Search + redirect

Phase 5: Home Page (หน้าแรก — /)
  └── 10. app/page.tsx           ← Server Component + Featured Properties

Phase 6: Listings Page (หน้า filter — /listings)
  ├── 11. components/FilterSidebar.tsx     ← Filter UI
  ├── 12. components/ListingsClient.tsx    ← Filter logic + sort
  └── 13. app/listings/page.tsx            ← Server wrapper + Suspense

Phase 7: Property Detail (หน้ารายละเอียด — /listings/[id])
  ├── 14. components/ImageGallery.tsx      ← Lightbox gallery
  └── 15. app/listings/[id]/page.tsx       ← Dynamic route + SSG + JSON-LD

Phase 8: Contact Page (หน้าติดต่อ — /contact)
  ├── 16. components/ContactForm.tsx       ← React Hook Form
  └── 17. app/contact/page.tsx             ← Server Component + agents

Phase 9: SEO & Error
  ├── 18. app/not-found.tsx      ← Custom 404
  ├── 19. app/robots.ts          ← robots.txt
  └── 20. app/sitemap.ts         ← sitemap.xml

Phase 10: API Route (เรียก Unsplash API)
  ├── 21. .env.local             ← API Key (ปลอดภัย)
  └── 22. app/api/images/route.ts ← API endpoint
```

---

## Phase 1: Config & Styling

### ไฟล์ 1: `next.config.ts`

```
เขียนอะไร: บอก Next.js ว่าอนุญาตโหลดรูปจากโดเมนไหน + เปิด Turbopack
ทำไมต้องมี: next/image จะ block รูปจากภายนอกถ้าไม่ตั้งค่า (security)
```

**Rendering:** ไม่เกี่ยวกับ rendering — เป็น build-time config

**เทียบ React JS:**
```
React JS: ไม่มี config สำหรับรูป — <img> โหลดจากไหนก็ได้ (ไม่ปลอดภัย)
Next.js:  ต้องระบุ domains → ป้องกัน Server-Side Request Forgery (SSRF)
```

### ไฟล์ 2: `postcss.config.mjs`

```
เขียนอะไร: บอก PostCSS ให้ใช้ @tailwindcss/postcss plugin
ทำไมต้องมี: Tailwind v4 ใช้ plugin ตัวเดียว (v3 ใช้ 2 ตัว)
```

### ไฟล์ 3: `app/globals.css`

```
เขียนอะไร: @import "tailwindcss" + @theme {} กำหนดสี, font, design tokens
ทำไมต้องมี: Tailwind v4 ใช้ CSS-first config (ไม่มี tailwind.config.js)
```

**เทียบ React JS:**
```
React JS + Tailwind v3: ต้องมี tailwind.config.js + 3 บรรทัด @tailwind
Next.js + Tailwind v4:  @import "tailwindcss" ตัวเดียว + @theme {} ใน CSS
```

---

## Phase 2: Data Layer

### ไฟล์ 4: `lib/mock-data.ts`

```
เขียนอะไร: TypeScript types + ข้อมูล 12 properties + 3 agents + helper functions
ทำไมต้องเขียนก่อน UI: เพราะทุก component ต้อง import data จากที่นี่
```

**Data Flow:**
```
lib/mock-data.ts
    │
    ├── Server Components อ่านโดยตรง (import)
    │     app/page.tsx             → getFeaturedProperties()
    │     app/listings/[id]/page.tsx → getPropertyById(id)
    │     app/contact/page.tsx     → agents[]
    │
    └── Client Components ←── รับผ่าน URL (searchParams)
          ListingsClient → useSearchParams() → filter logic → render
```

**เทียบ React JS:**
```
React JS:
  1. สร้าง Express.js backend → GET /api/properties
  2. Client: useEffect(() => { fetch('/api/properties') }, [])
  3. ต้อง useState + loading state

Next.js (Server Component):
  1. import { properties } from '@/lib/mock-data'
  → ใช้ได้เลย! ไม่ต้อง fetch, ไม่ต้อง useEffect, ไม่ต้อง loading
```

---

## Phase 3: Layout Shell (ทำงานก่อนทุกหน้า)

### ไฟล์ 5: `app/layout.tsx` — Root Layout

```
เขียนอะไร: HTML shell (Navbar + {children} + Footer) + global metadata
ทำไมสำคัญ: ทุกหน้าถูกครอบด้วย layout นี้อัตโนมัติ
```

**Rendering Flow:**
```
Browser เปิด / (หรือหน้าไหนก็ตาม)
    ↓
Server render app/layout.tsx
    ├── <Navbar />        ← Client Component (มี JS ไปด้วย)
    ├── {children}        ← หน้าที่ match กับ URL
    │     ↓
    │   app/page.tsx      ← Server Component (ไม่ส่ง JS)
    └── <Footer />        ← Server Component (ไม่ส่ง JS)
    ↓
ส่ง HTML สำเร็จรูปไปให้ Browser
    ↓
Browser hydrate เฉพาะ Client Components (Navbar)
```

**เทียบ React JS:**
```
React JS:
  // index.html — ไฟล์เปล่าๆ
  <div id="root"></div>

  // App.tsx — ต้องเขียน router + layout เอง
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
    </Routes>
    <Footer />
  </BrowserRouter>

Next.js:
  // app/layout.tsx — layout ครอบทุกหน้าอัตโนมัติ
  <html>
    <body>
      <Navbar />
      {children}  ← Next.js ใส่หน้าที่ match ให้เอง
      <Footer />
    </body>
  </html>
  // ไม่ต้องเขียน <BrowserRouter> หรือ <Routes>!
```

### ไฟล์ 6: `components/Navbar.tsx` — Client Component

```
เขียนอะไร: Sticky header + navigation links + mobile menu
ทำไมเป็น Client: ใช้ usePathname() + useState (hamburger)
```

**เทียบ React JS:**
```
React JS: useLocation().pathname  (react-router-dom)
Next.js:  usePathname()           (next/navigation)

React JS: <NavLink to="/listings" className={({ isActive }) => ...}>
Next.js:  <Link href="/listings" className={pathname === '/listings' ? '...' : '...'}>
          → ต้อง check active เอง (Link ของ Next.js ไม่มี isActive)
```

### ไฟล์ 7: `components/Footer.tsx` — Server Component

```
เขียนอะไร: Footer links + social links + copyright
ทำไมเป็น Server: ไม่มี hooks, ไม่มี events → static content
ข้อดี: ไม่ส่ง JavaScript ไป browser เลย
```

---

## Phase 4: Shared Components

### ไฟล์ 8: `components/PropertyCard.tsx` — Client Component

```
เขียนอะไร: Card แสดง property (รูป, ราคา, specs, bookmark)
ทำไมเป็น Client: useState สำหรับ bookmark toggle
```

**เทียบ React JS:**
```
React JS: <img src={url} alt="..." />              ← ไม่ optimize
Next.js:  <Image src={url} alt="..." fill sizes="..." /> ← auto resize, WebP, lazy load

React JS: <Link to={`/listings/${id}`}>
Next.js:  <Link href={`/listings/${id}`}>
          → Next.js prefetch ลิงก์ที่เห็นบนหน้าจอล่วงหน้า (เร็วกว่า!)
```

### ไฟล์ 9: `components/SearchBar.tsx` — Client Component

```
เขียนอะไร: Search input + dropdown suggestions + redirect ไปหน้า listings
ทำไมเป็น Client: useRouter() สำหรับ programmatic navigation
```

**เทียบ React JS:**
```
React JS: const navigate = useNavigate()
          navigate(`/listings?location=${query}`)

Next.js:  const router = useRouter()      ← จาก 'next/navigation'
          router.push(`/listings?location=${query}`)

⚠️ Next.js มี useRouter สองตัว!
  - next/navigation → App Router (ใช้ตัวนี้)
  - next/router     → Pages Router (อย่าใช้!)
```

---

## Phase 5: Home Page

### ไฟล์ 10: `app/page.tsx` — Server Component

```
เขียนอะไร: Hero section + SearchBar + Featured Properties + Browse by Location
ทำไมเป็น Server: อ่าน data ตรงจาก lib, ไม่มี hooks
URL: / (หน้าแรก)
```

**Rendering Flow:**
```
User เปิด http://localhost:3000/
    ↓
Next.js match: app/page.tsx (เพราะ path = /)
    ↓
Server render:
  1. import { getFeaturedProperties } from '@/lib/mock-data'
  2. const featured = getFeaturedProperties()  ← เรียกตรง ไม่ต้อง fetch
  3. render JSX → HTML
    ↓
ส่ง HTML ไปให้ Browser (พร้อม content → SEO ดี)
    ↓
Browser hydrate Client Components:
  - <SearchBar />      ← ได้รับ JS เพื่อจัดการ input + redirect
  - <PropertyCard /> x4 ← ได้รับ JS เพื่อจัดการ bookmark toggle
```

---

## Phase 6: Listings Page (Filter)

### ไฟล์ 11: `components/FilterSidebar.tsx` — Client Component

```
เขียนอะไร: Filter controls (location, price, area, type, amenities)
Pattern: Controlled Component — state อยู่ที่ parent (ListingsClient)
```

### ไฟล์ 12: `components/ListingsClient.tsx` — Client Component

```
เขียนอะไร: สมองของหน้า listings — filter + sort + URL sync
Hooks: useSearchParams() + useState + useMemo
```

**URL State Pattern:**
```
SearchBar (หน้าแรก)
    ↓ router.push("/listings?location=Beverly Hills")
    ↓
ListingsClient
    ↓ const searchParams = useSearchParams()
    ↓ const location = searchParams.get('location')
    ↓ → ใช้ location ตั้งค่า filter เริ่มต้น
    ↓
FilterSidebar ← แสดง "Beverly Hills" ใน filter

เทียบ React JS:
  React Router: const [searchParams, setSearchParams] = useSearchParams()
                → ได้ทั้ง getter และ setter

  Next.js:      const searchParams = useSearchParams()
                → ได้แค่ getter (read-only)
                → ถ้าจะเปลี่ยน URL → ใช้ router.push() แทน
```

### ไฟล์ 13: `app/listings/page.tsx` — Server Component

```
เขียนอะไร: Suspense wrapper สำหรับ ListingsClient
ทำไมต้อง Suspense: useSearchParams() ต้องอยู่ใน Suspense boundary
```

**ทำไมต้อง Suspense?**
```
Server ไม่รู้ค่า ?location=... ตอน render (เพราะ query params เป็นของ client)
    ↓
ถ้าไม่มี Suspense → Next.js จะ Error!
    ↓
วิธีแก้: ครอบ Component ที่ใช้ useSearchParams() ด้วย <Suspense>
    ↓
<Suspense fallback={<Loading />}>
  <ListingsClient />    ← ใช้ useSearchParams() ข้างใน
</Suspense>
    ↓
Server ส่ง HTML พร้อม fallback ก่อน → Client hydrate แล้วแทนที่ด้วย content จริง
```

---

## Phase 7: Property Detail Page

### ไฟล์ 14: `components/ImageGallery.tsx` — Client Component

```
เขียนอะไร: Main image + thumbnails + lightbox modal
Hooks: useState (activeIndex, lightboxOpen)
```

### ไฟล์ 15: `app/listings/[id]/page.tsx` — Server Component (async)

```
เขียนอะไร: Property detail — breadcrumb, specs, tabs, agent card, JSON-LD
URL: /listings/prop-001, /listings/prop-002, ...
Concepts: Dynamic Route, SSG, generateMetadata, notFound(), JSON-LD
```

**Dynamic Route Rendering Flow:**
```
User เปิด /listings/prop-001
    ↓
Next.js match: app/listings/[id]/page.tsx
    ↓ id = "prop-001" (จับจาก URL)
    ↓
Server render:
  1. const { id } = await params     ← Next.js 15: params เป็น Promise
  2. const property = getPropertyById(id)
  3. if (!property) notFound()        ← redirect ไป 404
  4. render JSX + JSON-LD → HTML
    ↓
ส่ง HTML ไปให้ Browser
    ↓
Browser hydrate Client Components:
  - <ImageGallery />  ← ได้รับ JS เพื่อจัดการ lightbox
```

**SSG (Static Site Generation):**
```
ตอน npm run build:
  1. Next.js เรียก generateStaticParams()
  2. ได้ [{ id: 'prop-001' }, { id: 'prop-002' }, ...] (12 ids)
  3. Next.js สร้าง HTML 12 ไฟล์ล่วงหน้า:
     .next/server/listings/prop-001.html
     .next/server/listings/prop-002.html
     ...
  4. User เปิดหน้า → ส่ง HTML ที่สร้างไว้แล้ว (เร็วมาก!)

React JS: ไม่มี SSG — render ฝั่ง client ทุกครั้ง
```

---

## Phase 8: Contact Page + React Hook Form

### ไฟล์ 16: `components/ContactForm.tsx` — Client Component

```
เขียนอะไร: Form ติดต่อ agent — ใช้ React Hook Form
Library: react-hook-form (useForm, register, handleSubmit)
```

**React Hook Form vs useState:**
```
❌ ธรรมดา (useState):
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  → 3 state + 3 onChange → re-render ทุกตัวอักษร!

✅ React Hook Form:
  const { register, handleSubmit, formState: { errors } } = useForm()
  <input {...register('name', { required: true })} />
  → state จัดการให้ + validation ในตัว + re-render น้อยลง
```

### ไฟล์ 17: `app/contact/page.tsx` — Server Component

```
เขียนอะไร: Layout (hero, form, office info, agents, FAQ)
Pattern: Server Component ครอบ Client Component (ContactForm)
```

---

## Phase 9: SEO & Error Handling

### ไฟล์ 18: `app/not-found.tsx`

```
เขียนอะไร: Custom 404 page
ทำไมสำคัญ: Next.js เรียกอัตโนมัติเมื่อ URL ไม่ match กับ route ใดๆ
          หรือเมื่อเรียก notFound() ในโค้ด
```

**เทียบ React JS:**
```
React JS: <Route path="*" element={<NotFound />} />
          → ต้องเพิ่ม catch-all route เอง
          → HTTP status ยังเป็น 200 (SPA ส่ง 200 เสมอ)

Next.js:  สร้างไฟล์ app/not-found.tsx → ใช้อัตโนมัติ
          → HTTP status เป็น 404 จริง (สำคัญสำหรับ SEO!)
```

### ไฟล์ 19-20: `app/robots.ts` + `app/sitemap.ts`

```
เขียนอะไร: robots.txt + sitemap.xml สร้างจาก TypeScript
ทำไมสำคัญ: Google Search Console ต้องใช้

React JS: ต้องสร้างเป็นไฟล์ static ใน public/
Next.js:  เขียนเป็น TypeScript function → type-safe + dynamic ได้
```

---

## Phase 10: API Route (Unsplash)

### ไฟล์ 21: `.env.local`

```
เขียนอะไร: UNSPLASH_ACCESS_KEY=xxx
ทำไมต้อง .env.local: Next.js gitignore ให้อัตโนมัติ → key ไม่หลุดไป GitHub
```

**ความปลอดภัยของ Environment Variables:**
```
⚠️ React JS:
  REACT_APP_API_KEY=xxx ใน .env
  → ถูก bundle ไปใน client code
  → เปิด browser DevTools → เห็น key!
  → ไม่ปลอดภัย!

✅ Next.js:
  UNSPLASH_ACCESS_KEY=xxx ใน .env.local
  → ใช้ได้เฉพาะใน Server Component / API Route
  → browser ไม่เห็น key
  → ปลอดภัย!

  ถ้าอยากให้ client เห็น → ต้องใส่ prefix: NEXT_PUBLIC_xxx
  (แต่ไม่ควรทำกับ API key!)
```

### ไฟล์ 22: `app/api/images/route.ts`

```
เขียนอะไร: API endpoint สำหรับดึงรูปจาก Unsplash
URL: GET /api/images?query=luxury+house&page=1
```

**API Route Rendering Flow:**
```
Client Component
    ↓ fetch('/api/images?query=villa')
    ↓
Next.js match: app/api/images/route.ts
    ↓ (ทำงานบน Server เท่านั้น!)
    ↓
export async function GET(request) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY  ← ปลอดภัย!
  const res = await fetch('https://api.unsplash.com/...', {
    headers: { Authorization: `Client-ID ${accessKey}` },
    next: { revalidate: 3600 }  ← cache 1 ชั่วโมง (Next.js exclusive!)
  })
  return NextResponse.json(data)
}
    ↓
Client ได้รับ JSON กลับมา (ไม่เห็น API key)
```

**เทียบ React JS:**
```
React JS:
  1. ต้องสร้าง backend แยก (Express.js / Flask)
  2. Client fetch จาก Express → Express fetch จาก Unsplash
  3. ต้อง deploy 2 services (frontend + backend)

Next.js:
  1. สร้างไฟล์ app/api/images/route.ts
  2. Client fetch จาก /api/images → route.ts fetch จาก Unsplash
  3. Deploy ตัวเดียว (frontend + API อยู่ด้วยกัน)
```

---

## 🗺️ Routing Deep Dive

### File-based Routing (โฟลเดอร์ = URL)

```
โครงสร้างโฟลเดอร์                      URL ที่ได้
──────────────────────                  ──────────
app/page.tsx                           /
app/listings/page.tsx                  /listings
app/listings/[id]/page.tsx             /listings/:id    (dynamic)
app/contact/page.tsx                   /contact
app/api/images/route.ts                /api/images      (API only)
app/not-found.tsx                      (auto 404)
app/robots.ts                         /robots.txt      (auto)
app/sitemap.ts                        /sitemap.xml     (auto)
```

### เทียบกับ React JS:
```
React JS (react-router-dom):
──────────────────────────
// ต้องเขียน route config เอง:
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/listings" element={<Listings />} />
    <Route path="/listings/:id" element={<PropertyDetail />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

Next.js:
──────────────────────────
// ไม่ต้องเขียน route config!
// แค่สร้างไฟล์ในโฟลเดอร์ → URL สร้างอัตโนมัติ
// layout.tsx ครอบ {children} → แทน <BrowserRouter>
```

### Special Files ใน App Router

```
ชื่อไฟล์             หน้าที่
──────────           ──────────────────────────────
page.tsx             หน้าเว็บ (UI ที่ user เห็น)
layout.tsx           โครงร่างที่ครอบ children (persistent)
route.ts             API endpoint (ไม่มี UI)
not-found.tsx        404 page
loading.tsx          Loading UI (auto Suspense boundary)
error.tsx            Error boundary (catch runtime errors)
template.tsx         เหมือน layout แต่ re-mount ทุกครั้ง
```

### Dynamic Route: `[id]` คืออะไร?

```
Folder: app/listings/[id]/page.tsx
                      ^^^
                      bracket = dynamic segment

URL: /listings/prop-001
               ^^^^^^^^
               id = "prop-001"

URL: /listings/prop-012
               ^^^^^^^^
               id = "prop-012"

→ Next.js จับค่าจาก URL ใส่ใน params.id ให้อัตโนมัติ

เทียบ React JS:
  <Route path="/listings/:id" element={<Detail />} />
  const { id } = useParams()  ← React Router

  Next.js 15+:
  const { id } = await params  ← Server Component (params เป็น Promise)
```

### URL Search Params Flow (เส้นทางจาก Search → Filter)

```
Step 1: User พิมพ์ "Beverly Hills" ใน SearchBar (หน้าแรก)
    ↓
Step 2: SearchBar เรียก router.push("/listings?location=Beverly+Hills")
    ↓
Step 3: Browser navigate ไป /listings?location=Beverly+Hills
    ↓
Step 4: Next.js match app/listings/page.tsx
    ↓
Step 5: Server render <Suspense> → ส่ง loading UI ก่อน
    ↓
Step 6: Client hydrate ListingsClient
    ↓
Step 7: ListingsClient เรียก useSearchParams()
        → searchParams.get('location') = "Beverly Hills"
    ↓
Step 8: ตั้งค่า filter เริ่มต้น: { location: "Beverly Hills" }
    ↓
Step 9: FilterSidebar แสดง "Beverly Hills" ในช่อง location
    ↓
Step 10: useMemo filter properties ตาม filter → แสดง cards ที่ match
```

---

## 🖥️ Rendering Deep Dive (Server vs Client)

### Server Component (default — ไม่ต้องเขียนอะไรเพิ่ม)

```typescript
// ไม่มี 'use client' → Server Component อัตโนมัติ
// ✅ ทำได้: import data, async/await, access filesystem, env vars
// ❌ ทำไม่ได้: useState, useEffect, onClick, useRouter

import { properties } from '@/lib/mock-data'

export default function Page() {
  // data พร้อมใช้เลย — ไม่ต้อง fetch!
  return <div>{properties.length} properties</div>
}

// → HTML ถูก render บน server
// → ส่ง HTML สำเร็จรูปไปให้ browser
// → ไม่ส่ง JavaScript ไป browser เลย!
```

### Client Component (ต้องเขียน 'use client')

```typescript
'use client'  // ← บรรทัดแรก!

import { useState } from 'react'

export default function BookmarkButton() {
  // ✅ ทำได้: useState, useEffect, onClick, useRouter
  // ❌ ทำไม่ได้: async component, access env vars (server-only)
  const [saved, setSaved] = useState(false)

  return (
    <button onClick={() => setSaved(!saved)}>
      {saved ? '❤️' : '🤍'}
    </button>
  )
}

// → ส่ง JavaScript ไป browser เพื่อจัดการ interactivity
// → เหมือน React JS ปกติ ทุกประการ
```

### ตารางเปรียบเทียบ Server vs Client

```
                          Server Component      Client Component
────────────────         ────────────────       ────────────────
ประกาศ                    ไม่ต้องเขียนอะไร       'use client' บรรทัดแรก
useState/useEffect        ❌ ใช้ไม่ได้           ✅ ใช้ได้
onClick/onChange          ❌ ใช้ไม่ได้           ✅ ใช้ได้
async/await               ✅ เป็น async ได้      ❌ ไม่ได้
import data ตรง           ✅ ได้เลย             ❌ ต้อง fetch
process.env               ✅ ปลอดภัย            ❌ ต้องใช้ NEXT_PUBLIC_
ส่ง JS ไป browser         ❌ ไม่ส่ง             ✅ ส่ง
SEO                       ✅ ดีมาก              ⚠️ ต้อง SSR ก่อน
```

### การ Render แต่ละหน้าในโปรเจกต์นี้

```
หน้า                          Server  Client     เหตุผล
────────────────────          ──────  ──────     ──────────────────
app/layout.tsx                ✅               static shell
  └─ Navbar.tsx                       ✅       usePathname, useState
  └─ Footer.tsx               ✅               static content

app/page.tsx (/)              ✅               import data ตรง
  └─ SearchBar                        ✅       useRouter, useState
  └─ PropertyCard x4                  ✅       useState (bookmark)

app/listings/page.tsx         ✅               Suspense wrapper
  └─ ListingsClient                   ✅       useSearchParams, useState
    └─ FilterSidebar                  ✅       controlled component
    └─ PropertyCard x12               ✅       useState (bookmark)

app/listings/[id]/page.tsx    ✅               await params, async
  └─ ImageGallery                     ✅       useState (lightbox)

app/contact/page.tsx          ✅               static + data import
  └─ ContactForm                      ✅       useForm (react-hook-form)

app/not-found.tsx             ✅               static content
app/api/images/route.ts       ✅               API (server only)
```

### Hydration คืออะไร?

```
1. Server render HTML (ทั้ง Server + Client Components)
   → ส่ง HTML เต็มๆ ไปให้ browser (SEO ดี!)

2. Browser แสดง HTML ทันที (เร็ว! เห็นเนื้อหาตั้งแต่ยังไม่โหลด JS)

3. Browser โหลด JavaScript ของ Client Components

4. React "hydrate" — ผูก event handlers เข้ากับ HTML ที่มีอยู่
   เช่น: ปุ่ม bookmark ← ผูก onClick
         SearchBar    ← ผูก onChange, onSubmit
         Navbar menu  ← ผูก onClick (hamburger)

5. ตอนนี้หน้าเว็บ interactive ได้แล้ว!

React JS (SPA):
  1. ส่ง HTML เปล่า (<div id="root"></div>)
  2. โหลด JS bundle ใหญ่ๆ
  3. React render ทุกอย่างฝั่ง client
  4. ช้ากว่า + SEO ไม่ดี (HTML เปล่า)
```

---

## 🌐 API & Networking Deep Dive

### 3 วิธีดึงข้อมูลใน Next.js

```
วิธี 1: Direct Import (โปรเจกต์นี้ใช้หลัก)
──────────────────────────────────────────
// Server Component — import data ตรงจาก lib
import { properties } from '@/lib/mock-data'

export default function Page() {
  return <div>{properties.length}</div>
}
// → ไม่ต้อง fetch, ไม่ต้อง API, ไม่ต้อง loading state
// → เหมาะกับ: mock data, static content, data จาก filesystem


วิธี 2: Server-side fetch (สำหรับ external API)
──────────────────────────────────────────
// Server Component — fetch บน server
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }  // ← cache 1 ชั่วโมง (Next.js exclusive!)
  })
  const data = await res.json()
  return <div>{data.length}</div>
}
// → fetch ทำงานบน server → API key ปลอดภัย
// → ส่ง HTML พร้อม data ไป browser
// → React JS ทำแบบนี้ไม่ได้ (ต้อง useEffect)


วิธี 3: API Route + Client fetch (โปรเจกต์นี้ใช้กับ Unsplash)
──────────────────────────────────────────
// Step 1: สร้าง API Route (server-only)
// app/api/images/route.ts
export async function GET(request: NextRequest) {
  const key = process.env.UNSPLASH_ACCESS_KEY  // ← ปลอดภัย!
  const res = await fetch('https://api.unsplash.com/...', {
    headers: { Authorization: `Client-ID ${key}` }
  })
  return NextResponse.json(await res.json())
}

// Step 2: Client Component fetch จาก API Route
// components/SomeClient.tsx
'use client'
const [images, setImages] = useState([])
useEffect(() => {
  fetch('/api/images?query=house')  // ← เรียก API Route ของเรา
    .then(res => res.json())
    .then(data => setImages(data.images))
}, [])
// → Client ไม่เห็น API key
// → API Route ทำหน้าที่เป็น proxy กลาง
```

### fetch ใน Next.js vs React JS

```
                    Next.js (Server)         React JS (Client)
────────────       ──────────────────       ──────────────────
ทำงานที่            Server                   Browser
API key             ปลอดภัย (env)            ไม่ปลอดภัย
Caching             next: { revalidate }     ต้อง setup เอง (react-query)
Result              HTML พร้อม data          ต้อง loading state
SEO                 ดี (content ใน HTML)     ไม่ดี (content มาทีหลัง)
CORS                ไม่มีปัญหา              อาจมีปัญหา
```

### API Route vs Express.js

```
Next.js API Route:
─────────────────
// app/api/images/route.ts
export async function GET(req: NextRequest) { ... }
export async function POST(req: NextRequest) { ... }

// → URL: /api/images
// → อยู่ในโปรเจกต์เดียวกับ frontend
// → deploy ตัวเดียว

Express.js (React JS ต้องใช้):
─────────────────────────────
// server.js (แยกโปรเจกต์)
app.get('/api/images', (req, res) => { ... })
app.post('/api/images', (req, res) => { ... })

// → ต้อง setup CORS
// → deploy แยก 2 services
// → จัดการ port ต่างกัน
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        lib/mock-data.ts                             │
│  (12 Properties + 3 Agents + Helper Functions)                      │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐            │
│  │ properties[] │  │ agents[]   │  │ getFeaturedProp() │            │
│  │ (all 12)     │  │ (all 3)   │  │ getPropertyById() │            │
│  └──────┬───────┘  └─────┬──────┘  └────────┬─────────┘            │
└─────────┼────────────────┼──────────────────┼──────────────────────┘
          │                │                  │
          │  Direct Import (Server Components)│
          │                │                  │
    ┌─────▼──────┐   ┌────▼─────┐   ┌────────▼──────────┐
    │ page.tsx   │   │ contact/ │   │ listings/[id]/     │
    │ (Home)     │   │ page.tsx │   │ page.tsx (Detail)  │
    │            │   │          │   │                    │
    │ Featured   │   │ Agents   │   │ await params → id  │
    │ Props x4   │   │ Cards x3 │   │ getPropertyById()  │
    └────────────┘   └──────────┘   └────────────────────┘
          │
    ┌─────▼──────────────────────────────────────────┐
    │              URL State (searchParams)           │
    │                                                  │
    │  SearchBar → router.push("/listings?location=X") │
    │       ↓                                          │
    │  ListingsClient → useSearchParams()              │
    │       ↓                                          │
    │  Filter properties[] → show matching cards       │
    └──────────────────────────────────────────────────┘
          │
    ┌─────▼────────────────────────────────────┐
    │         API Route (External Data)         │
    │                                           │
    │  Client → /api/images?query=villa         │
    │       ↓                                   │
    │  route.ts (Server) → Unsplash API         │
    │       ↓                                   │
    │  Response (images[]) → Client             │
    │                                           │
    │  API Key อยู่บน Server → ปลอดภัย          │
    └───────────────────────────────────────────┘
```

---

## 📝 React JS vs Next.js Cheat Sheet

| หัวข้อ | React JS | Next.js |
|--------|----------|---------|
| **สร้างโปรเจกต์** | `npm create vite@latest` | `npx create-next-app@latest` |
| **Bundler** | Vite / Webpack | Turbopack (built-in) |
| **Routing** | react-router-dom (ต้องลง) | File-based (ในตัว) |
| **Route config** | `<Route path="/x">` ใน App.tsx | สร้างโฟลเดอร์ `app/x/page.tsx` |
| **Dynamic route** | `<Route path="/x/:id">` | โฟลเดอร์ `[id]` |
| **อ่าน params** | `useParams()` | `await params` (Server) |
| **Navigate** | `useNavigate()` → `navigate('/x')` | `useRouter()` → `router.push('/x')` |
| **Active link** | `<NavLink isActive>` | ต้อง check `pathname` เอง |
| **Link prop** | `<Link to="/x">` | `<Link href="/x">` |
| **Data fetching** | `useEffect` + `fetch` + `useState` | import ตรง (Server Component) |
| **Loading state** | ต้องเขียนเอง | Suspense / loading.tsx |
| **Image** | `<img>` (no optimize) | `<Image>` (auto optimize) |
| **SEO** | react-helmet (client-side) | Metadata API (server-side) |
| **404 page** | `<Route path="*">` | `not-found.tsx` (auto) |
| **HTTP 404 status** | ส่ง 200 เสมอ (SPA) | ส่ง 404 จริง |
| **robots.txt** | static file ใน public/ | TypeScript function |
| **sitemap.xml** | ต้องสร้างเอง | TypeScript function |
| **API endpoint** | ต้องสร้าง Express แยก | `app/api/x/route.ts` |
| **Env vars** | `REACT_APP_xxx` (ไม่ปลอดภัย) | `process.env.xxx` (server only) |
| **Component type** | Client เสมอ | Server (default) / Client |
| **SSG** | ไม่มี | `generateStaticParams()` |
| **Form** | useState หรือ react-hook-form | เหมือนกัน (Client Component) |

---

## 🚀 Quick Start (สำหรับคนที่ clone project มา)

```bash
# 1. Clone project
git clone <repo-url>
cd aum-estate-studio

# 2. Install dependencies
npm install

# 3. สร้าง .env.local (API key สำหรับ Unsplash)
echo "UNSPLASH_ACCESS_KEY=your_key_here" > .env.local

# 4. รัน dev server
npm run dev

# 5. เปิด browser
# → http://localhost:3000                  (Home)
# → http://localhost:3000/listings         (Listings + Filter)
# → http://localhost:3000/listings/prop-001 (Property Detail)
# → http://localhost:3000/contact          (Contact + React Hook Form)
# → http://localhost:3000/api/images?query=villa (API Route)
# → http://localhost:3000/xyz              (404 page)
```

---

## 📖 ลำดับการอ่านโค้ดเพื่อเรียนรู้

ถ้าอ่านโค้ดเพื่อเรียนรู้ (ไม่ใช่เขียนตาม) แนะนำอ่านตามลำดับนี้:

```
1. app/layout.tsx          ← เข้าใจ Root Layout (จุดเริ่มต้นทุกหน้า)
2. app/page.tsx            ← เข้าใจ Server Component + data import
3. components/Navbar.tsx   ← เข้าใจ Client Component + usePathname
4. app/listings/page.tsx   ← เข้าใจ Suspense + useSearchParams
5. components/ListingsClient.tsx ← เข้าใจ URL state + filter logic
6. app/listings/[id]/page.tsx    ← เข้าใจ Dynamic Route + SSG + await params
7. app/api/images/route.ts       ← เข้าใจ API Route + env vars + security
8. components/ContactForm.tsx    ← เข้าใจ React Hook Form
9. app/sitemap.ts          ← เข้าใจ SEO automation
```

> **ทุกไฟล์มี comment ภาษาไทยอธิบายทุกบรรทัด + เปรียบเทียบกับ React JS**
> **อ่านจาก comment ใน source code ได้เลย!**
