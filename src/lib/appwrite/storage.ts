/**
 * Appwrite storage helpers — SERVER-SIDE ONLY.
 *
 * All token generation happens here. The raw APPWRITE_API_KEY is never
 * sent to the browser; only short-lived tokens (TTL: 15 min) are returned
 * to clients via the gallery/upload-token API route.
 *
 * See ARCHITECTURE.md §7 for bucket layout and permission model.
 */
import { Client, Storage } from "node-appwrite";

const WISHES_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_WISHES_BUCKET_ID ?? "";
const GALLERY_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GALLERY_BUCKET_ID ?? "";

/** Short-lived token TTL in seconds (15 minutes). */
const TOKEN_TTL_SECONDS = 900;

/** Creates an Appwrite client with the server-side API key. */
function getServerClient(): Client {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "")
    .setKey(process.env.APPWRITE_API_KEY ?? "");
}

/**
 * Generates a short-lived upload token for the wishes bucket.
 * Only call from Vercel API routes — never from client components.
 *
 * @returns A short-lived Appwrite token string.
 */
export async function getWishUploadToken(): Promise<string> {
  const storage = new Storage(getServerClient());
  const token = await storage.createFileToken(
    WISHES_BUCKET_ID,
    "unique()",
    TOKEN_TTL_SECONDS
  );
  return token.secret;
}

/**
 * Generates a short-lived view token for a specific file in the gallery bucket.
 * Must only be issued to the birthday_person role — enforced by the caller.
 *
 * @param fileId - Appwrite file ID to issue a token for.
 * @returns A short-lived Appwrite token string.
 */
export async function getGalleryViewToken(fileId: string): Promise<string> {
  const storage = new Storage(getServerClient());
  const token = await storage.createFileToken(
    GALLERY_BUCKET_ID,
    fileId,
    TOKEN_TTL_SECONDS
  );
  return token.secret;
}

/**
 * Deletes a file from the wishes bucket.
 * Called when a guest deletes their wish (ownership verified by caller).
 *
 * @param fileId - Appwrite file ID to delete.
 */
export async function deleteWishFile(fileId: string): Promise<void> {
  const storage = new Storage(getServerClient());
  await storage.deleteFile(WISHES_BUCKET_ID, fileId);
}
