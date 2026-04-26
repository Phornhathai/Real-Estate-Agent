import { ImageResponse } from "next/og";

// Apple Touch Icon — แสดงเมื่อ user เพิ่มเว็บไว้บน Home Screen ของ iOS
// Apple แนะนำขนาด 180x180 พื้นหลังทึบ (Apple จะตัดมุมโค้งให้เอง)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width="120" height="120" fill="white">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
