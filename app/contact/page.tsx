// =============================================================================
// 📁 app/contact/page.tsx — Contact Page (Server Component)
// =============================================================================
//
// 🔑 Server Component — ไม่มี 'use client':
// ─────────────────────────────────────────────
// ไฟล์นี้เป็น Server Component เพราะ:
//   1. ไม่มี useState, useEffect, useRouter หรือ hooks ใดๆ
//   2. ไม่มี event handlers (onClick, onChange) โดยตรง
//   3. ส่วนที่ต้องมี interactivity (ContactForm) แยกเป็น Client Component ต่างหาก
//
// 🔑 ข้อดีของ Server Component:
//   - HTML ถูก render บน server → ส่งให้ browser พร้อมใช้
//   - ไม่ส่ง JavaScript ไปฝั่ง client (ยกเว้น Client Components ที่ใช้)
//   - SEO ดีเพราะ content อยู่ใน HTML ตั้งแต่แรก
//   - import data ตรงจาก lib ได้ ไม่ต้อง fetch API
//
// 🔑 เทียบกับ React JS:
//   React JS:
//     - ทุก component เป็น Client Component
//     - ต้อง fetch data จาก API: useEffect(() => { fetch('/api/agents') }, [])
//     - ต้องมี loading state: if (loading) return <Spinner />
//     - Content render ฝั่ง client → SEO ไม่ดี (ถ้าไม่มี SSR)
//
//   Next.js (Server Component):
//     - import { agents } from '@/lib/mock-data' → ใช้ได้เลย
//     - ไม่ต้อง fetch, ไม่ต้อง loading state, ไม่ต้อง useEffect
//     - HTML พร้อม content ส่งให้ browser ทันที
//
// 🔑 Pattern: Server Component + Client Component ทำงานร่วมกัน:
//   - ไฟล์นี้ (Server) จัดการ layout, static content, SEO metadata
//   - ContactForm (Client) จัดการ form interaction (useState, useForm)
//   - agents data ถูก import ตรง ไม่ต้องส่งผ่าน API
// =============================================================================

// =============================================================================
// 📦 Imports
// =============================================================================

import type { Metadata } from 'next';
// Metadata = type สำหรับ SEO metadata ของ Next.js
// 🔑 React JS: ใช้ react-helmet: <Helmet><title>Contact</title></Helmet>
// 🔑 Next.js: export const metadata: Metadata = { title: '...' }

import Image from 'next/image';
// Image = Next.js component สำหรับ optimize รูปภาพ (lazy load, responsive, WebP)
// 🔑 React JS: ใช้ <img> ธรรมดา — ไม่มี optimization ในตัว

import Link from 'next/link';
// Link = client-side navigation ไม่ reload หน้า
// 🔑 React JS: <Link to="..."> จาก react-router-dom
// 🔑 Next.js: <Link href="..."> — ใช้ href ไม่ใช่ to

import ContactForm from '@/components/ContactForm';
// ContactForm = Client Component (มี 'use client') — จัดการ form state
// 🔑 Server Component สามารถ render Client Component ได้
//   → Next.js จะส่งเฉพาะ JS ของ ContactForm ไปฝั่ง client
//   → ส่วนที่เหลือของหน้านี้ไม่ส่ง JS ไปเลย

import { agents } from '@/lib/mock-data';
// agents = array ข้อมูล agent ทั้ง 3 คน
// 🔑 นี่คือความแตกต่างสำคัญกับ React JS:
//   React JS: ต้อง fetch จาก API ใน useEffect
//     const [agents, setAgents] = useState([]);
//     useEffect(() => {
//       fetch('/api/agents').then(res => res.json()).then(setAgents);
//     }, []);
//
//   Next.js (Server Component): import ตรงได้เลย!
//     import { agents } from '@/lib/mock-data';
//     → ไม่ต้อง fetch, ไม่ต้อง useState, ไม่ต้อง useEffect
//     → data พร้อมใช้ตั้งแต่ server render

