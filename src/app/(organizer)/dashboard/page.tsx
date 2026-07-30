import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage guests and invitations.",
};

/**
 * Organizer dashboard — guest list, invite management, reveal control.
 * Route guard (organizer role) implemented in TASK-014.
 * Full UI implemented in TASK-014 through TASK-018.
 */
export default function OrganizerDashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <h1 className="text-2xl font-bold text-white">Organizer Dashboard</h1>
      <p className="text-neutral-400 mt-2">
        Guest list, invite management, and reveal control — coming in
        TASK-014.
      </p>
    </main>
  );
}
