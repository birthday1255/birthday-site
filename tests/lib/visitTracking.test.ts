/**
 * Unit tests for IST visit tracking used by the organizer dashboard.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { visitedTodayIST } from "@/lib/utils/visitTracking";

describe("visitedTodayIST", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when lastVisitedAt is undefined", () => {
    expect(visitedTodayIST(undefined)).toBe(false);
  });

  it("returns true when visit timestamp is today in IST", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T12:00:00+05:30"));

    const lastVisitedAt = {
      toDate: () => new Date("2026-07-31T08:30:00+05:30"),
    };

    expect(visitedTodayIST(lastVisitedAt)).toBe(true);
  });

  it("returns false when visit timestamp is yesterday in IST", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T12:00:00+05:30"));

    const lastVisitedAt = {
      toDate: () => new Date("2026-07-30T23:00:00+05:30"),
    };

    expect(visitedTodayIST(lastVisitedAt)).toBe(false);
  });

  it("supports serialized Firestore seconds format", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T18:00:00+05:30"));

    const noonIstSeconds = Math.floor(
      new Date("2026-07-31T12:00:00+05:30").getTime() / 1000
    );

    expect(visitedTodayIST({ seconds: noonIstSeconds })).toBe(true);
  });
});
