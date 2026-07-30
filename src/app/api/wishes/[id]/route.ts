/**
 * PATCH  /api/wishes/[id]  — Update own wish (guest only, before reveal)
 * DELETE /api/wishes/[id]  — Delete own wish (guest only, before reveal)
 *
 * Ownership verification (authorUid === ctx.uid) is enforced here.
 * Full reveal-gate check added in TASK-024.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { updateWish, deleteWish, getAllWishes } from "@/lib/firestore/wishes";
import { logActivity } from "@/lib/firestore/activity";
import type { Wish } from "@/types/wish";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function assertOwnership(
  wishId: string,
  callerUid: string
): Promise<Wish> {
  const wishes = await getAllWishes();
  const wish = wishes.find((w) => w.id === wishId);

  if (!wish) {
    throw new Error("Wish not found");
  }

  if (wish.authorUid !== callerUid) {
    throw new Error("You do not own this wish");
  }

  return wish;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["guest"]);
    const { id } = await params;

    await assertOwnership(id, ctx.uid);

    const body = (await request.json()) as {
      content?: string;
      mediaUrls?: string[];
    };

    await updateWish(id, body);
    await logActivity(ctx.uid, "wish.edited", id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    const status = message === "Wish not found" ? 404 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["guest"]);
    const { id } = await params;

    await assertOwnership(id, ctx.uid);
    await deleteWish(id);
    await logActivity(ctx.uid, "wish.deleted", id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    const status = message === "Wish not found" ? 404 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
