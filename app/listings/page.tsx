import type { Metadata } from 'next';

import { Suspense } from 'react';

import ListingsClient from '@/components/ListingsClient';
import { prisma } from '@/lib/prisma';
import { toProperty } from '@/lib/transform';
import { SITE_URL } from '@/lib/seo';

// Client Component ที่จัดการทุกอย่างของหน้า listings:
//   - อ่าน URL search params (?location=, ?type=, ?sort=)
//   - แสดง FilterSidebar + PropertyCard grid
//   - จัดการ filter + sort logic
//   ซึ่งต้องเป็น Client Component — ไม่ใส่ใน page.tsx ที่เป็น Server Component

//   - title: "Property Listings..." จะถูกใส่ใน template: "%s | Home Reality"
//   → ผลลัพธ์: "Property Listings — Browse Homes, Villas & Apartments | Home Reality"
//
export const metadata: Metadata = {
  title: 'Property Listings — Browse Homes, Villas & Apartments in Thailand',
  description:
    'Browse all properties on Home Reality — houses, villas, apartments, and condos for rent and sale across Thailand. Filter by location (Bangkok, Chiang Mai, Phuket, Hua Hin), price, type, and amenities.',
  alternates: { canonical: '/listings' },
  openGraph: {
    title: 'Property Listings | Home Reality (homereality.homes)',
    description:
      'Browse premium properties — houses, villas, apartments, and condos across Thailand.',
    url: `${SITE_URL}/listings`,
  },
};

//   - หน้าที่ของ page.tsx คือ "entry point" ของ route /listings
//   - เป็น Server Component → export metadata ได้ (Client Component ทำไม่ได้)
//   - Logic ทั้งหมดอยู่ใน ListingsClient (Client Component)
//
//   function ListingsPage() {
//     const [searchParams] = useSearchParams();
//     const [filters, setFilters] = useState({...});
//     // ... filter logic ทั้งหมดอยู่ในนี้
//     return <div>...</div>;
//   }
export default async function ListingsPage() {
  const prismaProperties = await prisma.property.findMany({
    include: { images: { orderBy: { order: 'asc' } }, agent: true },
    orderBy: { createdAt: 'desc' },
  });
  const properties = prismaProperties.map(toProperty);

  return (
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
  );
}
