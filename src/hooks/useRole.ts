"use client";

/**
 * React hook that resolves the current user's Firestore role.
 *
 * Fetches the role from /api/auth/session after Firebase Auth is confirmed.
 * Components should gate render paths on this hook rather than checking
 * auth state directly.
 */
import { useState, useEffect } from "react";
import type { UserRole } from "@/types/user";
import { useAuth } from "./useAuth";

interface UseRoleReturn {
  role: UserRole | null;
  /** True while auth or role resolution is in-flight. */
  loading: boolean;
}

export function useRole(): UseRoleReturn {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRole = async (): Promise<void> => {
      const token = await user.getIdToken();
      const response = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok && !cancelled) {
        const data = (await response.json()) as { role: UserRole | null };
        setRole(data.role);
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    void fetchRole();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { role, loading };
}
