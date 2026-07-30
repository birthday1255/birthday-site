/**
 * GET  /api/reveal  — Read reveal status (all authenticated roles)
 * POST /api/reveal  — Set reveal config (organizer only)
 *
 * Manages the /config/reveal Firestore document.
 * See ARCHITECTURE.md §5 for the reveal gate logic.
 */
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/middleware/rbac";
import { logActivity } from "@/lib/firestore/activity";

const REVEAL_DOC = "config/reveal";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer", "guest", "birthday_person"]);
    const db = getFirestore(adminApp);
    const snap = await db.doc(REVEAL_DOC).get();
    return NextResponse.json(snap.data() ?? { is_revealed: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = await requireRole(request, ["organizer"]);
    const body = (await request.json()) as {
      is_revealed?: boolean;
      reveal_timestamp?: string;
    };

    const db = getFirestore(adminApp);
    await db.doc(REVEAL_DOC).set(body, { merge: true });
    await logActivity(ctx.uid, "reveal.triggered", REVEAL_DOC);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
