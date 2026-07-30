import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send a Wish",
  description: "Write and submit your birthday wish.",
};

/**
 * Guest wish submission page.
 * Route guard (guest role) implemented in TASK-022.
 * Wish form with media upload implemented in TASK-023.
 */
export default function GuestWishPage() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <h1 className="text-2xl font-bold text-white">Send a Wish 🎁</h1>
      <p className="text-neutral-400 mt-2">
        Wish form with text and media upload — coming in TASK-023.
      </p>
    </main>
  );
}
