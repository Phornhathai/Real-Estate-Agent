import type { Metadata } from "next";

import Link from "next/link";

import Image from "next/image";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { toProperty } from "@/lib/transform";
import ImageGallery from "@/components/ImageGallery";
// ImageGallery = Client Component สำหรับ lightbox gallery (มี 'use client')

// 📐 TypeScript Interface สำหรับ Props

interface Props {
  params: Promise<{ id: string }>;
  // params.id = ค่าจาก URL segment [id]
  // เช่น /listings/prop-001 → id = "prop-001"
}

//
// ทำอะไร: บอก Next.js ตอน build ว่ามี [id] อะไรบ้าง
// ผลลัพธ์: Next.js จะ pre-render HTML ของทุก id ล่วงหน้า (SSG)
//          → /listings/prop-001, /listings/prop-002, ... ถูกสร้างเป็น HTML พร้อมใช้
//
//

//
// ทำอะไร: สร้าง <title>, <meta description>, <meta og:*> แบบ dynamic
//          แต่ละ property จะได้ metadata ไม่ซ้ำกัน
//
//             → render ฝั่ง client → bot อาจอ่านไม่ทัน
//
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const raw = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, agent: true },
  });
  const property = raw ? toProperty(raw) : null;
  if (!property) {
    return { title: "Property Not Found" };
  }
  return {
    // title จะกลายเป็น <title> ใน HTML head
    title: `${property.name} — ${property.type} in ${property.location}`,

    // description จะกลายเป็น <meta name="description">
    description: `${property.bedrooms} bed, ${property.bathrooms} bath ${property.type.toLowerCase()} in ${property.location}. ${property.area.toLocaleString()} ตร.ม. · ฿${property.price.toLocaleString()}/${property.priceType}. ${property.description.slice(0, 100)}...`,

    // openGraph = metadata สำหรับ Facebook, LINE, Twitter เวลาแชร์ลิงก์
    openGraph: {
      title: `${property.name} | Home Reality`,
      description: property.description.slice(0, 200),
      url: `https://www.aumestatestudio.com/listings/${property.id}`,
      images: [
        {
          url: property.images[0], // รูปแรกเป็น og:image (preview ตอนแชร์)
          width: 1200,
          height: 630,
          alt: property.name,
        },
      ],
    },
  };
}

// Record<string, string> = TypeScript type สำหรับ object ที่ key เป็น string, value เป็น string
const TYPE_COLORS: Record<string, string> = {
  House: "bg-emerald-100 text-emerald-700",
  Villa: "bg-purple-100 text-purple-700",
  Apartment: "bg-blue-100 text-blue-700",
  Condo: "bg-amber-100 text-amber-700",
};

