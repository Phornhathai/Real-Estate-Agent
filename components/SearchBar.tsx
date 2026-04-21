'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

// ข้อมูล mock แบบ static — ในโปรเจกต์จริงอาจ fetch จาก API
const SUGGESTIONS = [
  'Beverly Hills, CA',
  'Santa Monica, CA',
  'Malibu, CA',
  'Los Angeles, CA',
  'Pasadena, CA',
  'Palm Springs, CA',
  'San Francisco, CA',
];

export default function SearchBar() {
  // query = ข้อความที่ user พิมพ์ใน search input
  const [query, setQuery] = useState('');

  // type = ประเภท property ที่เลือก ('' = All Types)
  const [type, setType] = useState('');

  // showSuggestions = true เมื่อต้องการแสดง dropdown suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🧭 Router — สำหรับ programmatic navigation
  const router = useRouter();

  // ใช้ .filter() + .includes() เพื่อหา suggestions ที่ตรงกับ query
  // .toLowerCase() เพื่อให้ case-insensitive (พิมพ์ "bev" ก็เจอ "Beverly")
  const filtered = SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  // สร้าง URL query string รวม location + type
  const buildHref = (location: string) => {
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    const qs = params.toString();
    return qs ? `/listings?${qs}` : '/listings';
  };

  const handleSubmit = (e: React.FormEvent) => {
    // e.preventDefault() — ป้องกัน form submit แบบปกติ (ที่จะ reload หน้า)
    e.preventDefault();
    router.push(buildHref(query));
  };

  const handleSelect = (suggestion: string) => {
    // 1. อัพเดท input ให้แสดงค่าที่เลือก
    setQuery(suggestion);
    // 2. ปิด dropdown
    setShowSuggestions(false);
    // 3. Navigate ไปหน้า listings พร้อม location + type ที่เลือก
    router.push(buildHref(suggestion));
  };

  return (
    // max-w-2xl mx-auto = จำกัดความกว้าง + จัดกลาง
    <div className="relative w-full max-w-2xl mx-auto">
      {/* role="search" บอก screen reader ว่านี่คือ search form */}
      <form onSubmit={handleSubmit} role="search">
        {/* Container ของ input + select + button */}
        {/* rounded-2xl shadow-xl = มุมมน + เงาเพื่อให้ดูลอยขึ้นมา */}
        <div className="flex flex-col sm:flex-row sm:items-center bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

          {/* ============================================================= */}
          {/* 📍 Location Input — ช่องค้นหาตามตำแหน่ง                        */}
          {/* ============================================================= */}
          <div className="flex-1 flex items-center px-5 py-4 gap-3">
            {/* Icon pin ตำแหน่ง */}
            <svg
              className="w-5 h-5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // แสดง suggestions เมื่อมีข้อความ (> 0 ตัวอักษร)
                setShowSuggestions(e.target.value.length > 0);
              }}
              // onFocus — แสดง suggestions เมื่อ focus กลับมาที่ input (ถ้ามี query อยู่)
              onFocus={() => setShowSuggestions(query.length > 0)}
              // onBlur — ปิด suggestions เมื่อ click ออก
              // setTimeout 150ms เพื่อให้ onMouseDown ของ suggestion ทำงานก่อน
              // ถ้าไม่มี delay → dropdown จะปิดก่อนที่ click จะถูก register
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Enter city or address (e.g. Bangkok, Sukhumvit)"
              aria-label="Search properties by city or address"
              className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm bg-transparent"
            />
          </div>

          {/* ============================================================= */}
          {/* ─── Divider — เส้นคั่นแนวตั้ง                                  */}
          {/* ============================================================= */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 shrink-0" aria-hidden="true" />
          <div className="sm:hidden h-px w-full bg-gray-200 shrink-0" aria-hidden="true" />

          {/* ============================================================= */}
          {/* 🏠 Property Type Select — dropdown เลือกประเภทอสังหา            */}
          {/* ============================================================= */}
          {/* ⚠️ ตอนนี้เป็น uncontrolled (ไม่มี state) — ยังไม่ได้ใช้ค่า filter */}
          <div className="px-4 sm:px-4">
            <select
              aria-label="Property type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm text-gray-600 outline-none bg-transparent cursor-pointer py-3 sm:py-4"
            >
              <option value="">All Types</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Condo">Condo</option>
            </select>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 shrink-0" aria-hidden="true" />
          <div className="sm:hidden h-px w-full bg-gray-200 shrink-0" aria-hidden="true" />

          {/* ============================================================= */}
          {/* 🔍 Search Button — type="submit" ทำให้กด Enter ได้              */}
          {/* ============================================================= */}
          <button
            type="submit"
            className="m-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {/* Icon แว่นขยาย */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        </div>
      </form>

      {/* =================================================================== */}
      {/* 📋 Suggestions Dropdown — Autocomplete รายชื่อเมือง                  */}
      {/* =================================================================== */}
      {/* แสดงเมื่อ: showSuggestions === true AND มี suggestions ที่ตรง */}
      {/* Conditional rendering: condition && <JSX> — ไม่ render ถ้า false */}
      {showSuggestions && filtered.length > 0 && (
        <div
          // absolute top-full = วางใต้ form พอดี (top-full = 100% จากด้านบน parent)
          // z-50 = อยู่ layer บนสุด ไม่ถูก element อื่นบัง
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          // role="listbox" + aria-label = accessibility สำหรับ dropdown
          role="listbox"
          aria-label="Location suggestions"
        >
          {filtered.map((suggestion) => (
            <button
              key={suggestion}
              role="option"
              aria-selected={false}
              type="button"
              // เพราะ input มี onBlur ที่จะปิด dropdown เมื่อ focus หายไป
              // ลำดับ event: onBlur (input) → onClick (button)
              // ถ้าใช้ onClick → dropdown ถูกปิดก่อนที่ click จะทำงาน!
              // onMouseDown เกิดก่อน onBlur → จึงใช้แทนเพื่อให้ click ทำงานได้
              // (setTimeout ใน onBlur 150ms ก็ช่วยเพิ่มอีกชั้น)
              onMouseDown={() => handleSelect(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Icon pin เล็กๆ ข้างหน้าแต่ละ suggestion */}
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
