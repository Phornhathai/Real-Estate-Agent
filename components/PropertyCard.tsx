// =============================================================================
// 📁 components/PropertyCard.tsx — การ์ดแสดงข้อมูล Property แต่ละรายการ
// =============================================================================
//
// 🔑 ทำไมต้องเป็น Client Component?
// ─────────────────────────────────────
// Component นี้ต้องเป็น 'use client' เพราะ:
//   1. useState — ใช้เก็บสถานะ bookmark (กดบุ๊กมาร์กหรือยัง)
//   2. onClick event handler — ปุ่มกด bookmark ต้อง handle event ฝั่ง client
//
// 🔑 React JS vs Next.js:
//   - React JS: ทุก component เป็น client อยู่แล้ว ไม่ต้องประกาศอะไร
//   - Next.js: default เป็น Server Component → ถ้าจะใช้ useState/useEffect
//              ต้องประกาศ 'use client' ที่บรรทัดแรกสุดของไฟล์
//
// 🔑 Next/Image vs <img> ปกติ:
// ──────────────────────────────
//   <img> ปกติ (React JS):
//     - โหลดรูปเต็มขนาดเสมอ ไม่ว่าจอจะเล็กแค่ไหน
//     - ไม่มี lazy loading อัตโนมัติ
//     - ไม่ optimize format (WebP/AVIF)
//     - CLS (Cumulative Layout Shift) สูง เพราะไม่รู้ขนาดรูปล่วงหน้า
//
//   Next/Image:
//     - Resize รูปอัตโนมัติตามขนาดจอ (ผ่าน sizes prop)
//     - Lazy loading เป็น default
//     - แปลง format เป็น WebP/AVIF อัตโนมัติ
//     - ป้องกัน CLS เพราะจอง space ไว้ล่วงหน้า (ผ่าน fill หรือ width/height)
//
// 🔑 Next/Link vs <a> ปกติ:
// ──────────────────────────
//   <a href="..."> (HTML ปกติ / React JS ที่ไม่ใช้ React Router):
//     - Full page reload ทุกครั้งที่คลิก
//     - โหลด HTML + JS + CSS ใหม่ทั้งหมด
//
//   React Router <Link> (React JS):
//     - Client-side navigation (ไม่ reload หน้า)
//     - ต้อง install react-router-dom แยก
//     - ต้อง setup <BrowserRouter> + <Routes> เอง
//
//   Next.js <Link>:
//     - Client-side navigation เหมือน React Router
//     - Prefetch อัตโนมัติ — เมื่อ Link ปรากฏบนจอ จะโหลด JS ของหน้านั้นล่วงหน้า
//     - ไม่ต้อง setup router — ใช้ folder structure เป็น route (file-based routing)
//     - ส่ง href เป็น string ตรง ๆ ได้เลย (ไม่ต้อง to={...} แบบ React Router)
// =============================================================================

'use client';
// 🔑 Next.js: ต้องใส่ 'use client' เพราะ component นี้ใช้ useState (bookmark toggle)
// React JS: ไม่ต้องใส่บรรทัดนี้ เพราะทุก component เป็น client อยู่แล้ว

import { useState } from 'react';
// useState = React hook สำหรับเก็บ state (สถานะที่เปลี่ยนแปลงได้) ฝั่ง client
// ใช้เก็บสถานะ bookmarked (true/false) ว่าผู้ใช้กด bookmark หรือยัง

import Image from 'next/image';
// 🔑 Next/Image — component พิเศษของ Next.js ที่ optimize รูปภาพอัตโนมัติ
// React JS ปกติ: ใช้ <img src="..." /> ← ไม่มี optimization
// Next.js: ใช้ <Image src="..." /> ← resize, lazy load, WebP อัตโนมัติ

import Link from 'next/link';
// 🔑 Next/Link — client-side navigation ไม่ reload หน้า + prefetch อัตโนมัติ
// React JS ปกติ: ใช้ <Link to="..."> จาก react-router-dom
// Next.js: ใช้ <Link href="..."> จาก next/link (ใช้ href ไม่ใช่ to)

import type { Property } from '@/lib/mock-data';
// Import type เฉพาะ type definition — ไม่ถูก include ใน JavaScript output
// @/ = alias ชี้ไปที่ root ของโปรเจกต์ (ตั้งค่าใน tsconfig.json)
// 🔑 React JS: ต้อง import แบบ relative path เช่น '../lib/mock-data'
//    Next.js: ใช้ @/ alias ได้เลย (สั้นกว่า, ไม่ต้องนับ ../ )

