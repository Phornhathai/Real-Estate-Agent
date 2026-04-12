"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Agent {
  id: string;
  name: string;
}

interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  order: number;
}

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  state: string;
  address: string;
  price: number;
  priceType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  landArea: number;
  amenities: string;
  description: string;
  featured: boolean;
  available: boolean;
  yearBuilt: number;
  parking: number;
  agentId: string;
  images: PropertyImage[];
}

interface Props {
  agents: Agent[];
  property?: Property;
}

const AMENITY_OPTIONS = [
  "Pool", "Gym", "Garden", "Garage", "Security",
  "Smart Home", "Parking", "Balcony", "Elevator", "Pet Friendly",
];

export default function PropertyForm({ agents, property }: Props) {
  const router = useRouter();
  const isEdit = !!property;

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<PropertyImage[]>(property?.images ?? []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property ? JSON.parse(property.amenities) : []
  );

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploaded: PropertyImage[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        uploaded.push({
          id: "",
          url: data.url,
          publicId: data.publicId,
          order: images.length + uploaded.length,
        });
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploadingImages(false);
  }

  async function handleDeleteImage(img: PropertyImage, index: number) {
    // ลบจาก Cloudinary ถ้าเป็นรูปที่บันทึกแล้ว
    if (img.id) {
      await fetch(`/api/images/${img.id}`, { method: "DELETE" });
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const body = {
      name: formData.get("name"),
      type: formData.get("type"),
      location: formData.get("location"),
      city: formData.get("city"),
      state: formData.get("state"),
      address: formData.get("address"),
      price: Number(formData.get("price")),
      priceType: formData.get("priceType"),
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      area: Number(formData.get("area")),
      landArea: Number(formData.get("landArea") || 0),
      amenities: selectedAmenities,
      description: formData.get("description"),
      featured: formData.get("featured") === "on",
      available: formData.get("available") === "on",
      yearBuilt: Number(formData.get("yearBuilt")),
      parking: Number(formData.get("parking") || 0),
      agentId: formData.get("agentId"),
      images: images,
    };

    const url = isEdit ? `/api/properties/${property.id}` : "/api/properties";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();

      // ถ้าเป็นการสร้างใหม่ ต้องบันทึกรูปภาพลง database
      if (!isEdit && images.length > 0) {
        await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: data.id,
            images: images,
          }),
        });
      }

      router.refresh();
      router.push("/admin/properties");
    } else {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* รูปภาพ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">รูปภาพ</h2>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
              <button
                type="button"
                onClick={() => handleDeleteImage(img, i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <label className="flex flex-col items-center justify-center gap-1 px-4 py-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
          <span className="text-sm text-gray-600 font-medium">
            {uploadingImages ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูป (เลือกได้หลายรูป)"}
          </span>
          <span className="text-xs text-gray-400">
            แนะนำ: <strong>1280×720px</strong> ขึ้นไป · อัตราส่วน <strong>16:9</strong> · JPG, PNG, WebP · ไม่เกิน 10MB ต่อรูป
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImages}
          />
        </label>
      </div>

      {/* ข้อมูลหลัก */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">ข้อมูลหลัก</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ Property</label>
            <input name="name" defaultValue={property?.name} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
            <select name="type" defaultValue={property?.type ?? "House"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["House", "Villa", "Apartment", "Condo"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select name="agentId" defaultValue={property?.agentId} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- เลือก Agent --</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (แสดงใน card)</label>
            <input name="location" defaultValue={property?.location} required placeholder="Bankgok"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input name="city" defaultValue={property?.city} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input name="state" defaultValue={property?.state} required placeholder="BK"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่เต็ม</label>
            <input name="address" defaultValue={property?.address} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
          <textarea name="description" defaultValue={property?.description} required rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* ราคาและรายละเอียด */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">ราคาและรายละเอียด</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา</label>
            <input name="price" type="number" defaultValue={property?.price} required min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
            <select name="priceType" defaultValue={property?.priceType ?? "month"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="month">/ month</option>
              <option value="year">/ year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่สร้าง</label>
            <input name="yearBuilt" type="number" defaultValue={property?.yearBuilt} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ห้องนอน</label>
            <input name="bedrooms" type="number" defaultValue={property?.bedrooms} required min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ห้องน้ำ</label>
            <input name="bathrooms" type="number" defaultValue={property?.bathrooms} required min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่จอดรถ</label>
            <input name="parking" type="number" defaultValue={property?.parking ?? 0} min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">พื้นที่ใช้สอย (ตร.ม.)</label>
            <input name="area" type="number" defaultValue={property?.area} required min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">พื้นที่ดิน (ตร.ม.)</label>
            <input name="landArea" type="number" defaultValue={property?.landArea ?? 0} min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() =>
                setSelectedAmenities((prev) =>
                  prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                )
              }
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedAmenities.includes(a)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="available" defaultChecked={property?.available ?? true}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Available</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="featured" defaultChecked={property?.featured ?? false}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Featured (แสดงหน้าแรก)</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้าง Property"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
