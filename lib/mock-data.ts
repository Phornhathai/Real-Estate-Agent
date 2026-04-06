// =============================================================================
// 📁 lib/mock-data.ts — ข้อมูลจำลอง (Mock Data) แทน Database + API
// =============================================================================
//
// 🔑 ทำไมใช้ Mock Data แทน API?
// ─────────────────────────────────
// โปรเจกต์นี้ไม่มี backend (database, API server) — ข้อมูลทั้งหมดอยู่ในไฟล์นี้
// Server Components import ข้อมูลโดยตรง ไม่ต้อง fetch
//
// 🔑 React JS vs Next.js — วิธีดึงข้อมูลต่างกัน:
// ─────────────────────────────────────────────────
// React JS (Client-side):
//   - ข้อมูลอยู่ที่ backend (Express, Django, etc.)
//   - ต้อง fetch จาก API: useEffect(() => { fetch('/api/properties') }, [])
//   - ต้องจัดการ loading state, error state
//   - ข้อมูลถูกส่งเป็น JSON ผ่าน network → ช้ากว่า
//
// Next.js (Server Components):
//   - import { properties } from '@/lib/mock-data' ← อ่านโดยตรงใน Server Component
//   - ไม่ต้อง fetch, ไม่ต้อง useEffect, ไม่ต้อง loading state
//   - ข้อมูลพร้อมใช้ตอน render — เร็วกว่า, SEO ดีกว่า (HTML มีข้อมูลครบตั้งแต่แรก)
//   - ถ้ามี backend จริง: ก็แค่ await fetch() ใน Server Component ได้เลย (ไม่ต้อง useEffect)
//
// 🔑 ใครใช้ไฟล์นี้บ้าง?
//   - app/page.tsx          → getFeaturedProperties()  (หน้าแรก แสดง 4 properties)
//   - app/listings/[id]/page.tsx → getPropertyById(id) (หน้า detail)
//   - app/contact/page.tsx  → agents[]                 (แสดงรายชื่อ agents)
//   - components/ListingsClient.tsx → properties[]      (หน้า listings ทั้งหมด)
// =============================================================================

// =============================================================================
// 📝 TypeScript Type — PropertyType
// =============================================================================
// Union Type: กำหนดว่า type ของ property ได้แค่ 4 ค่าเท่านั้น
// ถ้าใส่ค่าอื่น เช่น 'Bungalow' → TypeScript จะ error ตอน compile
// 🔑 React JS ก็ใช้ TypeScript ได้เหมือนกัน — ไม่ใช่เรื่องเฉพาะ Next.js
export type PropertyType = 'House' | 'Villa' | 'Apartment' | 'Condo';

// =============================================================================
// 📝 TypeScript Interface — Agent (ข้อมูลตัวแทนอสังหาริมทรัพย์)
// =============================================================================
// Interface = กำหนดรูปร่าง (shape) ของ object
// ทุก Agent object ต้องมี field ครบตามนี้ ไม่งั้น TypeScript จะ error
//
// 🔑 ทำไมต้องใช้ Interface?
//   - Type safety: ป้องกันพิมพ์ผิด เช่น agent.nmae แทน agent.name → error ทันที
//   - Autocomplete: VS Code แนะนำ field ได้ เช่น พิมพ์ agent. แล้วเห็น .name, .email
//   - Documentation: อ่าน interface แล้วรู้ทันทีว่า Agent มี field อะไรบ้าง
export interface Agent {
  id: string;            // รหัส agent เช่น 'agent-1'
  name: string;          // ชื่อ เช่น 'Sarah Johnson'
  phone: string;         // เบอร์โทร
  email: string;         // อีเมล
  avatar: string;        // URL รูปโปรไฟล์ (จาก Unsplash)
  rating: number;        // คะแนน เช่น 4.9
  totalListings: number; // จำนวน listings ทั้งหมดที่ดูแล
  experience: number;    // ประสบการณ์ (ปี)
  bio: string;           // ประวัติย่อ
}

