import type { Metadata } from 'next';

import Image from 'next/image';

import Link from 'next/link';


import { prisma } from '@/lib/prisma';
// agents = array ข้อมูล agent ทั้ง 3 คน
//     const [agents, setAgents] = useState([]);
//     useEffect(() => {
//       fetch('/api/agents').then(res => res.json()).then(setAgents);
//     }, []);
//
//     import { agents } from '@/lib/mock-data';
//     → ไม่ต้อง fetch, ไม่ต้อง useState, ไม่ต้อง useEffect
//     → data พร้อมใช้ตั้งแต่ server render

//   - Static metadata: ใช้เมื่อ metadata ไม่เปลี่ยนตาม params (เช่น หน้า Contact)
//   - Dynamic metadata: ใช้เมื่อ metadata ขึ้นอยู่กับ params (เช่น หน้า /listings/[id])
//
//   → render ฝั่ง client → bot อาจอ่านไม่ทัน
export const metadata: Metadata = {
  title: 'Contact Us — Meet Our Expert Agents',
  // title กลายเป็น <title> ใน HTML <head>

  description:
    'Get in touch with our team of experienced real estate agents. We are here to help you buy, rent, or sell your property in California.',
  // description กลายเป็น <meta name="description" content="...">

  // openGraph = metadata สำหรับ social media (Facebook, LINE, Twitter)
  openGraph: {
    title: 'Contact Home Reality',
    description:
      'Connect with our expert agents. We help you find, buy, rent or sell properties across California.',
    url: 'https://www.aumestatestudio.com/contact',
  },
};

// 📍 OFFICE_INFO — ข้อมูลสำนักงาน (constant ใช้ใน JSX)
// แยกออกมาเป็น constant เพื่อ:
//   1. ไม่ทำให้ JSX รก
//   2. แก้ไขข้อมูลได้ง่ายที่เดียว
//   3. ใช้ .map() วนลูปแสดง UI ซ้ำๆ ได้
const OFFICE_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Office Address',
    value: '99/1 ถนนสุขุมวิท แขวงคลองเตย\nกรุงเทพมหานคร 10110',
    // \n จะถูก render เป็นบรรทัดใหม่ด้วย whitespace-pre-line
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+66 2 123 4567',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'hello@realestatethailand.com',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Office Hours',
    value: 'Mon–Fri: 9am – 7pm\nSat–Sun: 10am – 5pm',
  },
];

