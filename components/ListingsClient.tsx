// =============================================================================
// 📁 components/ListingsClient.tsx — "สมอง" ของหน้า /listings
// =============================================================================
//
// 🎯 หน้าที่ของ Component นี้:
//   1. อ่านค่า filter จาก URL (?location=Bangkok) ผ่าน useSearchParams
//   2. เก็บ state ของ filter, sort, view mode
//   3. Filter + Sort properties ด้วย useMemo (คำนวณใหม่เฉพาะเมื่อ dependencies เปลี่ยน)
//   4. Render FilterSidebar + PropertyCard grid/list
//
// 🔑 ทำไมต้องเป็น Client Component?
// ────────────────────────────────────
//   - useSearchParams() — อ่าน query string จาก URL (ต้องทำงานฝั่ง browser)
//   - useState — เก็บ filters, sort, view state
//   - useMemo — optimize การคำนวณ filter/sort
//   - useEffect — sync location จาก URL เข้า state
//   → ทั้งหมดเป็น React hooks ที่ต้องทำงานฝั่ง client
//
// 🔑 useSearchParams กับ Suspense (สำคัญมาก!):
// ───────────────────────────────────────────────
//   Next.js 15 บังคับว่า component ที่ใช้ useSearchParams ต้องถูก wrap ด้วย <Suspense>
//   เพราะ: ตอน Server-side Rendering, URL params ยังไม่รู้ค่า
//          → ต้องมี fallback แสดงก่อน จนกว่า client จะ hydrate
//
//   ดูไฟล์ app/listings/page.tsx:
//     <Suspense fallback={<Loading />}>
//       <ListingsClient />   ← component นี้ถูก wrap ด้วย Suspense
//     </Suspense>
//
//   React JS ปกติ: ไม่ต้อง Suspense เพราะไม่มี SSR
//   React Router: ใช้ useSearchParams() ได้เลยไม่ต้อง Suspense
//
// 🔑 URL State Sync Pattern:
// ────────────────────────────
//   SearchBar (หน้าแรก):
//     → router.push("/listings?location=Bangkok")
//     → navigate ไปหน้า /listings พร้อม query param
//
//   ListingsClient (หน้า /listings):
//     → useSearchParams().get('location') อ่านค่าจาก URL
//     → ใส่ค่าเข้า filters state
//     → FilterSidebar แสดงค่าใน location input
//
//   🔑 เปรียบเทียบ:
//     React Router: useSearchParams() จาก 'react-router-dom'
//     Next.js:      useSearchParams() จาก 'next/navigation'
//     → API คล้ายกันมาก แต่คนละ package
//
// 🔑 useMemo — Performance Optimization:
// ────────────────────────────────────────
//   ปัญหา: ทุกครั้งที่ component re-render (เช่น เปลี่ยน view mode)
//          filter + sort logic จะถูกคำนวณใหม่ทั้งหมด → สิ้นเปลือง
//
//   useMemo: คำนวณใหม่เฉพาะเมื่อ [filters, sort] เปลี่ยนเท่านั้น
//            ถ้าเปลี่ยนแค่ view mode → ใช้ผลลัพธ์เดิมจาก cache
//
//   🔑 เหมือนกันทั้ง React JS และ Next.js — useMemo เป็น React hook มาตรฐาน
// =============================================================================

'use client';
// 🔑 Next.js: ต้องใส่ 'use client' เพราะ component นี้ใช้ hooks หลายตัว
// (useSearchParams, useState, useMemo, useEffect)
// React JS: ไม่ต้องใส่บรรทัดนี้ เพราะทุก component เป็น client อยู่แล้ว

import { useState, useMemo, useEffect } from 'react';
// useState  = เก็บ state (filters, sort, view)
// useMemo   = cache ผลลัพธ์การคำนวณ filter+sort (re-compute เฉพาะเมื่อ deps เปลี่ยน)
// useEffect = sync ข้อมูลจาก URL เข้า state ตอน mount

import { useSearchParams } from 'next/navigation';
// 🔑 useSearchParams — อ่าน query string จาก URL
// เช่น URL = /listings?location=Bangkok
//      searchParams.get('location') → 'Bangkok'
//
// 🔑 React JS (React Router):
//   import { useSearchParams } from 'react-router-dom';
//   const [searchParams, setSearchParams] = useSearchParams();
//   → คล้ายกัน แต่ Next.js version เป็น read-only (ไม่มี setSearchParams)
//   → Next.js ใช้ router.push() หรือ router.replace() แทน

import { properties } from '@/lib/mock-data';
// properties = array ของ Property ทั้ง 12 รายการ (mock data แทน database)
// 🔑 Next.js: import ตรง ๆ ใน client component ได้ เพราะ mock-data ไม่ได้ใช้ server-only APIs
//    ในโปรเจกต์จริง: อาจ fetch จาก API แทน

import PropertyCard from '@/components/PropertyCard';
// Component การ์ดแสดง property แต่ละรายการ

