// =============================================================================
// 📁 components/Navbar.tsx — Navigation Bar (Client Component)
// =============================================================================
//
// 🔑 ทำไมต้องเป็น Client Component?
// ─────────────────────────────────────
// Navbar ต้องใช้ 'use client' เพราะมี interactivity หลายอย่าง:
//   1. usePathname() — อ่าน URL ปัจจุบันเพื่อ highlight เมนูที่ active
//   2. useState()    — เก็บสถานะเปิด/ปิดของ mobile menu
//   3. onClick       — event handler สำหรับ toggle mobile menu
//
// 🔑 React JS vs Next.js:
// ─────────────────────────
// React JS:  ทุก component เป็น client อยู่แล้ว ไม่ต้องระบุ
// Next.js:   default เป็น Server Component → ถ้าต้องการใช้ hooks ต้องใส่ 'use client'
//
// 🔑 Link vs <a> tag:
// ─────────────────────
// React JS:  ใช้ <Link to="/path"> จาก react-router-dom (ต้องติดตั้งเพิ่ม)
// Next.js:   ใช้ <Link href="/path"> จาก next/link (built-in)
//            → ทั้งคู่ทำ client-side navigation (ไม่ reload หน้า)
//            → <a> tag ธรรมดาจะ reload หน้าใหม่ทุกครั้ง (ช้ากว่า)
//
// 🔑 usePathname vs useLocation:
// ────────────────────────────────
// React JS:  const location = useLocation(); → location.pathname
// Next.js:   const pathname = usePathname(); → pathname โดยตรง
//            → ทั้งคู่ให้ค่า URL path ปัจจุบัน เช่น "/listings"
// =============================================================================

'use client';
// 🔑 Next.js: ต้องใส่ 'use client' เพราะ component นี้ใช้ hooks (useState, usePathname)
// React JS: ไม่ต้องใส่บรรทัดนี้ เพราะทุก component เป็น client อยู่แล้ว

import { useState } from 'react';
// useState = hook สำหรับเก็บ state ของ mobile menu (เปิด/ปิด)

import Link from 'next/link';
// 🔑 Next.js: import Link จาก 'next/link' — ใช้ href prop
// React JS: import { Link } from 'react-router-dom' — ใช้ to prop
// ทั้งคู่ทำ client-side navigation (SPA) ไม่ reload หน้าใหม่

import { usePathname } from 'next/navigation';
// 🔑 Next.js: usePathname() ให้ค่า pathname ปัจจุบัน เช่น "/listings"
// React JS: useLocation().pathname จาก react-router-dom ทำหน้าที่เดียวกัน

// -----------------------------------------------------------------------------
// 📋 Navigation Links — ข้อมูลเมนู navigation ทั้งหมด
// แยกเป็น array เพื่อ loop render ได้ง่าย ไม่ต้องเขียน <Link> ซ้ำหลายตัว
// -----------------------------------------------------------------------------
const navLinks = [
  { href: '/listings?tab=buy', label: 'Buy' },
  { href: '/listings?tab=rent', label: 'Rent' },
  { href: '/listings?saved=true', label: 'Favorites' },
  { href: '/contact', label: 'Help' },
  { href: '/contact', label: 'Services' },
];

