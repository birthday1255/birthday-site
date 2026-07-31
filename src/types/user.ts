/**
 * TypeScript types for the `users` Firestore collection.
 *
 * Matches the data model defined in ARCHITECTURE.md §6.
 */
import type { Timestamp } from "firebase/firestore";

/** The three role values that can be assigned in Firestore. */
export type UserRole = "organizer" | "guest" | "birthday_person";

/** Shape of a document in the `/users/{uid}` Firestore collection. */
export interface UserProfile {
  /** Firebase Auth UID — also the Firestore document ID. */
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt: Timestamp;
  /** Updated on every session validation — used for daily visit counts. */
  lastVisitedAt?: Timestamp;
}
