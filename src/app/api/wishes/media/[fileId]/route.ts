/**
 * GET /api/wishes/media/[fileId] — Stream wish media from Appwrite Storage.
 *
 * Query params:
 *   info=true — returns file metadata JSON ({ mimeType, name, sizeOriginal })
 *   token=... — optional query auth token for <img>, <video>, <audio> tags
 *
 * Security:
 *   Requires caller to have an authenticated role ("organizer", "guest", "birthday_person").
 *   Appwrite API key is kept strictly server-side.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { getWishFileInfo, getWishFileStream } from "@/lib/appwrite/storage";

interface RouteParams {
  params: Promise<{ fileId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer", "guest", "birthday_person"]);
    const { fileId } = await params;

    const isInfo = request.nextUrl.searchParams.get("info") === "true";

    if (isInfo) {
      const info = await getWishFileInfo(fileId);
      return NextResponse.json(info);
    }

    const fileStream = await getWishFileStream(fileId);
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
