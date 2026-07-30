"use client";

/**
 * React hook that subscribes to the Firestore reveal configuration in real-time.
 *
 * Used exclusively by the birthday person experience page to show a
 * countdown before reveal and unlock wishes + gallery after it.
 * Uses Firestore's onSnapshot for live updates without polling.
 */
import { useState, useEffect } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { clientApp } from "@/lib/firebase/client";

interface RevealStatus {
  isRevealed: boolean;
  revealTimestamp: Date | null;
  /** True while the initial Firestore snapshot is loading. */
  loading: boolean;
}

export function useRevealStatus(): RevealStatus {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [revealTimestamp, setRevealTimestamp] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const db = getFirestore(clientApp);
    const revealRef = doc(db, "config", "reveal");

    const unsubscribe = onSnapshot(revealRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsRevealed(Boolean(data["is_revealed"]));
        const ts = data["reveal_timestamp"];
        // Firestore Timestamp → native Date for easy comparison.
        setRevealTimestamp(ts ? (ts.toDate() as Date) : null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { isRevealed, revealTimestamp, loading };
}
