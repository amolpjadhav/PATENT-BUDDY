import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildQualityCheckPrompt } from "@/lib/prompts/quality";
import type { QualityIssue } from "@/types";
import type { Prisma } from "@prisma/client";

function getTokenList(req: NextRequest): string[] {
  const raw = req.cookies.get("patent_buddy_session")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

type ProjectWithSectionsAndClaims = Prisma.ProjectGetPayload<{
  include: {
    sections: true;
    claims: true;
  };
}>;

type SectionText = { title: string; content: string };
type ClaimText = { number: number; content: string };

// POST /api/quality/[id] - run quality checks
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tokens = getTokenList(req);

  const project: ProjectWithSectionsAndClaims | null =
    await prisma.project.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { order: "asc" } },
        claims: { orderBy: { number: "asc" } },
      },
    });

  if (!project || !tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (project.sections.length === 0) {
    return NextResponse.json({ error: "No draft generated yet" }, { status: 400 });
  }

  // Force non-any local types (prevents implicit-any in map)
  const sections = project.sections as unknown as SectionText[];
  const claims = project.claims as unknown as ClaimText[];

  const sectionsText = sections
    .map((s: SectionText) => `[${s.title.toUpperCase()}]\n${s.content}`)
    .join("\n\n---\n\n");

  const claimsText = claims
    .map((c: ClaimText) => `Claim ${c.number}: ${c.content}`)
    .join("\n\n");

  // ... rest of your function unchanged
}