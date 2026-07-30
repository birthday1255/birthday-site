/**
 * Appwrite client SDK factory.
 *
 * Returns a configured Appwrite Client.
 * Safe to call from the browser — uses only NEXT_PUBLIC_ env vars.
 * For server-side operations that require the API key, use getServerClient()
 * inside src/lib/appwrite/storage.ts.
 */
import { Client } from "node-appwrite";

/**
 * Creates a public Appwrite client (no API key — browser-safe).
 */
export function getAppwriteClient(): Client {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "");
}
