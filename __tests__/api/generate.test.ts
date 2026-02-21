import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ── vi.hoisted ────────────────────────────────────────────────────────────────
const {
  mockRequireAuthUser,
  mockCheckRateLimit,
  mockFindUnique,
  mockCount,
  mockGenerateAllDraft,
  mockGenerateAllDraftFromDynamic,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCount: vi.fn(),
  mockGenerateAllDraft: vi.fn(),
  mockGenerateAllDraftFromDynamic: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({ requireAuthUser: mockRequireAuthUser }));
vi.mock("@/lib/token-usage", () => ({ checkRateLimit: mockCheckRateLimit }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findUnique: mockFindUnique },
    interviewQuestion: { count: mockCount },
  },
}));
vi.mock("@/lib/actions", () => ({ generateAllDraft: mockGenerateAllDraft }));
vi.mock("@/lib/ai/generation", () => ({
  generateAllDraftFromDynamic: mockGenerateAllDraftFromDynamic,
}));

import { POST } from "@/app/api/generate/[id]/route";

const MOCK_USER = { id: "user-1", email: "test@example.com" };
const OWNED_PROJECT = { userId: "user-1" };
const OTHER_PROJECT = { userId: "other-user" };
const RATE_LIMIT_OK = { allowed: true, used: 0, remaining: 100_000, resetAt: new Date() };
const RATE_LIMIT_EXCEEDED = { allowed: false, used: 100_000, remaining: 0, resetAt: new Date() };

function makeRequest(id: string) {
  return [
    new NextRequest(`http://localhost/api/generate/${id}`, { method: "POST" }),
    { params: Promise.resolve({ id }) },
  ] as const;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/generate/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockRequireAuthUser.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const [req, ctx] = makeRequest("proj-1");
    const res = await POST(req, ctx);
    expect(res.status).toBe(401);
  });

  it("returns 404 when project does not exist", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockFindUnique.mockResolvedValue(null);
    const [req, ctx] = makeRequest("proj-missing");
    const res = await POST(req, ctx);
    expect(res.status).toBe(404);
  });

  it("returns 403 when project belongs to another user", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockFindUnique.mockResolvedValue(OTHER_PROJECT);
    const [req, ctx] = makeRequest("proj-other");
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockFindUnique.mockResolvedValue(OWNED_PROJECT);
    mockCheckRateLimit.mockResolvedValue(RATE_LIMIT_EXCEEDED);
    const [req, ctx] = makeRequest("proj-1");
    const res = await POST(req, ctx);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("Daily limit reached");
  });

  it("calls static pipeline when no interview questions exist", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockFindUnique.mockResolvedValue(OWNED_PROJECT);
    mockCheckRateLimit.mockResolvedValue(RATE_LIMIT_OK);
    mockCount.mockResolvedValue(0);
    mockGenerateAllDraft.mockResolvedValue({ success: true, sections: [] });

    const [req, ctx] = makeRequest("proj-1");
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(mockGenerateAllDraft).toHaveBeenCalledWith("proj-1");
    expect(mockGenerateAllDraftFromDynamic).not.toHaveBeenCalled();
  });

  it("calls dynamic pipeline when interview questions exist", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockFindUnique.mockResolvedValue(OWNED_PROJECT);
    mockCheckRateLimit.mockResolvedValue(RATE_LIMIT_OK);
    mockCount.mockResolvedValue(5);
    mockGenerateAllDraftFromDynamic.mockResolvedValue({ success: true, sections: [] });

    const [req, ctx] = makeRequest("proj-1");
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(mockGenerateAllDraftFromDynamic).toHaveBeenCalledWith("proj-1", "user-1");
    expect(mockGenerateAllDraft).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected generation error", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockFindUnique.mockResolvedValue(OWNED_PROJECT);
    mockCheckRateLimit.mockResolvedValue(RATE_LIMIT_OK);
    mockCount.mockResolvedValue(0);
    mockGenerateAllDraft.mockRejectedValue(new Error("AI timeout"));

    const [req, ctx] = makeRequest("proj-1");
    const res = await POST(req, ctx);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("AI timeout");
  });
});