//
//   ใน Next.js มันเป็น Server Component อัตโนมัติ (ไม่ส่ง JS ไป client)
export default async function ContactPage() {
  const agents = await prisma.agent.findMany({ orderBy: { name: 'asc' } });
  return (
    <>
      {/* ================================================================= */}
      {/* 🦸 Hero Section — Banner ด้านบนสุดของหน้า                         */}
      {/* ================================================================= */}
      {/* gradient background สีน้ำเงินเข้ม + dot pattern decorative        */}
      <section
        className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 overflow-hidden"
        aria-labelledby="contact-hero-heading"
        // aria-labelledby ชี้ไปที่ h1 → screen reader รู้ว่า section นี้เกี่ยวกับอะไร
      >
        {/* Decorative dot pattern — เพิ่มความสวยงาม (aria-hidden ซ่อนจาก screen reader) */}
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge แสดงเวลาตอบกลับ */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
            We typically respond within 2 hours
          </div>
          {/* h1 — heading หลักของหน้า (สำคัญสำหรับ SEO) */}
          <h1
            id="contact-hero-heading"
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Get in Touch
          </h1>
          <p className="text-lg text-blue-100/80">
            Whether you&apos;re buying, renting, or selling — our expert agents are ready to guide
            you every step of the way.
          </p>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 📝 Main Content — Contact Form + Office Info                      */}
      {/* ================================================================= */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid: 2/3 สำหรับ form, 1/3 สำหรับ office info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* ─── LINE Contact (2/3 ของ grid) ─────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">ติดต่อเราผ่าน LINE</h2>
                <p className="text-gray-500 text-sm">
                  สแกน QR Code หรือกดปุ่มด้านล่างเพื่อเพิ่มเพื่อนและส่งข้อความหา agent โดยตรง
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">

                  {/* QR Code */}
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl border-2 border-[#06C755] shadow-md">
                      <Image
                        src="/qr-line.png"
                        alt="LINE QR Code — Home Reality"
                        width={180}
                        height={180}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-400">สแกนด้วยกล้องมือถือหรือ LINE app</p>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col items-center sm:items-start gap-5 text-center sm:text-left">
                    {/* LINE logo + ID */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#06C755' }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">LINE ID</p>
                        <p className="text-xl font-bold text-gray-900 tracking-wide">@HomeReality</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                      เพิ่มเพื่อนแล้วส่งข้อความมาได้เลยค่ะ agent ของเราพร้อมตอบทุกวัน
                      <br />
                      <span className="font-medium text-gray-700">จันทร์–ศุกร์ 9:00–19:00 · เสาร์–อาทิตย์ 10:00–17:00</span>
                    </p>

                    {/* ปุ่ม Add Friend */}
                    <a
                      href="https://line.me/ti/p/~homereality"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ background: '#06C755' }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                        <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      เพิ่มเพื่อนใน LINE
                    </a>
                  </div>
                </div>

                {/* Divider + note */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-400">
                    กรณีต้องการให้ agent ติดต่อกลับ กรุณาระบุชื่อ เบอร์โทร และ property ที่สนใจในข้อความค่ะ
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Office Info Sidebar (1/3 ของ grid) ──────────────────── */}
            <aside aria-label="Office contact information">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Our Office</h2>
              {/* วนลูป OFFICE_INFO แสดงข้อมูลสำนักงาน */}
              <div className="space-y-4 mb-8">
                {OFFICE_INFO.map((info) => (
                  <div
                    key={info.label}
                    className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  >
                    {/* Icon วงกลมสีฟ้า */}
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-0.5">{info.label}</div>
                      {/* whitespace-pre-line ทำให้ \n ใน value แสดงเป็นบรรทัดใหม่ */}
                      <div className="text-sm text-gray-900 whitespace-pre-line">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── Map Placeholder ────────────────────────────────────── */}
              {/* ใช้ CSS gradient + grid pattern แทนแผนที่จริง (mock project) */}
              <div
                className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center"
                role="img"
                aria-label="Map showing office location in Bangkok"
              >
                {/* Grid lines decorative */}
                <div
                  className="absolute inset-0 opacity-20"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      'linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />
                <div className="relative text-center">
                  {/* Pin icon */}
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Home Reality</p>
                  <p className="text-xs text-gray-500">Bangkok, Thailand</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 👥 Meet Our Agents Section                                        */}
      {/* ================================================================= */}
      {/* 🔑 agents data ถูก import ตรงจาก lib/mock-data.ts                 */}
      {/* ไม่ต้อง fetch API, ไม่ต้อง useEffect, ไม่ต้อง loading state       */}
      {/*                                                                    */}
      {/* 🔑 React JS: ต้องทำแบบนี้:                                        */}
      {/*   const [agents, setAgents] = useState([]);                        */}
      {/*   const [loading, setLoading] = useState(true);                    */}
      {/*   useEffect(() => {                                                */}
      {/*     fetch('/api/agents')                                           */}
      {/*       .then(res => res.json())                                     */}
      {/*       .then(data => { setAgents(data); setLoading(false); });      */}
      {/*   }, []);                                                          */}
      {/*   if (loading) return <Spinner />;                                 */}
      {/*                                                                    */}
      {/* 🔑 Next.js (Server Component):                                    */}
      {/*   import { agents } from '@/lib/mock-data';                        */}
      {/*   → ใช้ agents ใน JSX ได้เลย → สั้นกว่า, เร็วกว่า, SEO ดีกว่า    */}
      <section className="py-16 lg:py-20 bg-white" aria-labelledby="agents-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium text-sm mb-2">✦ Our Team</p>
            <h2 id="agents-heading" className="text-3xl font-bold text-gray-900">
              Meet Our Expert Agents
            </h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Experienced professionals dedicated to helping you find the perfect property
            </p>
          </div>

          {/* ─── Agent Cards Grid ───────────────────────────────────────── */}
          {/* 🔑 agents.map() — วนลูป array ที่ import มาจาก mock-data     */}
          {/* ไม่ต้อง fetch, ไม่ต้อง loading state → Server Component ทำได้ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header gradient สีน้ำเงิน (decorative) */}
                <div className="h-28 bg-gradient-to-br from-blue-600 to-indigo-700" aria-hidden="true" />
                <div className="px-6 pb-6">
                  {/* Avatar — -mt-12 ดึงขึ้นมาทับ gradient ข้างบน */}
                  <div className="relative -mt-12 mb-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                      {agent.avatar ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">{agent.name[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Agent Info */}
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">{agent.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">
                    Licensed Home Reality Agent
                  </p>

                  {/* Stats Row: Rating | Listings | Experience */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {agent.rating}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{agent.totalListings} listings</span>
                    <span className="text-gray-300">|</span>
                    <span>{agent.experience}yr exp</span>
                  </div>

                  {/* Bio — line-clamp-3 จำกัดแค่ 3 บรรทัด */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
                    {agent.bio}
                  </p>

                  {/* Contact Links */}
                  <div className="space-y-2 mb-5">
                    {/* href="tel:..." เปิดแอปโทรบนมือถือ */}
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {agent.phone}
                    </a>
                    {/* href="mailto:..." เปิดแอปอีเมล */}
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {agent.email}
                    </a>
                  </div>

                  {/* View Listings — ลิงก์ไปหน้า /listings พร้อม filter agent */}
                  {/* 🔑 Next.js Link: href="/listings?agent=..." */}
                  {/* 🔑 React JS Link: to="/listings?agent=..." */}
                  <Link
                    href={`/listings?agent=${agent.id}`}
                    className="block text-center py-2.5 border border-blue-200 text-blue-600 text-sm font-medium rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    View Listings
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* ❓ FAQ Section — ใช้ native HTML <details>/<summary>               */}
      {/* ================================================================= */}
      {/* 🔑 <details>/<summary> = accordion ของ browser (ไม่ต้อง JS!)     */}
      {/* ข้อดี: ไม่ต้อง useState สำหรับเปิด/ปิด → ไม่ต้อง 'use client'   */}
      {/*                                                                    */}
      {/* 🔑 React JS: มักใช้ useState + onClick สำหรับ accordion           */}
      {/*   const [openIndex, setOpenIndex] = useState(null);                */}
      {/*   → ต้องเขียน logic เปิด/ปิดเอง                                   */}
      {/*                                                                    */}
      {/* 🔑 Next.js (Server Component): ใช้ <details> native              */}
      {/*   → ไม่ต้อง JS, ไม่ต้อง 'use client', browser จัดการเอง          */}
      <section className="py-16 lg:py-20 bg-gray-50" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="faq-heading" className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {/* วนลูป FAQ items — ใช้ destructuring { q, a } จาก object */}
            {[
              {
                q: 'How do I schedule a property viewing?',
                a: 'Simply contact us via the form above or call our office directly, and our agent will arrange a viewing time that works for you.',
              },
              {
                q: 'Are all listings verified?',
                a: 'Yes. Every property listed on Home Reality is manually reviewed by our team to ensure accuracy of information, pricing, and availability.',
              },
              {
                q: 'Do you charge fees for using the platform?',
                a: "Browsing listings is completely free. Standard real estate agent fees apply when you proceed with a purchase or rental agreement.",
              },
              {
                q: 'Can I list my own property?',
                a: 'Absolutely! Contact our team and we will connect you with one of our licensed agents who will guide you through the listing process.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="bg-white rounded-xl border border-gray-100 shadow-sm group"
                // group = Tailwind class สำหรับ group-open:* ใน children
              >
                {/* summary = ส่วนที่คลิกได้ (หัวข้อ FAQ) */}
                {/* list-none ซ่อน default triangle marker ของ <summary> */}
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-gray-900 text-sm">
                  {q}
                  {/* ลูกศร — group-open:rotate-180 หมุนเมื่อ <details> เปิด */}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                {/* เนื้อหาคำตอบ — แสดงเมื่อ <details> เปิด */}
                <div className="px-5 pb-5 pt-1 text-sm text-gray-500 leading-relaxed border-t border-gray-100">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
