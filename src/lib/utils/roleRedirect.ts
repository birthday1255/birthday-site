/**
 * Post-login redirect paths by Firestore role.
 */
import type { UserRole } from "@/types/user";

/**
 * Maps a Firestore role to the destination route after Google sign-in.
 *
 * @param role - Resolved role from /api/auth/session, or null if unset.
 */
export function roleRedirectPath(role: UserRole | null): string {
  if (role === "organizer") {
    return "/dashboard";
  }
  if (role === "birthday_person") {
    return "/experience";
  }
  return "/wish";
}
