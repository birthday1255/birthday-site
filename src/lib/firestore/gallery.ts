/**
 * Firestore CRUD helpers for the `gallery` collection.
 *
 * Gallery items are uploaded by the organizer and displayed to the
 * birthday_person after reveal. Uses Firebase Admin SDK — server-side only.
 *
 * See ARCHITECTURE.md §8 for the gallery data model.
 */
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAdminApp } from "../firebase/admin";

const db = getFirestore(getAdminApp());
const COLLECTION = "gallery";

export interface GalleryItem {
  id: string;
  fileId: string;          // Appwrite file ID in gallery_bucket
  caption: string;
  mimeType: string;
  uploadedBy: string;      // organizer UID
  uploadedAt: FirebaseFirestore.Timestamp;
  order: number;           // display order
}

/**
 * Creates a new gallery item document.
 */
export async function createGalleryItem(payload: {
  fileId: string;
  caption: string;
  mimeType: string;
  uploadedBy: string;
  order: number;
}): Promise<string> {
  const ref = await db.collection(COLLECTION).add({
    ...payload,
    uploadedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

/**
 * Returns all gallery items ordered by display order ascending.
 */
export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const snap = await db
    .collection(COLLECTION)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GalleryItem[];
}

/**
 * Updates the caption of a gallery item.
 */
export async function updateGalleryItem(
  itemId: string,
  updates: { caption?: string; order?: number }
): Promise<void> {
  await db.collection(COLLECTION).doc(itemId).update(updates);
}

/**
 * Deletes a gallery item document.
 * Deleting the Appwrite file is the caller's responsibility.
 */
export async function deleteGalleryItem(itemId: string): Promise<void> {
  await db.collection(COLLECTION).doc(itemId).delete();
}

/**
 * Returns the count of existing gallery items (for auto-ordering new uploads).
 */
export async function getGalleryCount(): Promise<number> {
  const snap = await db.collection(COLLECTION).count().get();
  return snap.data().count;
}
