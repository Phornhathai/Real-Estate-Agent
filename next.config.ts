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
  // ⚡ Turbopack root — บอก Turbopack ว่า project root อยู่ที่ไหน
  // ---------------------------------------------------------------------------
  // ป้องกัน Next.js 16 เลือกผิด workspace root (เช่น ~/pnpm-lock.yaml)
  // ซึ่งทำให้ Turbopack scan node_modules ผิดที่และช้ามาก
  turbopack: {
    root: __dirname,
  },

  // ---------------------------------------------------------------------------
  // 📦 Server External Packages — ห้าม bundle packages ที่มี native binaries
  // ---------------------------------------------------------------------------
  // @libsql/client ใช้ native .node binary (@libsql/darwin-arm64)
  // Turbopack ไม่สามารถ bundle native modules ได้ → ต้อง require() ตอน runtime แทน
  serverExternalPackages: ['@libsql/client', '@prisma/adapter-libsql', '@prisma/client'],

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
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',  // QR Code generator
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
