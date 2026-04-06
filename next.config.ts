// =============================================================================
// 📁 next.config.ts — ไฟล์ตั้งค่าหลักของ Next.js (Project Configuration)
// =============================================================================
//
// 🔑 React JS vs Next.js — ไฟล์ config:
// ─────────────────────────────────────────────
// React JS (CRA / Vite):
//   - ไม่มี next.config.ts — ใช้ vite.config.ts หรือ craco.config.js แทน
//   - ไม่มีระบบ Image Optimization ในตัว — ต้องจัดการเอง
//   - ไม่มี Turbopack — ใช้ Webpack หรือ Vite เป็น bundler
//
// Next.js:
//   - next.config.ts คือศูนย์กลางการตั้งค่าทั้งหมดของโปรเจกต์
//   - มี Image Optimization ในตัว (next/image) — resize, format, cache อัตโนมัติ
//   - Turbopack = bundler ใหม่ที่เร็วกว่า Webpack 10x (ใช้ Rust)
//   - ควบคุม domains ที่อนุญาตให้โหลดรูป (security)
//
// 🔑 ทำไมต้องมีไฟล์นี้:
//   - บอก Next.js ว่าอนุญาตโหลดรูปจากโดเมนไหนบ้าง (remotePatterns)
//   - เปิดใช้ Turbopack สำหรับ dev server ที่เร็วขึ้น
//   - ถ้าไม่ตั้งค่า remotePatterns → next/image จะ block รูปจากภายนอก (security)
// =============================================================================

// -----------------------------------------------------------------------------
// 📦 Import type — NextConfig คือ TypeScript type สำหรับ config object
// -----------------------------------------------------------------------------
// 🔑 React JS: ไม่มี type นี้ — config ของ Vite/CRA ใช้ type ของตัวเอง
// 🔑 Next.js: import type ไม่ถูก bundle เข้า production — ใช้แค่ตอน develop
import type { NextConfig } from 'next';

// =============================================================================
// ⚙️ Config Object — ตั้งค่าทุกอย่างของ Next.js ในที่เดียว
// =============================================================================
const nextConfig: NextConfig = {

  // ---------------------------------------------------------------------------
  // ⚡ Turbopack — Bundler สมัยใหม่ (เขียนด้วย Rust)
  // ---------------------------------------------------------------------------
  // 🔑 React JS: ใช้ Webpack (ช้า) หรือ Vite (เร็ว, ใช้ esbuild)
  // 🔑 Next.js 15: Turbopack เป็น bundler ในตัว เร็วกว่า Webpack 10x
  //   - เปิดใช้ด้วย `next dev --turbopack` ในคำสั่ง dev
  //   - root = บอก Turbopack ว่า root directory ของโปรเจกต์อยู่ที่ไหน
  //   - __dirname = ค่า built-in ของ Node.js ชี้ไปที่โฟลเดอร์ของไฟล์นี้
  turbopack: {
    root: __dirname,
    // __dirname = path ของโฟลเดอร์ที่ไฟล์ next.config.ts อยู่
    // ช่วยให้ Turbopack resolve ไฟล์ได้ถูกต้อง
  },

  // ---------------------------------------------------------------------------
  // 🖼️ Images — ตั้งค่า next/image component
  // ---------------------------------------------------------------------------
  // 🔑 React JS vs Next.js — การจัดการรูปภาพ:
  // ─────────────────────────────────────────────
  // React JS:
  //   - ใช้ <img src="..."> ธรรมดา — ไม่มี optimization
  //   - ต้อง lazy load เอง (loading="lazy")
  //   - ต้อง resize / convert format เอง (หรือใช้ CDN)
  //   - ไม่มี security check สำหรับ external images
  //
  // Next.js (next/image):
  //   - Optimize อัตโนมัติ: resize, convert เป็น WebP/AVIF, cache
  //   - Lazy load ในตัว — โหลดรูปเฉพาะเมื่อเลื่อนมาถึง
  //   - ⚠️ ต้องระบุ remotePatterns — บอก Next.js ว่าอนุญาตโดเมนไหน
  //   - ถ้าไม่ระบุ → Error: "hostname is not configured under images"
  // ─────────────────────────────────────────────
  images: {
    // remotePatterns = รายการโดเมนที่อนุญาตให้ next/image โหลดรูป
    // 🔑 React JS: ไม่ต้องตั้งค่านี้ — <img> โหลดจากไหนก็ได้
    // 🔑 Next.js: ต้องระบุทุกโดเมน เพื่อป้องกัน Server-Side Request Forgery (SSRF)
    remotePatterns: [
      {
        protocol: 'https',                   // ใช้ HTTPS เท่านั้น (ปลอดภัย)
        hostname: 'images.unsplash.com',      // โดเมนหลักของ Unsplash
        // Unsplash = แหล่งรูปฟรีที่ใช้ในโปรเจกต์นี้ (mock data)
      },
      {
        protocol: 'https',                   // ใช้ HTTPS เท่านั้น
        hostname: 'plus.unsplash.com',        // โดเมน Unsplash+ (รูป premium)
        // บาง property ในโปรเจกต์ใช้รูปจาก plus.unsplash.com
      },
    ],
  },
};

// =============================================================================
// 📤 Export — ส่ง config ให้ Next.js ใช้
// =============================================================================
// 🔑 React JS: export default defineConfig({...}) — Vite ใช้ defineConfig
// 🔑 Next.js: export default nextConfig — Next.js อ่าน default export อัตโนมัติ
export default nextConfig;
