/**
 * GET /api/gallery/upload-token
 *
 * Issues a short-lived Appwrite JWT for the appropriate storage bucket.
 * The raw APPWRITE_API_KEY never leaves the server — only the derived
 * short-lived token (TTL: 15 min) is returned.
 *
 * - guest          → upload token for wishes_bucket
 * - organizer      → upload token for gallery_bucket (by fileId param)
 * - birthday_person → view token for gallery_bucket (by fileId param)
 *
 * See ARCHITECTURE.md §7 for bucket permission model.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import {
  getWishUploadToken,
  getGalleryViewToken,
} from "@/lib/appwrite/storage";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, [
      "organizer",
      "guest",
      "birthday_person",
    ]);

    if (ctx.role === "guest") {
      const token = await getWishUploadToken();
      return NextResponse.json({ token, bucket: "wishes" });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId query param is required for this role" },
        { status: 400 }
      );
    }

    const token = await getGalleryViewToken(fileId);
    return NextResponse.json({ token, bucket: "gallery" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
