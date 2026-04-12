import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function AdminAgentsPage() {
  const agents = await prisma.agent.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <Link
          href="/admin/agents/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + เพิ่ม Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">ยังไม่มี agent — ต้องเพิ่ม agent ก่อนจึงจะสร้าง property ได้</p>
          <Link
            href="/admin/agents/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            เพิ่ม Agent แรก
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                {agent.avatar ? (
                  <Image src={agent.avatar} alt={agent.name} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                    {agent.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{agent.name}</p>
                <p className="text-sm text-gray-500">{agent.email} · ประสบการณ์ {agent.experience} ปี</p>
              </div>
              <Link
                href={`/admin/agents/${agent.id}`}
                className="text-sm text-blue-600 hover:underline shrink-0"
              >
                แก้ไข
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
