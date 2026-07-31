/**
 * Firestore CRUD helpers for the `users` collection.
 *
 * All functions use the Firebase Admin SDK and must only run server-side.
 * See ARCHITECTURE.md §6 for the full data model.
 */
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAdminApp } from "../firebase/admin";
import type { UserProfile, UserRole } from "@/types/user";

const db = getFirestore(getAdminApp());
const COLLECTION = "users";

/**
 * Creates or updates a user profile in Firestore.
 *
 * Called on every session validation to keep display info current.
 * The `role` and `createdAt` fields are not overwritten on subsequent calls.
 *
 * @param profile - Profile fields from the decoded Firebase JWT.
 */
export async function upsertUserProfile(
  profile: Omit<UserProfile, "role" | "createdAt">
): Promise<void> {
  const ref = db.collection(COLLECTION).doc(profile.uid);
  await ref.set(
    {
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      // Only set createdAt if this is a new document.
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Retrieves a user profile document by UID.
 *
 * @param uid - Firebase Auth UID.
 * @returns The user profile, or null if the document does not exist.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await db.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) {
    return null;
  }
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

/**
 * Assigns a role to a user. PM-only operation; not exposed via any UI route.
 *
 * @param uid - Firebase Auth UID of the user.
 * @param role - The role to assign.
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await db.collection(COLLECTION).doc(uid).update({ role });
}

/**
 * Ensures every signed-in visitor has a role.
 *
 * New users default to `guest` so anyone with the public link can wish
 * without an invite flow. Pre-seeded organizer/birthday_person roles are kept.
 *
 * @param uid - Firebase Auth UID.
 * @returns The user's effective role after this call.
 */
export async function ensureGuestRole(uid: string): Promise<UserRole> {
  const profile = await getUserProfile(uid);
  if (profile?.role) {
    return profile.role;
  }
  await setUserRole(uid, "guest");
  return "guest";
}

/**
 * Records the current visit timestamp for dashboard analytics.
 *
 * @param uid - Firebase Auth UID.
 */
export async function recordVisit(uid: string): Promise<void> {
  await db.collection(COLLECTION).doc(uid).update({
    lastVisitedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Returns all users with the guest role, newest first.
 */
export async function getGuestUsers(): Promise<UserProfile[]> {
  const snap = await db
    .collection(COLLECTION)
    .where("role", "==", "guest")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map(
    (doc) => ({ uid: doc.id, ...doc.data() } as UserProfile)
  );
}
