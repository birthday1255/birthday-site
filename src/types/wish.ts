/**
 * TypeScript types for the `wishes` Firestore collection.
 *
 * Matches the data model defined in ARCHITECTURE.md §6.
 */
import type { Timestamp } from "firebase/firestore";

/** Shape of a document in the `/wishes/{wishId}` collection. */
export interface Wish {
  /** Firestore auto-generated document ID. */
  id: string;
  authorUid: string;
  authorName: string;
  content: string;
  /**
   * Appwrite file IDs — never raw storage URLs.
   * Short-lived URLs are generated server-side on demand.
   */
  mediaUrls: string[];
  submittedAt: Timestamp;
  isRevealed: boolean;
  /** Map of { uid → emoji } for reactions. */
  reactions: Record<string, string>;
}

/** Shape of a document in the `/wishes/{wishId}/replies` subcollection. */
export interface WishReply {
  id: string;
  authorUid: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}
