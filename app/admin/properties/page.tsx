import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeletePropertyButton from "./_components/DeletePropertyButton";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      agent: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <Link
          href="/admin/properties/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + เพิ่ม Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">ยังไม่มี property</p>
          <Link
            href="/admin/properties/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            เพิ่ม Property แรก
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="md:hidden grid gap-3">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-medium text-gray-900 break-words min-w-0">
                    {p.name}
                  </p>
                  <span
                    className={`inline-block shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.available
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {p.type} · {p.location}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ฿{p.price.toLocaleString()}/{p.priceType}
                </p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/properties/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    แก้ไข
                  </Link>
                  <DeletePropertyButton id={p.id} name={p.name} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">ชื่อ</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">ประเภท</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">ที่ตั้ง</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">ราคา</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">สถานะ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.type}</td>
                    <td className="px-4 py-3 text-gray-600">{p.location}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      ฿{p.price.toLocaleString()}/{p.priceType}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {p.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          แก้ไข
                        </Link>
                        <DeletePropertyButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
