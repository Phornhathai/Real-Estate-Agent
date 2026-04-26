import { ImageResponse } from "next/og";

// Google Search ต้องการ favicon ขนาดทวีคูณของ 48 (ขั้นต่ำ 48x48)
// ใช้ 96x96 เพื่อ render คมทั้งใน search result + browser tab + bookmark
// อ้างอิง: https://developers.google.com/search/docs/appearance/favicon-in-search
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 20,
          background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width="60" height="60" fill="white">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
