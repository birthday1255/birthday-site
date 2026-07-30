"use client";

/**
 * React hook that tracks Firebase Auth state.
 *
 * Provides the current Firebase user and a loading flag. Use this as the
 * foundation for all auth-dependent UI — never read auth state directly
 * from the Firebase SDK in components.
 */
import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthState } from "@/lib/firebase/auth";

interface UseAuthReturn {
  user: User | null;
  /** True while the initial auth state is being resolved. */
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // Clean up the listener when the component unmounts.
    return unsubscribe;
  }, []);

  return { user, loading };
}
