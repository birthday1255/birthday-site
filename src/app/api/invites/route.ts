/**
 * GET    /api/invites  — List all invites (organizer only)
 * POST   /api/invites  — Create invite (organizer only)
 * DELETE /api/invites  — Revoke invite (organizer only)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import {
  createInvite,
  getAllInvites,
  updateInviteStatus,
} from "@/lib/firestore/invites";
import { logActivity } from "@/lib/firestore/activity";
import type { UserRole } from "@/types/user";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer"]);
    const invites = await getAllInvites();
    return NextResponse.json({ invites });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["organizer"]);
    const body = (await request.json()) as {
      email: string;
      role: Extract<UserRole, "guest" | "birthday_person">;
    };

    const inviteId = await createInvite(body.email, body.role, ctx.uid);
    await logActivity(ctx.uid, "invite.created", inviteId);

    return NextResponse.json({ inviteId }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["organizer"]);
    const { inviteId } = (await request.json()) as { inviteId: string };

    await updateInviteStatus(inviteId, "revoked");
    await logActivity(ctx.uid, "invite.revoked", inviteId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
