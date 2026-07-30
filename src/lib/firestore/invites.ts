/**
 * Firestore helpers for the `invites` collection.
 *
 * All functions use the Firebase Admin SDK and must only run server-side.
 * See ARCHITECTURE.md §6 for the full data model.
 */
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { adminApp } from "../firebase/admin";
import type { Invite, InviteStatus } from "@/types/invite";
import type { UserRole } from "@/types/user";

const db = getFirestore(adminApp);
const COLLECTION = "invites";

/**
 * Creates a new invite document with status `pending`.
 *
 * @param email - Email address of the invitee.
 * @param role - Role to assign when the invite is accepted.
 * @param createdBy - UID of the organizer creating the invite.
 * @returns The Firestore auto-generated invite document ID.
 */
export async function createInvite(
  email: string,
  role: Extract<UserRole, "guest" | "birthday_person">,
  createdBy: string
): Promise<string> {
  const ref = await db.collection(COLLECTION).add({
    email,
    role,
    status: "pending" as InviteStatus,
    createdBy,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/**
 * Transitions an invite to a new status (accepted | revoked).
 *
 * @param inviteId - Firestore document ID of the invite.
 * @param status - The new status to apply.
 */
export async function updateInviteStatus(
  inviteId: string,
  status: InviteStatus
): Promise<void> {
  await db.collection(COLLECTION).doc(inviteId).update({ status });
}

/**
 * Returns all invites ordered by creation date descending.
 * Only organizers may access the API route that calls this.
 */
export async function getAllInvites(): Promise<Invite[]> {
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Invite);
}
