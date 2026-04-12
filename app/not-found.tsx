import Link from 'next/link';

import type { Metadata } from 'next';
// Type สำหรับ metadata object — ใช้กำหนด title, description สำหรับหน้า 404

//   ถ้าจะใส่ต้องใช้: <Helmet><title>404 — Page Not Found</title></Helmet>
export const metadata: Metadata = {
  title: '404 — Page Not Found',                              // แสดงบน tab browser
  description: 'The page you are looking for could not be found.',  // สำหรับ search engines
};

//   เพราะเป็น static content — ไม่มี state, ไม่มี event handler (นอกจาก Link)
export default function NotFound() {
  return (
    // min-h-[60vh] = ความสูงขั้นต่ำ 60% ของ viewport → content อยู่กลางจอ
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* ================================================================= */}
      {/* 🏠 Icon — รูปบ้านแสดงว่าเป็นเว็บ real estate                     */}
      {/* ================================================================= */}
      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"  // ซ่อนจาก screen reader เพราะเป็น decorative icon
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>

      {/* ================================================================= */}
      {/* 📝 Error Message                                                  */}
      {/* ================================================================= */}
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get
        you back on track.
      </p>

      {/* ================================================================= */}
      {/* 🔗 Navigation Links — ปุ่มกลับหน้าแรก + ดู listings              */}
      {/* ================================================================= */}
            <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/listings"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    </section>
  );
}
