// =============================================================================
// 📁 app/page.tsx — Home Page (หน้าแรกของเว็บไซต์)
// =============================================================================
//
// 🔑 React JS vs Next.js — Home Page:
// ─────────────────────────────────────────────
// React JS (แบบเดิม):
//   - หน้าแรกเป็น component ธรรมดา render บน client:
//     function HomePage() {
//       const [featured, setFeatured] = useState([]);
//       useEffect(() => {
//         fetch('/api/properties?featured=true')
//           .then(res => res.json())
//           .then(data => setFeatured(data));
//       }, []);
//       return <div>...</div>;
//     }
//   - ต้อง fetch data ด้วย useEffect (client-side)
//   - User เห็นหน้าว่างก่อน → แล้วค่อยเห็น data (loading flash)
//   - SEO ไม่ดี เพราะ Google เห็น HTML เปล่าก่อน JS render
//
// Next.js App Router:
//   - app/page.tsx = Server Component → render บน server
//   - ดึง data ได้ตรงๆ (import function แล้วเรียก) ไม่ต้อง useEffect
//   - HTML ถูก render ครบก่อนส่งให้ browser → SEO ดี, ไม่มี loading flash
//   - export metadata ได้ → ไม่ต้อง react-helmet
//
// 🔑 ไฟล์นี้ทำหน้าที่:
//   1. แสดง Hero Section พร้อม SearchBar
//   2. แสดง Stats Bar (จำนวน properties, agents, cities, satisfaction)
//   3. แสดง Featured Properties (4 ตัวที่ featured=true)
//   4. แสดง Browse by Location (6 locations)
//   5. แสดง Why Choose Us features
//   6. แสดง CTA (Call-to-Action) Section
//
// 🔑 Data Flow:
//   getFeaturedProperties() → return properties ที่ featured=true
//   → ถูกเรียกใน Server Component → HTML render ครบบน server
//   → ส่ง HTML สำเร็จรูปให้ browser → ไม่มี loading state
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================
import type { Metadata } from 'next';
// Type สำหรับ metadata — กำหนด title, description, OG สำหรับหน้าแรก
// 🔑 React JS: ใช้ react-helmet หรือ document.title ใน useEffect

import Image from 'next/image';
// 🔑 next/image vs React JS <img>:
//   React JS: <img src="..." alt="..." /> — ไม่มี optimization
//   Next.js:  <Image src="..." alt="..." width={} height={} />
//     - Lazy loading อัตโนมัติ (โหลดรูปเมื่อ scroll ถึง)
//     - Responsive images (srcset) อัตโนมัติ
//     - Convert เป็น WebP/AVIF อัตโนมัติ (ขนาดเล็กกว่า)
//     - ป้องกัน layout shift (ต้องระบุ width/height หรือ fill)

import Link from 'next/link';
// 🔑 Next.js Link vs React JS:
//   React JS: import { Link } from 'react-router-dom' → <Link to="/listings">
//   Next.js:  import Link from 'next/link'             → <Link href="/listings">
//     - Next.js Link มี prefetching: โหลดหน้าถัดไปล่วงหน้าเมื่อ link อยู่ใน viewport
//     - เปลี่ยนหน้าเร็วมากเพราะ data ถูก prefetch แล้ว

import SearchBar from '@/components/SearchBar';
// Client Component — มี dropdown, useRouter สำหรับ navigate ไป /listings?location=...
// 🔑 ต้องเป็น Client Component เพราะใช้ useState (dropdown state) + useRouter (navigation)

import PropertyCard from '@/components/PropertyCard';
// Client Component — แสดงข้อมูล property พร้อม bookmark toggle
// 🔑 ต้องเป็น Client Component เพราะมี onClick (bookmark toggle)

import { getFeaturedProperties } from '@/lib/mock-data';
// ฟังก์ชัน helper จาก mock data — return properties ที่ featured=true
// 🔑 เทียบกับ React JS:
//   React JS: ต้อง fetch('/api/featured') ใน useEffect แล้ว setState
//   Next.js:  import แล้วเรียกตรงๆ ใน Server Component (ไม่ต้อง useEffect)

// =============================================================================
// 🏷️ Metadata — SEO สำหรับหน้าแรก
// =============================================================================
// 🔑 metadata ที่ export จากหน้านี้จะ override metadata ใน layout.tsx
//   เฉพาะ fields ที่กำหนด (title, description, openGraph)
//   fields ที่ไม่ได้กำหนด (เช่น twitter, robots) จะใช้ค่าจาก layout.tsx
//
// React JS: ต้องใส่ <Helmet> ใน component:
//   <Helmet>
//     <title>AumEstate Studio — Find Your Dream Home</title>
//     <meta name="description" content="..." />
//     <meta property="og:title" content="..." />
//   </Helmet>
export const metadata: Metadata = {
  title: 'AumEstate Studio — Find Your Dream Home',  // title ของหน้าแรก
  description:
    'Discover premium properties for rent and sale across California. Browse luxury villas, modern apartments, family homes, and condos with AumEstate Studio.',
  openGraph: {
    title: 'AumEstate Studio — Find Your Dream Home',
    description: 'Discover premium properties for rent and sale across California.',
    url: 'https://www.aumestatestudio.com',
  },
};

