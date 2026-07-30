/**
 * Firebase Admin SDK initializer — SERVER-SIDE ONLY.
 *
 * Must never be imported from client components or files under src/app/
 * that are not API routes. Uses FIREBASE_ADMIN_SERVICE_ACCOUNT env var
 * which is only available in the Vercel serverless function runtime.
 */
import {
  getApps,
  initializeApp,
  cert,
  type App as AdminApp,
} from "firebase-admin/app";

function createAdminApp(): AdminApp {
  // Reuse the existing admin app across hot-reloads in development.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_ADMIN_SERVICE_ACCOUNT is not set. " +
        "Add it to your Vercel environment variables or .env.local."
    );
  }

  const credential = cert(
    JSON.parse(serviceAccountJson) as Parameters<typeof cert>[0]
  );

  return initializeApp({ credential });
}

const adminApp: AdminApp = createAdminApp();

export { adminApp };
