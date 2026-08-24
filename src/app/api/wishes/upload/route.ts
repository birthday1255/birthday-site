/**
 * POST /api/wishes/upload — Upload wish media to Appwrite (guest only).
 *
 * Accepts multipart/form-data with a single `file` field.
 * Returns the Appwrite file ID for inclusion in POST /api/wishes.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireRole } from "@/lib/middleware/rbac";
import { uploadWishFile } from "@/lib/appwrite/storage";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["guest", "organizer", "birthday_person"]);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file field is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 25 MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = randomUUID();
    const uploadedId = await uploadWishFile(
      fileId,
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({ fileId: uploadedId }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
