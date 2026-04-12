import type { MetadataRoute } from 'next';

import { properties } from '@/lib/mock-data';
// import ข้อมูล property ทั้งหมด — ใช้สร้าง URL สำหรับ /listings/[id] ทุกตัว

const BASE_URL = 'https://www.aumestatestudio.com';
// URL หลักของเว็บ — ใช้ต่อกับ path ของแต่ละหน้า

// 🗺️ Sitemap Function — สร้าง sitemap.xml
//     <?xml version="1.0" encoding="UTF-8"?>
//     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//       <url><loc>https://example.com/</loc></url>
//     </urlset>
export default function sitemap(): MetadataRoute.Sitemap {
  // 📄 Static Pages — หน้าที่มี URL คงที่
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

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${BASE_URL}/listings/${property.id}`,  // เช่น .../listings/beverly-hills-mansion
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,          // as const เพื่อให้ TypeScript รู้ว่าเป็น literal type
    priority: 0.8,                               // สำคัญ (หน้า detail ของแต่ละ property)
  }));

  // รวม static + dynamic pages แล้ว return เป็น array เดียว
  return [...staticPages, ...propertyPages];
}
