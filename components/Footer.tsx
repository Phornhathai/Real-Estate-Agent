import Link from "next/link";
//    เพราะ Link component จัดการ client-side navigation ภายในตัวเอง

// จัดเป็น object ที่ key = ชื่อหมวด, value = array ของ links
// ใช้ Object.entries() ด้านล่างเพื่อ loop render ทุกหมวด
const footerLinks = {
  Company: [{ label: "About Us", href: "/contact" }],
};
// Server จะ render เป็น HTML สำเร็จรูป ไม่ส่ง JS ไป browser
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* =============================================================== */}
          {/* 🏠 Brand Column — Logo + คำอธิบาย + Social links                */}
          {/* =============================================================== */}
          <div>
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
                Home<span className="text-blue-400">Reality</span>
              </span>
            </Link>
            {/* คำอธิบายบริษัท */}
            {/* &apos; = HTML entity สำหรับ ' (apostrophe) — Next.js บังคับใช้แทน ' */}
            <p className="text-sm leading-relaxed mb-6">
              Your trusted partner in finding the perfect home. Premium properties across
              Thailand&apos;s most sought-after locations.
            </p>

            {/* ============================================================= */}
            {/* 🌐 Social Media Links                                         */}
            {/* ============================================================= */}
            {/* ใช้ <a> แทน <Link> เพราะ social links จะไปเว็บนอก (external) */}
            {/* 🔑 <Link> = internal navigation (ภายในเว็บเรา) */}
            {/*     <a>    = external links หรือ links ที่ยังไม่มีหน้า (href="#") */}
            <div className="flex gap-3" aria-label="Social media links">
              <a
                href="https://www.google.com/"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 🔗 Link Columns — Loop สร้างจาก footerLinks object               */}
          {/* =============================================================== */}
          {/* Object.entries() แปลง { Explore: [...], Company: [...] } */}
          {/* เป็น [['Explore', [...]], ['Company', [...]]] เพื่อ loop ได้ */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col items-center text-center">
              <h3 className="text-white font-semibold text-sm mb-4">{category}</h3>
              <ul className="flex">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
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
          <div className="flex items-center gap-4">
            <p className="text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} Home Reality. All rights reserved.
            </p>
            <Link
              href="/admin"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Admin
            </Link>
          </div>
          <p className="text-sm">
            Made with{" "}
            <span className="text-red-400" aria-label="love">
              ♥
            </span>{" "}
            in Thailand
          </p>
        </div>
      </div>
    </footer>
  );
}
