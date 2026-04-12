import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [propertyCount, agentCount] = await Promise.all([
    prisma.property.count(),
    prisma.agent.count(),
  ]);

  const recentProperties = await prisma.property.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1 } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Properties ทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-900">{propertyCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Agents ทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-900">{agentCount}</p>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Property ล่าสุด</h2>
          <Link href="/admin/properties/new" className="text-sm text-blue-600 hover:underline">
            + เพิ่มใหม่
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            ยังไม่มี property — <Link href="/admin/properties/new" className="text-blue-600 hover:underline">เพิ่มเลย</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recentProperties.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.location} · {p.type}</p>
                </div>
                <Link
                  href={`/admin/properties/${p.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  แก้ไข
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
