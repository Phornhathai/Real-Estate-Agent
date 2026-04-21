import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function revalidateAgents() {
  revalidatePath("/admin");
  revalidatePath("/admin/agents");
  revalidatePath("/about");
  revalidatePath("/contact");
}

// GET /api/agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(agents);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

// POST /api/agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const agent = await prisma.agent.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        avatar: body.avatar ?? "",
        rating: body.rating ?? 0,
        totalListings: body.totalListings ?? 0,
        experience: body.experience ?? 0,
        bio: body.bio,
      },
    });

    revalidateAgents();
    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
