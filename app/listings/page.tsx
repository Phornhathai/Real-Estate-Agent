import type { Metadata } from 'next';

import { Suspense } from 'react';

import ListingsClient from '@/components/ListingsClient';
import { prisma } from '@/lib/prisma';
import { toProperty } from '@/lib/transform';
import { SITE_URL } from '@/lib/seo';

// 🌍 Location-based metadata mapping — title/description for different areas
// เพิ่มพื้นที่ใหม่ได้ที่นี่ทีหลัง (Silom, Sathorn, Sukhumvit, etc.)
const LOCATION_METADATA: Record<
  string,
  { titleEn: string; titleTh: string; descEn: string; descTh: string; lat: number; lng: number }
> = {
  ladprao: {
    titleEn: 'Properties in Ladprao, Bangkok',
    titleTh: 'ทรัพย์สินในลาดพร้าว',
    descEn:
      'Browse condos, apartments, and villas in Ladprao, Bangkok. Find premium properties for rent and sale with Home Reality.',
    descTh:
      'ค้นหาคอนโด อพาร์ตเมนต์ และวิลล่า ในเขตลาดพร้าว กรุงเทพ ทรัพย์สินเลือกสรรราคาดี ทำเลเด่น ฝากขายและเช่า ที่ Home Reality',
    lat: 13.7472,
    lng: 100.5673,
  },
};

// Server Component generateMetadata — อ่าน searchParams และส่ง metadata ที่ต่างกัน
// ทำให้ SEO เป็น dynamic ตามพื้นที่ที่ user filter
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const location = (params.location as string)?.toLowerCase() || '';
  const locationData = LOCATION_METADATA[location];

  // Default (ไม่ filter หรือ location ไม่รู้จัก)
  if (!locationData) {
    return {
      title: 'Property Listings — Browse Homes, Villas & Apartments in Thailand',
      description:
        'Browse all properties on Home Reality — houses, villas, apartments, and condos for rent and sale across Thailand. Filter by location (Bangkok, Chiang Mai, Phuket, Hua Hin), price, type, and amenities.',
      alternates: { canonical: '/listings' },
      keywords: [
        'property listings Thailand',
        'buy house Thailand',
        'rent apartment Thailand',
        'condos Thailand',
      ],
      openGraph: {
        title: 'Property Listings | Home Reality (homereality.homes)',
        description: 'Browse premium properties across Thailand.',
        url: `${SITE_URL}/listings`,
      },
    };
  }

  // Location-specific metadata (e.g., Ladprao)
  return {
    title: `${locationData.titleEn} | Home Reality`,
    description: `${locationData.descEn} ${locationData.descTh}`,
    alternates: {
      canonical: `/listings?location=${location}`,
    },
    keywords: [
      `properties ${location}`,
      `condos ${location}`,
      `apartments ${location}`,
      `villas ${location}`,
      `buy property ${location}`,
      `rent ${location}`,
      locationData.titleTh,
      `${location} property`,
      'Home Reality',
    ],
    openGraph: {
      title: `${locationData.titleEn} | Home Reality (homereality.homes)`,
      description: locationData.descEn,
      url: `${SITE_URL}/listings?location=${location}`,
    },
  };
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const location = (params.location as string)?.toLowerCase() || '';
  const locationData = LOCATION_METADATA[location];

  const prismaProperties = await prisma.property.findMany({
    include: { images: { orderBy: { order: 'asc' } }, agent: true },
    orderBy: { createdAt: 'desc' },
  });
  const properties = prismaProperties.map(toProperty);

  // 🌍 Local Business Schema สำหรับ Ladprao
  // ช่วยให้ Google เข้าใจว่าเว็บมี business ในพื้นที่นี้
  const localSchema =
    locationData && location === 'ladprao'
      ? {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}/listings?location=ladprao#local`,
          name: 'Home Reality - Ladprao Properties',
          areaServed: {
            '@type': 'City',
            name: 'Ladprao, Bangkok',
            'geo': {
              '@type': 'GeoCoordinates',
              latitude: locationData.lat,
              longitude: locationData.lng,
            },
          },
          description: locationData.descTh,
          url: `${SITE_URL}/listings?location=ladprao`,
          image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
          priceRange: '฿฿฿',
        }
      : null;

  return (
    <>
      {/* JSON-LD Schema สำหรับ Ladprao — ช่วย Google เข้าใจ local business */}
      {localSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
        />
      )}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading listings...</p>
            </div>
          </div>
        }
      >
        <ListingsClient initialProperties={properties} />
      </Suspense>
    </>
  );
}
