/**
 * TypeScript types for the immutable `activity` Firestore audit log collection.
 *
 * Matches the data model defined in ARCHITECTURE.md §6.
 */
import type { Timestamp } from "firebase/firestore";

/** Union of all possible auditable actions in the system. */
export type ActivityAction =
  | "wish.submitted"
  | "wish.edited"
  | "wish.deleted"
  | "gallery.viewed"
  | "gallery.uploaded"
  | "gallery.deleted"
  | "reveal.triggered"
  | "invite.created"
  | "invite.revoked"
  | "user.signed_in";

/** Shape of a document in the `/activity/{eventId}` collection. */
export interface ActivityEvent {
  /** Firestore auto-generated document ID. */
  id: string;
  actorUid: string;
  action: ActivityAction;
  targetId: string;
  timestamp: Timestamp;
  /** Flexible bag for action-specific metadata. */
  metadata: Record<string, unknown>;
}
