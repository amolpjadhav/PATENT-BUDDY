import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getTokenList(req: NextRequest): string[] {
  const raw = req.cookies.get("patent_buddy_session")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// PATCH /api/claims/[id] - update claim content
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!claim || !tokens.includes(claim.project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  const updated = await prisma.claim.update({
    where: { id },
    data: {
      content: body.content ?? claim.content,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ claim: updated });
}
