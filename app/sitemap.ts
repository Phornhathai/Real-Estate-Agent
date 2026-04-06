// =============================================================================
// 📁 app/sitemap.ts — Sitemap.xml Generator (แผนที่เว็บสำหรับ search engines)
// =============================================================================
//
// 🔑 React JS vs Next.js — Sitemap:
// ─────────────────────────────────────────────
// React JS (แบบเดิม):
//   - ไม่มี built-in sitemap → ต้องทำเอง:
//     1. สร้าง public/sitemap.xml ด้วยมือ (แก้ทุกครั้งที่เพิ่มหน้า)
//     2. ใช้ library เช่น react-router-sitemap หรือ sitemap-generator
//     3. เขียน script สำหรับ generate ตอน build
//   - SPA มักมีปัญหา SEO เพราะ Google อาจ render ไม่ครบ
//
// Next.js App Router:
//   - สร้าง app/sitemap.ts → export function ที่ return array ของ URL objects
//   - Next.js generate /sitemap.xml ให้อัตโนมัติ
//   - มี TypeScript type (MetadataRoute.Sitemap) → ช่วยเรื่อง type safety
//   - สามารถ query database/API ได้ (ในโปรเจกต์นี้ใช้ mock data)
//   - สร้าง dynamic URLs จากข้อมูลได้ (เช่น /listings/[id] ทุกตัว)
//
// 🔑 Sitemap.xml คืออะไร?
//   - ไฟล์ XML ที่บอก Google/Bing ว่าเว็บมีหน้าอะไรบ้าง
//   - ช่วยให้ search engines ค้นพบหน้าเว็บเร็วขึ้น
//   - แต่ละ entry มี: url, lastModified, changeFrequency, priority
//   - อยู่ที่: https://www.example.com/sitemap.xml
//   - ปกติจะลิงก์จาก robots.txt ด้วย
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================
import type { MetadataRoute } from 'next';
// MetadataRoute.Sitemap = TypeScript type สำหรับ sitemap entries
// เป็น array ของ object ที่มี url, lastModified, changeFrequency, priority
// 🔑 React JS: ไม่มี type นี้ ต้องเขียน XML string เองหรือใช้ library

import { properties } from '@/lib/mock-data';
// import ข้อมูล property ทั้งหมด — ใช้สร้าง URL สำหรับ /listings/[id] ทุกตัว
// 🔑 ในโปรเจกต์จริง อาจ fetch จาก database/CMS แทน mock data

// =============================================================================
// 🌐 Constants
// =============================================================================
const BASE_URL = 'https://www.aumestatestudio.com';
// URL หลักของเว็บ — ใช้ต่อกับ path ของแต่ละหน้า

// =============================================================================
// 🗺️ Sitemap Function — สร้าง sitemap.xml
// =============================================================================
// 🔑 Next.js จะเรียกฟังก์ชันนี้ตอน build แล้วสร้าง /sitemap.xml ให้
//   React JS: ต้องเขียน XML เอง เช่น:
//     <?xml version="1.0" encoding="UTF-8"?>
//     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//       <url><loc>https://example.com/</loc></url>
//     </urlset>
export default function sitemap(): MetadataRoute.Sitemap {
  // ---------------------------------------------------------------------------
  // 📄 Static Pages — หน้าที่มี URL คงที่
  // ---------------------------------------------------------------------------
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,                    // หน้าแรก: https://www.aumestatestudio.com
      lastModified: new Date(),          // วันที่แก้ไขล่าสุด (ใช้วันปัจจุบัน)
      changeFrequency: 'weekly',         // บอก Google ว่าเนื้อหาเปลี่ยนบ่อยแค่ไหน
      priority: 1.0,                     // ความสำคัญ 0.0-1.0 (1.0 = สำคัญที่สุด)
    },
    {
      url: `${BASE_URL}/listings`,       // หน้า listings: .../listings
      lastModified: new Date(),
      changeFrequency: 'daily',          // เปลี่ยนทุกวัน (property ใหม่เข้ามา)
      priority: 0.9,                     // สำคัญรองจากหน้าแรก
    },
    {
      url: `${BASE_URL}/contact`,        // หน้า contact: .../contact
      lastModified: new Date(),
      changeFrequency: 'monthly',        // ไม่ค่อยเปลี่ยน
      priority: 0.6,                     // สำคัญน้อยกว่าหน้าอื่น
    },
  ];

  // ---------------------------------------------------------------------------
  // 🏠 Property Pages — สร้าง URL สำหรับ property แต่ละตัว (dynamic)
  // ---------------------------------------------------------------------------
  // 🔑 นี่คือจุดแข็งของ Next.js — สร้าง sitemap entries จากข้อมูลได้
  //   React JS: ต้อง loop สร้าง <url> tags เองใน XML string
  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${BASE_URL}/listings/${property.id}`,  // เช่น .../listings/beverly-hills-mansion
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,          // as const เพื่อให้ TypeScript รู้ว่าเป็น literal type
    priority: 0.8,                               // สำคัญ (หน้า detail ของแต่ละ property)
  }));

  // รวม static + dynamic pages แล้ว return เป็น array เดียว
  // Next.js จะแปลง array นี้เป็น XML อัตโนมัติ
  return [...staticPages, ...propertyPages];
}
