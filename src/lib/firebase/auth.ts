"use client";

/**
 * Firebase Auth helper functions for client-side authentication.
 *
 * Centralises all auth logic so that components and hooks import from here
 * rather than the Firebase SDK directly, making it easier to swap providers.
 */
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { clientApp } from "./client";

const auth = getAuth(clientApp);
const googleProvider = new GoogleAuthProvider();

/**
 * Opens the Google OAuth popup and returns the authenticated Firebase user.
 *
 * @returns The signed-in Firebase User.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Signs the current user out of Firebase.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribes to Firebase Auth state changes.
 *
 * @param callback - Called with the current user (or null on sign-out).
 * @returns An unsubscribe function.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export { auth };