// =============================================================================
// 🏗️ Component หลัก — Navbar
// =============================================================================
export default function Navbar() {
  // ---------------------------------------------------------------------------
  // 📱 State สำหรับ Mobile Menu
  // ---------------------------------------------------------------------------
  // mobileOpen = true เมื่อเมนู mobile เปิดอยู่, false เมื่อปิด
  // 🔑 เหมือนกันทั้ง React JS และ Next.js — useState ทำงานเหมือนกัน
  const [mobileOpen, setMobileOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // 🔗 อ่าน URL ปัจจุบันเพื่อ highlight เมนูที่ active
  // ---------------------------------------------------------------------------
  // 🔑 Next.js: usePathname() → "/listings", "/contact" ฯลฯ
  // React JS: useLocation().pathname → ให้ค่าเดียวกัน
  // ใช้เปรียบเทียบกับ link.href เพื่อเปลี่ยนสี active link
  const pathname = usePathname();

  return (
    // =========================================================================
    // 📌 Header — sticky ติดด้านบนหน้าจอเมื่อ scroll
    // sticky top-0 = ติดอยู่ด้านบนสุด
    // z-50 = อยู่ layer บนสุด ไม่ถูก element อื่นบัง
    // =========================================================================
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* aria-label = บอก screen reader ว่านี่คือ navigation หลัก */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        {/* Container หลัก — flex จัดเรียง logo, links, actions ในแนวนอน */}
        {/* h-16 = ความสูงคงที่ 64px */}
        <div className="flex items-center justify-between h-16">

          {/* ================================================================= */}
          {/* 🏠 Logo — กดแล้วกลับหน้าแรก                                       */}
          {/* ================================================================= */}
          {/* 🔑 Next.js: <Link href="/"> / React JS: <Link to="/"> */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Icon บ้าน — ใช้ SVG inline แทน icon library เพื่อลด bundle size */}
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white fill-current"
                aria-hidden="true"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            {/* ชื่อแบรนด์ — "Estate" สีน้ำเงินเพื่อเน้น */}
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Aum<span className="text-blue-600">Estate</span>
            </span>
          </Link>

          {/* ================================================================= */}
          {/* 🖥️ Desktop Nav Links — ซ่อนบน mobile (hidden md:flex)             */}
          {/* ================================================================= */}
          {/* hidden = ซ่อนตอน mobile, md:flex = แสดงเมื่อจอ >= 768px */}
          <div className="hidden md:flex items-center gap-1">
            {/* Loop สร้าง Link จาก navLinks array */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                // ─────────────────────────────────────────────────────────────
                // 🔑 Active Link Styling — เปลี่ยนสีตาม URL ปัจจุบัน
                // ─────────────────────────────────────────────────────────────
                // React JS: ใช้ <NavLink> จาก react-router-dom ที่มี isActive prop
                //   <NavLink className={({ isActive }) => isActive ? 'active' : ''}>
                // Next.js: ไม่มี NavLink → ต้องเปรียบเทียบ pathname เอง
                //   pathname === link.href ? 'active styles' : 'normal styles'
                // ─────────────────────────────────────────────────────────────
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ================================================================= */}
          {/* 🔍 Search Bar (Desktop) — ซ่อนบนจอเล็ก (hidden lg:flex)           */}
          {/* ================================================================= */}
          {/* แสดงเฉพาะจอ >= 1024px — จอเล็กกว่าจะใช้ search ใน mobile menu */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              {/* Icon แว่นขยาย — วางทับ input ด้วย absolute positioning */}
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {/* pl-9 = padding-left เพื่อไม่ให้ข้อความทับ icon */}
              <input
                type="search"
                placeholder="Search properties..."
                aria-label="Search properties"
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ================================================================= */}
          {/* ➡️ Right side actions — Browse button, Avatar, Mobile toggle       */}
          {/* ================================================================= */}
          <div className="flex items-center gap-3">
            {/* Browse Button — ซ่อนบนจอเล็กมาก (hidden sm:inline-flex) */}
            {/* 🔑 Next.js: <Link href="/listings"> / React JS: <Link to="/listings"> */}
            <Link
              href="/listings"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {/* Icon รายการ */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Browse
            </Link>

            {/* ============================================================= */}
            {/* 👤 User Avatar — ปุ่มแสดงตัวอักษร "A" (mock user)             */}
            {/* ============================================================= */}
            <button
              aria-label="User account"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0"
            >
              A
            </button>

            {/* ============================================================= */}
            {/* 📱 Mobile Menu Toggle — แสดงเฉพาะจอ < 768px (md:hidden)      */}
            {/* ============================================================= */}
            {/* onClick toggle state mobileOpen ระหว่าง true/false */}
            {/* aria-expanded บอก screen reader ว่าเมนูเปิดอยู่หรือไม่ */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {/* สลับ icon ระหว่าง X (ปิด) กับ hamburger (เปิด) */}
              {mobileOpen ? (
                // ❌ Icon X — แสดงเมื่อเมนูเปิดอยู่
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // ☰ Icon Hamburger — แสดงเมื่อเมนูปิดอยู่
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 📱 Mobile Menu — Conditional Rendering                              */}
        {/* =================================================================== */}
        {/* แสดงเฉพาะเมื่อ mobileOpen === true */}
        {/* md:hidden = ซ่อนบน desktop (>= 768px) แม้ mobileOpen จะเป็น true */}
        {/* 🔑 React JS + Next.js เหมือนกัน: ใช้ && สำหรับ conditional rendering */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {/* Loop สร้าง link เหมือน desktop แต่ layout แนวตั้ง */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                // กดเมนูแล้วปิด mobile menu อัตโนมัติ
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Search input สำหรับ mobile — แสดงใน mobile menu */}
            <div className="pt-2 pb-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  placeholder="Search properties..."
                  aria-label="Search properties"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
