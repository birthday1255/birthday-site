import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery Upload",
  description: "Upload the personal gift gallery.",
};

/**
 * Organizer gallery upload page.
 * Route guard (organizer role) implemented in TASK-031.
 * Drag-and-drop uploader implemented in TASK-031.
 */
export default function OrganizerGalleryPage() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <h1 className="text-2xl font-bold text-white">Gallery Upload</h1>
      <p className="text-neutral-400 mt-2">
        Drag-and-drop uploader for the personal gift gallery — coming in
        TASK-031.
      </p>
    </main>
  );
}
