import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

// ใช้ค่าจริงจาก DB แทน mock-data เพื่อให้ sitemap ตรงกับ /listings/[id] ที่ render จริง
// (ก่อนหน้านี้ sitemap list URL ที่ไม่มีจริง → Google เจอ 404 → ลด crawl budget)
const BASE_URL = SITE_URL;
// URL หลักของเว็บ — ใช้ต่อกับ path ของแต่ละหน้า

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // ดึง id + updatedAt จาก DB จริง (กัน sitemap ชี้ไป URL ที่ไม่มีจริง)
  const dbProperties = await prisma.property
    .findMany({ select: { id: true, updatedAt: true } })
    .catch(() => []);

  const propertyPages: MetadataRoute.Sitemap = dbProperties.map((p) => ({
    url: `${BASE_URL}/listings/${p.id}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
