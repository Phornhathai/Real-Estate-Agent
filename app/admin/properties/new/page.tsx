import { prisma } from "@/lib/prisma";
import PropertyForm from "../_components/PropertyForm";

export default async function NewPropertyPage() {
  const agents = await prisma.agent.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">เพิ่ม Property ใหม่</h1>
      <PropertyForm agents={agents} />
    </div>
  );
}
