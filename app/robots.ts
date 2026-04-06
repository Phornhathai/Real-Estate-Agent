// =============================================================================
// 📁 app/robots.ts — Robots.txt Generator (บอก search engine ว่าควร crawl อะไร)
// =============================================================================
//
// 🔑 React JS vs Next.js — Robots.txt:
// ─────────────────────────────────────────────
// React JS (แบบเดิม):
//   - สร้างไฟล์ public/robots.txt ด้วยมือ (static file):
//     User-agent: *
//     Allow: /
//     Disallow: /api/
//     Sitemap: https://example.com/sitemap.xml
//   - ต้องแก้ไฟล์ text ตรงๆ ทุกครั้งที่เปลี่ยน
//   - ไม่มี type checking — ผิด format ก็ไม่มี error
//
// Next.js App Router:
//   - สร้าง app/robots.ts → export function ที่ return object
//   - Next.js จะ generate robots.txt ให้อัตโนมัติที่ /robots.txt
//   - มี TypeScript type (MetadataRoute.Robots) → ผิด format จะเตือน
//   - สามารถใช้ logic ได้ เช่น เปลี่ยนตาม environment
//     (dev อาจ disallow ทั้งหมด, production อาจ allow)
//
// 🔑 Robots.txt คืออะไร?
//   - ไฟล์ที่บอก search engine bots (Google, Bing, etc.) ว่า:
//     - ให้ crawl หน้าไหนได้ (Allow)
//     - ไม่ให้ crawl หน้าไหน (Disallow)
//     - Sitemap อยู่ที่ไหน
//   - อยู่ที่ root: https://www.example.com/robots.txt
//   - ไม่ใช่ security measure — เป็นแค่ "ป้ายบอกทาง" ให้ bots
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================
import type { MetadataRoute } from 'next';
// MetadataRoute.Robots = TypeScript type สำหรับ robots.txt configuration
// 🔑 React JS: ไม่มี type นี้ เพราะเขียน robots.txt เป็น plain text

// =============================================================================
// 🤖 Robots Function — สร้าง robots.txt
// =============================================================================
// 🔑 Next.js จะเรียกฟังก์ชันนี้ตอน build แล้วสร้างไฟล์ /robots.txt ให้
//   React JS: ต้องสร้างไฟล์เอง หรือใช้ library เช่น generate-robotstxt
export default function robots(): MetadataRoute.Robots {
  return {
    // rules = กฎสำหรับ bots แต่ละตัว (สามารถมีหลาย rule ได้)
    rules: [
      {
        userAgent: '*',          // * = ใช้กับทุก bots (Googlebot, Bingbot, etc.)
        allow: '/',              // อนุญาตให้ crawl ทุกหน้า
        disallow: [
          '/api/',               // ไม่ให้ crawl API routes (ไม่ใช่หน้าเว็บ)
          '/_next/',             // ไม่ให้ crawl Next.js internal files (JS bundles, etc.)
        ],
      },
    ],

    // sitemap = บอก bots ว่า sitemap.xml อยู่ที่ไหน
    // 🔑 ใช้คู่กับ app/sitemap.ts ที่สร้าง sitemap.xml อัตโนมัติ
    sitemap: 'https://www.aumestatestudio.com/sitemap.xml',

    // host = URL หลักของเว็บ (บาง search engines ใช้)
    host: 'https://www.aumestatestudio.com',
  };
}
