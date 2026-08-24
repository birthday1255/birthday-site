/**
 * Appwrite gallery bucket storage helpers — SERVER-SIDE ONLY.
 *
 * Mirror of src/lib/appwrite/storage.ts but for the gallery_bucket.
 * Provides upload, info, stream, and delete operations.
 */

const GALLERY_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GALLERY_BUCKET_ID ?? "";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
}

function jsonHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
    "X-Appwrite-Key": process.env.APPWRITE_API_KEY ?? "",
  };
}

function multipartHeaders(): Record<string, string> {
  return {
    "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
    "X-Appwrite-Key": process.env.APPWRITE_API_KEY ?? "",
  };
}

/**
 * Uploads a file to the gallery bucket via Appwrite REST API.
 */
export async function uploadGalleryFile(
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

  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(GALLERY_BUCKET_ID)}/files`;

  const res = await fetch(url, {
    method: "POST",
    headers: multipartHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Appwrite gallery upload failed: ${res.status} ${res.statusText} — ${errorText}`
    );
  }

  const data = (await res.json()) as { $id: string };
  return data.$id;
}

/**
 * Gets gallery file metadata from Appwrite.
 */
export async function getGalleryFileInfo(fileId: string): Promise<{
  mimeType: string;
  name: string;
  sizeOriginal: number;
}> {
  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(GALLERY_BUCKET_ID)}/files/${encodeURIComponent(fileId)}`;
  const res = await fetch(url, { headers: multipartHeaders() });

  if (!res.ok) {
    throw new Error(
      `Appwrite gallery file info failed: ${res.status} ${res.statusText}`
    );
  }

  return (await res.json()) as {
    mimeType: string;
    name: string;
    sizeOriginal: number;
  };
}

/**
 * Streams a gallery file from Appwrite.
 */
export async function getGalleryFileStream(fileId: string): Promise<Response> {
  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(GALLERY_BUCKET_ID)}/files/${encodeURIComponent(fileId)}/view`;
  const res = await fetch(url, { headers: multipartHeaders() });

  if (!res.ok) {
    throw new Error(
      `Appwrite gallery file stream failed: ${res.status} ${res.statusText}`
    );
  }

  return res;
}

/**
 * Deletes a file from the gallery bucket.
 */
export async function deleteGalleryFile(fileId: string): Promise<void> {
  const url = `${apiBase()}/storage/buckets/${encodeURIComponent(GALLERY_BUCKET_ID)}/files/${encodeURIComponent(fileId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: jsonHeaders(),
  });

  if (!res.ok) {
    throw new Error(
      `Appwrite gallery delete failed: ${res.status} ${res.statusText}`
    );
  }
}
