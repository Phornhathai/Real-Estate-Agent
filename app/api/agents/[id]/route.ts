import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function revalidateAgents() {
  revalidatePath("/admin");
  revalidatePath("/admin/agents");
  revalidatePath("/about");
  revalidatePath("/contact");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        avatar: body.avatar,
        rating: body.rating,
        totalListings: body.totalListings,
        experience: body.experience,
        bio: body.bio,
      },
    });

    revalidateAgents();
    return NextResponse.json(agent);
  } catch {
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await prisma.agent.findUnique({ where: { id } });

    // ลบรูป avatar จาก Cloudinary (ถ้า upload เอง)
    if (agent?.avatar && agent.avatar.includes("cloudinary")) {
      const publicId = agent.avatar.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await prisma.agent.delete({ where: { id } });
    revalidateAgents();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}
