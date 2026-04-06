// =============================================================================
// 📁 app/not-found.tsx — 404 Page Not Found (หน้าแสดงเมื่อไม่พบ URL)
// =============================================================================
//
// 🔑 React JS vs Next.js — 404 Handling:
// ─────────────────────────────────────────────
// React JS (แบบเดิม):
//   - ต้องสร้าง Route สำหรับ 404 เอง:
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/about" element={<About />} />
//       <Route path="*" element={<NotFound />} />   ← ต้อง catch-all เอง
//     </Routes>
//   - ถ้าลืมใส่ path="*" → user จะเห็นหน้าว่างเปล่า
//   - SPA (Single Page App) ส่ง HTTP 200 ทุกครั้ง แม้เป็น 404
//     → Google อาจ index หน้าเปล่าๆ ได้ (ไม่ดีสำหรับ SEO)
//
// Next.js App Router:
//   - แค่สร้างไฟล์ app/not-found.tsx → Next.js จัดการให้อัตโนมัติ
//   - ส่ง HTTP status 404 จริงๆ → search engine รู้ว่าหน้านี้ไม่มี (ดีต่อ SEO)
//   - ถูกเรียกเมื่อ:
//     1. URL ไม่ตรงกับ route ใดเลย (อัตโนมัติ)
//     2. เรียก notFound() function ในโค้ด (เช่น ไม่เจอ property ตาม id)
//   - ไม่ต้องเขียน catch-all route — Next.js ทำให้เอง
//   - metadata ก็ export ได้เหมือนหน้าอื่นๆ
//
// 🔑 ไฟล์นี้ทำหน้าที่:
//   1. แสดง UI สวยๆ เมื่อเกิด 404
//   2. ให้ลิงก์กลับหน้าแรก + หน้า listings
//   3. export metadata สำหรับ SEO (title, description)
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================
import Link from 'next/link';
// 🔑 Next.js Link vs React JS:
//   React JS: import { Link } from 'react-router-dom'  ← ต้อง install react-router-dom
//   Next.js:  import Link from 'next/link'              ← built-in, มี prefetching อัตโนมัติ
// Next.js Link จะ prefetch หน้าที่ลิงก์ไปล่วงหน้า → เปลี่ยนหน้าเร็วมาก

import type { Metadata } from 'next';
// Type สำหรับ metadata object — ใช้กำหนด title, description สำหรับหน้า 404

// =============================================================================
// 🏷️ Metadata — SEO สำหรับหน้า 404
// =============================================================================
// 🔑 React JS: หน้า 404 มักไม่มี metadata เพราะ SPA ส่ง 200 เสมอ
//   ถ้าจะใส่ต้องใช้: <Helmet><title>404 — Page Not Found</title></Helmet>
// Next.js: export metadata ได้เลย + ส่ง HTTP 404 status จริง
export const metadata: Metadata = {
  title: '404 — Page Not Found',                              // แสดงบน tab browser
  description: 'The page you are looking for could not be found.',  // สำหรับ search engines
};

// =============================================================================
// 🏗️ NotFound Component — หน้า 404
// =============================================================================
// 🔑 นี่เป็น Server Component (ไม่มี 'use client')
//   เพราะเป็น static content — ไม่มี state, ไม่มี event handler (นอกจาก Link)
//   React JS: ทุก component เป็น client อยู่แล้ว ไม่ต้องคิดเรื่องนี้
export default function NotFound() {
  return (
    // min-h-[60vh] = ความสูงขั้นต่ำ 60% ของ viewport → content อยู่กลางจอ
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* ================================================================= */}
      {/* 🏠 Icon — รูปบ้านแสดงว่าเป็นเว็บ real estate                     */}
      {/* ================================================================= */}
      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"  // ซ่อนจาก screen reader เพราะเป็น decorative icon
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>

      {/* ================================================================= */}
      {/* 📝 Error Message                                                  */}
      {/* ================================================================= */}
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get
        you back on track.
      </p>

      {/* ================================================================= */}
      {/* 🔗 Navigation Links — ปุ่มกลับหน้าแรก + ดู listings              */}
      {/* ================================================================= */}
      {/* 🔑 React JS: <Link to="/"> (ใช้ prop "to")
           Next.js:  <Link href="/"> (ใช้ prop "href" เหมือน <a> tag)    */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/listings"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    </section>
  );
}
