// =============================================================================
// 📁 components/ImageGallery.tsx — Image Gallery พร้อม Lightbox สำหรับหน้า Property Detail
// =============================================================================
//
// 🔑 Next.js Image vs React JS <img>:
// ─────────────────────────────────────
// React JS (<img>):
//   - ใช้ <img src="..." /> ธรรมดา
//   - ต้อง optimize รูปเอง (resize, compress, lazy load)
//   - ไม่มี automatic responsive sizes
//   - ต้องเขียน loading="lazy" เอง
//
// Next.js (<Image>):
//   - import Image from 'next/image' — component พิเศษ
//   - Optimize รูปอัตโนมัติ (resize, WebP, lazy load)
//   - fill prop = เติมเต็ม parent container (ไม่ต้องกำหนด width/height)
//   - sizes prop = บอก browser ว่ารูปจะใหญ่แค่ไหนในแต่ละ breakpoint
//   - priority prop = โหลดทันที (ไม่ lazy load) — ใช้กับ above-the-fold images
//
// 🔑 ความแตกต่างกับ React JS ปกติ:
//   - ใน Next.js ต้องมี 'use client' เพราะ component นี้ใช้ useState
//   - React JS ปกติไม่ต้องใส่ 'use client' เพราะทุกอย่างเป็น client อยู่แล้ว
//
// 🔑 Lightbox Pattern:
//   - คลิกรูปหลัก → เปิด fullscreen overlay (lightbox)
//   - ใช้ fixed positioning + z-50 เพื่อให้ overlay ทับทุกอย่าง
//   - คลิก backdrop (พื้นหลังดำ) → ปิด lightbox
//   - e.stopPropagation() ป้องกันคลิกรูปแล้วปิด lightbox ไปด้วย
//
// 🔑 Circular Navigation:
//   - เมื่ออยู่รูปแรก กด prev → ไปรูปสุดท้าย (วนกลับ)
//   - เมื่ออยู่รูปสุดท้าย กด next → ไปรูปแรก (วนกลับ)
//   - ใช้ ternary: i === 0 ? images.length - 1 : i - 1
// =============================================================================

'use client';
// 🔑 Next.js: ต้องใส่ 'use client' เพราะ component นี้ใช้ useState (lightbox state, active image index)
// React JS: ไม่ต้องใส่บรรทัดนี้ เพราะทุก component เป็น client อยู่แล้ว

import { useState } from 'react';
// useState = hook สำหรับจัดการ state ของ active image index และ lightbox open/close

import Image from 'next/image';
// 🔑 Next.js Image component — ดีกว่า <img> ธรรมดาเพราะ:
//   1. Auto-optimize: แปลงเป็น WebP, resize ตาม device
//   2. Lazy loading: โหลดรูปเมื่อ scroll เข้าใกล้ (default)
//   3. Prevent CLS: จอง space ไว้ก่อนรูปโหลดเสร็จ (ไม่กระโดด)
//   4. fill mode: เติมเต็ม parent container — เหมาะกับ gallery ที่ไม่รู้ขนาดรูปล่วงหน้า
//
// 🔑 React JS: ใช้ <img src="..." /> ธรรมดา ต้อง optimize เอง
//   Next.js: ใช้ <Image fill sizes="..." /> optimize อัตโนมัติ

// -----------------------------------------------------------------------------
// 📝 Props Interface — กำหนดว่า component นี้รับ data อะไรบ้าง
// -----------------------------------------------------------------------------
interface ImageGalleryProps {
  images: string[];       // array ของ URL รูปภาพ (จาก mock-data.ts → Property.images)
  propertyName: string;   // ชื่อ property — ใช้สร้าง alt text สำหรับ accessibility
}

