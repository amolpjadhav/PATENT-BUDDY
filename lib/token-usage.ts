import { prisma } from "@/lib/prisma";
import type { TokenUsageData } from "@/lib/ai/provider";

export const FREE_TIER_TOKENS_PER_DAY = 100_000;

export interface LogUsageParams {
  userId: string;
  projectId?: string;
  operation: string;
  usage: TokenUsageData;
}

/**
 * Persists a single AI call's token usage to the database.
 * Non-throwing — a logging failure never interrupts the caller.
 */
export async function logUsage(params: LogUsageParams): Promise<void> {
  try {
    await prisma.tokenUsage.create({
      data: {
        userId: params.userId,
        projectId: params.projectId ?? null,
        operation: params.operation,
        model: params.usage.model,
        promptTokens: params.usage.promptTokens,
        completionTokens: params.usage.completionTokens,
        totalTokens: params.usage.totalTokens,
      },
    });
  } catch (err) {
    console.error("[token-usage] Failed to log usage:", err);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Checks whether a user has exceeded the daily token limit.
 * Aggregates all TokenUsage rows for userId in the last 24 hours.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - 86_400_000);
  const resetAt = new Date(since.getTime() + 86_400_000);

  const result = await prisma.tokenUsage.aggregate({
    where: { userId, createdAt: { gte: since } },
    _sum: { totalTokens: true },
  });

  const used = result._sum.totalTokens ?? 0;
  const remaining = Math.max(0, FREE_TIER_TOKENS_PER_DAY - used);

  return {
    allowed: used < FREE_TIER_TOKENS_PER_DAY,
    used,
    remaining,
    resetAt,
  };
}
