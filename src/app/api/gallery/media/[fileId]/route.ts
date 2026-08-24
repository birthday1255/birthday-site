/**
 * GET /api/gallery/media/[fileId] — Stream gallery media from Appwrite Storage.
 *
 * Same pattern as /api/wishes/media/[fileId] but for the gallery bucket.
 * Allowed roles: organizer, birthday_person.
 *
 * Query params:
 *   info=true  — returns file metadata JSON
 *   token=...  — optional query auth token for <img> / <video> src usage
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import {
  getGalleryFileInfo,
  getGalleryFileStream,
} from "@/lib/appwrite/galleryStorage";

interface RouteParams {
  params: Promise<{ fileId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer", "birthday_person"]);
    const { fileId } = await params;
    const isInfo = request.nextUrl.searchParams.get("info") === "true";

    if (isInfo) {
      const info = await getGalleryFileInfo(fileId);
      return NextResponse.json(info);
    }

    const fileStream = await getGalleryFileStream(fileId);
    const contentType =
      fileStream.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(fileStream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
