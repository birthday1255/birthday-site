/**
 * TypeScript types for the `invites` Firestore collection.
 *
 * Matches the data model defined in ARCHITECTURE.md §6.
 */
import type { Timestamp } from "firebase/firestore";
import type { UserRole } from "./user";

/** Lifecycle states of an invite. */
export type InviteStatus = "pending" | "accepted" | "revoked";

/** Shape of a document in the `/invites/{inviteId}` collection. */
export interface Invite {
  /** Firestore auto-generated document ID. */
  id: string;
  email: string;
  /** Invites can only target guest or birthday_person roles. */
  role: Extract<UserRole, "guest" | "birthday_person">;
  status: InviteStatus;
  /** UID of the organizer who created this invite. */
  createdBy: string;
  createdAt: Timestamp;
}