// ไม่ได้ export ออกไป — เป็น helper component ภายใน
// ไม่ต้อง 'use client' เพราะไม่มี state/hooks — render บน server ได้
function StarRating({ rating }: { rating: number }) {
  return (
    // aria-label สำหรับ screen reader อ่านค่า rating
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {/* สร้าง array ขนาด 5 → วนลูปแสดงดาว 5 ดวง */}
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          // ดาวที่ index < rating จะเป็นสีเหลือง, ที่เหลือเป็นสีเทา
          className={`w-4 h-4 ${i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-200"}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {/* แสดงตัวเลข rating ข้างดาว เช่น 4.8 */}
      <span className="text-sm font-semibold text-gray-900 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

//   - เป็น async function → สามารถ await ได้โดยตรง
//   - ไม่มี 'use client' → render บน server
//   - import data จาก lib ได้เลย → ไม่ต้อง useEffect + fetch
//
//     function PropertyDetail() {
//       const { id } = useParams();
//       const [property, setProperty] = useState(null);
//       const [loading, setLoading] = useState(true);
//       useEffect(() => {
//         fetch(`/api/properties/${id}`)
//           .then(res => res.json())
//           .then(data => { setProperty(data); setLoading(false); });
//       }, [id]);
//       if (loading) return <Spinner />;
//       if (!property) return <NotFound />;
//       return (...);
//     }
//
//     async function PropertyDetailPage({ params }) {
//       const { id } = await params;
//       const property = getPropertyById(id);
//       if (!property) notFound();
//       return (...);
//     }
//     → สั้นกว่ามาก, ไม่ต้อง loading state, SEO ดีกว่า
export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const raw = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, agent: true },
  });
  const property = raw ? toProperty(raw) : null;
  //   → redirect ไปแสดง app/not-found.tsx อัตโนมัติ
  //   → ส่ง HTTP 404 status code ที่ถูกต้อง (สำคัญสำหรับ SEO)
  //   → ไม่ส่ง HTTP 404 จริงๆ (SPA ส่ง 200 เสมอ ถ้าไม่มี SSR)
  if (!property) {
    notFound();
  }

  // 📊 JSON-LD Structured Data — ข้อมูลสำหรับ Google Search
  //   - เป็น format ที่ Google แนะนำสำหรับ structured data
  //   - ช่วยให้ Google เข้าใจเนื้อหาหน้าเว็บ → แสดง rich results (snippet พิเศษ)
  //   - ใส่ใน <script type="application/ld+json"> ใน HTML
  //
  //   → แต่ถ้าไม่มี SSR, Google bot อาจอ่านไม่ทัน
  //   → Google bot อ่านได้ทันที
  //
  // Schema ที่ใช้: https://schema.org/Home RealityListing
  const jsonLd = {
    "@context": "https://schema.org", // บอก Google ว่าใช้ schema.org
    "@type": "Home RealityListing", // ประเภท: ประกาศอสังหาริมทรัพย์
    name: property.name, // ชื่อ property
    description: property.description, // คำอธิบาย
    url: `https://www.aumestatestudio.com/listings/${property.id}`, // URL ของหน้านี้
    image: property.images, // array รูปภาพทั้งหมด
    offers: {
      "@type": "Offer",
      price: property.price, // ราคา
      priceCurrency: "THB", // สกุลเงิน
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: property.price,
        priceCurrency: "THB",
        unitText: property.priceType === "month" ? "MON" : "ANN", // ต่อเดือน/ต่อปี
      },
      // availability: InStock = ว่างอยู่, OutOfStock = ไม่ว่าง
      availability: property.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address, // ที่อยู่
      addressLocality: property.city,
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.coordinates.lat, // ละติจูด
      longitude: property.coordinates.lng, // ลองจิจูด
    },
    numberOfRooms: property.bedrooms, // จำนวนห้องนอน
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area, // พื้นที่ใช้สอย
      unitCode: "FTK", // หน่วย: ตารางฟุต
    },
    agent: {
      "@type": "Home RealityAgent",
      name: property.agent.name, // ชื่อ agent
      email: property.agent.email,
      telephone: property.agent.phone,
    },
  };

  return (
    <>
      {/* ================================================================= */}
      {/* 📊 JSON-LD Script Tag                                             */}
      {/* ================================================================= */}
      {/* ใส่ JSON-LD ลงใน HTML ผ่าน <script type="application/ld+json">    */}
      {/* dangerouslySetInnerHTML ใช้แทน textContent เพราะ React ไม่ให้ใส่   */}
      {/* children ใน <script> โดยตรง                                       */}
      {/* 🔑 React JS: ใช้ react-helmet: <Helmet><script>...</script></Helmet> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ================================================================= */}
      {/* 📄 Article Container — ใช้ <article> สำหรับ semantic HTML          */}
      {/* ================================================================= */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 🧭 Breadcrumb Navigation                                      */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* Breadcrumb ช่วย: 1) User รู้ว่าอยู่ตรงไหน 2) SEO ดีขึ้น       */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              {/* 🔑 Next.js Link: href="/" — React JS Link: to="/" */}
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
            </li>
            {/* ลูกศร separator (aria-hidden เพราะเป็น decorative) */}
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <Link href="/listings" className="hover:text-gray-900 transition-colors">
                Listings
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            {/* aria-current="page" บอก screen reader ว่านี่คือหน้าปัจจุบัน */}
            <li aria-current="page" className="text-gray-900 font-medium truncate max-w-xs">
              {property.name}
            </li>
          </ol>
        </nav>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* 📐 Grid Layout: 2 คอลัมน์ (content + sidebar)                 */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* lg:grid-cols-3 = 3 คอลัมน์บนจอใหญ่                            */}
        {/* lg:col-span-2 = content กิน 2 คอลัมน์, sidebar กิน 1           */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============================================================= */}
          {/* 📷 Left Column — Gallery + Details (กว้าง 2/3)                 */}
          {/* ============================================================= */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─── Image Gallery (Client Component) ────────────────────── */}
            {/* 🔑 ImageGallery มี 'use client' เพราะมี lightbox state      */}
            {/* Server Component (ไฟล์นี้) ส่ง props ให้ Client Component ได้ */}
            <ImageGallery images={property.images} propertyName={property.name} />

            {/* ─── Property Header: ชื่อ + ราคา + rating ───────────────── */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  {/* Type Badge + Available Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* ?? = Nullish Coalescing — ถ้า TYPE_COLORS ไม่มี key นี้ ใช้สีเทา */}
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        TYPE_COLORS[property.type] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {property.type}
                    </span>
                    {/* แสดง Available badge เฉพาะเมื่อ property.available = true */}
                    {property.available && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <span
                          className="w-1.5 h-1.5 bg-green-500 rounded-full"
                          aria-hidden="true"
                        />
                        Available
                      </span>
                    )}
                  </div>
                  {/* ชื่อ Property — h1 สำหรับ SEO (ทุกหน้าควรมี h1 เดียว) */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {property.name}
                  </h1>
                  {/* ที่อยู่ — ใช้ <address> สำหรับ semantic HTML */}
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg
                      className="w-4 h-4 shrink-0"
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
                    <address className="not-italic text-sm">{property.address}</address>
                  </div>
                </div>
                {/* ราคา (มุมขวา) */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ฿{property.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">per {property.priceType}</div>
                </div>
              </div>

              {/* Star Rating + Review Count + Year Built */}
              {/* <div className="flex items-center gap-4">
                <StarRating rating={property.rating} />
                <span className="text-sm text-gray-500">
                  {property.reviewCount} reviews
                </span>
                <span className="text-gray-200">|</span>
                <span className="text-sm text-gray-500">Built {property.yearBuilt}</span>
              </div> */}
            </div>

            {/* ─── Key Specs: 4 กล่อง (Bedrooms, Bathrooms, Area, Land) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* ใช้ array.map แทนเขียน JSX ซ้ำ 4 ครั้ง */}
              {[
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 6h18M3 14h10"
                      />
                    </svg>
                  ),
                  label: "Bedrooms",
                  value: property.bedrooms,
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 14H3v5h5v-5zm7 0h-4v5h4v-5zm7 0h-4v5h5v-5zM3 10h18"
                      />
                    </svg>
                  ),
                  label: "Bathrooms",
                  value: property.bathrooms,
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  ),
                  label: "Living Area",
                  value: `${property.area.toLocaleString()} ตร.ม.`,
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  ),
                  label: "Land Area",
                  value:
                    property.landArea > 0 ? `${property.landArea.toLocaleString()} ตร.ม.` : "N/A",
                },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center gap-2"
                >
                  <div className="text-blue-600">{spec.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{spec.value}</div>
                  <div className="text-xs text-gray-500">{spec.label}</div>
                </div>
              ))}
            </div>

            {/* ─── Tabs Section: Overview / Amenities / Location ────────── */}
            {/* หมายเหตุ: tab นี้เป็น static (ยังไม่ interactive) แสดง Overview เท่านั้น */}
            <div>
              {/* Tab Headers */}
              <div className="border-b border-gray-100 mb-6">
                <div className="flex gap-6">
                  {["Overview", "Amenities", "Location"].map((tab, i) => (
                    <button
                      key={tab}
                      // tab แรก (i === 0) = active (สี blue), ที่เหลือ = inactive (สีเทา)
                      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                        i === 0
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overview Tab Content */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this property</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>

                {/* Additional Details — ตารางข้อมูลเพิ่มเติม */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { label: "Property Type", value: property.type },
                    { label: "Year Built", value: property.yearBuilt },
                    { label: "Parking Spaces", value: property.parking },
                    {
                      label: "Availability",
                      value: property.available ? "Available Now" : "Not Available",
                    },
                  ].map((detail) => (
                    <div
                      key={detail.label}
                      className="flex justify-between py-2.5 border-b border-gray-100"
                    >
                      <span className="text-sm text-gray-500">{detail.label}</span>
                      <span className="text-sm font-medium text-gray-900">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Amenities List ───────────────────────────────────────── */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* วนลูปแสดง amenity แต่ละตัวพร้อม checkmark icon */}
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5"
                  >
                    {/* วงกลมสีฟ้า + checkmark */}
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Map Placeholder ──────────────────────────────────────── */}
            {/* ใช้ CSS gradient + grid pattern แทนแผนที่จริง (mock project) */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div
                className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center"
                role="img"
                aria-label={`Map showing location of ${property.name} at ${property.address}`}
              >
                {/* Decorative grid pattern — เลียนแบบเส้นกริดของแผนที่ */}
                <div
                  className="absolute inset-0 opacity-20"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="relative text-center">
                  {/* Pin icon วงกลมสีฟ้า */}
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <svg
                      className="w-7 h-7 text-white"
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
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{property.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{property.address}</p>
                  {/* แสดงพิกัด GPS */}
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 bg-white rounded-full px-3 py-1.5 shadow-sm border border-blue-100">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Lat {property.coordinates.lat.toFixed(4)}, Lng{" "}
                    {property.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* 📌 Right Column — Sidebar (กว้าง 1/3)                          */}
          {/* ============================================================= */}
          <aside className="space-y-6" aria-label="Property sidebar">
            {/* ─── Price Card (sticky ติดหน้าจอ) ───────────────────────── */}
            {/* sticky top-24 = ติดอยู่ห่างจากบน 24 (96px) ตอน scroll */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
              {/* ราคาและที่ตั้ง */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  ฿{property.price.toLocaleString()}
                  <span className="text-base font-normal text-gray-500">/{property.priceType}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{property.location}</div>
              </div>

              {/* Quick Specs — 3 คอลัมน์: Beds / Baths / ตร.ม. */}
              <div className="grid grid-cols-3 gap-3 mb-5 py-4 border-y border-gray-100">
                <div className="text-center">
                  <div className="font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-xs text-gray-500">Beds</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-xs text-gray-500">Baths</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{property.area.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">ตร.ม.</div>
                </div>
              </div>

              {/* CTA Buttons — ปุ่ม Order + Schedule */}
              <div className="space-y-3">
                <a
                  href="tel:0639399665"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Order Now
                </a>
              </div>
            </div>

            {/* ─── Agent Card ──────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Your Agent</h3>
              <div className="flex items-start gap-3 mb-4">
                {/* Avatar — ใช้ Next.js Image สำหรับ optimization */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  {property.agent.avatar ? (
                    <Image
                      src={property.agent.avatar}
                      alt={`Agent ${property.agent.name}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-semibold">
                      {property.agent.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{property.agent.name}</div>
                  <div className="text-sm text-gray-500">Licensed Home Reality Agent</div>
                  {/* Rating + Listings + Experience */}
                  <div className="flex items-center gap-1 mt-1">
                    {/* <svg
                      className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg> */}
                    {/* <span className="text-xs font-medium text-gray-700">
                      {property.agent.rating}
                    </span> */}
                    <span className="text-xs text-gray-400">{property.agent.experience}yr exp</span>
                  </div>
                </div>
              </div>

              {/* Agent Bio — line-clamp-3 จำกัดแค่ 3 บรรทัด */}
              <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
                {property.agent.bio}
              </p>

              {/* Agent Contact Links */}
              <div className="space-y-2.5">
                {/* โทรศัพท์ — href="tel:..." เปิดแอปโทรบนมือถือ */}
                <a
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  {property.agent.phone}
                </a>
                {/* อีเมล — href="mailto:..." เปิดแอปอีเมล */}
                <a
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="truncate">{property.agent.email}</span>
                </a>
              </div>

              {/* ลิงก์ไปหน้า Contact */}
              <Link
                href="/contact"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-blue-200 text-blue-600 text-sm font-medium rounded-xl hover:bg-blue-50 transition-colors"
              >
                Contact Agent
              </Link>
            </div>

            {/* ─── Share Card ──────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Share this property</h3>
              <div className="flex gap-2">
                {/* ปุ่ม share 3 แบบ: Copy Link, Email, WhatsApp */}
                {["Copy Link", "Email", "WhatsApp"].map((method) => (
                  <button
                    key={method}
                    className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
