import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TokenUsageData } from "@/lib/ai/provider";

// ── vi.hoisted keeps mock refs available inside the hoisted vi.mock factory ───
const { mockAggregate, mockCreate } = vi.hoisted(() => ({
  mockAggregate: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tokenUsage: {
      aggregate: mockAggregate,
      create: mockCreate,
    },
  },
}));

import { checkRateLimit, logUsage, FREE_TIER_TOKENS_PER_DAY } from "@/lib/token-usage";

const MOCK_USAGE: TokenUsageData = {
  promptTokens: 500,
  completionTokens: 1000,
  totalTokens: 1500,
  model: "mock",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── checkRateLimit ───────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  it("returns allowed=true when usage is under the daily limit", async () => {
    mockAggregate.mockResolvedValue({ _sum: { totalTokens: 10_000 } });
    const result = await checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(10_000);
    expect(result.remaining).toBe(FREE_TIER_TOKENS_PER_DAY - 10_000);
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it("returns allowed=false when usage meets or exceeds the daily limit", async () => {
    mockAggregate.mockResolvedValue({ _sum: { totalTokens: FREE_TIER_TOKENS_PER_DAY } });
    const result = await checkRateLimit("user-1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("handles null _sum (no usage yet) as 0 tokens", async () => {
    mockAggregate.mockResolvedValue({ _sum: { totalTokens: null } });
    const result = await checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(FREE_TIER_TOKENS_PER_DAY);
  });
});

// ─── logUsage ─────────────────────────────────────────────────────────────────

describe("logUsage", () => {
  it("creates a tokenUsage record with correct fields", async () => {
    mockCreate.mockResolvedValue({});
    await logUsage({ userId: "user-1", projectId: "proj-1", operation: "DRAFT_SECTIONS", usage: MOCK_USAGE });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        projectId: "proj-1",
        operation: "DRAFT_SECTIONS",
        model: "mock",
        promptTokens: 500,
        completionTokens: 1000,
        totalTokens: 1500,
      },
    });
  });

  it("uses null for projectId when not provided", async () => {
    mockCreate.mockResolvedValue({});
    await logUsage({ userId: "user-1", operation: "CLAIMS", usage: MOCK_USAGE });
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ projectId: null }),
    });
  });

  it("does not throw when prisma.create fails (non-fatal)", async () => {
    mockCreate.mockRejectedValue(new Error("DB down"));
    await expect(
      logUsage({ userId: "user-1", operation: "CLAIMS", usage: MOCK_USAGE })
    ).resolves.toBeUndefined();
  });
});
