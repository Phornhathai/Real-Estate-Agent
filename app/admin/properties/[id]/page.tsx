import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PropertyForm from "../_components/PropertyForm";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [property, agents] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.agent.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!property) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไข Property</h1>
      <PropertyForm agents={agents} property={property} />
    </div>
  );
}
