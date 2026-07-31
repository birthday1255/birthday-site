/**
 * GET /api/gallery/upload-token
 *
 * Returns a short-lived Appwrite file view token for an existing file.
 * The raw APPWRITE_API_KEY never leaves the server — only the derived
 * 15-minute token is returned.
 *
 * Role → behaviour:
 *   organizer      → view token for gallery_bucket (requires ?fileId=)
 *   birthday_person → view token for gallery_bucket (requires ?fileId=)
 *   guest           → view token for wishes_bucket  (requires ?fileId=)
 *
 * NOTE: File *uploads* are handled by /api/wishes/upload (guest) and
 *       /api/gallery/upload (organizer) — not this route.
 *
 * See ARCHITECTURE.md §7 for bucket permission model.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { getGalleryViewToken, getWishFileToken } from "@/lib/appwrite/storage";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, [
      "organizer",
      "guest",
      "birthday_person",
    ]);

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId query parameter is required" },
        { status: 400 }
      );
    }

    if (ctx.role === "guest") {
      // Guests can only get view tokens for wish-bucket files (their own media).
      const token = await getWishFileToken(fileId);
      return NextResponse.json({ token, bucket: "wishes" });
    }

    // Organizer and birthday_person get gallery-bucket tokens.
    const token = await getGalleryViewToken(fileId);
    return NextResponse.json({ token, bucket: "gallery" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
