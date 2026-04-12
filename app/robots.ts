import type { MetadataRoute } from 'next';
// MetadataRoute.Robots = TypeScript type สำหรับ robots.txt configuration

// 🤖 Robots Function — สร้าง robots.txt
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
    sitemap: 'https://www.aumestatestudio.com/sitemap.xml',

    // host = URL หลักของเว็บ (บาง search engines ใช้)
    host: 'https://www.aumestatestudio.com',
  };
}
