"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalListings: number;
  experience: number;
  bio: string;
}

interface Props {
  agent?: Agent;
}

export default function AgentForm({ agent }: Props) {
  const router = useRouter();
  const isEdit = !!agent;

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(agent?.avatar ?? "");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) setAvatarUrl(data.url);
    setUploadingAvatar(false);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      avatar: avatarUrl,
      rating: Number(formData.get("rating") || 0),
      totalListings: Number(formData.get("totalListings") || 0),
      experience: Number(formData.get("experience") || 0),
      bio: formData.get("bio"),
    };

    const url = isEdit ? `/api/agents/${agent.id}` : "/api/agents";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/agents");
      router.refresh();
    } else {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }

    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`ลบ ${agent?.name} ออกจากระบบ?`)) return;

    const res = await fetch(`/api/agents/${agent?.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/agents");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">รูปโปรไฟล์</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                👤
              </div>
            )}
          </div>
          <label className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-sm text-gray-600 font-medium">
              {uploadingAvatar ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปโปรไฟล์"}
            </span>
            <span className="text-xs text-gray-400 text-center">
              แนะนำ: <strong>400×400px</strong> ขึ้นไป · อัตราส่วน <strong>1:1 (สี่เหลี่ยมจัตุรัส)</strong> · JPG, PNG, WebP
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
        </div>
      </div>

      {/* ข้อมูลหลัก */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">ข้อมูล Agent</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
          <input name="name" defaultValue={agent?.name} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input name="email" type="email" defaultValue={agent?.email} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
            <input name="phone" defaultValue={agent?.phone} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประสบการณ์ (ปี)</label>
            <input name="experience" type="number" min={0} defaultValue={agent?.experience ?? 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
            <input name="rating" type="number" min={0} max={5} step={0.1} defaultValue={agent?.rating ?? 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listings ทั้งหมด</label>
            <input name="totalListings" type="number" min={0} defaultValue={agent?.totalListings ?? 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประวัติย่อ (Bio)</label>
          <textarea name="bio" rows={4} defaultValue={agent?.bio} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้าง Agent"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto px-6 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
          >
            ลบ Agent
          </button>
        )}
      </div>
    </form>
  );
}
