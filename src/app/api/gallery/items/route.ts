/**
 * GET  /api/gallery/items — List all gallery items (organizer + birthday_person)
 * DELETE /api/gallery/items?id=[itemId] — Remove a gallery item (organizer only)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import {
  getAllGalleryItems,
  deleteGalleryItem,
} from "@/lib/firestore/gallery";
import { deleteGalleryFile } from "@/lib/appwrite/galleryStorage";
import { logActivity } from "@/lib/firestore/activity";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer", "birthday_person"]);
    const items = await getAllGalleryItems();
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["organizer"]);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");
    const fileId = searchParams.get("fileId");

    if (!itemId || !fileId) {
      return NextResponse.json(
        { error: "id and fileId query parameters are required" },
        { status: 400 }
      );
    }

    await Promise.all([
      deleteGalleryItem(itemId),
      deleteGalleryFile(fileId),
    ]);

    await logActivity(ctx.uid, "gallery.deleted", itemId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
