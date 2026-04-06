// =============================================================================
// 📁 components/Footer.tsx — Footer (Server Component)
// =============================================================================
//
// 🔑 ทำไมเป็น Server Component?
// ─────────────────────────────────
// Footer ไม่มี interactivity ใดๆ:
//   - ไม่มี useState (ไม่มี state ที่เปลี่ยนแปลง)
//   - ไม่มี useEffect (ไม่มี side effects)
//   - ไม่มี onClick handlers (ไม่มี event จาก user)
//   - ไม่มี useRouter / usePathname (ไม่ต้องอ่าน URL)
//   - เป็น static content ล้วนๆ — แค่แสดง links กับข้อความ
//
// ดังนั้น Next.js จะ render เป็น HTML บน server → ส่ง HTML สำเร็จรูปไป browser
// ข้อดี: ไม่ส่ง JavaScript ของ Footer ไป browser เลย → หน้าโหลดเร็วขึ้น
//
// 🔑 Server Component vs Client Component:
// ──────────────────────────────────────────
// Server Component (ไม่มี 'use client'):
//   - Render บน server แล้วส่ง HTML ไป browser
//   - ไม่ส่ง JS bundle ไป client → เร็วกว่า
//   - ใช้ได้เฉพาะ: static content, import data, async/await
//   - ใช้ไม่ได้: useState, useEffect, onClick, browser APIs
//
// Client Component ('use client'):
//   - Render บน browser (hydrate จาก HTML)
//   - ส่ง JS bundle ไป client → ช้ากว่าเล็กน้อย
//   - ใช้ได้ทุกอย่าง: hooks, events, browser APIs
//
// 🔑 React JS vs Next.js:
// ────────────────────────
// React JS:  ไม่มีแนวคิด Server/Client Component — ทุกอย่างเป็น client หมด
//            → ส่ง JS ทั้งหมดไป browser ทุกครั้ง
// Next.js:   แยก Server/Client → ส่งเฉพาะ JS ที่จำเป็น → performance ดีกว่า
//
// 🔑 สังเกต: ไฟล์นี้ไม่มี 'use client' บรรทัดแรก = Server Component โดยอัตโนมัติ
// =============================================================================

import Link from 'next/link';
// 🔑 Next.js: <Link href="/path"> — client-side navigation ไม่ reload หน้า
// React JS: <Link to="/path"> จาก react-router-dom
// ⚠️ แม้ Footer จะเป็น Server Component แต่ใช้ <Link> ได้
//    เพราะ Link component จัดการ client-side navigation ภายในตัวเอง

