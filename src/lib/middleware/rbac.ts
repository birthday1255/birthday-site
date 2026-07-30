/**
 * Role-based access control (RBAC) middleware helper — SERVER-SIDE ONLY.
 *
 * Verifies the Firebase JWT from the incoming request and checks the
 * caller's Firestore role against the endpoint's allowed roles.
 * Must only be called from Next.js API route handlers.
 *
 * Data flow (matches ARCHITECTURE.md §5):
 *   Request → middleware.ts (edge, presence check) →
 *   API route → requireRole() (full JWT verify + role check)
 */
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "../firebase/admin";
import { getUserProfile } from "../firestore/users";
import type { UserRole } from "@/types/user";
import type { NextRequest } from "next/server";

/** Context returned to the API route after successful role verification. */
export interface AuthContext {
  uid: string;
  role: UserRole;
}

/**
 * Extracts the Bearer token from the Authorization header.
 *
 * @returns The raw token string, or null if the header is absent/malformed.
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verifies the caller's JWT and asserts that their role is in allowedRoles.
 *
 * @param request - The incoming Next.js request object.
 * @param allowedRoles - Roles permitted to access the endpoint.
 * @returns Verified auth context with uid and role.
 * @throws {Error} If the token is missing, invalid, or the role is not allowed.
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthContext> {
  const token = extractBearerToken(request);

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  const decoded = await getAuth(adminApp).verifyIdToken(token);
  const profile = await getUserProfile(decoded.uid);

  if (!profile) {
    throw new Error("User profile not found — sign in again to create one");
  }

  if (!allowedRoles.includes(profile.role)) {
    throw new Error(
      `Role '${profile.role}' is not permitted to access this endpoint`
    );
  }

  return { uid: decoded.uid, role: profile.role };
}
