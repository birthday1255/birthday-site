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

/**
 * Headers for JSON-body Appwrite REST calls (token creation, etc.).
 * Includes Content-Type: application/json.
 */
function jsonHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
    "X-Appwrite-Key": process.env.APPWRITE_API_KEY ?? "",
  };
}

/**
 * Headers for multipart/form-data Appwrite REST calls (file uploads).
 *
 * Content-Type must NOT be set here — fetch automatically sets
 * `multipart/form-data; boundary=...` when the body is FormData.
 * Manually setting Content-Type strips the boundary and causes
 * Appwrite to return 400 Bad Request.
 */
function multipartHeaders(): Record<string, string> {
  return {
    "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
    "X-Appwrite-Key": process.env.APPWRITE_API_KEY ?? "",
  };
}

/** Creates an Appwrite server client using the server-side API key. */
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
    headers: jsonHeaders(),
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
 * Generates a short-lived view token for a file in the wishes bucket.
 * Returned to authenticated roles for displaying wish media after reveal.
 *
 * @param fileId - Appwrite file ID.
 * @returns A short-lived Appwrite secret token.
 */
export async function getWishFileToken(fileId: string): Promise<string> {
  return createFileToken(WISHES_BUCKET_ID, fileId);
}

/**
 * Generates a short-lived view token for a file in the gallery bucket.
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

/**
 * Uploads a media file to the wishes bucket via the Appwrite REST API.
 *
 * Root cause of previous 400 Bad Request: `Content-Type: application/json`
 * was being sent alongside a FormData body, which corrupted the multipart
 * boundary. Fixed by using `multipartHeaders()` which omits Content-Type.
 *
 * @param fileId   - Unique Appwrite file ID (server-generated UUID).
 * @param buffer   - Raw file bytes.
 * @param fileName - Original filename for Appwrite metadata.
 * @param mimeType - MIME type of the uploaded file.
 * @returns The Appwrite file ID to store in Firestore wish metadata.
 */
export async function uploadWishFile(
  fileId: string,
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const formData = new FormData();
  formData.append("fileId", fileId);
  formData.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mimeType }),
    fileName
  );

  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(WISHES_BUCKET_ID)}/files`;

  // multipartHeaders() omits Content-Type — fetch sets the boundary itself.
  const res = await fetch(url, {
    method: "POST",
    headers: multipartHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Appwrite upload failed: ${res.status} ${res.statusText} — ${errorText}`
    );
  }

  const data = (await res.json()) as { $id: string };
  return data.$id;
}

/**
 * Gets file metadata from the wishes bucket via Appwrite REST API.
 *
 * @param fileId - Appwrite file ID.
 */
export async function getWishFileInfo(fileId: string): Promise<{
  mimeType: string;
  name: string;
  sizeOriginal: number;
}> {
  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(WISHES_BUCKET_ID)}/files/${encodeURIComponent(fileId)}`;
  const res = await fetch(url, {
    headers: multipartHeaders(),
  });

  if (!res.ok) {
    throw new Error(
      `Appwrite file info failed: ${res.status} ${res.statusText}`
    );
  }

  return (await res.json()) as {
    mimeType: string;
    name: string;
    sizeOriginal: number;
  };
}

/**
 * Downloads/streams a file from the wishes bucket via Appwrite REST API.
 *
 * @param fileId - Appwrite file ID.
 */
export async function getWishFileStream(fileId: string): Promise<Response> {
  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(WISHES_BUCKET_ID)}/files/${encodeURIComponent(fileId)}/view`;
  const res = await fetch(url, {
    headers: multipartHeaders(),
  });

  if (!res.ok) {
    throw new Error(
      `Appwrite file stream failed: ${res.status} ${res.statusText}`
    );
  }

  return res;
}

