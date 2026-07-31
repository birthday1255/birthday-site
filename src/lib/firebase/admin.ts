/**
 * Firebase Admin SDK initializer — SERVER-SIDE ONLY.
 *
 * Uses lazy initialization: the Admin app is created on first call to
 * getAdminApp(), NOT at module import time. This prevents Next.js from
 * crashing during the build-time "Collecting page data" phase when env vars
 * may not be valid JSON yet (e.g. placeholder values in CI).
 *
 * Must never be imported from client components or pages that are not
 * API routes.
 */
import {
  getApps,
  initializeApp,
  cert,
  type App as AdminApp,
} from "firebase-admin/app";

let _adminApp: AdminApp | null = null;

/**
 * Returns the Firebase Admin SDK app instance.
 * Initializes on first call; subsequent calls return the cached instance.
 *
 * @throws {Error} If FIREBASE_ADMIN_SERVICE_ACCOUNT is missing or not valid JSON.
 */
export function getAdminApp(): AdminApp {
  // Return cached instance across hot-reloads and repeated calls.
  if (_adminApp !== null) {
    return _adminApp;
  }

  // Reuse an already-initialized Admin app (e.g. from a previous module load).
  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_ADMIN_SERVICE_ACCOUNT is not set. " +
        "Add the full service account JSON as a single-line string to " +
        "your Vercel environment variables or .env.local."
    );
  }

  let serviceAccount: Parameters<typeof cert>[0] & { private_key?: string };
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
    
    // Vercel sometimes escapes newlines in environment variables.
    // If the private key contains literal '\n' strings, replace them with actual newline characters.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
  } catch {
    throw new Error(
      "FIREBASE_ADMIN_SERVICE_ACCOUNT is not valid JSON. " +
        "Ensure the value is a single-line JSON string with no line breaks."
    );
  }

  _adminApp = initializeApp({ credential: cert(serviceAccount) });
  return _adminApp;
}
