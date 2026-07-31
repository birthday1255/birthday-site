/**
 * Unit tests for wish upload validation constants and allowed types.
 */
import { describe, it, expect } from "vitest";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
];

/** Mirrors upload route validation for testability without hitting Appwrite. */
function validateWishUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported file type";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File exceeds 25 MB limit";
  }
  return null;
}

describe("wish upload validation", () => {
  it("accepts JPEG images under 25 MB", () => {
    expect(
      validateWishUpload({ type: "image/jpeg", size: 1024 * 1024 })
    ).toBeNull();
  });

  it("rejects unsupported MIME types", () => {
    expect(
      validateWishUpload({ type: "application/pdf", size: 1000 })
    ).toBe("Unsupported file type");
  });

  it("rejects files over 25 MB", () => {
    expect(
      validateWishUpload({ type: "image/png", size: MAX_FILE_BYTES + 1 })
    ).toBe("File exceeds 25 MB limit");
  });

  it("accepts MP4 video and MP3 audio", () => {
    expect(validateWishUpload({ type: "video/mp4", size: 5000 })).toBeNull();
    expect(validateWishUpload({ type: "audio/mpeg", size: 5000 })).toBeNull();
  });
});
