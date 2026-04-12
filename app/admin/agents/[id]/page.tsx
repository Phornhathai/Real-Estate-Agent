import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AgentForm from "../_components/AgentForm";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({ where: { id } });

  if (!agent) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไข Agent</h1>
      <AgentForm agent={agent} />
    </div>
  );
}
