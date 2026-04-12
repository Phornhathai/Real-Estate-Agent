import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/admin/properties");
}

// GET /api/properties — ดึง properties ทั้งหมด
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: { orderBy: { order: "asc" } },
        agent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(properties);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST /api/properties — สร้าง property ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const property = await prisma.property.create({
      data: {
        name: body.name,
        type: body.type,
        location: body.location,
        city: body.city,
        state: body.state,
        address: body.address,
        price: body.price,
        priceType: body.priceType,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        area: body.area,
        landArea: body.landArea ?? 0,
        amenities: JSON.stringify(body.amenities ?? []),
        description: body.description,
        featured: body.featured ?? false,
        available: body.available ?? true,
        yearBuilt: body.yearBuilt,
        parking: body.parking ?? 0,
        latitude: body.latitude ?? 0,
        longitude: body.longitude ?? 0,
        agentId: body.agentId,
        // images จะ upload แยกผ่าน /api/upload แล้วค่อย link
      },
      include: {
        images: true,
        agent: true,
      },
    });

    revalidateAll();
    return NextResponse.json(property, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
