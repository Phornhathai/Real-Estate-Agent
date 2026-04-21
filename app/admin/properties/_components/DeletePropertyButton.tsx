"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  id: string;
  name: string;
}

export default function DeletePropertyButton({ id, name }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`ลบ "${name}" ออกจากระบบ?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline disabled:opacity-40"
    >
      {loading ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}