// =============================================================================
// 📝 TypeScript Interface — Property (ข้อมูลอสังหาริมทรัพย์)
// =============================================================================
// Interface หลักของโปรเจกต์ — ข้อมูลบ้าน/คอนโด/วิลล่าแต่ละหลัง
// ใช้ทั่วทั้งโปรเจกต์: PropertyCard, ListingsClient, FilterSidebar, Detail page
//
// 🔑 สังเกต: agent field เป็น type Agent (ไม่ใช่ string)
//   แปลว่าทุก Property มี Agent object ฝังอยู่ข้างใน (nested object)
//   ในโปรเจกต์จริงอาจเป็น agentId: string แล้ว join กับ agents table
export interface Property {
  id: string;            // รหัส property เช่น 'prop-1' — ใช้เป็น URL slug (/listings/prop-1)
  name: string;          // ชื่อ property เช่น 'Sunridge Modern Villa'
  type: PropertyType;    // ประเภท: 'House' | 'Villa' | 'Apartment' | 'Condo'
  location: string;      // ที่ตั้งแบบย่อ เช่น 'Beverly Hills, CA' (ใช้แสดงใน card)
  city: string;          // เมือง — ใช้ filter ตาม location
  state: string;         // รัฐ เช่น 'CA'
  address: string;       // ที่อยู่เต็ม — ใช้ในหน้า detail
  price: number;         // ราคา (ต่อเดือน/ปี) — ใช้ filter ตาม price range
  priceType: 'month' | 'year';  // หน่วยราคา — แสดงเป็น "/month" หรือ "/year"
  rating: number;        // คะแนน 1-5 — แสดงเป็นดาว
  reviewCount: number;   // จำนวนรีวิว
  bedrooms: number;      // จำนวนห้องนอน — ใช้ filter
  bathrooms: number;     // จำนวนห้องน้ำ
  area: number;          // พื้นที่ใช้สอย (sq ft)
  landArea: number;      // พื้นที่ดิน (sq ft) — 0 สำหรับ Apartment/Condo
  amenities: string[];   // สิ่งอำนวยความสะดวก เช่น ['Pool', 'Gym'] — ใช้ filter
  images: string[];      // array URL รูปภาพ — ส่งให้ ImageGallery component
  description: string;   // คำอธิบาย property — แสดงในหน้า detail
  agent: Agent;          // ตัวแทนที่ดูแล property นี้ (nested Agent object)
  featured: boolean;     // true = แสดงในหน้าแรก (featured properties)
  available: boolean;    // true = ยังว่างอยู่
  yearBuilt: number;     // ปีที่สร้าง
  parking: number;       // จำนวนที่จอดรถ
  coordinates: { lat: number; lng: number };  // พิกัด GPS — ใช้แสดงแผนที่ (ถ้ามี)
}

// =============================================================================
// 👥 ข้อมูลตัวแทน (Agents) — 3 คน
// =============================================================================
// 🔑 export const = export ออกไปให้ไฟล์อื่น import ได้
//   ใช้ใน: app/contact/page.tsx (แสดงรายชื่อ agents)
//   Agent[] = array ของ Agent objects (TypeScript ตรวจให้ว่าทุก object ตรงตาม interface)
export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Sarah Johnson',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@aumestate.com',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=200&auto=format&fit=crop&q=80',
    rating: 4.9,
    totalListings: 48,
    experience: 8,
    bio: 'Specializing in luxury properties and investment real estate with over 8 years of experience in the Southern California market. I help clients find their perfect home with personalized, white-glove service.',
  },
  {
    id: 'agent-2',
    name: 'Michael Chen',
    phone: '+1 (555) 234-5678',
    email: 'michael.chen@aumestate.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    rating: 4.8,
    totalListings: 36,
    experience: 6,
    bio: 'Expert in residential and commercial properties with a focus on urban living and investment opportunities. My data-driven approach ensures clients make informed decisions.',
  },
  {
    id: 'agent-3',
    name: 'Emily Rodriguez',
    phone: '+1 (555) 345-6789',
    email: 'emily.rodriguez@aumestate.com',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    rating: 4.7,
    totalListings: 29,
    experience: 5,
    bio: 'Passionate about helping families find their perfect home. With deep roots in the community, I offer unmatched local knowledge and genuine care for every client I serve.',
  },
];

