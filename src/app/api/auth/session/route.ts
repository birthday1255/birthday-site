/**
 * GET /api/auth/session
 *
 * Validates the caller's Firebase JWT, upserts their Firestore profile,
 * assigns a default guest role when needed, records the visit, and returns
 * their uid and role. Called by useRole hook on sign-in.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  ensureGuestRole,
  getUserProfile,
  recordVisit,
  upsertUserProfile,
} from "@/lib/firestore/users";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("Authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);

    await upsertUserProfile({
      uid: decoded.uid,
      displayName: decoded.name ?? "",
      email: decoded.email ?? "",
      photoURL: decoded.picture ?? "",
    });

    const role = await ensureGuestRole(decoded.uid);
    await recordVisit(decoded.uid);

    const profile = await getUserProfile(decoded.uid);

    return NextResponse.json({
      uid: decoded.uid,
      role: profile?.role ?? role,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Authentication failed: ${message}` },
      { status: 401 }
    );
  }
}
