"use client";

/**
 * StatsCard — a single metric card for the organizer dashboard header row.
 */
interface StatsCardProps {
  /** Icon or emoji rendered at the top of the card. */
  icon: string;
  label: string;
  value: string | number;
  /** Optional subtle description shown below the value. */
  description?: string;
  /** Tailwind accent color class for the icon background, e.g. "bg-violet-500/10". */
  accentClass?: string;
}

/**
 * Renders a metric card with an icon, large value, and label.
 */
export function StatsCard({
  icon,
  label,
  value,
  description,
  accentClass = "bg-violet-500/10",
}: StatsCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${accentClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-sm font-medium text-neutral-300 mt-0.5">{label}</p>
        {description && (
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
