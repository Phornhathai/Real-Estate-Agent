// =============================================================================
// 📁 postcss.config.cjs — ตั้งค่า PostCSS สำหรับ Tailwind CSS v4
// =============================================================================
//
// 🔑 React JS vs Next.js — การตั้งค่า Tailwind CSS:
// ─────────────────────────────────────────────
// React JS + Tailwind v3 (แบบเดิม):
//   - postcss.config.js ใช้ plugin 2 ตัว: tailwindcss + autoprefixer
//   - ต้องมีไฟล์ tailwind.config.js แยกต่างหาก (config ทุกอย่างอยู่ใน JS)
//   - ต้องมี autoprefixer plugin เพิ่มเอง
//
// Next.js + Tailwind v4 (โปรเจกต์นี้):
//   - postcss.config.cjs ใช้ plugin ตัวเดียว: @tailwindcss/postcss
//   - ❌ ไม่มี tailwind.config.js — config ทุกอย่างอยู่ใน CSS (@theme block)
//   - ❌ ไม่ต้อง autoprefixer — @tailwindcss/postcss จัดการให้แล้ว
//   - ⚡ เร็วกว่า v3 เพราะ engine ใหม่ (Oxide, เขียนด้วย Rust)
//
// 🔑 ทำไมใช้ .cjs (CommonJS) แทน .js หรือ .mjs:
//   - โปรเจกต์ Next.js ใช้ "type": "module" ใน package.json (ESM)
//   - แต่ PostCSS ต้องการ CommonJS format (module.exports)
//   - .cjs = บังคับให้ Node.js อ่านเป็น CommonJS แม้โปรเจกต์เป็น ESM
//   - ถ้าใช้ .js → Error: "module.exports is not defined in ES module"
//
// 🔑 PostCSS คืออะไร:
//   - เป็น CSS processor — อ่าน CSS แล้วแปลงด้วย plugins
//   - Tailwind CSS ทำงานเป็น PostCSS plugin
//   - Next.js เรียก PostCSS อัตโนมัติเมื่อ build
//   - ไฟล์ CSS ทุกไฟล์จะผ่าน PostCSS pipeline ก่อนถูกใช้งาน
// =============================================================================

// =============================================================================
// ⚙️ Config Object — ระบุ PostCSS plugins ที่ต้องใช้
// =============================================================================
module.exports = {
  // plugins = รายการ PostCSS plugins ที่จะประมวลผล CSS
  plugins: {
    // ─────────────────────────────────────────────────────────────────────────
    // 🎨 @tailwindcss/postcss — Plugin หลักของ Tailwind CSS v4
    // ─────────────────────────────────────────────────────────────────────────
    // 🔑 เทียบกับ Tailwind v3 (แบบเดิม):
    //   v3: plugins: { tailwindcss: {}, autoprefixer: {} }  ← ต้อง 2 plugins
    //   v4: plugins: { '@tailwindcss/postcss': {} }          ← plugin เดียวจบ
    //
    // Plugin นี้ทำอะไร:
    //   1. อ่าน @import "tailwindcss" จาก globals.css
    //   2. อ่าน @theme {} block แล้วสร้าง CSS variables
    //   3. แปลง Tailwind classes (bg-brand-500, rounded-card) เป็น CSS จริง
    //   4. เพิ่ม vendor prefixes อัตโนมัติ (-webkit-, -moz-) ← แทน autoprefixer
    //   5. Purge unused CSS ตอน production build
    //
    // {} = ไม่มี options เพิ่มเติม (ใช้ค่า default)
    // Tailwind v4 อ่าน config จาก CSS (@theme block) แทน tailwind.config.js
    // ─────────────────────────────────────────────────────────────────────────
    '@tailwindcss/postcss': {},
  },
};