import FilterSidebar, { FilterValues, DEFAULT_FILTERS } from '@/components/FilterSidebar';
// FilterSidebar   = component ตัว sidebar filter UI
// FilterValues    = TypeScript interface สำหรับ type ของ filters state
// DEFAULT_FILTERS = ค่าเริ่มต้นของ filters — ใช้ตอน init state และ reset

// -----------------------------------------------------------------------------
// 📋 ตัวเลือกการเรียงลำดับ — ใช้ render <select> dropdown
// -----------------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },          // เรียงตาม featured flag
  { value: 'price-asc', label: 'Price: Low to High' }, // ราคาน้อย → มาก
  { value: 'price-desc', label: 'Price: High to Low' }, // ราคามาก → น้อย
  { value: 'rating', label: 'Highest Rated' },        // คะแนนสูงสุดก่อน
  { value: 'newest', label: 'Newest' },                // ใหม่สุดก่อน (ปี สร้าง)
];

// =============================================================================
// 🏗️ Component หลัก — ListingsClient
// =============================================================================
export default function ListingsClient() {
  // ---------------------------------------------------------------------------
  // 🔍 useSearchParams — อ่าน query params จาก URL
  // ---------------------------------------------------------------------------
  // 🔑 Next.js 15: useSearchParams() ต้องอยู่ภายใน <Suspense>
  //    ถ้าไม่ wrap → จะ error ตอน build
  //    ดู app/listings/page.tsx ที่ wrap <Suspense fallback={...}>
  //
  // 🔑 React JS (React Router):
  //    const [searchParams] = useSearchParams();  ← มี setter ด้วย
  //    Next.js: const searchParams = useSearchParams();  ← read-only
  const searchParams = useSearchParams();

  // ---------------------------------------------------------------------------
  // 📦 State: filters — ค่า filter ทั้งหมด (ส่งไป FilterSidebar)
  // ---------------------------------------------------------------------------
  // เริ่มต้นจาก DEFAULT_FILTERS แต่ override location จาก URL (ถ้ามี)
  // เช่น URL = /listings?location=Bangkok → filters.location = 'Bangkok'
  const [filters, setFilters] = useState<FilterValues>({
    ...DEFAULT_FILTERS,
    location: searchParams.get('location') ?? '',
    // ?? '' = ถ้า searchParams.get() return null → ใช้ '' แทน
  });

  // ---------------------------------------------------------------------------
  // 📦 State: sort — วิธีเรียงลำดับปัจจุบัน
  // ---------------------------------------------------------------------------
  const [sort, setSort] = useState('featured');

  // ---------------------------------------------------------------------------
  // 📦 State: view — โหมดแสดงผล (grid หรือ list)
  // ---------------------------------------------------------------------------
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // ---------------------------------------------------------------------------
  // 🔄 useEffect — Sync location จาก URL เข้า state เมื่อ URL เปลี่ยน
  // ---------------------------------------------------------------------------
  // ทำไมต้อง useEffect ทั้ง ๆ ที่ตั้ง initial state จาก URL แล้ว?
  //   → เพราะ URL อาจเปลี่ยนหลัง mount (เช่น user กด back button)
  //   → useEffect จับการเปลี่ยนแปลงของ searchParams แล้ว sync เข้า state
  //
  // 🔑 Dependency array [searchParams]:
  //   → Effect จะทำงานใหม่ทุกครั้งที่ searchParams เปลี่ยน
  //   → ถ้าใส่ [] (empty) จะทำแค่ครั้งเดียวตอน mount
  useEffect(() => {
    const loc = searchParams.get('location');
    if (loc) setFilters((f) => ({ ...f, location: loc }));
    // setFilters((f) => ...) ใช้ functional update
    // เพื่อไม่ต้องใส่ filters ใน dependency array (ป้องกัน infinite loop)
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // 🧮 useMemo — Filter + Sort properties (คำนวณใหม่เฉพาะเมื่อ deps เปลี่ยน)
  // ---------------------------------------------------------------------------
  // 🔑 ทำไมต้อง useMemo?
  //   - properties มี 12 รายการ (ไม่เยอะ) แต่ถ้ามี 1000+ จะเห็นผลชัด
  //   - ถ้าไม่ใช้ useMemo → ทุกครั้งที่ component re-render (เช่น เปลี่ยน view mode)
  //     filter+sort จะถูกคำนวณใหม่ทั้งหมด ทั้ง ๆ ที่ filters/sort ไม่ได้เปลี่ยน
  //   - useMemo cache ผลลัพธ์ → คืนค่าเดิมถ้า [filters, sort] ไม่เปลี่ยน
  //
  // 🔑 Dependency array [filters, sort]:
  //   → คำนวณใหม่เมื่อ filters หรือ sort เปลี่ยน
  //   → ถ้าเปลี่ยนแค่ view → ไม่คำนวณใหม่ (ใช้ cache)
  const filtered = useMemo(() => {
    // spread เป็น array ใหม่ เพราะ .sort() mutate array ต้นฉบับ
    let result = [...properties];

    // ----- Location filter: ค้นหาจาก city, state, location, address -----
    if (filters.location) {
      const q = filters.location.toLowerCase();
      result = result.filter(
        (p) =>
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }

    // ----- Price filter: กรองตามช่วงราคา -----
    result = result.filter(
      (p) => p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    // ----- Area filter: กรองตามพื้นที่ -----
    result = result.filter(
      (p) => p.area >= filters.areaMin && p.area <= filters.areaMax
    );

    // ----- Type filter: กรองตามประเภท (ถ้าเลือกไว้) -----
    // ถ้าไม่เลือกเลย (types = []) → แสดงทุกประเภท
    if (filters.types.length > 0) {
      result = result.filter((p) => filters.types.includes(p.type));
    }

    // ----- Amenities filter: ต้องมีครบทุก amenity ที่เลือก (AND logic) -----
    // every() = ทุกตัวที่เลือกต้องอยู่ใน property.amenities
    // ถ้าใช้ some() จะเป็น OR logic (มีอย่างใดอย่างหนึ่งก็ผ่าน)
    if (filters.amenities.length > 0) {
      result = result.filter((p) =>
        filters.amenities.every((a) => p.amenities.includes(a))
      );
    }

    // ----- Sort: เรียงลำดับตามตัวเลือก -----
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);       // ราคาน้อย → มาก
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);       // ราคามาก → น้อย
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);     // คะแนนสูง → ต่ำ
        break;
      case 'newest':
        result.sort((a, b) => b.yearBuilt - a.yearBuilt); // ปีสร้างใหม่ → เก่า
        break;
      default:
        // 'featured' — property ที่ featured = true มาก่อน
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [filters, sort]);

  // ---------------------------------------------------------------------------
  // 🎨 Render UI
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ================================================================= */}
      {/* 📋 Page Header                                                    */}
      {/* ================================================================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Property Listings
        </h1>
        <p className="text-gray-500 text-sm">
          Find your perfect home from our curated selection of premium properties
        </p>
      </div>

      {/* ================================================================= */}
      {/* 📐 Layout: Sidebar (ซ้าย) + Main Content (ขวา)                   */}
      {/* ================================================================= */}
      {/* flex-col บนจอเล็ก (sidebar อยู่บน) → lg:flex-row บนจอใหญ่ (sidebar อยู่ซ้าย) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🔍 FilterSidebar — ส่ง filters state + onChange callback      */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🔑 "Lifting State Up" pattern:                                 */}
        {/*   - filters state อยู่ที่นี่ (ListingsClient)                  */}
        {/*   - ส่ง filters → FilterSidebar เพื่อแสดงผล                    */}
        {/*   - ส่ง setFilters → FilterSidebar เพื่อรับค่ากลับ             */}
        {/*   - resultCount = จำนวนผลลัพธ์หลัง filter                     */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 📦 Main Content — Toolbar + Results                            */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* min-w-0 = ป้องกัน flex item ล้นออกนอก container */}

          {/* ============================================================= */}
          {/* 🔧 Toolbar — แสดงจำนวน, Sort dropdown, View toggle           */}
          {/* ============================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            {/* จำนวนผลลัพธ์ */}
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'property' : 'properties'}
            </p>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <label htmlFor="sort-select" className="sr-only">
                Sort by
              </label>
              {/* sr-only = ซ่อนจากตา แต่ screen reader อ่านได้ (Accessibility) */}
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* View Toggle — Grid / List */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Grid View Button */}
                <button
                  onClick={() => setView('grid')}
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  className={`p-2 transition-colors ${
                    view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                {/* List View Button */}
                <button
                  onClick={() => setView('list')}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  className={`p-2 transition-colors ${
                    view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* 📊 Results — แสดง PropertyCard หรือ Empty State               */}
          {/* ============================================================= */}
          {filtered.length === 0 ? (
            // ─────────────────────────────────────────────────────────────
            // 🚫 Empty State — ไม่มี property ตรงตามเงื่อนไข
            // ─────────────────────────────────────────────────────────────
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your filters to see more results.
              </p>
              {/* ปุ่ม Clear All Filters — reset กลับค่าเริ่มต้น */}
              <button
                onClick={() =>
                  setFilters({
                    ...DEFAULT_FILTERS,
                    location: '',
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // ─────────────────────────────────────────────────────────────
            // 📊 Property Grid/List — แสดง PropertyCard ตาม view mode
            // ─────────────────────────────────────────────────────────────
            // grid mode: 1 col (mobile) → 2 col (sm) → 3 col (xl)
            // list mode: 1 col ทุกขนาดจอ (stack แนวตั้ง)
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}       // key = unique identifier สำหรับ React reconciliation
                  property={property}      // ส่งข้อมูล property ทั้งก้อน
                  featured={property.featured}  // ถ้า featured = true → การ์ดมีขอบสีฟ้า
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