// =============================================================================
// 🏷️ Static Metadata — SEO สำหรับหน้า Contact
// =============================================================================
// 🔑 export const metadata (static) vs generateMetadata() (dynamic):
//   - Static metadata: ใช้เมื่อ metadata ไม่เปลี่ยนตาม params (เช่น หน้า Contact)
//   - Dynamic metadata: ใช้เมื่อ metadata ขึ้นอยู่กับ params (เช่น หน้า /listings/[id])
//
// 🔑 React JS: <Helmet><title>Contact Us</title></Helmet>
//   → render ฝั่ง client → bot อาจอ่านไม่ทัน
// 🔑 Next.js: export const metadata → render ฝั่ง server → bot อ่านได้ทันที
export const metadata: Metadata = {
  title: 'Contact Us — Meet Our Expert Agents',
  // title กลายเป็น <title> ใน HTML <head>

  description:
    'Get in touch with our team of experienced real estate agents. We are here to help you buy, rent, or sell your property in California.',
  // description กลายเป็น <meta name="description" content="...">

  // openGraph = metadata สำหรับ social media (Facebook, LINE, Twitter)
  openGraph: {
    title: 'Contact AumEstate Studio',
    description:
      'Connect with our expert agents. We help you find, buy, rent or sell properties across California.',
    url: 'https://www.aumestatestudio.com/contact',
  },
};

// =============================================================================
// 📍 OFFICE_INFO — ข้อมูลสำนักงาน (constant ใช้ใน JSX)
// =============================================================================
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
    value: '9876 Wilshire Blvd, Suite 400\nBeverly Hills, CA 90210',
    // \n จะถูก render เป็นบรรทัดใหม่ด้วย whitespace-pre-line
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+1 (800) 286-3782',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'hello@aumestatestudio.com',
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

// =============================================================================
// 🏗️ ContactPage — Page Component หลัก (Server Component)
// =============================================================================
// 🔑 สังเกต: ไม่มี 'use client' → นี่คือ Server Component
// 🔑 สังเกต: ไม่ใช่ async function → ไม่ต้อง await อะไร (ไม่มี dynamic params)
// 🔑 สังเกต: ไม่รับ props → หน้านี้ไม่มี dynamic segment ([id])
//
// 🔑 เทียบกับ React JS:
//   React JS: function ContactPage() { ... }  ← เหมือนกัน!
//   แต่ใน React JS มันเป็น Client Component อัตโนมัติ
//   ใน Next.js มันเป็น Server Component อัตโนมัติ (ไม่ส่ง JS ไป client)
// =============================================================================
export default function ContactPage() {
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
            {/* ─── Contact Form (2/3 ของ grid) ─────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
                <p className="text-gray-500 text-sm">
                  Fill out the form and we&apos;ll connect you with the best agent for your needs.
                </p>
              </div>
              {/* ──────────────────────────────────────────────────────── */}
              {/* 🔑 ContactForm = Client Component (มี 'use client')    */}
              {/* ──────────────────────────────────────────────────────── */}
              {/* Server Component (ไฟล์นี้) render Client Component ได้  */}
              {/* Next.js จะส่งเฉพาะ JS ของ ContactForm ไปฝั่ง client     */}
              {/* ส่วนที่เหลือของหน้าไม่ส่ง JS ไป → performance ดี       */}
              {/*                                                         */}
              {/* 🔑 React JS: ทุกอย่างเป็น client → ส่ง JS ทั้งหน้า     */}
              {/* 🔑 Next.js: ส่ง JS เฉพาะ component ที่ต้องการ           */}
              <ContactForm />
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
                aria-label="Map showing office location in Beverly Hills"
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
                  <p className="text-xs font-semibold text-gray-700">AumEstate Studio</p>
                  <p className="text-xs text-gray-500">Beverly Hills, CA</p>
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
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-gray-100">
                      {/* 🔑 Next.js Image: optimize รูปอัตโนมัติ */}
                      {/* 🔑 React JS: ใช้ <img> ธรรมดา ไม่มี optimization */}
                      <Image
                        src={agent.avatar}
                        alt={agent.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Agent Info */}
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">{agent.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">
                    Licensed Real Estate Agent
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
                a: "Simply contact us via the form above or call our office directly. You can also click 'Schedule Viewing' on any property detail page.",
              },
              {
                q: 'Are all listings verified?',
                a: 'Yes. Every property listed on AumEstate Studio is manually reviewed by our team to ensure accuracy of information, pricing, and availability.',
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
