'use client';

import type { PropertyType } from '@/lib/mock-data';
// Import เฉพาะ type — ไม่เพิ่มขนาด JS bundle
// PropertyType = 'House' | 'Villa' | 'Apartment' | 'Condo' (union type)

// export เพราะ ListingsClient.tsx ต้อง import ไปใช้เป็น type ของ useState
export interface FilterValues {
  location: string;           // คำค้นหาสถานที่ เช่น "Bangkok"
  priceMin: number;           // ราคาต่ำสุด เช่น 0
  priceMax: number;           // ราคาสูงสุด เช่น 20000
  areaMin: number;            // พื้นที่ต่ำสุด (ft²) เช่น 0
  areaMax: number;            // พื้นที่สูงสุด (ft²) เช่น 10000
  types: PropertyType[];      // ประเภทที่เลือก เช่น ['House', 'Villa']
  amenities: string[];        // สิ่งอำนวยความสะดวกที่เลือก เช่น ['Pool', 'Gym']
}

const PROPERTY_TYPES: PropertyType[] = ['House', 'Villa', 'Apartment', 'Condo'];

const AMENITY_OPTIONS = [
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

interface FilterSidebarProps {
  filters: FilterValues;                    // ค่า filter ปัจจุบัน (controlled by parent)
  onChange: (filters: FilterValues) => void; // callback เมื่อ filter เปลี่ยน → ส่งกลับ parent
  resultCount: number;                       // จำนวนผลลัพธ์หลัง filter — แสดงใน header
}

// export เพราะ ListingsClient.tsx ต้อง import ไปใช้ตอน:
//   1. สร้าง initial state: useState<FilterValues>({ ...DEFAULT_FILTERS })
//   2. Reset filters: setFilters(DEFAULT_FILTERS)
//    ไม่ต้อง hardcode ค่าเดิมซ้ำทั้งใน FilterSidebar และ ListingsClient
export const DEFAULT_FILTERS: FilterValues = {
  location: '',
  priceMin: 0,
  priceMax: 99_999_999,
  areaMin: 0,
  areaMax: 99_999,
  types: [],
  amenities: [],
};

export default function FilterSidebar({ filters, onChange, resultCount }: FilterSidebarProps) {
  // 🔧 Helper: update — อัปเดตเฉพาะ field ที่เปลี่ยน แล้วส่งกลับ parent
  // Partial<FilterValues> = อนุญาตให้ส่งแค่บาง field ก็ได้
  // เช่น update({ location: 'Bangkok' }) → ส่ง { ...filters, location: 'Bangkok' } กลับ
  const update = (patch: Partial<FilterValues>) => onChange({ ...filters, ...patch });

  // 🔧 Helper: toggleType — เปิด/ปิด property type ที่เลือก
  // ถ้า type อยู่ใน array แล้ว → เอาออก (filter)
  // ถ้ายังไม่อยู่ → เพิ่มเข้าไป (spread + append)
  const toggleType = (type: PropertyType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)   // เอาออก
      : [...filters.types, type];                  // เพิ่มเข้าไป
    update({ types });
  };

  // 🔧 Helper: toggleAmenity — เปิด/ปิด amenity ที่เลือก (logic เหมือน toggleType)
  const toggleAmenity = (amenity: string) => {
    const amenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    update({ amenities });
  };

  // 🔧 Helper: resetFilters — ล้าง filter ทั้งหมดกลับค่าเริ่มต้น
  const resetFilters = () => onChange(DEFAULT_FILTERS);

  // เทียบทุก field กับค่าเริ่มต้น — ถ้า field ไหนต่างจาก default = มี filter active
  const hasActiveFilters =
    filters.location !== '' ||
    filters.priceMin > 0 ||
    filters.priceMax < 99_999_999 ||
    filters.areaMin > 0 ||
    filters.areaMax < 99_999 ||
    filters.types.length > 0 ||
    filters.amenities.length > 0;

  return (
    <aside
      className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6 h-fit lg:sticky lg:top-24"
      // lg:sticky lg:top-24 = ติดอยู่กับหน้าจอตอน scroll (บนจอใหญ่)
      // h-fit = สูงแค่พอดีเนื้อหา (ไม่ยืดเต็ม container)
      aria-label="Property filters"  // Accessibility: บอก screen reader ว่านี่คือ filter
    >
      {/* ================================================================= */}
      {/* 📋 Header — "Filters" + จำนวนผลลัพธ์ + ปุ่ม Reset                */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-base">Filters</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{resultCount} results</span>
          {/* แสดงปุ่ม Reset เฉพาะเมื่อมี filter active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 📍 Location Filter — input ค้นหาตามสถานที่                       */}
      {/* ================================================================= */}
      <div>
        <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          {/* ไอคอน pin — ตำแหน่ง absolute ภายใน input */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
          {/* Input ค้นหา Location */}
          <input
            id="filter-location"
            type="text"
            placeholder="City, neighborhood..."
            value={filters.location}
            onChange={(e) => update({ location: e.target.value })}
            // Controlled input: value มาจาก props, onChange ส่งกลับ parent
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* ปุ่ม X ลบข้อความ — แสดงเฉพาะเมื่อมี text อยู่ */}
          {filters.location && (
            <button
              onClick={() => update({ location: '' })}
              aria-label="Clear location"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 💰 Price Range Filter — slider + number input คู่                 */}
      {/* ================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Price Range</label>
          {/* แสดงช่วงราคาปัจจุบัน */}
          <span className="text-xs text-gray-500">
            ฿{filters.priceMin.toLocaleString()} – ฿{filters.priceMax.toLocaleString()}
            <span className="text-gray-400">/mo</span>
          </span>
        </div>
        <div className="space-y-3">
          {/* Min Price Slider */}
          <div>
            <label htmlFor="price-min" className="text-xs text-gray-500 mb-1 block">
              Min price
            </label>
            <input
              id="price-min"
              type="range"
              min={0}
              max={20000}
              step={500}
              value={filters.priceMin}
              onChange={(e) =>
                // Math.min ป้องกัน min > max (min ต้องน้อยกว่า max อย่างน้อย 500)
                update({ priceMin: Math.min(Number(e.target.value), filters.priceMax - 500) })
              }
              className="w-full accent-blue-600"
              aria-label={`Minimum price: ฿${filters.priceMin}`}
            />
          </div>
          {/* Max Price Slider */}
          <div>
            <label htmlFor="price-max" className="text-xs text-gray-500 mb-1 block">
              Max price
            </label>
            <input
              id="price-max"
              type="range"
              min={0}
              max={20000}
              step={500}
              value={filters.priceMax}
              onChange={(e) =>
                // Math.max ป้องกัน max < min (max ต้องมากกว่า min อย่างน้อย 500)
                update({ priceMax: Math.max(Number(e.target.value), filters.priceMin + 500) })
              }
              className="w-full accent-blue-600"
              aria-label={`Maximum price: ฿${filters.priceMax}`}
            />
          </div>
          {/* Number Inputs — สำหรับพิมพ์ตัวเลขตรง ๆ */}
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => update({ priceMin: Number(e.target.value) })}
              placeholder="Min"
              aria-label="Minimum price input"
              className="w-1/2 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => update({ priceMax: Number(e.target.value) })}
              placeholder="Max"
              aria-label="Maximum price input"
              className="w-1/2 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 📐 Property Area Filter — slider + number input                   */}
      {/* ================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Property Area</label>
          <span className="text-xs text-gray-500">
            {filters.areaMin.toLocaleString()} – {filters.areaMax.toLocaleString()} ตร.ม.
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={10000}
            step={200}
            value={filters.areaMax}
            onChange={(e) => update({ areaMax: Number(e.target.value) })}
            className="w-full accent-blue-600"
            aria-label={`Maximum area: ${filters.areaMax} ตร.ม.`}
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.areaMin}
              onChange={(e) => update({ areaMin: Number(e.target.value) })}
              placeholder="Min ตร.ม."
              aria-label="Minimum area input"
              className="w-1/2 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={filters.areaMax}
              onChange={(e) => update({ areaMax: Number(e.target.value) })}
              placeholder="Max ตร.ม."
              aria-label="Maximum area input"
              className="w-1/2 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 🏠 Type of Place — ปุ่ม toggle เลือกประเภท                       */}
      {/* ================================================================= */}
      <div>
        <legend className="text-sm font-medium text-gray-700 mb-3 block">Type of Place</legend>
        <fieldset className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((type) => {
            const active = filters.types.includes(type);  // เช็คว่าประเภทนี้ถูกเลือกอยู่ไหม
            return (
              <button
                key={type}
                type="button"   // ป้องกัน form submit ถ้าอยู่ใน form
                onClick={() => toggleType(type)}
                aria-pressed={active}  // Accessibility: บอก screen reader ว่าปุ่มถูกกดอยู่ไหม
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'               // เลือกอยู่ = สีน้ำเงิน
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'  // ไม่เลือก = สีขาว
                }`}
              >
                {type}
              </button>
            );
          })}
        </fieldset>
      </div>

      {/* ================================================================= */}
      {/* ✨ Amenities — checkbox list สิ่งอำนวยความสะดวก                   */}
      {/* ================================================================= */}
      <div>
        <legend className="text-sm font-medium text-gray-700 mb-3 block">Amenities</legend>
        {/* max-h-48 overflow-y-auto = จำกัดความสูง scroll ได้ถ้ารายการยาว */}
        <fieldset className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {AMENITY_OPTIONS.map((amenity) => {
            const checked = filters.amenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-2.5 cursor-pointer group"
                // group = ให้ลูก (span) ใช้ group-hover: ได้
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity)}
                  // Controlled checkbox: checked มาจาก state, onChange ส่งกลับ parent
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span
                  className={`text-sm transition-colors ${
                    checked ? 'text-blue-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {amenity}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>
    </aside>
  );
}
