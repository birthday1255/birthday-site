/**
 * Firestore writer for the immutable `activity` audit log collection.
 *
 * This module is append-only by design — no update or delete helpers are
 * provided. Every significant user action in the system writes here via
 * the /api/activity route or directly from other API routes.
 *
 * See ARCHITECTURE.md §6 for the full data model.
 */
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { adminApp } from "../firebase/admin";
import type { ActivityAction, ActivityEvent } from "@/types/activity";

const db = getFirestore(adminApp);
const COLLECTION = "activity";

/**
 * Appends a new event to the immutable activity log.
 *
 * @param actorUid - UID of the user performing the action.
 * @param action - The auditable action type.
 * @param targetId - Firestore ID of the document being acted upon.
 * @param metadata - Optional bag of action-specific context data.
 */
export async function logActivity(
  actorUid: string,
  action: ActivityAction,
  targetId: string,
  metadata: ActivityEvent["metadata"] = {}
): Promise<void> {
  await db.collection(COLLECTION).add({
    actorUid,
    action,
    targetId,
    timestamp: FieldValue.serverTimestamp(),
    metadata,
  });
}

/**
 * Returns the most recent 500 activity events, ordered newest-first.
 * Only the organizer role may call the API route that invokes this.
 */
export async function getActivityLog(): Promise<ActivityEvent[]> {
  const snap = await db
    .collection(COLLECTION)
    .orderBy("timestamp", "desc")
    .limit(500)
    .get();
  return snap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as ActivityEvent
  );
}
