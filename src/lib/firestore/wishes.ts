/**
 * Firestore CRUD helpers for the `wishes` collection.
 *
 * All functions use the Firebase Admin SDK and must only run server-side.
 * See ARCHITECTURE.md §6 for the full data model.
 */
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAdminApp } from "../firebase/admin";
import type { Wish } from "@/types/wish";

const db = getFirestore(getAdminApp());
const COLLECTION = "wishes";

/**
 * Creates a new wish document.
 *
 * @param payload - Author info, content, and Appwrite file IDs.
 * @returns The Firestore auto-generated wish document ID.
 */
export async function createWish(
  payload: Pick<Wish, "authorUid" | "authorName" | "content" | "mediaUrls">
): Promise<string> {
  const ref = await db.collection(COLLECTION).add({
    ...payload,
    submittedAt: FieldValue.serverTimestamp(),
    isRevealed: false,
    reactions: {},
  });
  return ref.id;
}

/**
 * Returns all wishes ordered by submission time ascending.
 *
 * The calling API route applies role-based filtering (e.g. only revealed
 * wishes are returned to birthday_person before organizer triggers reveal).
 */
export async function getAllWishes(): Promise<Wish[]> {
  const snap = await db
    .collection(COLLECTION)
    .orderBy("submittedAt", "asc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Wish);
}

/**
 * Updates mutable fields of a wish document.
 *
 * Ownership verification is the caller's responsibility (API route layer).
 *
 * @param wishId - Firestore document ID of the wish to update.
 * @param updates - Partial update containing only mutable fields.
 */
export async function updateWish(
  wishId: string,
  updates: Partial<Pick<Wish, "content" | "mediaUrls">>
): Promise<void> {
  await db.collection(COLLECTION).doc(wishId).update(updates);
}

/**
 * Deletes a wish document.
 *
 * Ownership verification is the caller's responsibility (API route layer).
 *
 * @param wishId - Firestore document ID of the wish to delete.
 */
export async function deleteWish(wishId: string): Promise<void> {
  await db.collection(COLLECTION).doc(wishId).delete();
}

/**
 * Returns the most recent wish submitted by a given author, if any.
 *
 * @param authorUid - Firebase Auth UID of the wish author.
 */
export async function getWishByAuthorUid(
  authorUid: string
): Promise<Wish | null> {
  const snap = await db
    .collection(COLLECTION)
    .where("authorUid", "==", authorUid)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Wish;
}
