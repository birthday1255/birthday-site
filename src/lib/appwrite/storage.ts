/**
 * Appwrite storage helpers — SERVER-SIDE ONLY.
 *
 * File uploads are proxied through Vercel API routes using the server-side
 * API key. Token generation uses the Appwrite REST API directly so that
 * this module is not tied to a specific node-appwrite SDK version.
 *
 * The raw APPWRITE_API_KEY is NEVER sent to the browser.
 * Only short-lived secrets (TTL: 15 min) are returned to clients.
 *
 * See ARCHITECTURE.md §7 for bucket layout and permission model.
 */
import { Client, Storage } from "node-appwrite";

const WISHES_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_WISHES_BUCKET_ID ?? "";
const GALLERY_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GALLERY_BUCKET_ID ?? "";

/** Short-lived token TTL — 15 minutes in milliseconds. */
const TOKEN_TTL_MS = 15 * 60 * 1000;

/** ISO 8601 expiry string for token creation. */
function expireISO(): string {
  return new Date(Date.now() + TOKEN_TTL_MS).toISOString();
}

/** Appwrite REST API base URL (includes /v1). */
function apiBase(): string {
  return process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
}

/** Common headers for Appwrite REST calls using the server API key. */
function serverHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
    "X-Appwrite-Key": process.env.APPWRITE_API_KEY ?? "",
  };
}

/** Creates an Appwrite client with the server-side API key (for SDK methods). */
function getServerClient(): Client {
  return new Client()
    .setEndpoint(apiBase())
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "")
    .setKey(process.env.APPWRITE_API_KEY ?? "");
}

/**
 * Creates a short-lived file token via the Appwrite REST API.
 *
 * Uses fetch instead of the SDK so this works regardless of node-appwrite
 * version (createFileToken was added after v14.0.0).
 *
 * @param bucketId - Appwrite bucket ID.
 * @param fileId   - Appwrite file ID for an existing file.
 * @returns A short-lived secret token string.
 */
async function createFileToken(
  bucketId: string,
  fileId: string
): Promise<string> {
  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/tokens`;

  const res = await fetch(url, {
    method: "POST",
    headers: serverHeaders(),
    body: JSON.stringify({ expire: expireISO() }),
  });

  if (!res.ok) {
    throw new Error(
      `Appwrite token creation failed: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as { secret: string };
  return data.secret;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generates a short-lived view token for a specific file in the wishes bucket.
 * Returned to authenticated roles for displaying wish media after reveal.
 *
 * @param fileId - Appwrite file ID.
 * @returns A short-lived Appwrite secret token.
 */
export async function getWishFileToken(fileId: string): Promise<string> {
  return createFileToken(WISHES_BUCKET_ID, fileId);
}

/**
 * Generates a short-lived view token for a specific file in the gallery bucket.
 * Must only be issued to the birthday_person role — enforced by the caller.
 *
 * @param fileId - Appwrite file ID.
 * @returns A short-lived Appwrite secret token.
 */
export async function getGalleryViewToken(fileId: string): Promise<string> {
  return createFileToken(GALLERY_BUCKET_ID, fileId);
}

/**
 * Deletes a file from the wishes bucket.
 * Ownership verification is the caller's responsibility (API route layer).
 *
 * @param fileId - Appwrite file ID to delete.
 */
export async function deleteWishFile(fileId: string): Promise<void> {
  const storage = new Storage(getServerClient());
  await storage.deleteFile(WISHES_BUCKET_ID, fileId);
}
