// =============================================================================
// 📁 app/api/images/route.ts — Unsplash API Route (Next.js API Route)
// =============================================================================
//
// 🔑 ความแตกต่างกับ React JS:
// ─────────────────────────────
// React JS ปกติ:  ต้องสร้าง backend แยก (Express.js) หรือเรียก API จาก client โดยตรง
//                 → เสี่ยง API Key หลุด เพราะ client-side code เห็นได้หมด
//
// Next.js:        มี API Route ในตัว — ไฟล์นี้ทำงานบน Server เท่านั้น
//                 → API Key ปลอดภัย เพราะ process.env ไม่ส่งไป browser
//                 → ไม่ต้อง setup Express.js แยก
//
// 🏗️ วิธีสร้าง API Route ใน Next.js App Router:
//    1. สร้างไฟล์ชื่อ route.ts ใน app/api/ชื่อ-endpoint/
//    2. export function ชื่อ HTTP method (GET, POST, PUT, DELETE)
//    3. URL จะเป็น /api/ชื่อ-endpoint อัตโนมัติ
//    → ไฟล์นี้อยู่ที่ app/api/images/route.ts → URL = /api/images
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
// NextRequest  = request object ของ Next.js (extends Web Request API)
// NextResponse = response object ของ Next.js (extends Web Response API)
// 🔑 React JS ไม่มีสิ่งนี้ — ต้องใช้ express.Request / express.Response แทน

// -----------------------------------------------------------------------------
// GET /api/images?query=luxury+house&page=1&per_page=12
// ดึงรูปภาพจาก Unsplash API แล้วส่งกลับเฉพาะข้อมูลที่ต้องใช้
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  // อ่าน query parameters จาก URL
  // เช่น /api/images?query=villa&page=2 → query="villa", page="2"
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || 'luxury house';   // คำค้นหา (default: luxury house)
  const page = searchParams.get('page') || '1';                // หน้าที่ (default: 1)
  const perPage = searchParams.get('per_page') || '12';        // จำนวนรูปต่อหน้า (default: 12)

  // อ่าน API Key จาก environment variable (.env.local)
  // 🔒 ปลอดภัย: process.env ทำงานบน Server เท่านั้น — browser จะไม่เห็น key นี้
  // 🔑 React JS: ถ้าใช้ REACT_APP_xxx จะถูก bundle ไปใน client code → ไม่ปลอดภัย!
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  // ถ้าไม่มี API Key → ส่ง error กลับ
  if (!accessKey) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 500 }
    );
  }

  // สร้าง URL สำหรับเรียก Unsplash API
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;

  // เรียก Unsplash API ด้วย fetch (built-in ใน Next.js)
  // 🔑 React JS: ต้องใช้ axios หรือ fetch เหมือนกัน แต่เรียกจาก client → key หลุด
  // Next.js: fetch บน server มี option พิเศษ เช่น next.revalidate สำหรับ caching
  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,  // ส่ง API Key ผ่าน header
    },
    next: { revalidate: 3600 },  // ← Next.js exclusive: cache ผลลัพธ์ 1 ชั่วโมง
    // 🔑 React JS ไม่มี option นี้ — ต้อง setup Redis/memcached เอง
  });

  // ถ้า Unsplash ตอบ error → ส่ง error กลับไปให้ client
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch from Unsplash' },
      { status: res.status }
    );
  }

  // แปลง response เป็น JSON
  const data = await res.json();

  // แปลงข้อมูลให้เหลือเฉพาะที่ต้องใช้ (ไม่ส่งข้อมูลเกินไปให้ client)
  // → ลด bandwidth + ไม่เปิดเผยโครงสร้างข้อมูลของ Unsplash API
  const images = data.results.map(
    (img: {
      id: string;
      urls: { regular: string; small: string };
      alt_description: string | null;
      user: { name: string; links: { html: string } };
      width: number;
      height: number;
    }) => ({
      id: img.id,                                    // ID ของรูป
      url: img.urls.regular,                         // รูปขนาดปกติ (สำหรับ lightbox)
      thumbnail: img.urls.small,                     // รูปขนาดเล็ก (สำหรับ grid)
      alt: img.alt_description || 'Property image',  // คำอธิบายรูป (accessibility)
      photographer: img.user.name,                   // ชื่อช่างภาพ (Unsplash ต้อง credit)
      photographerUrl: img.user.links.html,          // ลิงก์โปรไฟล์ช่างภาพ
      width: img.width,                              // ความกว้างรูป (pixel)
      height: img.height,                            // ความสูงรูป (pixel)
    })
  );

  // ส่งข้อมูลกลับไปให้ client เป็น JSON
  return NextResponse.json({
    images,                        // รายการรูปภาพ
    total: data.total,             // จำนวนรูปทั้งหมดที่ค้นพบ
    totalPages: data.total_pages,  // จำนวนหน้าทั้งหมด
  });
}
