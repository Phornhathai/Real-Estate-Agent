// =============================================================================
// 📁 app/listings/page.tsx — Listings Page (หน้ารวม property ทั้งหมด)
// =============================================================================
//
// 🔑 React JS vs Next.js — Suspense + useSearchParams:
// ─────────────────────────────────────────────────────────
// React JS (แบบเดิม):
//   - ใช้ useSearchParams() ได้ตรงๆ ไม่ต้อง Suspense:
//     function ListingsPage() {
//       const [searchParams] = useSearchParams();  // จาก react-router-dom
//       const location = searchParams.get('location');
//       return <div>...</div>;
//     }
//   - ทุกอย่าง render ฝั่ง client — ไม่มีปัญหา server/client boundary
//
// Next.js App Router:
//   - useSearchParams() ต้องอยู่ใน Client Component ('use client')
//   - Client Component ที่ใช้ useSearchParams() **ต้อง** ถูก wrap ด้วย <Suspense>
//   - เหตุผล: Next.js pre-render หน้านี้บน server → แต่ search params (เช่น ?location=Malibu)
//     ยังไม่รู้ตอน server render → ต้องมี fallback แสดงก่อน
//   - ถ้าไม่ใส่ Suspense → build จะ error หรือ warning
//
// 🔑 ไฟล์นี้ทำหน้าที่:
//   1. เป็น Server Component (ไม่มี 'use client') — ทำหน้าที่ "wrapper" เท่านั้น
//   2. export metadata สำหรับ SEO ของหน้า /listings
//   3. ครอบ ListingsClient ด้วย <Suspense> boundary
//   4. ListingsClient (Client Component) จัดการ filter, sort, display ทั้งหมด
//
// 🔑 ทำไมแยกเป็น 2 ไฟล์ (page.tsx + ListingsClient.tsx)?
//   - page.tsx = Server Component → export metadata ได้, render เร็ว
//   - ListingsClient = Client Component → ใช้ useSearchParams, useState, filter logic
//   - ใน React JS ไม่ต้องแยก เพราะไม่มี server/client boundary
//
// 🔑 Flow การทำงาน:
//   User เปิด /listings?location=Malibu
//   → Next.js render page.tsx บน server
//   → เจอ <Suspense> → แสดง fallback (loading spinner) ก่อน
//   → ListingsClient โหลดบน client → อ่าน ?location=Malibu → แสดง filtered results
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================
import type { Metadata } from 'next';
// Type สำหรับ metadata — ใช้กำหนด title, description ของหน้านี้
// 🔑 React JS: ใช้ react-helmet แทน: <Helmet><title>...</title></Helmet>

import { Suspense } from 'react';
// Suspense = React component สำหรับแสดง fallback ระหว่างรอ async operation
// 🔑 React JS: Suspense มีใน React เหมือนกัน แต่มักใช้กับ React.lazy()
//   ใน Next.js จำเป็นต้องใช้เมื่อ Client Component ใช้ useSearchParams()
//   เพราะ search params ยังไม่รู้ตอน server render

import ListingsClient from '@/components/ListingsClient';
// Client Component ที่จัดการทุกอย่างของหน้า listings:
//   - อ่าน URL search params (?location=, ?type=, ?sort=)
//   - แสดง FilterSidebar + PropertyCard grid
//   - จัดการ filter + sort logic
// 🔑 แยกเป็น component เพราะใช้ hooks (useSearchParams, useState)
//   ซึ่งต้องเป็น Client Component — ไม่ใส่ใน page.tsx ที่เป็น Server Component

// =============================================================================
// 🏷️ Metadata — SEO สำหรับหน้า /listings
// =============================================================================
// 🔑 metadata นี้จะถูก merge กับ metadata ใน layout.tsx:
//   - title: "Property Listings..." จะถูกใส่ใน template: "%s | AumEstate Studio"
//   → ผลลัพธ์: "Property Listings — Browse Homes, Villas & Apartments | AumEstate Studio"
//
// React JS: ต้องใช้ react-helmet ในทุกหน้า หรือ useEffect(() => { document.title = '...' })
export const metadata: Metadata = {
  title: 'Property Listings — Browse Homes, Villas & Apartments',
  description:
    'Explore our full collection of properties available for rent and sale. Filter by location, price, type, and amenities to find your perfect home.',
  openGraph: {
    title: 'Property Listings | AumEstate Studio',
    description:
      'Browse premium properties — houses, villas, apartments, and condos across California.',
    url: 'https://www.aumestatestudio.com/listings',
  },
};

// =============================================================================
// 🏗️ ListingsPage Component — Server Component ที่ wrap Suspense
// =============================================================================
// 🔑 ทำไมไฟล์นี้สั้นมาก?
//   - หน้าที่ของ page.tsx คือ "entry point" ของ route /listings
//   - เป็น Server Component → export metadata ได้ (Client Component ทำไม่ได้)
//   - Logic ทั้งหมดอยู่ใน ListingsClient (Client Component)
//
// 🔑 React JS เทียบเท่า (ไม่ต้อง Suspense, ไม่ต้องแยกไฟล์):
//   function ListingsPage() {
//     const [searchParams] = useSearchParams();
//     const [filters, setFilters] = useState({...});
//     // ... filter logic ทั้งหมดอยู่ในนี้
//     return <div>...</div>;
//   }
export default function ListingsPage() {
  return (
    // =========================================================================
    // ⏳ Suspense Boundary — จำเป็นสำหรับ useSearchParams() ใน Next.js
    // =========================================================================
    // 🔑 Suspense ทำอะไร:
    //   1. ตอน server render: แสดง fallback (loading spinner)
    //   2. ตอน client hydrate: ListingsClient อ่าน search params แล้ว render จริง
    //
    // 🔑 ถ้าไม่ใส่ Suspense:
    //   - Next.js 15 จะ error: "useSearchParams() should be wrapped in a suspense boundary"
    //   - เพราะ server ไม่รู้ค่า search params (เช่น ?location=Malibu)
    //     → ต้องมี fallback แสดงก่อนจนกว่า client จะ hydrate
    //
    // 🔑 React JS: ไม่ต้อง Suspense สำหรับ useSearchParams
    //   เพราะ SPA render ทั้งหมดบน client — search params รู้ทันที
    <Suspense
      fallback={
        // Fallback UI — แสดงระหว่าง ListingsClient กำลังโหลด
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-3">
            {/* Loading spinner animation */}
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading listings...</p>
          </div>
        </div>
      }
    >
      {/* ListingsClient = Client Component ที่ใช้ useSearchParams() */}
      {/* จัดการ filter, sort, display ทั้งหมด */}
      <ListingsClient />
    </Suspense>
  );
}
