import { describe, it, expect } from "vitest";
import { config } from "@/proxy";

/**
 * Tests for the proxy.ts route matcher configuration.
 * Validates which paths are protected (require auth) and which are public.
 *
 * Next.js matcher pattern semantics:
 *   /dashboard/:path*  → /dashboard AND /dashboard/anything/nested
 *   /projects/:path*   → /projects  AND /projects/anything/nested
 */

function matches(pathname: string): boolean {
  const patterns = config.matcher as string[];
  return patterns.some((pattern) => {
    // /:path*  means "optional: / followed by any sub-path"
    // Convert to regex: replace `/:path*` with `(/.*)?`, then anchor.
    const regexStr =
      "^" + pattern.replace(/\/:path\*/g, "(/.*)?").replace(/\/:path\+/g, "/.+") + "$";
    return new RegExp(regexStr).test(pathname);
  });
}

describe("proxy config matcher", () => {
  // ── Protected routes (require auth) ────────────────────────────────────────
  it("matches /dashboard", () => expect(matches("/dashboard")).toBe(true));
  it("matches /dashboard/settings", () => expect(matches("/dashboard/settings")).toBe(true));
  it("matches /projects/abc123", () => expect(matches("/projects/abc123")).toBe(true));
  it("matches /projects/abc123/draft", () => expect(matches("/projects/abc123/draft")).toBe(true));
  it("matches /projects/abc123/interview", () => expect(matches("/projects/abc123/interview")).toBe(true));
  it("matches /projects/new", () => expect(matches("/projects/new")).toBe(true));

  // ── Public routes (must NOT be intercepted) ────────────────────────────────
  it("does not match /", () => expect(matches("/")).toBe(false));
  it("does not match /auth/signin", () => expect(matches("/auth/signin")).toBe(false));
  it("does not match /api/auth/callback/google", () => expect(matches("/api/auth/callback/google")).toBe(false));
  it("does not match /api/projects", () => expect(matches("/api/projects")).toBe(false));
  it("does not match /_next/static/chunk.js", () => expect(matches("/_next/static/chunk.js")).toBe(false));
});
