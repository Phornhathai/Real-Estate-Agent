import type { Metadata } from 'next';

import { Inter } from 'next/font/google';

import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  metadataBase: new URL('https://www.aumestatestudio.com'),

  // title object — กำหนด title ของหน้าเว็บ
  title: {
    default: 'Home Reality — Find Your Dream Home',  // title เมื่อไม่มีหน้าไหน override
    template: '%s | Home Reality',  // template สำหรับหน้าอื่น: "Listings | Home Reality"
  },

  // description — แสดงในผลค้นหา Google ใต้ title
  description:
    'Discover premium properties for rent and sale. Browse houses, villas, apartments, and condos with Home Reality — your trusted real estate partner in Thailand.',

  // keywords — คำค้นหาที่เกี่ยวข้อง (Google ไม่ค่อยใช้แล้ว แต่ search engines อื่นยังใช้)
  keywords: ['real estate', 'homes for rent', 'luxury properties', 'Thailand homes', 'buy house', 'property listings'],

  authors: [{ name: 'Home Reality' }],
  creator: 'Home Reality',

  // Open Graph — ข้อมูลที่แสดงเมื่อ share ลิงก์ใน Facebook, LINE, Discord ฯลฯ
  openGraph: {
    type: 'website',                                    // ประเภทเนื้อหา
    locale: 'en_US',                                    // ภาษา
    url: 'https://www.aumestatestudio.com',             // URL ของเว็บ
    siteName: 'Home Reality',                       // ชื่อเว็บ
    title: 'Home Reality — Find Your Dream Home',   // title ที่แสดงตอน share
    description:                                         // description ที่แสดงตอน share
      'Discover premium properties for rent and sale across Thailand. Luxury villas, modern apartments, family homes, and more.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
        width: 1200,    // ขนาดรูปที่ Facebook แนะนำ = 1200x630
        height: 630,
        alt: 'Home Reality — Luxury Properties',  // alt text สำหรับ accessibility
      },
    ],
  },

  // Twitter Card — ข้อมูลที่แสดงเมื่อ share ลิงก์ใน Twitter/X
  twitter: {
    card: 'summary_large_image',  // แสดงรูปใหญ่ (แทน summary ที่รูปเล็ก)
    title: 'Home Reality — Find Your Dream Home',
    description: 'Discover premium properties for rent and sale across Thailand.',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80'],
  },

  // Robots — บอก search engine ว่าให้ index หน้านี้ไหม
  robots: {
    index: true,      // ให้ Google index หน้านี้
    follow: true,     // ให้ Google ตาม link ในหน้านี้ไปหน้าอื่น
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,      // -1 = ไม่จำกัดขนาด video preview
      'max-image-preview': 'large',  // ให้ Google แสดงรูป preview ขนาดใหญ่
      'max-snippet': -1,             // -1 = ไม่จำกัดความยาว text snippet
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
  children: React.ReactNode;  // children = เนื้อหาของหน้าปัจจุบัน (page.tsx)
}) {
  return (
    // className={inter.variable} = ใส่ CSS variable --font-inter ให้ใช้ได้ทั้งเว็บ
    <html lang="en" className={inter.variable}>
      {/* 🔑 <body> ต้องอยู่ใน Root Layout เช่นกัน */}
      {/* min-h-screen = ความสูงขั้นต่ำเต็มจอ */}
      {/* flex flex-col = จัด layout แนวตั้ง (Navbar → content → Footer) */}
      {/* font-sans = ใช้ font-family ที่ตั้งไว้ใน Tailwind v4 (globals.css) */}
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans">
        {/* Navbar — แสดงทุกหน้า (Client Component เพราะมี hamburger menu + usePathname) */}
        <Navbar />

        {/* main flex-1 = ขยายเต็มพื้นที่ว่าง ดัน Footer ลงล่างสุด */}
        {/* {children} = หน้าที่ตรงกับ URL ปัจจุบัน */}
        {/* 🔑 React JS: ตรงนี้จะเป็น <Routes>...</Routes> แทน */}
        <main className="flex-1">{children}</main>

        {/* Footer — แสดงทุกหน้า (Server Component เพราะเป็น static content) */}
        <Footer />
      </body>
    </html>
  );
}