// =============================================================================
// 🏠 ข้อมูล Properties — 12 รายการ
// =============================================================================
// 🔑 นี่คือ "database" ของโปรเจกต์ — ข้อมูลทั้งหมดอยู่ที่นี่
//
// 🔑 React JS vs Next.js — วิธีเข้าถึงข้อมูลต่างกัน:
//   React JS:  fetch('/api/properties') ใน useEffect → ต้องรอ loading
//   Next.js:   import { properties } from '@/lib/mock-data' → พร้อมใช้ทันที
//
// 🔑 สังเกต: agent field ใช้ agents[0], agents[1], agents[2]
//   = อ้างอิง object จาก array agents ด้านบน (ไม่ได้ copy ข้อมูลซ้ำ)
//   ในโปรเจกต์จริง database จะใช้ foreign key (agentId) แทน
//
// Property[] = TypeScript ตรวจให้ว่าทุก object ใน array ตรงตาม Property interface
export const properties: Property[] = [
  // ---------------------------------------------------------------------------
  // 🏠 Property 1 — Sunridge Modern Villa (featured: true)
  // ---------------------------------------------------------------------------
  {
    id: 'prop-1',
    name: 'Sunridge Modern Villa',
    type: 'Villa',
    location: 'Beverly Hills, CA',
    city: 'Beverly Hills',
    state: 'CA',
    address: '1234 Sunset Blvd, Beverly Hills, CA 90210',
    price: 8500,
    priceType: 'month',
    rating: 4.9,
    reviewCount: 47,
    bedrooms: 5,
    bathrooms: 4,
    area: 4200,
    landArea: 8500,
    amenities: ['Pool', 'Garden', 'Garage', 'Gym', 'Security', 'Smart Home'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'An exquisite modern villa nestled in the prestigious hills of Beverly Hills. This architectural masterpiece features floor-to-ceiling windows, an infinity pool overlooking the canyon, gourmet kitchen with top-of-the-line appliances, and a cinema room. The landscaped grounds include a meditation garden and outdoor entertainment area perfect for California living.',
    agent: agents[0],    // Sarah Johnson
    featured: true,      // ✅ แสดงในหน้าแรก
    available: true,
    yearBuilt: 2019,
    parking: 3,
    coordinates: { lat: 34.0736, lng: -118.4004 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 2 — Oakwood Family Home (featured: true)
  // ---------------------------------------------------------------------------
  {
    id: 'prop-2',
    name: 'Oakwood Family Home',
    type: 'House',
    location: 'Pasadena, CA',
    city: 'Pasadena',
    state: 'CA',
    address: '567 Oak Avenue, Pasadena, CA 91101',
    price: 4200,
    priceType: 'month',
    rating: 4.7,
    reviewCount: 31,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    landArea: 5500,
    amenities: ['Garden', 'Garage', 'Fireplace', 'Patio', 'Storage'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'A charming craftsman-style family home in the heart of Pasadena. Surrounded by mature oak trees, this property offers a warm and welcoming atmosphere with original hardwood floors, a renovated kitchen, and a spacious backyard ideal for entertaining. Located in a top-rated school district.',
    agent: agents[2],    // Emily Rodriguez
    featured: true,      // ✅ แสดงในหน้าแรก
    available: true,
    yearBuilt: 1965,
    parking: 2,
    coordinates: { lat: 34.1478, lng: -118.1445 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 3 — Downtown Luxury Loft (featured: true)
  // ---------------------------------------------------------------------------
  {
    id: 'prop-3',
    name: 'Downtown Luxury Loft',
    type: 'Apartment',
    location: 'Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    address: '888 Grand Ave, Unit 1204, Los Angeles, CA 90015',
    price: 3800,
    priceType: 'month',
    rating: 4.6,
    reviewCount: 23,
    bedrooms: 2,
    bathrooms: 2,
    area: 1450,
    landArea: 0,
    amenities: ['Gym', 'Rooftop', 'Concierge', 'Security', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'An ultra-modern loft on the 12th floor of the iconic Grand Tower. Featuring polished concrete floors, exposed brick, and panoramic city views. The open-plan living area is flooded with natural light. Building amenities include a rooftop pool, co-working lounge, and 24/7 concierge.',
    agent: agents[1],    // Michael Chen
    featured: true,      // ✅ แสดงในหน้าแรก
    available: true,
    yearBuilt: 2018,
    parking: 1,
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 4 — Marina Bay Condo (featured: true)
  // ---------------------------------------------------------------------------
  {
    id: 'prop-4',
    name: 'Marina Bay Condo',
    type: 'Condo',
    location: 'Santa Monica, CA',
    city: 'Santa Monica',
    state: 'CA',
    address: '200 Ocean Ave, Unit 5B, Santa Monica, CA 90402',
    price: 5200,
    priceType: 'month',
    rating: 4.8,
    reviewCount: 38,
    bedrooms: 3,
    bathrooms: 2,
    area: 1900,
    landArea: 0,
    amenities: ['Pool', 'Gym', 'Parking', 'Balcony', 'Security', 'Beach Access'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'A stunning oceanfront condo steps from the Santa Monica Pier. Enjoy spectacular sunset views from your private balcony. Recently renovated with high-end finishes, a chef\'s kitchen with quartz countertops, and spa-like bathrooms. Building features direct beach access and resort-style amenities.',
    agent: agents[0],    // Sarah Johnson
    featured: true,      // ✅ แสดงในหน้าแรก (รวม 4 featured properties สำหรับหน้าแรก)
    available: true,
    yearBuilt: 2015,
    parking: 2,
    coordinates: { lat: 34.0195, lng: -118.4912 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 5 — Malibu Beachfront Estate (featured: false)
  // ---------------------------------------------------------------------------
  {
    id: 'prop-5',
    name: 'Malibu Beachfront Estate',
    type: 'Villa',
    location: 'Malibu, CA',
    city: 'Malibu',
    state: 'CA',
    address: '31450 Pacific Coast Hwy, Malibu, CA 90265',
    price: 15000,
    priceType: 'month',
    rating: 5.0,
    reviewCount: 12,
    bedrooms: 6,
    bathrooms: 6,
    area: 6800,
    landArea: 12000,
    amenities: ['Pool', 'Beach Access', 'Gym', 'Home Theater', 'Smart Home', 'Wine Cellar', 'Garage'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'An iconic Malibu estate directly on the Pacific Ocean. Every room offers breathtaking ocean panoramas. Features a private beach access gate, infinity pool that blends into the sea, outdoor kitchen, and multiple terraces. This once-in-a-lifetime property offers the ultimate in California coastal luxury.',
    agent: agents[0],    // Sarah Johnson
    featured: false,
    available: true,
    yearBuilt: 2022,
    parking: 4,
    coordinates: { lat: 34.0259, lng: -118.7798 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 6 — Sunset Strip Penthouse
  // ---------------------------------------------------------------------------
  {
    id: 'prop-6',
    name: 'Sunset Strip Penthouse',
    type: 'Apartment',
    location: 'West Hollywood, CA',
    city: 'West Hollywood',
    state: 'CA',
    address: '9000 Sunset Blvd, PH1, West Hollywood, CA 90069',
    price: 9500,
    priceType: 'month',
    rating: 4.8,
    reviewCount: 19,
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    landArea: 0,
    amenities: ['Rooftop Deck', 'Pool', 'Gym', 'Valet', 'Concierge', 'Smart Home'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'The crown jewel of the Sunset Strip. This spectacular penthouse offers 360-degree views from its private rooftop terrace, including the Hollywood Hills, downtown LA, and the Pacific Ocean on clear days. Designed by a celebrated architect with bespoke finishes throughout.',
    agent: agents[1],    // Michael Chen
    featured: false,
    available: true,
    yearBuilt: 2020,
    parking: 2,
    coordinates: { lat: 34.0901, lng: -118.3857 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 7 — Craftsman Bungalow
  // ---------------------------------------------------------------------------
  {
    id: 'prop-7',
    name: 'Craftsman Bungalow',
    type: 'House',
    location: 'Pasadena, CA',
    city: 'Pasadena',
    state: 'CA',
    address: '1122 Orange Grove Blvd, Pasadena, CA 91105',
    price: 3500,
    priceType: 'month',
    rating: 4.5,
    reviewCount: 28,
    bedrooms: 3,
    bathrooms: 2,
    area: 1850,
    landArea: 6000,
    amenities: ['Garden', 'Porch', 'Fireplace', 'Storage', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'A beautifully preserved 1920s Craftsman bungalow in Pasadena\'s historic district. Original details including built-in bookshelves, wainscoting, and coved ceilings have been lovingly maintained. The wraparound porch and manicured garden make this a true California classic.',
    agent: agents[2],    // Emily Rodriguez
    featured: false,
    available: true,
    yearBuilt: 1924,
    parking: 1,
    coordinates: { lat: 34.1423, lng: -118.1608 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 8 — Modern Farmhouse Estate
  // ---------------------------------------------------------------------------
  {
    id: 'prop-8',
    name: 'Modern Farmhouse Estate',
    type: 'House',
    location: 'Calabasas, CA',
    city: 'Calabasas',
    state: 'CA',
    address: '4500 Las Virgenes Rd, Calabasas, CA 91302',
    price: 6800,
    priceType: 'month',
    rating: 4.7,
    reviewCount: 22,
    bedrooms: 5,
    bathrooms: 4,
    area: 4500,
    landArea: 15000,
    amenities: ['Pool', 'Garden', 'Garage', 'Gym', 'Barn', 'Orchard'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'A stunning modern farmhouse on nearly a third of an acre in gated Calabasas. This newly built estate blends contemporary design with rustic charm. The open floor plan features vaulted ceilings, white oak floors, a butler\'s pantry, and resort-style outdoor living with a pool and spa.',
    agent: agents[1],    // Michael Chen
    featured: false,
    available: true,
    yearBuilt: 2021,
    parking: 3,
    coordinates: { lat: 34.1575, lng: -118.6599 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 9 — Silver Lake Loft
  // ---------------------------------------------------------------------------
  {
    id: 'prop-9',
    name: 'Silver Lake Loft',
    type: 'Apartment',
    location: 'Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    address: '2720 Rowena Ave, Unit 8, Los Angeles, CA 90039',
    price: 3200,
    priceType: 'month',
    rating: 4.4,
    reviewCount: 16,
    bedrooms: 1,
    bathrooms: 1,
    area: 950,
    landArea: 0,
    amenities: ['Rooftop', 'Bike Storage', 'Pets Allowed', 'Laundry'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'A chic creative loft in the vibrant Silver Lake neighborhood. Industrial-modern design with polished concrete floors, high ceilings, and massive warehouse windows. Steps from the reservoir, trendy cafes, and boutiques. The rooftop terrace offers stunning views of the Hollywood Hills.',
    agent: agents[2],    // Emily Rodriguez
    featured: false,
    available: true,
    yearBuilt: 2017,
    parking: 1,
    coordinates: { lat: 34.0879, lng: -118.2717 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 10 — Hillcrest Tudor Manor
  // ---------------------------------------------------------------------------
  {
    id: 'prop-10',
    name: 'Hillcrest Tudor Manor',
    type: 'House',
    location: 'Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    address: '6789 Hillcrest Dr, Los Angeles, CA 90068',
    price: 5800,
    priceType: 'month',
    rating: 4.6,
    reviewCount: 34,
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    landArea: 7200,
    amenities: ['Garden', 'Garage', 'Fireplace', 'Library', 'Wine Cellar'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'A magnificent English Tudor manor perched in the Hollywood Hills. This stately home features dark-beamed ceilings, leaded glass windows, and stone fireplaces that evoke old-world grandeur. The terraced gardens offer privacy and serenity just minutes from the Sunset Strip.',
    agent: agents[0],    // Sarah Johnson
    featured: false,
    available: true,
    yearBuilt: 1938,
    parking: 2,
    coordinates: { lat: 34.1016, lng: -118.3337 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 11 — Palm Springs Desert Villa
  // ---------------------------------------------------------------------------
  {
    id: 'prop-11',
    name: 'Palm Springs Desert Villa',
    type: 'Villa',
    location: 'Palm Springs, CA',
    city: 'Palm Springs',
    state: 'CA',
    address: '1000 Tahquitz Canyon Way, Palm Springs, CA 92262',
    price: 4500,
    priceType: 'month',
    rating: 4.8,
    reviewCount: 41,
    bedrooms: 4,
    bathrooms: 3,
    area: 2600,
    landArea: 9000,
    amenities: ['Pool', 'Hot Tub', 'Garden', 'Garage', 'Mountain Views', 'BBQ'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'Classic mid-century modern architecture at its finest in Palm Springs. This iconic villa features walls of glass, terrazzo floors, and a dramatic saltwater pool set against the stunning San Jacinto Mountains. Fully furnished with authentic period pieces and all modern conveniences.',
    agent: agents[1],    // Michael Chen
    featured: false,
    available: true,
    yearBuilt: 1962,
    parking: 2,
    coordinates: { lat: 33.8303, lng: -116.5453 },
  },
  // ---------------------------------------------------------------------------
  // 🏠 Property 12 — Pacific Heights Condo
  // ---------------------------------------------------------------------------
  {
    id: 'prop-12',
    name: 'Pacific Heights Condo',
    type: 'Condo',
    location: 'San Francisco, CA',
    city: 'San Francisco',
    state: 'CA',
    address: '2200 Broadway St, Unit 401, San Francisco, CA 94115',
    price: 6200,
    priceType: 'month',
    rating: 4.7,
    reviewCount: 27,
    bedrooms: 2,
    bathrooms: 2,
    area: 1600,
    landArea: 0,
    amenities: ['Gym', 'Doorman', 'Balcony', 'Parking', 'Storage', 'Views'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'An elegant Pacific Heights condo with sweeping views of the Bay and Golden Gate Bridge. This stunning residence features floor-to-ceiling windows, Carrara marble bathrooms, and a chef\'s kitchen. Located in San Francisco\'s most prestigious neighborhood, just steps from boutique shops and acclaimed restaurants.',
    agent: agents[2],    // Emily Rodriguez
    featured: false,
    available: true,
    yearBuilt: 2014,
    parking: 1,
    coordinates: { lat: 37.7952, lng: -122.4338 },
  },
];

// =============================================================================
// 🔍 Helper Functions — ฟังก์ชันช่วยดึงข้อมูล
// =============================================================================
//
// 🔑 React JS vs Next.js — ทำไมใช้ import แทน API?
// ─────────────────────────────────────────────────────
// React JS (Client-only):
//   // ต้อง fetch จาก API
//   const [property, setProperty] = useState(null);
//   useEffect(() => {
//     fetch(`/api/properties/${id}`)
//       .then(res => res.json())
//       .then(data => setProperty(data));
//   }, [id]);
//
// Next.js (Server Component):
//   // import ตรงๆ — ไม่ต้อง fetch, ไม่ต้อง useEffect
//   import { getPropertyById } from '@/lib/mock-data';
//   const property = getPropertyById(id);  // พร้อมใช้ทันที!
//
// ✅ ข้อดีของ Next.js approach:
//   1. ไม่ต้อง loading state — ข้อมูลพร้อมตอน render
//   2. SEO ดี — HTML มีข้อมูลครบ (ไม่ต้องรอ JavaScript load)
//   3. เร็วกว่า — ไม่มี network round-trip
//   4. Code สั้นกว่า — ไม่ต้อง useState + useEffect + loading/error handling
// =============================================================================

// -----------------------------------------------------------------------------
// 🔍 getPropertyById — หา property ตาม id
// -----------------------------------------------------------------------------
// ใช้ใน: app/listings/[id]/page.tsx (หน้า detail ของ property)
// return: Property object ถ้าเจอ, undefined ถ้าไม่เจอ (→ แสดง 404)
//
// 🔑 Array.find() = หา element แรกที่ตรงเงื่อนไข → คืน element นั้น
//   ถ้าไม่เจอ → คืน undefined
//   เทียบ SQL: SELECT * FROM properties WHERE id = ? LIMIT 1
export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

// -----------------------------------------------------------------------------
// ⭐ getFeaturedProperties — ดึง properties ที่ featured: true
// -----------------------------------------------------------------------------
// ใช้ใน: app/page.tsx (หน้าแรก — แสดง featured properties 4 รายการ)
// return: array ของ Property objects ที่ featured === true
//
// 🔑 Array.filter() = กรอง array เอาเฉพาะ element ที่ตรงเงื่อนไข
//   คืน array ใหม่ (ไม่แก้ array เดิม)
//   เทียบ SQL: SELECT * FROM properties WHERE featured = true
export function getFeaturedProperties(): Property[] {
  return properties.filter((p) => p.featured);
}

// =============================================================================
// 🏷️ ALL_AMENITIES — รายชื่อ amenities ทั้งหมดสำหรับ filter
// =============================================================================
// ใช้ใน: components/FilterSidebar.tsx (แสดง checkbox ให้ user เลือก filter)
// เป็น array ของ string — ใช้ .map() สร้าง checkbox ใน UI
//
// 🔑 แยกออกมาเป็น constant เพราะ:
//   1. FilterSidebar ใช้แสดง UI (checkbox)
//   2. ListingsClient ใช้ filter properties ตาม amenities ที่เลือก
//   3. ถ้าเพิ่ม amenity ใหม่ → แก้ที่เดียว ใช้ได้ทุกที่
export const ALL_AMENITIES = [
  'Pool',
  'Garden',
  'Garage',
  'Gym',
  'Security',
  'Smart Home',
  'Balcony',
  'Fireplace',
  'Rooftop',
  'Concierge',
  'Beach Access',
  'Parking',
];
