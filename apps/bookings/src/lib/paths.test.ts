import { describe, expect, it } from "vitest";
import { isPublicPath, safeNextPath } from "./paths";

describe("isPublicPath", () => {
  it("lets the sign-in pages, signing out, the privacy policy and the offline page through", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/offline/")).toBe(true);
    expect(isPublicPath("/logout")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
  });

  it("treats a trailing slash as the same page", () => {
    expect(isPublicPath("/privacy/")).toBe(true);
    expect(isPublicPath("/offline")).toBe(true);
    expect(isPublicPath("/no-access/")).toBe(false);
  });

  it("protects everything else", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/no-access")).toBe(false);
    expect(isPublicPath("/login/extra")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("keeps a path on this site, with its query", () => {
    expect(safeNextPath("/bookings/123?tab=notes")).toBe(
      "/bookings/123?tab=notes"
    );
  });

  it("falls back to the home page when there's nothing", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("refuses other websites", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
  });
});
