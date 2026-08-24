/**
 * POST /api/gallery/upload — Upload a photo/video to the gallery bucket.
 *
 * Organizer only. Accepts multipart/form-data with:
 *   - file   — the image or video file
 *   - caption — optional text caption (default: "")
 *
 * Stores the Appwrite fileId + metadata in Firestore `gallery` collection.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireRole } from "@/lib/middleware/rbac";
import { uploadGalleryFile } from "@/lib/appwrite/galleryStorage";
import { createGalleryItem, getGalleryCount } from "@/lib/firestore/gallery";
import { logActivity } from "@/lib/firestore/activity";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB for gallery
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["organizer"]);

    const formData = await request.formData();
    const file = formData.get("file");
    const caption = (formData.get("caption") as string | null) ?? "";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file field is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 50 MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = randomUUID();

    const [uploadedId, currentCount] = await Promise.all([
      uploadGalleryFile(fileId, buffer, file.name, file.type),
      getGalleryCount(),
    ]);

    const itemId = await createGalleryItem({
      fileId: uploadedId,
      caption,
      mimeType: file.type,
      uploadedBy: ctx.uid,
      order: currentCount,
    });

    await logActivity(ctx.uid, "gallery.uploaded", itemId);

    return NextResponse.json({ itemId, fileId: uploadedId }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
