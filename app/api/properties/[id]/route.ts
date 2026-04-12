import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function revalidateAll(id?: string) {
  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/admin/properties");
  if (id) revalidatePath(`/listings/${id}`);
}

// GET /api/properties/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        agent: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] — แก้ไขข้อมูล
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const property = await prisma.property.update({
      where: { id },
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
        landArea: body.landArea,
        amenities: JSON.stringify(body.amenities ?? []),
        description: body.description,
        featured: body.featured,
        available: body.available,
        yearBuilt: body.yearBuilt,
        parking: body.parking,
        agentId: body.agentId,
      },
      include: {
        images: { orderBy: { order: "asc" } },
        agent: true,
      },
    });

    revalidateAll(id);
    return NextResponse.json(property);
  } catch {
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] — ลบ property + รูปทั้งหมดจาก Cloudinary
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ดึงรูปทั้งหมดก่อนลบ เพื่อเอา publicId ไปลบใน Cloudinary
    const images = await prisma.image.findMany({ where: { propertyId: id } });

    // ลบรูปจาก Cloudinary
    await Promise.all(
      images.map((img) => cloudinary.uploader.destroy(img.publicId))
    );

    // ลบ property (Image จะถูกลบอัตโนมัติเพราะ onDelete: Cascade)
    await prisma.property.delete({ where: { id } });

    revalidateAll();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
