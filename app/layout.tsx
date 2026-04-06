// =============================================================================
// 📁 app/layout.tsx — Root Layout (โครงสร้างหลักของทั้งเว็บไซต์)
// =============================================================================
//
// 🔑 React JS vs Next.js App Router — Layout:
// ─────────────────────────────────────────────
// React JS (แบบเดิม):
//   - ใช้ BrowserRouter + Routes ครอบทุกหน้า
//   - ต้องสร้าง Layout component เอง แล้ว wrap ใน App.tsx:
//     <BrowserRouter>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         ...
//       </Routes>
//       <Footer />
//     </BrowserRouter>
//   - ไม่มี metadata API — ต้องใช้ react-helmet หรือ document.title เอง
//   - <html> และ <body> อยู่ใน index.html (public/index.html) ไม่ได้อยู่ใน component
//
// Next.js App Router:
//   - app/layout.tsx = Root Layout อัตโนมัติ ครอบ **ทุกหน้า** ใน app/
//   - ไม่ต้องเขียน Router — folder structure = URL โดยอัตโนมัติ
//   - export metadata = ได้ <title>, <meta>, Open Graph, Twitter Card ครบ
//   - <html> + <body> ต้องอยู่ใน layout.tsx (ไม่ใช่ index.html)
//   - เป็น Server Component — render บน server ก่อนส่งให้ browser
//
// 🔑 ไฟล์นี้ทำหน้าที่:
//   1. กำหนด <html> + <body> tags (จำเป็นต้องมีใน Root Layout)
//   2. โหลด Google Font (Inter) ผ่าน next/font (optimized, no layout shift)
//   3. export metadata สำหรับ SEO ทั้งเว็บ (title, description, OG, Twitter)
//   4. Wrap ทุกหน้าด้วย Navbar + Footer (เหมือน "shell" ของเว็บ)
//   5. {children} = เนื้อหาของแต่ละหน้าที่เปลี่ยนตาม URL
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================
import type { Metadata } from 'next';
// Metadata type จาก Next.js — ใช้กำหนด type ของ metadata object
// 🔑 React JS: ไม่มี type นี้ ต้องใช้ react-helmet: <Helmet><title>...</title></Helmet>

import { Inter } from 'next/font/google';
// 🔑 next/font/google = ระบบโหลด Google Font ของ Next.js
// ข้อดี:
//   - Font ถูก download ตอน build แล้วเก็บไว้ใน server (self-hosted)
//   - ไม่ต้อง request ไปหา Google ตอน user เข้าเว็บ = เร็วกว่า
//   - ใส่ font-display: swap ให้อัตโนมัติ = ไม่เกิด layout shift
// 🔑 React JS: ต้องใส่ <link> ใน index.html หรือ import ใน CSS เอง
//   เช่น: @import url('https://fonts.googleapis.com/css2?family=Inter...')

import './globals.css';
// Import Tailwind CSS + custom styles
// 🔑 ทั้ง React JS และ Next.js ใช้วิธีเดียวกัน แต่ใน Next.js จะ import ที่ layout.tsx
//   ส่วน React JS จะ import ที่ index.tsx หรือ App.tsx

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// @/ = alias ชี้ไปที่ root ของโปรเจกต์ (ตั้งค่าใน tsconfig.json)
// 🔑 React JS: ปกติใช้ relative path เช่น '../components/Navbar'
//   หรือตั้ง alias เองใน webpack/vite config

// =============================================================================
// 🔤 Google Font Configuration — โหลด Inter font
// =============================================================================
const inter = Inter({
  subsets: ['latin'],        // โหลดเฉพาะ latin characters (เบากว่าโหลดทั้งหมด)
  variable: '--font-inter',  // สร้าง CSS variable: --font-inter ไว้ใช้ใน CSS/Tailwind
  display: 'swap',           // font-display: swap — แสดง fallback font ก่อน แล้วค่อยเปลี่ยน
});
// 🔑 React JS: ต้อง setup เอง — ใส่ <link> ใน HTML แล้วเขียน CSS:
//   font-family: 'Inter', sans-serif;
// Next.js: แค่ใส่ className={inter.variable} บน <html> แล้วใช้ได้เลย

