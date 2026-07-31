/**
 * GET /api/users — List all Firestore user profiles (organizer only).
 *
 * Returns users filtered by role query param, e.g. ?role=guest.
 * Without a role param, returns all users.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/middleware/rbac";
import { getAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import type { UserProfile } from "@/types/user";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(request, ["organizer"]);

    const db = getFirestore(getAdminApp());
    const roleFilter = request.nextUrl.searchParams.get("role");

    let query: FirebaseFirestore.Query = db.collection("users");
    if (roleFilter) {
      query = query.where("role", "==", roleFilter);
    }

    const snap = await query.orderBy("createdAt", "desc").get();
    const users: UserProfile[] = snap.docs.map(
      (doc) => ({ uid: doc.id, ...doc.data() } as UserProfile)
    );

    return NextResponse.json({ users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
