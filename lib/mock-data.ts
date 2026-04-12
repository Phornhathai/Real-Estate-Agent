//
// โปรเจกต์นี้ไม่มี backend (database, API server) — ข้อมูลทั้งหมดอยู่ในไฟล์นี้
// Server Components import ข้อมูลโดยตรง ไม่ต้อง fetch
//
//   - ข้อมูลอยู่ที่ backend (Express, Django, etc.)
//   - ต้อง fetch จาก API: useEffect(() => { fetch('/api/properties') }, [])
//   - ต้องจัดการ loading state, error state
//   - ข้อมูลถูกส่งเป็น JSON ผ่าน network → ช้ากว่า
//
//   - import { properties } from '@/lib/mock-data' ← อ่านโดยตรงใน Server Component
//   - ไม่ต้อง fetch, ไม่ต้อง useEffect, ไม่ต้อง loading state
//   - ข้อมูลพร้อมใช้ตอน render — เร็วกว่า, SEO ดีกว่า (HTML มีข้อมูลครบตั้งแต่แรก)
//   - ถ้ามี backend จริง: ก็แค่ await fetch() ใน Server Component ได้เลย (ไม่ต้อง useEffect)
//
//   - app/page.tsx          → getFeaturedProperties()  (หน้าแรก แสดง 4 properties)
//   - app/listings/[id]/page.tsx → getPropertyById(id) (หน้า detail)
//   - app/contact/page.tsx  → agents[]                 (แสดงรายชื่อ agents)
//   - components/ListingsClient.tsx → properties[]      (หน้า listings ทั้งหมด)

// Union Type: กำหนดว่า type ของ property ได้แค่ 4 ค่าเท่านั้น
// ถ้าใส่ค่าอื่น เช่น 'Bungalow' → TypeScript จะ error ตอน compile
export type PropertyType = 'House' | 'Villa' | 'Apartment' | 'Condo';

// Interface = กำหนดรูปร่าง (shape) ของ object
// ทุก Agent object ต้องมี field ครบตามนี้ ไม่งั้น TypeScript จะ error
//
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

// Interface หลักของโปรเจกต์ — ข้อมูลบ้าน/คอนโด/วิลล่าแต่ละหลัง
// ใช้ทั่วทั้งโปรเจกต์: PropertyCard, ListingsClient, FilterSidebar, Detail page
//
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

// 👥 ข้อมูลตัวแทน (Agents) — 3 คน
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

