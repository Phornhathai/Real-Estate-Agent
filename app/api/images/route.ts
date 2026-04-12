import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, images } = body;

    await prisma.image.createMany({
      data: images.map((img: { url: string; publicId: string; order: number }) => ({
        url: img.url,
        publicId: img.publicId,
        order: img.order,
        propertyId,
      })),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save images" }, { status: 500 });
  }
}
