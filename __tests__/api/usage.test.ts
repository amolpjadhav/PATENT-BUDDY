import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── vi.hoisted ────────────────────────────────────────────────────────────────
const { mockRequireAuthUser, mockAggregate, mockGroupBy } = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockAggregate: vi.fn(),
  mockGroupBy: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({ requireAuthUser: mockRequireAuthUser }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tokenUsage: {
      aggregate: mockAggregate,
      groupBy: mockGroupBy,
    },
  },
}));
vi.mock("@/lib/token-usage", () => ({ FREE_TIER_TOKENS_PER_DAY: 100_000 }));

import { GET } from "@/app/api/usage/route";

const MOCK_USER = { id: "user-1", email: "test@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/usage", () => {
  it("returns 401 when not authenticated", async () => {
    mockRequireAuthUser.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns today and all-time usage for authenticated user", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockAggregate
      .mockResolvedValueOnce({ _sum: { totalTokens: 5_000 } })   // today
      .mockResolvedValueOnce({ _sum: { totalTokens: 80_000 } }); // all-time
    mockGroupBy.mockResolvedValue([
      { operation: "DRAFT_SECTIONS", _sum: { totalTokens: 50_000 } },
      { operation: "CLAIMS", _sum: { totalTokens: 30_000 } },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.today.tokens).toBe(5_000);
    expect(body.today.limit).toBe(100_000);
    expect(body.today.remaining).toBe(95_000);
    expect(body.today.resetAt).toBeDefined();

    expect(body.allTime.tokens).toBe(80_000);
    expect(body.allTime.operations).toEqual({
      DRAFT_SECTIONS: 50_000,
      CLAIMS: 30_000,
    });
  });

  it("returns 0 tokens when user has no usage", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    mockAggregate.mockResolvedValue({ _sum: { totalTokens: null } });
    mockGroupBy.mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();
    expect(body.today.tokens).toBe(0);
    expect(body.today.remaining).toBe(100_000);
    expect(body.allTime.tokens).toBe(0);
    expect(body.allTime.operations).toEqual({});
  });
});
