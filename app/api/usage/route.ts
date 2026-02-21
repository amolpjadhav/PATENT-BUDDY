import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";
import { FREE_TIER_TOKENS_PER_DAY } from "@/lib/token-usage";

// GET /api/usage — return today's and all-time token usage for the authenticated user
export async function GET() {
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const since = new Date(Date.now() - 86_400_000);

  const [todayAgg, allTimeAgg, allTimeByOp] = await Promise.all([
    prisma.tokenUsage.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { totalTokens: true },
    }),
    prisma.tokenUsage.aggregate({
      where: { userId },
      _sum: { totalTokens: true },
    }),
    prisma.tokenUsage.groupBy({
      by: ["operation"],
      where: { userId },
      _sum: { totalTokens: true },
    }),
  ]);

  const todayTokens = todayAgg._sum.totalTokens ?? 0;
  const allTimeTokens = allTimeAgg._sum.totalTokens ?? 0;
  const operations = Object.fromEntries(
    allTimeByOp.map((r) => [r.operation, r._sum.totalTokens ?? 0])
  );

  return NextResponse.json({
    today: {
      tokens: todayTokens,
      limit: FREE_TIER_TOKENS_PER_DAY,
      remaining: Math.max(0, FREE_TIER_TOKENS_PER_DAY - todayTokens),
      resetAt: new Date(since.getTime() + 86_400_000),
    },
    allTime: {
      tokens: allTimeTokens,
      operations,
    },
  });
}