// -----------------------------------------------------------------------------
// 📋 Footer Links Data — ข้อมูลลิงก์ทั้งหมดแยกตาม category
// จัดเป็น object ที่ key = ชื่อหมวด, value = array ของ links
// ใช้ Object.entries() ด้านล่างเพื่อ loop render ทุกหมวด
// -----------------------------------------------------------------------------
const footerLinks = {
  Explore: [
    { label: 'Buy a Home', href: '/listings?tab=buy' },
    { label: 'Rent a Home', href: '/listings?tab=rent' },
    { label: 'Featured Listings', href: '/listings' },
    { label: 'New Listings', href: '/listings' },
  ],
  Company: [
    { label: 'About Us', href: '/contact' },
    { label: 'Our Agents', href: '/contact' },
    { label: 'Careers', href: '/contact' },
    { label: 'Press', href: '/contact' },
  ],
  Resources: [
    { label: 'Blog', href: '/contact' },
    { label: 'Market Reports', href: '/contact' },
    { label: 'Mortgage Calculator', href: '/contact' },
    { label: 'FAQ', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/contact' },
    { label: 'Terms of Service', href: '/contact' },
    { label: 'Cookie Policy', href: '/contact' },
  ],
};

// =============================================================================
// 🏗️ Component หลัก — Footer
// =============================================================================
// ⚠️ ไม่มี 'use client' → เป็น Server Component
// Server จะ render เป็น HTML สำเร็จรูป ไม่ส่ง JS ไป browser
// 🔑 React JS: ไม่มีแนวคิดนี้ — ทุก component ส่ง JS ไป client เสมอ
export default function Footer() {
  return (
    // role="contentinfo" บอก screen reader ว่านี่คือ footer ของหน้า
    <footer className="bg-gray-900 text-gray-400" role="contentinfo">
      {/* max-w-7xl mx-auto = จำกัดความกว้างสูงสุด + จัดกลาง */}
      {/* Responsive padding: px-4 (mobile) → sm:px-6 → lg:px-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* ================================================================= */}
        {/* 📐 Grid Layout — Responsive columns                               */}
        {/* ================================================================= */}
        {/* grid-cols-2 = 2 คอลัมน์บน mobile */}
        {/* md:grid-cols-5 = 5 คอลัมน์บน desktop (1 brand + 4 link groups) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">

          {/* =============================================================== */}
          {/* 🏠 Brand Column — Logo + คำอธิบาย + Social links                */}
          {/* =============================================================== */}
          {/* col-span-2 = กินพื้นที่ 2 คอลัมน์บน mobile (เต็มแถว) */}
          {/* md:col-span-1 = กินแค่ 1 คอลัมน์บน desktop */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo — เหมือนใน Navbar แต่สี text เป็นขาว (เพราะ bg มืด) */}
            {/* 🔑 Next.js: <Link href="/"> / React JS: <Link to="/"> */}
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white fill-current"
                  aria-hidden="true"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">
                Aum<span className="text-blue-400">Estate</span>
              </span>
            </Link>
            {/* คำอธิบายบริษัท */}
            {/* &apos; = HTML entity สำหรับ ' (apostrophe) — Next.js บังคับใช้แทน ' */}
            <p className="text-sm leading-relaxed mb-6">
              Your trusted partner in finding the perfect home. Premium properties across
              California&apos;s most sought-after neighborhoods.
            </p>

            {/* ============================================================= */}
            {/* 🌐 Social Media Links                                         */}
            {/* ============================================================= */}
            {/* ใช้ <a> แทน <Link> เพราะ social links จะไปเว็บนอก (external) */}
            {/* 🔑 <Link> = internal navigation (ภายในเว็บเรา) */}
            {/*     <a>    = external links หรือ links ที่ยังไม่มีหน้า (href="#") */}
            <div className="flex gap-3" aria-label="Social media links">
              {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  aria-label={platform}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  {/* sr-only = ซ่อนจากตา แต่ screen reader อ่านได้ (accessibility) */}
                  <span className="sr-only">{platform}</span>
                  {/* Placeholder icon — ใช้วงกลมแทน icon จริง (mock) */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* =============================================================== */}
          {/* 🔗 Link Columns — Loop สร้างจาก footerLinks object               */}
          {/* =============================================================== */}
          {/* Object.entries() แปลง { Explore: [...], Company: [...] } */}
          {/* เป็น [['Explore', [...]], ['Company', [...]]] เพื่อ loop ได้ */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              {/* หัวข้อหมวด — สีขาวเพื่อเน้นเหนือ links สีเทา */}
              <h3 className="text-white font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {/* 🔑 ใช้ <Link> เพราะเป็น internal links ภายในเว็บเรา */}
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* =================================================================== */}
        {/* ─── Bottom Bar — Copyright + Made with ♥                           */}
        {/* =================================================================== */}
        {/* border-t = เส้นขอบบน คั่นระหว่าง links กับ copyright */}
        {/* flex-col sm:flex-row = แนวตั้งบน mobile, แนวนอนบน desktop */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* new Date().getFullYear() = ปีปัจจุบันอัตโนมัติ ไม่ต้อง hardcode */}
          <p className="text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} AumEstate Studio. All rights reserved.
          </p>
          <p className="text-sm">
            Made with{' '}
            <span className="text-red-400" aria-label="love">
              ♥
            </span>{' '}
            in California
          </p>
        </div>
      </div>
    </footer>
  );
}
