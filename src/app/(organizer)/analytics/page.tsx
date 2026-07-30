import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Activity audit log and analytics.",
};

/**
 * Organizer analytics and activity audit log page.
 * Route guard (organizer role) implemented in TASK-017.
 * Audit log table implemented in TASK-017.
 */
export default function OrganizerAnalyticsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="text-neutral-400 mt-2">
        Activity audit log and summary analytics — coming in TASK-017.
      </p>
    </main>
  );
}
