/**
 * GET /api/wishes/mine — Returns the authenticated guest's own wish, if any.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { getWishByAuthorUid } from "@/lib/firestore/wishes";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["guest"]);
    const wish = await getWishByAuthorUid(ctx.uid);
    return NextResponse.json({ wish });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
