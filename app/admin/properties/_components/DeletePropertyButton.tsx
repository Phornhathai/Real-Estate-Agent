"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePropertyButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;
    setLoading(true);

    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });

    if (res.ok) {
      router.refresh();
    } else {
      alert("เกิดข้อผิดพลาด ลบไม่สำเร็จ");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}
