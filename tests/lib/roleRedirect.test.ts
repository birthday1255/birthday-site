/**
 * Unit tests for post-login role-based redirects.
 */
import { describe, it, expect } from "vitest";
import { roleRedirectPath } from "@/lib/utils/roleRedirect";

describe("roleRedirectPath", () => {
  it("sends organizers to the dashboard", () => {
    expect(roleRedirectPath("organizer")).toBe("/dashboard");
  });

  it("sends birthday person to the experience page", () => {
    expect(roleRedirectPath("birthday_person")).toBe("/experience");
  });

  it("sends guests and null roles to the wish page", () => {
    expect(roleRedirectPath("guest")).toBe("/wish");
    expect(roleRedirectPath(null)).toBe("/wish");
  });
});