// =============================================================================
// 🏗️ Component หลัก — ImageGallery
// =============================================================================
// รับ images (array URL) กับ propertyName (ชื่อ property สำหรับ alt text)
// แสดง: รูปหลัก + thumbnails + lightbox เมื่อคลิกขยาย
export default function ImageGallery({ images, propertyName }: ImageGalleryProps) {
  // ---------------------------------------------------------------------------
  // 🎯 State Management — ควบคุมรูปที่แสดงและ lightbox
  // ---------------------------------------------------------------------------
  const [activeIndex, setActiveIndex] = useState(0);
  // activeIndex = index ของรูปที่กำลังแสดง (0 = รูปแรก)
  // เปลี่ยนเมื่อ: คลิก thumbnail, กดปุ่ม prev/next

  const [lightboxOpen, setLightboxOpen] = useState(false);
  // lightboxOpen = true เมื่อผู้ใช้คลิกรูปหลักเพื่อดูแบบเต็มจอ
  // false = แสดง gallery ปกติ, true = แสดง fullscreen overlay

  // ---------------------------------------------------------------------------
  // 🔄 Circular Navigation Functions — ปุ่ม prev/next แบบวนรอบ
  // ---------------------------------------------------------------------------
  // 🔑 ใช้ functional update: setActiveIndex((i) => ...) เพราะค่าใหม่ขึ้นอยู่กับค่าเก่า
  //   ถ้าใช้ setActiveIndex(activeIndex - 1) อาจได้ค่าเก่า (stale closure)

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  // prev: ถ้าอยู่รูปแรก (i === 0) → ไปรูปสุดท้าย (images.length - 1)
  //        ถ้าไม่ → ถอยกลับ 1 รูป (i - 1)
  // ✅ Circular: รูปแรก → prev → รูปสุดท้าย (วนกลับ)

  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  // next: ถ้าอยู่รูปสุดท้าย (i === images.length - 1) → ไปรูปแรก (0)
  //        ถ้าไม่ → ไปรูปถัดไป (i + 1)
  // ✅ Circular: รูปสุดท้าย → next → รูปแรก (วนกลับ)

  return (
    <>
      {/* ================================================================= */}
      {/* 🖼️ Main Gallery — แสดงรูปหลัก + thumbnails                       */}
      {/* ================================================================= */}
      <div className="space-y-3">
        {/* --------------------------------------------------------------- */}
        {/* 📸 Main Image — รูปใหญ่ที่แสดงอยู่ คลิกเพื่อเปิด lightbox     */}
        {/* --------------------------------------------------------------- */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
          // relative = เป็น positioning context ให้ลูกที่ใช้ absolute/fill
          // aspect-video = อัตราส่วน 16:9 (เหมาะกับรูปบ้าน)
          // group = ให้ลูกใช้ group-hover:* ได้ (แสดง arrows เมื่อ hover)
          onClick={() => setLightboxOpen(true)}
          // คลิกรูป → เปิด lightbox (fullscreen mode)
        >
          <Image
            src={images[activeIndex]}
            // แสดงรูปตาม index ปัจจุบัน
            alt={`${propertyName} — photo ${activeIndex + 1} of ${images.length}`}
            // alt text สำหรับ accessibility — บอกชื่อ property + ลำดับรูป
            fill
            // 🔑 fill prop (Next.js เฉพาะ):
            //   - ทำให้ Image เติมเต็ม parent container (ใช้ position: absolute ข้างใน)
            //   - parent ต้องมี position: relative + กำหนดขนาด (ที่นี่ใช้ aspect-video)
            //   - ไม่ต้องกำหนด width/height — เหมาะกับ dynamic images ที่ไม่รู้ขนาดล่วงหน้า
            //
            // 🔑 React JS: ใช้ <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            //   Next.js fill: ทำสิ่งเดียวกัน แต่ได้ optimization ฟรี
            priority={activeIndex === 0}
            // priority = true เฉพาะรูปแรก → โหลดทันที (ไม่ lazy load)
            // 🔑 เพราะรูปแรกเป็น above-the-fold — ผู้ใช้เห็นทันทีที่เปิดหน้า
            //   รูปอื่น (activeIndex !== 0) ใช้ lazy loading ปกติ
            sizes="(max-width: 768px) 100vw, 60vw"
            // 🔑 sizes prop (Next.js เฉพาะ):
            //   - บอก browser ว่ารูปจะกว้างแค่ไหนในแต่ละ breakpoint
            //   - มือถือ (≤768px): รูปกว้าง 100% ของ viewport
            //   - Desktop (>768px): รูปกว้าง 60% (เพราะมี sidebar ข้างๆ)
            //   - ช่วยให้ browser เลือก srcset ที่เหมาะสม → ไม่โหลดรูปใหญ่เกินจำเป็น
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            // object-cover = crop รูปให้พอดี container (ไม่บิดเบี้ยว)
            // group-hover:scale-[1.02] = ขยายเล็กน้อยเมื่อ hover (zoom effect)
          />

          {/* ------------------------------------------------------------- */}
          {/* ◀ ▶ Navigation Arrows — ปุ่ม prev/next บน main image           */}
          {/* ------------------------------------------------------------- */}
          {/* แสดงเฉพาะเมื่อมีรูปมากกว่า 1 รูป */}
          {images.length > 1 && (
            <>
              {/* ปุ่ม Previous (ลูกศรซ้าย) */}
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                // e.stopPropagation() = ป้องกัน event bubble ขึ้นไป parent
                // 🔑 ถ้าไม่มี stopPropagation: คลิกปุ่ม prev → event จะ bubble ขึ้นไป
                //   parent div (ที่มี onClick={() => setLightboxOpen(true)))
                //   → ปุ่ม prev จะเปิด lightbox แทนที่จะเปลี่ยนรูป!
                // ดังนั้นต้อง stop propagation ก่อนแล้วค่อยเรียก prev()
                aria-label="Previous image"
                // 🔑 Accessibility: aria-label บอก screen reader ว่าปุ่มนี้ทำอะไร
                //   เพราะปุ่มมีแค่ icon (ไม่มี text) ต้องมี aria-label
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
                // absolute + left-3 + top-1/2 - translate-y-1/2 = จัดกลางแนวตั้งชิดซ้าย
                // opacity-0 group-hover:opacity-100 = ซ่อนปุ่ม แสดงเมื่อ hover รูป
                // backdrop-blur-sm = เบลอพื้นหลังเล็กน้อย (glassmorphism effect)
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {/* aria-hidden="true" = ซ่อน icon จาก screen reader (มี aria-label ที่ปุ่มแล้ว) */}
              </button>
              {/* ปุ่ม Next (ลูกศรขวา) — ทำงานเหมือน prev แต่เรียก next() */}
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 🔢 Image Counter — แสดงลำดับรูป เช่น "2 / 4"                 */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
            {activeIndex + 1} / {images.length}
            {/* +1 เพราะ index เริ่มจาก 0 แต่แสดงให้ user เริ่มจาก 1 */}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 🔍 Expand Icon — ไอคอนขยายมุมขวาบน แสดงเมื่อ hover           */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {/* opacity-0 → group-hover:opacity-100 = แสดงเมื่อ hover รูป */}
            {/* บอก user ว่าคลิกได้เพื่อขยายดูแบบเต็มจอ */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* 🖼️ Thumbnails — รูปเล็กด้านล่างสำหรับเลือกรูป                  */}
        {/* --------------------------------------------------------------- */}
        {/* แสดงเฉพาะเมื่อมีรูปมากกว่า 1 รูป */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Image thumbnails">
            {/* role="tablist" + role="tab" = ใช้ ARIA tab pattern */}
            {/* 🔑 Accessibility: screen reader จะอ่านว่า "Image thumbnails, tab 1 of 4, selected" */}
            {/* overflow-x-auto = scroll แนวนอนได้ถ้า thumbnails เยอะเกิน */}
            {images.map((img, i) => (
              <button
                key={i}
                role="tab"
                // 🔑 ARIA tab role: บอก screen reader ว่านี่คือ tab (เลือกได้)
                aria-selected={i === activeIndex}
                // aria-selected = true ถ้าเป็นรูปที่กำลังแสดง
                aria-label={`View photo ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                // คลิก thumbnail → เปลี่ยน activeIndex ไปรูปนั้น
                className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${
                  i === activeIndex
                    ? 'ring-2 ring-blue-600 ring-offset-1'
                    // รูปที่ active: มีกรอบน้ำเงินล้อมรอบ (ring-2 ring-blue-600)
                    : 'opacity-60 hover:opacity-100'
                    // รูปที่ไม่ active: จางลง 60% แต่ hover แล้วกลับมาเต็ม
                }`}
              >
                <Image
                  src={img}
                  alt={`${propertyName} thumbnail ${i + 1}`}
                  fill
                  // 🔑 fill prop: เติมเต็ม parent button (80x56px)
                  //   parent ต้อง relative + กำหนดขนาด (w-20 h-14)
                  sizes="80px"
                  // sizes="80px": thumbnail กว้าง 80px เสมอ — ไม่ต้อง responsive
                  // ช่วยให้ Next.js ส่งรูปขนาดเล็กมา (ประหยัด bandwidth)
                  className="object-cover"
                  // object-cover = crop รูปให้พอดี thumbnail (ไม่บิดเบี้ยว)
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 🔳 Lightbox — Fullscreen overlay เมื่อคลิกดูรูปขยาย               */}
      {/* =================================================================== */}
      {/* 🔑 Conditional rendering: แสดง lightbox เฉพาะเมื่อ lightboxOpen === true
           React JS ก็ใช้ pattern เดียวกัน: {condition && <Component />} */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          // fixed inset-0 = เต็มหน้าจอ (top:0, right:0, bottom:0, left:0)
          // z-50 = อยู่บนสุด (ทับ navbar, content ทั้งหมด)
          // bg-black/90 = พื้นหลังดำ 90% opacity (เห็น backdrop เล็กน้อย)
          onClick={() => setLightboxOpen(false)}
          // คลิก backdrop (พื้นหลังดำ) → ปิด lightbox
          role="dialog"
          // 🔑 Accessibility: role="dialog" บอก screen reader ว่านี่คือ dialog/modal
          aria-modal="true"
          // aria-modal = บอกว่า modal นี้ block interaction กับ content ด้านหลัง
          aria-label="Image lightbox"
        >
          {/* ปุ่ม Close (X) มุมขวาบน */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close lightbox"
            // 🔑 Accessibility: aria-label เพราะปุ่มมีแค่ icon X
            onClick={() => setLightboxOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* --------------------------------------------------------------- */}
          {/* 🖼️ Lightbox Image Container                                    */}
          {/* --------------------------------------------------------------- */}
          <div
            className="relative w-full max-w-4xl aspect-video"
            // max-w-4xl = จำกัดความกว้างไม่ให้เกิน ~896px
            // aspect-video = คง ratio 16:9
            onClick={(e) => e.stopPropagation()}
            // 🔑 stopPropagation: คลิกที่รูป → ไม่ให้ bubble ขึ้นไป backdrop
            //   ถ้าไม่มี: คลิกรูปหรือปุ่ม prev/next → lightbox จะปิด (เพราะ backdrop onClick)
          >
            <Image
              src={images[activeIndex]}
              alt={`${propertyName} — full size photo ${activeIndex + 1}`}
              fill
              sizes="100vw"
              // 🔑 sizes="100vw": ใน lightbox รูปเต็มจอ → ใช้ขนาดเต็ม viewport
              className="object-contain"
              // 🔑 object-contain (ไม่ใช่ object-cover):
              //   contain = แสดงรูปทั้งรูปโดยไม่ crop (อาจมี space ว่างรอบๆ)
              //   cover = crop รูปให้พอดี container (ตัดบางส่วนออก)
              //   Lightbox ใช้ contain เพราะต้องการให้ user เห็นรูปเต็มๆ
            />
            {/* ปุ่ม prev/next ใน lightbox — แสดงเมื่อมีรูปมากกว่า 1 */}
            {images.length > 1 && (
              <>
                {/* ปุ่ม Previous ใน lightbox */}
                <button
                  onClick={prev}
                  // 🔑 ไม่ต้อง stopPropagation ที่นี่ เพราะ parent div ด้านบน
                  //   มี stopPropagation อยู่แล้ว → event ไม่ถึง backdrop
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* ปุ่ม Next ใน lightbox */}
                <button
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
    // 🔑 Fragment (<> </>) = return หลาย element โดยไม่สร้าง DOM node เพิ่ม
    //   ที่นี่ return 2 ส่วน: Main Gallery + Lightbox (conditional)
    //   React JS ก็ใช้ Fragment เหมือนกัน
  );
}
