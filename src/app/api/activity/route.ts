/**
 * GET  /api/activity  — Retrieve audit log (organizer only)
 * POST /api/activity  — Append an activity event (all authenticated roles)
 *
 * The activity log is append-only. GET is restricted to organizers.
 * POST is available to all authenticated roles for client-side events
 * (e.g. gallery.viewed) that API routes cannot detect on their own.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { logActivity, getActivityLog } from "@/lib/firestore/activity";
import type { ActivityAction } from "@/types/activity";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer"]);
    const events = await getActivityLog();
    return NextResponse.json({ events });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, [
      "organizer",
      "guest",
      "birthday_person",
    ]);

    const body = (await request.json()) as {
      action: ActivityAction;
      targetId: string;
      metadata?: Record<string, unknown>;
    };

    await logActivity(ctx.uid, body.action, body.targetId, body.metadata);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