// -----------------------------------------------------------------------------
// 🎨 สี Badge สำหรับแต่ละประเภท Property
// -----------------------------------------------------------------------------
// Record<string, string> = TypeScript utility type
// key = ชื่อประเภท (House, Villa, ...), value = Tailwind classes
const TYPE_STYLES: Record<string, string> = {
  House: 'bg-emerald-100 text-emerald-700',
  Villa: 'bg-purple-100 text-purple-700',
  Apartment: 'bg-blue-100 text-blue-700',
  Condo: 'bg-amber-100 text-amber-700',
};

// -----------------------------------------------------------------------------
// ⭐ StarRating — Sub-component แสดงดาว rating
// -----------------------------------------------------------------------------
// เป็น function component ธรรมดา (ไม่ export) ใช้ภายในไฟล์นี้เท่านั้น
// Props: rating (คะแนน เช่น 4.5), count (จำนวนรีวิว เช่น 120)
function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);    // จำนวนดาวเต็ม เช่น 4.5 → 4
  const half = rating % 1 >= 0.5;     // มีครึ่งดาวไหม เช่น 4.5 → true

  return (
    <div className="flex items-center gap-1.5">
      {/* aria-label สำหรับ screen reader — บอกคะแนนแบบ text */}
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {/* สร้าง Array 5 ช่อง แล้ว map เป็นดาว 5 ดวง */}
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${
              i < full
                ? 'text-amber-400 fill-amber-400'           // ดาวเต็ม = สีเหลือง
                : i === full && half
                ? 'text-amber-400 fill-amber-400'           // ครึ่งดาว = สีเหลือง (simplified)
                : 'text-gray-300 fill-gray-200'             // ดาวว่าง = สีเทา
            }`}
            viewBox="0 0 24 24"
            aria-hidden="true"  // ซ่อนจาก screen reader เพราะมี aria-label ด้านบนแล้ว
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {/* แสดงคะแนนและจำนวนรีวิว เช่น "4.5 (120)" */}
      <span className="text-xs text-gray-500">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 📝 Props Interface — TypeScript กำหนด props ที่ component รับ
// -----------------------------------------------------------------------------
interface PropertyCardProps {
  property: Property;      // ข้อมูล property ทั้งหมด (จาก mock-data.ts)
  featured?: boolean;      // optional — ถ้า true จะมี ring สีฟ้ารอบการ์ด
}

// =============================================================================
// 🏗️ Component หลัก — PropertyCard
// =============================================================================
// 🔑 เปรียบเทียบ export:
//   React JS: export default function PropertyCard() { ... }  ← เหมือนกัน
//   Next.js:  export default function PropertyCard() { ... }  ← เหมือนกัน
//   (ส่วน export เหมือนกันทุกประการ ต่างแค่ 'use client' ด้านบน)
export default function PropertyCard({ property, featured = false }: PropertyCardProps) {
  // ---------------------------------------------------------------------------
  // 🔖 Bookmark State — เก็บว่าผู้ใช้กด bookmark หรือยัง
  // ---------------------------------------------------------------------------
  // 🔑 นี่คือเหตุผลที่ต้องเป็น 'use client' — useState ทำงานฝั่ง client เท่านั้น
  // ในโปรเจกต์จริง อาจเก็บใน database หรือ localStorage แทน
  // ตอนนี้เป็น mock — refresh หน้าแล้ว bookmark จะหายไป
  const [bookmarked, setBookmarked] = useState(false);

  return (
    // <article> = semantic HTML สำหรับเนื้อหาที่สมบูรณ์ในตัวเอง (SEO + Accessibility)
    <article
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group ${
        featured ? 'ring-2 ring-blue-100' : ''  // featured property มีขอบสีฟ้า
      }`}
      // 🔑 group = Tailwind utility — ให้ลูกใช้ group-hover: ได้
      // เช่น รูปภาพ zoom เมื่อ hover ที่การ์ด (ไม่ใช่แค่ hover ที่รูป)
    >
      {/* ================================================================= */}
      {/* 🖼️ ส่วนรูปภาพ                                                    */}
      {/* ================================================================= */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🔑 Next/Image — optimization ที่ <img> ปกติทำไม่ได้           */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* fill = ให้รูปเต็ม container (ใช้คู่กับ object-cover)            */}
        {/* sizes = บอก browser ว่ารูปจะกว้างเท่าไรในแต่ละ breakpoint     */}
        {/*   → Next.js จะ generate srcset ที่เหมาะสมอัตโนมัติ             */}
        {/*   → ประหยัด bandwidth — จอเล็กไม่ต้องโหลดรูปใหญ่              */}
        {/* 🔑 React JS: ใช้ <img src={...} /> ← ไม่มี auto resize        */}
        <Image
          src={property.images[0]}
          alt={`${property.name} — ${property.type} in ${property.location}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          // group-hover:scale-105 = zoom 5% เมื่อ hover ที่ <article> (parent ที่มี group)
        />

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🏷️ Type Badge — แสดงประเภท (House, Villa, Apartment, Condo)  */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
              TYPE_STYLES[property.type] ?? 'bg-gray-100 text-gray-700'
              // ?? = nullish coalescing — ถ้าไม่เจอ type ใน map ใช้สีเทาเป็น fallback
            }`}
          >
            {property.type}
          </span>
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🔖 Bookmark Button — ปุ่มบุ๊กมาร์ก (ต้องการ state จึงเป็น client) */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🔑 onClick ต้องทำงานฝั่ง browser → ต้อง 'use client'          */}
        {/* React JS: ใช้ onClick ได้เลยไม่ต้องคิดเรื่อง server/client    */}
        <button
          onClick={() => setBookmarked(!bookmarked)}
          aria-label={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
          // aria-label = บอก screen reader ว่าปุ่มทำอะไร (Accessibility)
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <svg
            className={`w-4 h-4 ${bookmarked ? 'text-blue-600 fill-blue-600' : 'text-gray-500 fill-none'}`}
            // bookmarked = true → ไอคอนสีน้ำเงินเต็ม, false → ไอคอนเทาโปร่ง
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ✅ Available Badge — แสดงเมื่อ property ว่างอยู่               */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* Conditional rendering: แสดงเฉพาะเมื่อ property.available = true */}
        {property.available && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
              {/* จุดเขียวเล็ก ๆ แสดงสถานะ "พร้อม" */}
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
              Available
            </span>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 📄 ส่วนเนื้อหา (ชื่อ, ที่อยู่, specs, rating, ราคา)             */}
      {/* ================================================================= */}
      <div className="p-4">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🏠 ชื่อ Property — ใช้ Link เพื่อ navigate ไปหน้า detail      */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
          {/* 🔑 Next.js Link:                                             */}
          {/*   - href="/listings/xxx" → file-based route                  */}
          {/*   - Client-side navigation (ไม่ reload หน้า)                 */}
          {/*   - Prefetch อัตโนมัติเมื่อ Link ปรากฏบนจอ                  */}
          {/* 🔑 React JS (React Router):                                  */}
          {/*   - <Link to="/listings/xxx"> (ใช้ to แทน href)              */}
          {/*   - ต้อง setup <Route path="/listings/:id"> ใน router config */}
          <Link
            href={`/listings/${property.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {property.name}
          </Link>
        </h3>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 📍 Location — ที่ตั้ง property                                 */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{property.location}</span>
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🛏️ Specs — ห้องนอน, ห้องน้ำ, พื้นที่                          */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h10" />
            </svg>
            {property.bedrooms} bed
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14H3v5h5v-5zm7 0h-4v5h4v-5zm7 0h-4v5h5v-5zM3 10h18" />
            </svg>
            {property.bathrooms} bath
          </span>
          <span className="text-gray-300">•</span>
          <span>{property.area.toLocaleString()} ft²</span>
          {/* toLocaleString() = ใส่ comma คั่นหลักพัน เช่น 1,500 */}
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* ⭐ Rating — ใช้ StarRating sub-component ด้านบน                */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <StarRating rating={property.rating} count={property.reviewCount} />

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 💰 Price & CTA Button                                          */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${property.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">/{property.priceType}</span>
            {/* เช่น "$2,500/month" */}
          </div>
          {/* 🔑 Link ที่ styled เป็นปุ่ม — navigate ไปหน้า detail โดยไม่ reload */}
          <Link
            href={`/listings/${property.id}`}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
