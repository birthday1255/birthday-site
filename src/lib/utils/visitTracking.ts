/**
 * Pure helpers for IST-based daily visit tracking on the organizer dashboard.
 */

/** Firestore-like timestamp shape from Admin SDK or serialized JSON. */
export interface VisitTimestamp {
  toDate?: () => Date;
  seconds?: number;
}

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Returns true when the timestamp falls on today's calendar date in IST.
 *
 * @param lastVisitedAt - Firestore timestamp or serialized { seconds } object.
 */
export function visitedTodayIST(lastVisitedAt: VisitTimestamp | undefined): boolean {
  if (!lastVisitedAt) {
    return false;
  }

  let date: Date;
  if (typeof lastVisitedAt.toDate === "function") {
    date = lastVisitedAt.toDate();
  } else if (typeof lastVisitedAt.seconds === "number") {
    date = new Date(lastVisitedAt.seconds * 1000);
  } else {
    return false;
  }

  const visitDay = date.toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
  return visitDay === today;
}
