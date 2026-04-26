// =============================================================================
// 🌐 SEO Constants — single source of truth for URLs / brand
// =============================================================================
// แก้ที่นี่ที่เดียว metadata, sitemap, robots, canonical, og:url ทั้งเว็บเปลี่ยนตาม
// อย่า hardcode URL ในไฟล์อื่น — import จากที่นี่เสมอ

export const SITE_URL = 'https://www.homereality.homes';

export const SITE_NAME = 'Home Reality';

// ใช้ใน <title> default + Organization JSON-LD + og:site_name
export const SITE_BRAND = 'Home Reality';

// description กลางสำหรับหน้าที่ไม่มี description ของตัวเอง
export const SITE_DESCRIPTION =
  'Home Reality (homereality.homes) — เว็บอสังหาริมทรัพย์ในประเทศไทย ค้นหาบ้าน คอนโด วิลล่า และอพาร์ตเมนต์สำหรับเช่าและขายในกรุงเทพ เชียงใหม่ ภูเก็ต หัวหิน และทำเลยอดนิยมทั่วประเทศ.';
