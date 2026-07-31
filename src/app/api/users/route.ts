/**
 * GET /api/users — List Firestore user profiles (organizer only).
 *
 * Query params:
 *   role=guest          — filter by role
 *   visitedToday=true   — only guests who visited today (IST)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { getGuestUsers } from "@/lib/firestore/users";
import { visitedTodayIST } from "@/lib/utils/visitTracking";
import { getAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import type { UserProfile } from "@/types/user";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer"]);

    const roleFilter = request.nextUrl.searchParams.get("role");
    const visitedToday = request.nextUrl.searchParams.get("visitedToday") === "true";

    let users: UserProfile[];

    if (roleFilter === "guest" || visitedToday) {
      users = await getGuestUsers();
    } else {
      const db = getFirestore(getAdminApp());
      const snap = await db
        .collection("users")
        .orderBy("createdAt", "desc")
        .get();
      users = snap.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() } as UserProfile)
      );
    }

    if (visitedToday) {
      users = users.filter((u) => visitedTodayIST(u.lastVisitedAt));
    } else if (roleFilter && roleFilter !== "guest") {
      users = users.filter((u) => u.role === roleFilter);
    }

    return NextResponse.json({ users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