// =============================================================================
// 📊 Static Data — ข้อมูลที่ไม่เปลี่ยน (constants)
// =============================================================================

// ---------------------------------------------------------------------------
// 📈 Stats — ตัวเลขสถิติที่แสดงใน Stats Bar
// ---------------------------------------------------------------------------
const STATS = [
  { value: '2,400+', label: 'Properties Listed' },
  { value: '150+', label: 'Expert Agents' },
  { value: '30+', label: 'Cities Covered' },
  { value: '98%', label: 'Client Satisfaction' },
];

// ---------------------------------------------------------------------------
// ✨ Features — จุดเด่นที่แสดงใน "Why Choose Us" section
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Verified Listings',
    description: 'Every property is manually verified by our team for accuracy and legitimacy.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Expert Agents',
    description: 'Connect directly with licensed agents who know the local market inside and out.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Transactions',
    description: 'Your personal data and financial information are always protected.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Flexible Payments',
    description: 'Multiple payment options and transparent pricing with no hidden fees.',
  },
];

// ---------------------------------------------------------------------------
// 📍 Locations — ข้อมูล location สำหรับ "Browse by Location" section
// ---------------------------------------------------------------------------
const LOCATIONS = [
  { name: 'Beverly Hills', count: 24, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&auto=format&fit=crop&q=80' },
  { name: 'Santa Monica', count: 18, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=80' },
  { name: 'Malibu', count: 12, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop&q=80' },
  { name: 'Los Angeles', count: 86, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&auto=format&fit=crop&q=80' },
  { name: 'Pasadena', count: 31, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&auto=format&fit=crop&q=80' },
  { name: 'Palm Springs', count: 15, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80' },
];

// =============================================================================
// 🏗️ HomePage Component — Server Component (หน้าแรก)
// =============================================================================
// 🔑 นี่เป็น Server Component (ไม่มี 'use client'):
//   - render บน server → HTML สำเร็จรูปส่งให้ browser
//   - เรียก getFeaturedProperties() ตรงๆ (ไม่ต้อง useEffect + useState)
//   - ไม่ส่ง JavaScript ของ component นี้ไป client (เบากว่า)
//   - แต่ SearchBar + PropertyCard เป็น Client Components ที่ hydrate บน client
//
// 🔑 React JS: ต้อง fetch data ด้วย useEffect:
//   const [featured, setFeatured] = useState([]);
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     getFeaturedProperties().then(data => {
//       setFeatured(data);
//       setLoading(false);
//     });
//   }, []);
//   if (loading) return <Spinner />;
export default function HomePage() {
  // ---------------------------------------------------------------------------
  // 📦 Data Fetching — ดึงข้อมูล featured properties
  // ---------------------------------------------------------------------------
  // 🔑 ใน Server Component เรียก function ได้ตรงๆ — ไม่ต้อง useEffect!
  //   เพราะ code นี้ run บน server ตอน render → data พร้อมทันที
  //   React JS: ต้อง useEffect + useState + loading state
  const featured = getFeaturedProperties();

  return (
    <>
      {/* ================================================================= */}
      {/* 🦸 Hero Section — ส่วนบนสุดของหน้าแรก                            */}
      {/* ================================================================= */}
      <section
        className="relative min-h-[580px] flex items-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 overflow-hidden"
        aria-label="Hero section"  // Accessibility: บอก screen reader ว่าส่วนนี้คืออะไร
      >
        {/* Background pattern — ลายจุดเพิ่มความสวยงาม */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Background property image — รูปบ้านเป็นพื้นหลัง */}
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          {/* 🔑 next/image: ใช้ fill + sizes แทน width/height สำหรับ background image */}
          {/*   fill = เต็ม parent container, sizes = บอก browser ว่าภาพกว้างเท่าไหร่ */}
          {/*   priority = โหลดรูปนี้ก่อน (above the fold) ไม่ lazy load */}
          <Image
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&auto=format&fit=crop&q=60"
            alt=""       // alt="" เพราะเป็น decorative image (ไม่ใช่เนื้อหาสำคัญ)
            fill         // เต็มพื้นที่ parent
            priority     // โหลดทันที ไม่ lazy load (เพราะอยู่ above the fold)
            sizes="100vw"  // รูปกว้างเต็มจอ
            className="object-cover"  // crop ให้เต็มกรอบ
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow — badge เล็กๆ เหนือ heading */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
              2,400+ properties available now
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Find Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                Dream Home
              </span>{' '}
              in California
            </h1>
            <p className="text-lg text-blue-100/80 mb-10 max-w-xl mx-auto">
              Discover premium properties across California&apos;s most sought-after
              neighborhoods. Your perfect home is just a search away.
            </p>

            {/* SearchBar — Client Component (มี useState + useRouter) */}
            {/* 🔑 Server Component สามารถ render Client Component เป็น children ได้ */}
            {/*   Next.js จะ hydrate เฉพาะ Client Components บน client */}
            <SearchBar />

            {/* Popular Searches — ลิงก์ไปหน้า listings พร้อม filter */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-white/50">Popular:</span>
              {['Beverly Hills', 'Santa Monica', 'Malibu', 'Palm Springs'].map((loc) => (
                <Link
                  key={loc}
                  // 🔑 Next.js Link: ใช้ href (ไม่ใช่ to เหมือน react-router)
                  // encodeURIComponent แปลงช่องว่างเป็น %20 สำหรับ URL
                  href={`/listings?location=${encodeURIComponent(loc)}`}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs rounded-full border border-white/10 transition-colors"
                >
                  {loc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 📊 Stats Bar — แถบตัวเลขสถิติ                                     */}
      {/* ================================================================= */}
      <section className="bg-white border-b border-gray-100" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* divide-x = เส้นแบ่งแนวตั้งระหว่าง columns (เฉพาะ md ขึ้นไป) */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-gray-100">
            {STATS.map((stat) => (
              <div key={stat.label} className="py-6 px-8 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* ⭐ Featured Properties — property เด่น 4 ตัว                      */}
      {/* ================================================================= */}
      <section className="py-16 lg:py-20 bg-gray-50" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-600 font-medium text-sm mb-2">✦ Hand-picked</p>
              <h2 id="featured-heading" className="text-3xl font-bold text-gray-900">
                Featured Properties
              </h2>
              <p className="text-gray-500 mt-2">
                Expertly curated listings for discerning buyers and renters
              </p>
            </div>
            {/* 🔑 Next.js Link มี prefetching — hover แล้วจะโหลดหน้า /listings ล่วงหน้า */}
            <Link
              href="/listings"
              className="hidden sm:inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              View all listings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Property Cards Grid */}
          {/* 🔑 featured ถูกดึงมาตอน server render — ไม่มี loading state */}
          {/*   React JS: ต้อง { loading ? <Spinner /> : featured.map(...) } */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((property) => (
              // PropertyCard = Client Component (มี bookmark toggle)
              // 🔑 Server Component ส่ง data (property) ให้ Client Component ผ่าน props
              <PropertyCard key={property.id} property={property} featured />
            ))}
          </div>

          {/* Mobile-only CTA button (ซ่อนบน desktop เพราะมี link ด้านบนแล้ว) */}
          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              View All Listings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 📍 Browse by Location — สำรวจตามทำเล                             */}
      {/* ================================================================= */}
      <section className="py-16 lg:py-20 bg-white" aria-labelledby="locations-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-blue-600 font-medium text-sm mb-2">✦ Explore</p>
            <h2 id="locations-heading" className="text-3xl font-bold text-gray-900">
              Browse by Location
            </h2>
            <p className="text-gray-500 mt-2">
              Explore properties in California&apos;s most desirable neighborhoods
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LOCATIONS.map((location) => (
              <Link
                key={location.name}
                // กดแล้วไปหน้า listings พร้อม filter location
                href={`/listings?location=${encodeURIComponent(location.name)}`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                {/* 🔑 next/image ใช้ fill mode สำหรับ responsive image */}
                {/* sizes บอก browser ว่าภาพกว้างเท่าไหร่ในแต่ละ breakpoint */}
                <Image
                  src={location.image}
                  alt={`Properties in ${location.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Gradient overlay — ให้ text อ่านง่ายบนรูป */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm leading-tight">{location.name}</p>
                  <p className="text-white/70 text-xs">{location.count} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 🏆 Why Choose Us — จุดเด่นของเว็บ                                */}
      {/* ================================================================= */}
      <section className="py-16 lg:py-20 bg-gray-50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium text-sm mb-2">✦ Why Us</p>
            <h2 id="features-heading" className="text-3xl font-bold text-gray-900">
              The AumEstate Advantage
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              We combine technology with local expertise to deliver an unmatched property
              search experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 📣 CTA Section — กระตุ้นให้ user ดู listings หรือติดต่อ agent     */}
      {/* ================================================================= */}
      <section
        className="relative py-20 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden"
        aria-labelledby="cta-heading"
      >
        {/* Background dot pattern */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Browse thousands of properties or talk to one of our expert agents today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Contact an Agent
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
