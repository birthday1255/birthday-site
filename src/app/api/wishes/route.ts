/**
 * GET  /api/wishes  — List all wishes (organizer | birthday_person)
 * POST /api/wishes  — Create a new wish (guest only)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { createWish, getAllWishes } from "@/lib/firestore/wishes";
import { logActivity } from "@/lib/firestore/activity";
import { getUserProfile } from "@/lib/firestore/users";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer", "birthday_person"]);
    const wishes = await getAllWishes();
    return NextResponse.json({ wishes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["guest", "organizer", "birthday_person"]);

    const profile = await getUserProfile(ctx.uid);
    const body = (await request.json()) as {
      content: string;
      mediaUrls?: string[];
    };

    const wishId = await createWish({
      authorUid: ctx.uid,
      authorName: profile?.displayName ?? "",
      content: body.content,
      mediaUrls: body.mediaUrls ?? [],
    });

    await logActivity(ctx.uid, "wish.submitted", wishId);

    return NextResponse.json({ wishId }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