// =============================================================================
// 🏷️ Metadata — SEO สำหรับทั้งเว็บไซต์
// =============================================================================
// 🔑 นี่คือความแตกต่างใหญ่ระหว่าง React JS กับ Next.js:
//
// React JS (แบบเดิม):
//   - ต้องใช้ react-helmet ในทุกหน้า:
//     <Helmet>
//       <title>AumEstate Studio</title>
//       <meta name="description" content="..." />
//       <meta property="og:title" content="..." />
//     </Helmet>
//   - หรือ document.title = '...' ใน useEffect
//   - ต้อง install package เพิ่ม (react-helmet-async)
//
// Next.js:
//   - แค่ export const metadata = { ... } จาก Server Component
//   - Next.js จะ generate <head> tags ให้อัตโนมัติ
//   - ไม่ต้อง install อะไรเพิ่ม — built-in
//   - metadata ใน layout.tsx = ค่า default สำหรับทุกหน้า
//   - แต่ละหน้าสามารถ override ด้วย metadata ของตัวเอง
// =============================================================================
export const metadata: Metadata = {
  // metadataBase = URL หลักของเว็บ ใช้เป็น base สำหรับ relative URL ใน OG images
  metadataBase: new URL('https://www.aumestatestudio.com'),

  // title object — กำหนด title ของหน้าเว็บ
  title: {
    default: 'AumEstate Studio — Find Your Dream Home',  // title เมื่อไม่มีหน้าไหน override
    template: '%s | AumEstate Studio',  // template สำหรับหน้าอื่น: "Listings | AumEstate Studio"
    // 🔑 React JS: ต้องเขียน template เอง เช่น `${pageTitle} | AumEstate Studio`
  },

  // description — แสดงในผลค้นหา Google ใต้ title
  description:
    'Discover premium properties for rent and sale. Browse houses, villas, apartments, and condos with AumEstate Studio — your trusted real estate partner in California.',

  // keywords — คำค้นหาที่เกี่ยวข้อง (Google ไม่ค่อยใช้แล้ว แต่ search engines อื่นยังใช้)
  keywords: ['real estate', 'homes for rent', 'luxury properties', 'California homes', 'buy house', 'property listings'],

  authors: [{ name: 'AumEstate Studio' }],  // ผู้เขียน/เจ้าของเว็บ
  creator: 'AumEstate Studio',               // ผู้สร้างเว็บ

  // ---------------------------------------------------------------------------
  // Open Graph — ข้อมูลที่แสดงเมื่อ share ลิงก์ใน Facebook, LINE, Discord ฯลฯ
  // ---------------------------------------------------------------------------
  // 🔑 React JS: ต้องใส่ <meta property="og:*"> ทุกตัวเองผ่าน react-helmet
  openGraph: {
    type: 'website',                                    // ประเภทเนื้อหา
    locale: 'en_US',                                    // ภาษา
    url: 'https://www.aumestatestudio.com',             // URL ของเว็บ
    siteName: 'AumEstate Studio',                       // ชื่อเว็บ
    title: 'AumEstate Studio — Find Your Dream Home',   // title ที่แสดงตอน share
    description:                                         // description ที่แสดงตอน share
      'Discover premium properties for rent and sale across California. Luxury villas, modern apartments, family homes, and more.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
        width: 1200,    // ขนาดรูปที่ Facebook แนะนำ = 1200x630
        height: 630,
        alt: 'AumEstate Studio — Luxury Real Estate',  // alt text สำหรับ accessibility
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Twitter Card — ข้อมูลที่แสดงเมื่อ share ลิงก์ใน Twitter/X
  // ---------------------------------------------------------------------------
  twitter: {
    card: 'summary_large_image',  // แสดงรูปใหญ่ (แทน summary ที่รูปเล็ก)
    title: 'AumEstate Studio — Find Your Dream Home',
    description: 'Discover premium properties for rent and sale across California.',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80'],
  },

  // ---------------------------------------------------------------------------
  // Robots — บอก search engine ว่าให้ index หน้านี้ไหม
  // ---------------------------------------------------------------------------
  // 🔑 ใน Next.js ยังมี app/robots.ts แยกอีกไฟล์สำหรับ robots.txt ด้วย
  robots: {
    index: true,      // ให้ Google index หน้านี้
    follow: true,     // ให้ Google ตาม link ในหน้านี้ไปหน้าอื่น
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,      // -1 = ไม่จำกัดขนาด video preview
      'max-image-preview': 'large',  // ให้ Google แสดงรูป preview ขนาดใหญ่
      'max-snippet': -1,             // -1 = ไม่จำกัดความยาว text snippet
    },
  },
};

// =============================================================================
// 🏗️ Root Layout Component — โครงสร้างหลักที่ครอบทุกหน้า
// =============================================================================
// 🔑 ความแตกต่างสำคัญ:
//
// React JS:
//   function App() {
//     return (
//       <BrowserRouter>        ← ต้องมี Router
//         <Navbar />
//         <Routes>             ← ต้อง define routes ด้วยมือ
//           <Route path="/" element={<Home />} />
//           <Route path="/listings" element={<Listings />} />
//           <Route path="/listings/:id" element={<Detail />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//         <Footer />
//       </BrowserRouter>
//     );
//   }
//   // <html> + <body> อยู่ใน public/index.html ไม่ได้อยู่ใน component
//
// Next.js App Router:
//   - layout.tsx = shell ที่ครอบทุกหน้า
//   - {children} = หน้าที่ตรงกับ URL จะถูกใส่ตรงนี้โดยอัตโนมัติ
//   - ไม่ต้องเขียน Routes — folder structure เป็น routes เอง
//   - <html> + <body> ต้องอยู่ใน Root Layout (บังคับ)
//   - เป็น Server Component — render บน server (ไม่ส่ง JS ไป client)
// =============================================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;  // children = เนื้อหาของหน้าปัจจุบัน (page.tsx)
}) {
  return (
    // 🔑 <html> ต้องอยู่ใน Root Layout ของ Next.js (ไม่มีใน React JS component)
    // className={inter.variable} = ใส่ CSS variable --font-inter ให้ใช้ได้ทั้งเว็บ
    <html lang="en" className={inter.variable}>
      {/* 🔑 <body> ต้องอยู่ใน Root Layout เช่นกัน */}
      {/* min-h-screen = ความสูงขั้นต่ำเต็มจอ */}
      {/* flex flex-col = จัด layout แนวตั้ง (Navbar → content → Footer) */}
      {/* font-sans = ใช้ font-family ที่ตั้งไว้ใน Tailwind v4 (globals.css) */}
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans">
        {/* Navbar — แสดงทุกหน้า (Client Component เพราะมี hamburger menu + usePathname) */}
        <Navbar />

        {/* main flex-1 = ขยายเต็มพื้นที่ว่าง ดัน Footer ลงล่างสุด */}
        {/* {children} = หน้าที่ตรงกับ URL ปัจจุบัน */}
        {/* 🔑 React JS: ตรงนี้จะเป็น <Routes>...</Routes> แทน */}
        <main className="flex-1">{children}</main>

        {/* Footer — แสดงทุกหน้า (Server Component เพราะเป็น static content) */}
        <Footer />
      </body>
    </html>
  );
}
