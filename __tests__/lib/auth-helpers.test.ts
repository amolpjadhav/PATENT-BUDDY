import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── Mock next-auth/next before importing the module under test ─────────────
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";
import { getAuthUser, requireAuthUser } from "@/lib/auth-helpers";

const mockGetServerSession = vi.mocked(getServerSession);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getAuthUser ──────────────────────────────────────────────────────────────

describe("getAuthUser", () => {
  it("returns null when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const result = await getAuthUser();
    expect(result).toBeNull();
  });

  it("returns null when session has no user id", async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: "test@example.com" } } as never);
    const result = await getAuthUser();
    expect(result).toBeNull();
  });

  it("returns AuthUser when session has a valid user id", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    } as never);
    const result = await getAuthUser();
    expect(result).toEqual({ id: "user-123", email: "test@example.com" });
  });
});

// ─── requireAuthUser ──────────────────────────────────────────────────────────

describe("requireAuthUser", () => {
  it("returns 401 NextResponse when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const result = await requireAuthUser();
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns AuthUser when session is valid", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-456", email: "hello@example.com" },
    } as never);
    const result = await requireAuthUser();
    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ id: "user-456", email: "hello@example.com" });
  });
});