//
//
//   = อ้างอิง object จาก array agents ด้านบน (ไม่ได้ copy ข้อมูลซ้ำ)
//   ในโปรเจกต์จริง database จะใช้ foreign key (agentId) แทน
//
// Property[] = TypeScript ตรวจให้ว่าทุก object ใน array ตรงตาม Property interface
export const properties: Property[] = [
  {
    id: 'prop-1',
    name: 'Sukhumvit Modern Villa',
    type: 'Villa',
    location: 'สุขุมวิท, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '123 ซอยสุขุมวิท 31 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    price: 120000,
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
      'วิลล่าสมัยใหม่สุดหรูใจกลางย่านสุขุมวิท ออกแบบโดยสถาปนิกรางวัลระดับชาติ ตกแต่งด้วยวัสดุนำเข้าคุณภาพสูง พร้อมสระว่ายน้ำอินฟินิตี้ ห้องออกกำลังกายส่วนตัว และระบบสมาร์ทโฮมครบครัน ทำเลใกล้ BTS สถานีพร้อมพงษ์ เดินทางสะดวกทุกทิศทาง',
    agent: agents[0],
    featured: true,
    available: true,
    yearBuilt: 2019,
    parking: 3,
    coordinates: { lat: 13.7278, lng: 100.5694 },
  },
  {
    id: 'prop-2',
    name: 'Nimman Family Home',
    type: 'House',
    location: 'นิมมานเหมินทร์, เชียงใหม่',
    city: 'เชียงใหม่',
    state: 'เชียงใหม่',
    address: '88 ถนนนิมมานเหมินทร์ ตำบลสุเทพ อำเภอเมือง เชียงใหม่ 50200',
    price: 45000,
    priceType: 'month',
    rating: 4.7,
    reviewCount: 31,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    landArea: 5500,
    amenities: ['Garden', 'Garage', 'Patio', 'Storage', 'Smart Home'],
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'บ้านเดี่ยวสไตล์ล้านนาร่วมสมัยในย่านนิมมานเหมินทร์ที่มีชีวิตชีวา ล้อมรอบด้วยต้นไม้ร่มรื่น พื้นไม้สักแท้ ครัวใหม่พร้อมอุปกรณ์ครบครัน และสวนหลังบ้านขนาดใหญ่เหมาะสำหรับครอบครัว ใกล้ Maya Mall และมหาวิทยาลัยเชียงใหม่',
    agent: agents[2],
    featured: true,
    available: true,
    yearBuilt: 2010,
    parking: 2,
    coordinates: { lat: 18.8034, lng: 98.9673 },
  },
  {
    id: 'prop-3',
    name: 'Silom Luxury Apartment',
    type: 'Apartment',
    location: 'สีลม, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '999 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    price: 65000,
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
      'อพาร์ตเมนต์หรูชั้น 18 ในย่านธุรกิจสีลม วิวเมืองแบบพาโนราม่า ตกแต่งด้วยวัสดุพรีเมียม พื้นลอฟต์คอนกรีตขัดมัน ทางเข้าส่วนตัว พร้อมสระว่ายน้ำบนดาดฟ้าและห้องทำงาน co-working ใกล้ BTS ช่องนนทรี',
    agent: agents[1],
    featured: true,
    available: true,
    yearBuilt: 2018,
    parking: 1,
    coordinates: { lat: 13.7234, lng: 100.5235 },
  },
  {
    id: 'prop-4',
    name: 'Thonglor Sky Condo',
    type: 'Condo',
    location: 'ทองหล่อ, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '55 ซอยทองหล่อ 13 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    price: 85000,
    priceType: 'month',
    rating: 4.8,
    reviewCount: 38,
    bedrooms: 3,
    bathrooms: 2,
    area: 1900,
    landArea: 0,
    amenities: ['Pool', 'Gym', 'Parking', 'Balcony', 'Security', 'Rooftop'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'คอนโดหรูในย่านทองหล่อที่ทันสมัยที่สุดของกรุงเทพฯ วิวเมืองสวยงามจากระเบียงส่วนตัว ตกแต่งใหม่ด้วยวัสดุคุณภาพสูง ครัวพร้อมเคาน์เตอร์ควอตซ์ และห้องน้ำสไตล์สปา ใกล้ BTS ทองหล่อ ร้านอาหาร และ J Avenue',
    agent: agents[0],
    featured: true,
    available: true,
    yearBuilt: 2015,
    parking: 2,
    coordinates: { lat: 13.7306, lng: 100.5811 },
  },
  {
    id: 'prop-5',
    name: 'Phuket Beachfront Villa',
    type: 'Villa',
    location: 'กะตะ, ภูเก็ต',
    city: 'ภูเก็ต',
    state: 'ภูเก็ต',
    address: '15 หมู่ 4 ตำบลกะรน อำเภอเมือง ภูเก็ต 83100',
    price: 200000,
    priceType: 'month',
    rating: 5.0,
    reviewCount: 12,
    bedrooms: 6,
    bathrooms: 6,
    area: 6800,
    landArea: 12000,
    amenities: ['Pool', 'Beach Access', 'Gym', 'Home Theater', 'Smart Home', 'BBQ', 'Garage'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'วิลล่าริมหาดสุดหรูในภูเก็ต ทุกห้องมองเห็นวิวทะเลอันดามันอันงดงาม พร้อมสระว่ายน้ำอินฟินิตี้ ทางลงหาดส่วนตัว ครัวกลางแจ้ง และระเบียงหลายชั้น เหมาะสำหรับผู้ที่ต้องการความเป็นส่วนตัวสูงสุดในสไตล์รีสอร์ทระดับโลก',
    agent: agents[0],
    featured: false,
    available: true,
    yearBuilt: 2022,
    parking: 4,
    coordinates: { lat: 7.8286, lng: 98.2956 },
  },
  {
    id: 'prop-6',
    name: 'Asok Sky Penthouse',
    type: 'Apartment',
    location: 'อโศก, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '159 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    price: 150000,
    priceType: 'month',
    rating: 4.8,
    reviewCount: 19,
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    landArea: 0,
    amenities: ['Rooftop Deck', 'Pool', 'Gym', 'Concierge', 'Smart Home', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'เพนต์เฮ้าส์สุดยอดในย่านอโศก วิว 360 องศาจากดาดฟ้าส่วนตัว มองเห็นกรุงเทพฯ ยามค่ำคืนอย่างตระการตา ออกแบบโดยสถาปนิกชื่อดัง ตกแต่งด้วยวัสดุนำเข้าระดับพรีเมียม ใกล้ BTS อโศก และ MRT สุขุมวิท',
    agent: agents[1],
    featured: false,
    available: true,
    yearBuilt: 2020,
    parking: 2,
    coordinates: { lat: 13.7372, lng: 100.5602 },
  },
  {
    id: 'prop-7',
    name: 'Chiang Mai Old Town House',
    type: 'House',
    location: 'เมืองเก่า, เชียงใหม่',
    city: 'เชียงใหม่',
    state: 'เชียงใหม่',
    address: '42 ถนนพระปกเกล้า ตำบลพระสิงห์ อำเภอเมือง เชียงใหม่ 50200',
    price: 35000,
    priceType: 'month',
    rating: 4.5,
    reviewCount: 28,
    bedrooms: 3,
    bathrooms: 2,
    area: 1850,
    landArea: 6000,
    amenities: ['Garden', 'Parking', 'Storage', 'Patio'],
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'บ้านทรงล้านนาดั้งเดิมในย่านเมืองเก่าเชียงใหม่ รายละเอียดงานไม้แกะสลักที่อนุรักษ์ไว้อย่างดี สวนร่มรื่น และระเบียงไม้ที่มีเสน่ห์ ทำเลใจกลางเมืองเก่า ใกล้วัดพระสิงห์ ตลาดวโรรส และถนนคนเดินเสาร์',
    agent: agents[2],
    featured: false,
    available: true,
    yearBuilt: 1980,
    parking: 1,
    coordinates: { lat: 18.7883, lng: 98.9853 },
  },
  {
    id: 'prop-8',
    name: 'Pattaya Pool Villa',
    type: 'House',
    location: 'จอมเทียน, พัทยา',
    city: 'พัทยา',
    state: 'ชลบุรี',
    address: '88/5 หมู่ 12 ตำบลหนองปรือ อำเภอบางละมุง ชลบุรี 20150',
    price: 75000,
    priceType: 'month',
    rating: 4.7,
    reviewCount: 22,
    bedrooms: 5,
    bathrooms: 4,
    area: 4500,
    landArea: 15000,
    amenities: ['Pool', 'Garden', 'Garage', 'Gym', 'BBQ', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'พูลวิลล่าหรูในย่านจอมเทียน พัทยา ออกแบบสไตล์โมเดิร์นท รอปิคอล ผสมผสานความร่วมสมัยกับความงามของธรรมชาติ สระว่ายน้ำส่วนตัว สวนภูมิทัศน์สวยงาม และพื้นที่นั่งเล่นกลางแจ้ง ใกล้หาดจอมเทียนและศูนย์การค้า',
    agent: agents[1],
    featured: false,
    available: true,
    yearBuilt: 2021,
    parking: 3,
    coordinates: { lat: 12.9269, lng: 100.8825 },
  },
  {
    id: 'prop-9',
    name: 'Ari Urban Loft',
    type: 'Apartment',
    location: 'อารีย์, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '22 ซอยอารีย์สัมพันธ์ 4 แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    price: 38000,
    priceType: 'month',
    rating: 4.4,
    reviewCount: 16,
    bedrooms: 1,
    bathrooms: 1,
    area: 950,
    landArea: 0,
    amenities: ['Rooftop', 'Pet Friendly', 'Parking', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'ลอฟต์สไตล์สร้างสรรค์ในย่านอารีย์อันมีเอกลักษณ์ ออกแบบด้วยคอนกรีตขัดมัน เพดานสูง และหน้าต่างบานใหญ่ ใกล้คาเฟ่ ร้านอาหาร และแกลเลอรีศิลปะมากมาย ดาดฟ้าชั้นบนให้วิวเมืองสวยงาม BTS อารีย์อยู่ใกล้มาก',
    agent: agents[2],
    featured: false,
    available: true,
    yearBuilt: 2017,
    parking: 1,
    coordinates: { lat: 13.7774, lng: 100.5454 },
  },
  {
    id: 'prop-10',
    name: 'Ratchada Classic Home',
    type: 'House',
    location: 'รัชดาภิเษก, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '99 ซอยรัชดาภิเษก 7 แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
    price: 68000,
    priceType: 'month',
    rating: 4.6,
    reviewCount: 34,
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    landArea: 7200,
    amenities: ['Garden', 'Garage', 'Storage', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'บ้านเดี่ยวสไตล์คลาสสิกในทำเลรัชดาภิเษก สวนร่มรื่นให้ความเป็นส่วนตัว ห้องนั่งเล่นกว้างขวาง ห้องครัวตกแต่งใหม่ และโรงรถ 2 คัน ทำเลใจกลางเมือง ใกล้รถไฟฟ้า MRT ห้วยขวาง และ Central Rama 9',
    agent: agents[0],
    featured: false,
    available: true,
    yearBuilt: 2005,
    parking: 2,
    coordinates: { lat: 13.7657, lng: 100.5672 },
  },
  {
    id: 'prop-11',
    name: 'Hua Hin Seaside Villa',
    type: 'Villa',
    location: 'หัวหิน, ประจวบฯ',
    city: 'หัวหิน',
    state: 'ประจวบคีรีขันธ์',
    address: '55 หมู่ 6 ตำบลหนองแก อำเภอหัวหิน ประจวบคีรีขันธ์ 77110',
    price: 95000,
    priceType: 'month',
    rating: 4.8,
    reviewCount: 41,
    bedrooms: 4,
    bathrooms: 3,
    area: 2600,
    landArea: 9000,
    amenities: ['Pool', 'Garden', 'Garage', 'BBQ', 'Beach Access', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'วิลล่าริมทะเลสุดโรแมนติกในหัวหิน สถาปัตยกรรมแบบโมเดิร์นทรอปิคอลผสมโคโลเนียล สระว่ายน้ำส่วนตัว สวนจัดภูมิทัศน์สวยงาม และทางลงหาดส่วนตัว เหมาะสำหรับครอบครัวหรือผู้ที่ต้องการพักผ่อนอย่างมีระดับห่างจากเมือง',
    agent: agents[1],
    featured: false,
    available: true,
    yearBuilt: 2018,
    parking: 2,
    coordinates: { lat: 12.5700, lng: 99.9573 },
  },
  {
    id: 'prop-12',
    name: 'Rama 9 Premium Condo',
    type: 'Condo',
    location: 'พระราม 9, กรุงเทพฯ',
    city: 'กรุงเทพมหานคร',
    state: 'กทม',
    address: '1 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    price: 55000,
    priceType: 'month',
    rating: 4.7,
    reviewCount: 27,
    bedrooms: 2,
    bathrooms: 2,
    area: 1600,
    landArea: 0,
    amenities: ['Gym', 'Concierge', 'Balcony', 'Parking', 'Security', 'Pool'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
    ],
    description:
      'คอนโดพรีเมียมในย่านพระราม 9 ศูนย์กลางธุรกิจใหม่ของกรุงเทพฯ วิวเมืองงดงามจากระเบียงส่วนตัว ห้องน้ำหินอ่อนคาร์ราร่า ครัวพร้อมเครื่องใช้ครบครัน ทำเลใกล้ MRT พระราม 9 Central Rama 9 และสำนักงานชั้นนำมากมาย',
    agent: agents[2],
    featured: false,
    available: true,
    yearBuilt: 2016,
    parking: 1,
    coordinates: { lat: 13.7560, lng: 100.5672 },
  },
];

//
//   // ต้อง fetch จาก API
//   const [property, setProperty] = useState(null);
//   useEffect(() => {
//     fetch(`/api/properties/${id}`)
//       .then(res => res.json())
//       .then(data => setProperty(data));
//   }, [id]);
//
//   // import ตรงๆ — ไม่ต้อง fetch, ไม่ต้อง useEffect
//   import { getPropertyById } from '@/lib/mock-data';
//   const property = getPropertyById(id);  // พร้อมใช้ทันที!
//
//   1. ไม่ต้อง loading state — ข้อมูลพร้อมตอน render
//   2. SEO ดี — HTML มีข้อมูลครบ (ไม่ต้องรอ JavaScript load)
//   3. เร็วกว่า — ไม่มี network round-trip
//   4. Code สั้นกว่า — ไม่ต้อง useState + useEffect + loading/error handling

// ใช้ใน: app/listings/[id]/page.tsx (หน้า detail ของ property)
// return: Property object ถ้าเจอ, undefined ถ้าไม่เจอ (→ แสดง 404)
//
//   ถ้าไม่เจอ → คืน undefined
//   เทียบ SQL: SELECT * FROM properties WHERE id = ? LIMIT 1
export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

// ใช้ใน: app/page.tsx (หน้าแรก — แสดง featured properties 4 รายการ)
// return: array ของ Property objects ที่ featured === true
//
//   คืน array ใหม่ (ไม่แก้ array เดิม)
//   เทียบ SQL: SELECT * FROM properties WHERE featured = true
export function getFeaturedProperties(): Property[] {
  return properties.filter((p) => p.featured);
}

// ใช้ใน: components/FilterSidebar.tsx (แสดง checkbox ให้ user เลือก filter)
// เป็น array ของ string — ใช้ .map() สร้าง checkbox ใน UI
//
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
