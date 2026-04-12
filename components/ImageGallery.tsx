'use client';

import { useState } from 'react';

import Image from 'next/image';
//   1. Auto-optimize: แปลงเป็น WebP, resize ตาม device
//   2. Lazy loading: โหลดรูปเมื่อ scroll เข้าใกล้ (default)
//   3. Prevent CLS: จอง space ไว้ก่อนรูปโหลดเสร็จ (ไม่กระโดด)
//   4. fill mode: เติมเต็ม parent container — เหมาะกับ gallery ที่ไม่รู้ขนาดรูปล่วงหน้า
//

interface ImageGalleryProps {
  images: string[];       // array ของ URL รูปภาพ (จาก mock-data.ts → Property.images)
  propertyName: string;   // ชื่อ property — ใช้สร้าง alt text สำหรับ accessibility
}

// รับ images (array URL) กับ propertyName (ชื่อ property สำหรับ alt text)
// แสดง: รูปหลัก + thumbnails + lightbox เมื่อคลิกขยาย
export default function ImageGallery({ images, propertyName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80';

  function getSrc(index: number) {
    return errorIndices.has(index) ? FALLBACK_IMAGE : images[index];
  }

  function handleError(index: number) {
    setErrorIndices((prev) => new Set(prev).add(index));
  }
  // lightboxOpen = true เมื่อผู้ใช้คลิกรูปหลักเพื่อดูแบบเต็มจอ
  // false = แสดง gallery ปกติ, true = แสดง fullscreen overlay

  //   ถ้าใช้ setActiveIndex(activeIndex - 1) อาจได้ค่าเก่า (stale closure)

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  // prev: ถ้าอยู่รูปแรก (i === 0) → ไปรูปสุดท้าย (images.length - 1)
  //        ถ้าไม่ → ถอยกลับ 1 รูป (i - 1)

  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  // next: ถ้าอยู่รูปสุดท้าย (i === images.length - 1) → ไปรูปแรก (0)
  //        ถ้าไม่ → ไปรูปถัดไป (i + 1)

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
            src={getSrc(activeIndex)}
            alt={`${propertyName} — photo ${activeIndex + 1} of ${images.length}`}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => handleError(activeIndex)}
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
                //   parent div (ที่มี onClick={() => setLightboxOpen(true)))
                //   → ปุ่ม prev จะเปิด lightbox แทนที่จะเปลี่ยนรูป!
                // ดังนั้นต้อง stop propagation ก่อนแล้วค่อยเรียก prev()
                aria-label="Previous image"
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
                        {/* overflow-x-auto = scroll แนวนอนได้ถ้า thumbnails เยอะเกิน */}
            {images.map((img, i) => (
              <button
                key={i}
                role="tab"
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
                  src={getSrc(i)}
                  alt={`${propertyName} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => handleError(i)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 🔳 Lightbox — Fullscreen overlay เมื่อคลิกดูรูปขยาย               */}
      {/* =================================================================== */}
            {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          // fixed inset-0 = เต็มหน้าจอ (top:0, right:0, bottom:0, left:0)
          // z-50 = อยู่บนสุด (ทับ navbar, content ทั้งหมด)
          // bg-black/90 = พื้นหลังดำ 90% opacity (เห็น backdrop เล็กน้อย)
          onClick={() => setLightboxOpen(false)}
          // คลิก backdrop (พื้นหลังดำ) → ปิด lightbox
          role="dialog"
          aria-modal="true"
          // aria-modal = บอกว่า modal นี้ block interaction กับ content ด้านหลัง
          aria-label="Image lightbox"
        >
          {/* ปุ่ม Close (X) มุมขวาบน */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close lightbox"
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
            //   ถ้าไม่มี: คลิกรูปหรือปุ่ม prev/next → lightbox จะปิด (เพราะ backdrop onClick)
          >
            <Image
              src={getSrc(activeIndex)}
              alt={`${propertyName} — full size photo ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              onError={() => handleError(activeIndex)}
            />
            {/* ปุ่ม prev/next ใน lightbox — แสดงเมื่อมีรูปมากกว่า 1 */}
            {images.length > 1 && (
              <>
                {/* ปุ่ม Previous ใน lightbox */}
                <button
                  onClick={prev}
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
    //   ที่นี่ return 2 ส่วน: Main Gallery + Lightbox (conditional)
  );
}
