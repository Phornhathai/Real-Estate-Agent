import type { Metadata } from 'next';

import { Inter } from 'next/font/google';

import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_URL, SITE_BRAND, SITE_DESCRIPTION } from '@/lib/seo';
// @/ = alias ชี้ไปที่ root ของโปรเจกต์ (ตั้งค่าใน tsconfig.json)
//   หรือตั้ง alias เองใน webpack/vite config

// 🔤 Google Font Configuration — โหลด Inter font
const inter = Inter({
  subsets: ['latin'],        // โหลดเฉพาะ latin characters (เบากว่าโหลดทั้งหมด)
  variable: '--font-inter',  // สร้าง CSS variable: --font-inter ไว้ใช้ใน CSS/Tailwind
  display: 'swap',           // font-display: swap — แสดง fallback font ก่อน แล้วค่อยเปลี่ยน
});
//   font-family: 'Inter', sans-serif;

//
//   - ต้องใช้ react-helmet ในทุกหน้า:
//     <Helmet>
//       <title>Home Reality</title>
//       <meta name="description" content="..." />
//       <meta property="og:title" content="..." />
//     </Helmet>
//   - หรือ document.title = '...' ใน useEffect
//   - ต้อง install package เพิ่ม (react-helmet-async)
//
//   - แค่ export const metadata = { ... } จาก Server Component
//   - Next.js จะ generate <head> tags ให้อัตโนมัติ
//   - ไม่ต้อง install อะไรเพิ่ม — built-in
//   - metadata ใน layout.tsx = ค่า default สำหรับทุกหน้า
//   - แต่ละหน้าสามารถ override ด้วย metadata ของตัวเอง
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // title object — กำหนด title ของหน้าเว็บ
  // ใส่ชื่อโดเมน + Thailand เพื่อให้ Google จับคู่กับการค้นหา "homereality" ง่ายขึ้น
  title: {
    default: 'Home Reality | homereality.homes — อสังหาริมทรัพย์ บ้าน คอนโด เช่า/ขาย ในประเทศไทย',
    template: '%s | Home Reality (homereality.homes)',
  },

  // description — แสดงในผลค้นหา Google ใต้ title
  // ใส่ทั้งภาษาไทย/อังกฤษ + ชื่อแบรนด์/โดเมนซ้ำ เพื่อ rank คำว่า "homereality"
  description: SITE_DESCRIPTION,

  // keywords — คำค้นหาที่เกี่ยวข้อง (Google ไม่ค่อยใช้แล้ว แต่ Bing/DuckDuckGo ยังใช้)
  keywords: [
    'homereality',
    'home reality',
    'homereality.homes',
    'Home Reality Thailand',
    'อสังหาริมทรัพย์',
    'บ้านเช่า',
    'คอนโดเช่า',
    'บ้านขาย',
    'คอนโดขาย',
    'real estate Thailand',
    'homes for rent Bangkok',
    'condos for sale Thailand',
    'luxury villas Phuket',
    'property listings Thailand',
  ],

  // alternates.canonical — บอก Google ว่า URL หลักของแต่ละหน้าคืออันไหน
  // กัน duplicate-content และรวม ranking signals ไว้ที่ canonical
  alternates: {
    canonical: '/',
  },

  authors: [{ name: SITE_BRAND, url: SITE_URL }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,

  // Application name — บางครั้งใช้แสดงในผลค้นหา/share
  applicationName: SITE_BRAND,

  // 🔐 Search Engine Verification
  // ใส่ค่าที่ได้จาก Google Search Console / Bing Webmaster Tools
  // วิธีเอาค่า: GSC → Settings → Ownership verification → HTML tag → copy content="..."
  // ⚠️ ถ้ายังไม่ได้ verify Google Search Console — เว็บอาจไม่ขึ้นใน Google เลย
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? '',
    },
  },

  // Open Graph — ข้อมูลที่แสดงเมื่อ share ลิงก์ใน Facebook, LINE, Discord ฯลฯ
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: SITE_BRAND,
    title: 'Home Reality | homereality.homes — Find Your Dream Home in Thailand',
    description:
      'Discover premium properties for rent and sale across Thailand. Luxury villas, modern apartments, family homes, and condos in Bangkok, Chiang Mai, Phuket and more — only on homereality.homes.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Home Reality — Luxury Properties in Thailand',
      },
    ],
  },

  // Twitter Card — ข้อมูลที่แสดงเมื่อ share ลิงก์ใน Twitter/X
  twitter: {
    card: 'summary_large_image',
    title: 'Home Reality | homereality.homes',
    description:
      'Premium properties for rent and sale across Thailand — Bangkok, Chiang Mai, Phuket, Hua Hin.',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80'],
  },

  // Robots — บอก search engine ว่าให้ index หน้านี้ไหม
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

//
//   function App() {
//     return (
//       <BrowserRouter>        ← ต้องมี Router
//         <Navbar />
//         <Routes>             ← ต้อง define routes ด้วยมือ
//           <Route path="/" element={<Home />} />
//           <Route path="/listings" element={<Listings />} />
//           <Route path="/listings/:id" element={<Detail />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//         <Footer />
//       </BrowserRouter>
//     );
//   }
//   // <html> + <body> อยู่ใน public/index.html ไม่ได้อยู่ใน component
//
//   - layout.tsx = shell ที่ครอบทุกหน้า
//   - {children} = หน้าที่ตรงกับ URL จะถูกใส่ตรงนี้โดยอัตโนมัติ
//   - ไม่ต้องเขียน Routes — folder structure เป็น routes เอง
//   - <html> + <body> ต้องอยู่ใน Root Layout (บังคับ)
//   - เป็น Server Component — render บน server (ไม่ส่ง JS ไป client)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🏢 Organization JSON-LD — สำคัญที่สุดสำหรับการค้นหาด้วยชื่อแบรนด์ "homereality"
  // Google ใช้ข้อมูลนี้สร้าง Knowledge Panel + จับคู่แบรนด์กับโดเมน
  // alternateName ช่วยให้ Google รู้ว่า "Home Reality", "homereality", "homereality.homes"
  // คือสิ่งเดียวกัน → ไม่ว่า user พิมพ์แบบไหนก็ rank โดเมนเรา
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_BRAND,
    alternateName: ['homereality', 'homereality.homes', 'Home Reality Thailand'],
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    description: SITE_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '992 Phahonyothin Rd, Chom Phon, Chatuchak',
      addressLocality: 'Bangkok',
      postalCode: '10900',
      addressCountry: 'TH',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+66-63-939-9665',
      contactType: 'customer service',
      areaServed: 'TH',
      availableLanguage: ['Thai', 'English'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Thailand',
    },
  };

  // 🌐 WebSite JSON-LD — ทำให้ Google แสดง Sitelinks Searchbox ในผลค้นหา
  // เมื่อค้นหา "homereality" จะมีช่อง search ของเราแสดงใต้ผลลัพธ์โดยตรง
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_BRAND,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/listings?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['th-TH', 'en-US'],
  };

  return (
    <html lang="th" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
