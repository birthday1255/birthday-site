import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Birthday Experience 🎂",
  description:
    "Your personal birthday experience — wishes, reactions, and gallery.",
};

/**
 * Birthday person experience page — reveal gate, wishes display, personal gallery.
 * Route guard (birthday_person role) implemented in TASK-026.
 * Reveal gate hook (useRevealStatus) implemented in TASK-027.
 * Wish display implemented in TASK-028.
 * Personal gallery implemented in TASK-030.
 */
export default function BirthdayExperiencePage() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <h1 className="text-2xl font-bold text-white">Happy Birthday! 🎉</h1>
      <p className="text-neutral-400 mt-2">
        Reveal gate, wishes, and personal gallery — coming in TASK-026.
      </p>
    </main>
  );
}
