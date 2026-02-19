import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildQualityCheckPrompt } from "@/lib/prompts/quality";
import { getSessionIdsFromRequest } from "@/lib/session";
import { SECTION_ORDER, SECTION_LABELS, type QualityIssueInput } from "@/types";

function sessionIds(req: NextRequest) {
  return getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
}

// POST /api/quality/[id] — run quality checks, persist individual QualityIssue rows
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sessionIds(req).includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sections = await prisma.draftSection.findMany({ where: { projectId: id } });
  if (sections.length === 0) {
    return NextResponse.json({ error: "No draft generated yet" }, { status: 400 });
  }

  // Build full draft text ordered by SECTION_ORDER
  const sectionMap = new Map(sections.map((s) => [s.sectionKey, s]));
  const draftText = SECTION_ORDER
    .filter((key) => sectionMap.has(key))
    .map((key) => {
      const s = sectionMap.get(key)!;
      return `[${SECTION_LABELS[key] ?? key}]\n${s.content}`;
    })
    .join("\n\n---\n\n");

  const ai = getAIProvider();
  let aiIssues: QualityIssueInput[] = [];

  try {
    const raw = await ai.generateText({
      system: "You are a patent quality checker. Return only valid JSON.",
      prompt: buildQualityCheckPrompt(draftText),
      temperature: 0.2,
    });
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as { issues: QualityIssueInput[] };
    aiIssues = parsed.issues ?? [];
  } catch (err) {
    console.error("AI quality check failed:", err);
    // Fall through to heuristics only
  }

  // Heuristic checks
  const heuristics = runHeuristicChecks(sections);

  // Merge, deduplicate by message
  const seen = new Set<string>();
  const allIssues = [...aiIssues, ...heuristics].filter((issue) => {
    if (seen.has(issue.message)) return false;
    seen.add(issue.message);
    return true;
  });

  // Delete old issues and save new ones
  await prisma.qualityIssue.deleteMany({ where: { projectId: id } });
  if (allIssues.length > 0) {
    await prisma.qualityIssue.createMany({
      data: allIssues.map((i) => ({
        projectId: id,
        type: i.type,
        severity: i.severity,
        message: i.message,
        metadata: JSON.stringify(i.metadata ?? {}),
      })),
    });
  }

  const saved = await prisma.qualityIssue.findMany({
    where: { projectId: id },
    orderBy: [{ severity: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ issues: saved });
}

function runHeuristicChecks(
  sections: Array<{ sectionKey: string; content: string }>
): QualityIssueInput[] {
  const issues: QualityIssueInput[] = [];
  const sectionMap = new Map(sections.map((s) => [s.sectionKey, s.content]));

  // Required sections completeness
  for (const key of ["BACKGROUND", "DETAILED_DESC", "ABSTRACT", "CLAIMS"] as const) {
    if (!sectionMap.has(key)) {
      issues.push({
        type: "MISSING_SUPPORT",
        severity: "HIGH",
        message: `Missing required section: ${SECTION_LABELS[key]}`,
        metadata: { location: key },
      });
    }
  }

  // Thin detailed description
  const dd = sectionMap.get("DETAILED_DESC") ?? "";
  if (dd.length > 0 && dd.length < 500) {
    issues.push({
      type: "MISSING_SUPPORT",
      severity: "MED",
      message: "Detailed Description is very short. Add more technical detail about components and operation.",
      metadata: { location: "DETAILED_DESC" },
    });
  }

  // Abstract word count
  const abstract = sectionMap.get("ABSTRACT") ?? "";
  if (abstract.split(/\s+/).length > 150) {
    issues.push({
      type: "VAGUE_TERM",
      severity: "LOW",
      message: "Abstract exceeds 150 words. USPTO requires abstracts of 150 words or fewer.",
      metadata: { location: "ABSTRACT" },
    });
  }

  // Antecedent basis heuristic on CLAIMS
  const claims = sectionMap.get("CLAIMS") ?? "";
  const claimLines = claims.split(/\n+/).filter((l) => /^\d+\./.test(l.trim()));
  for (const line of claimLines) {
    const claimNum = line.match(/^(\d+)\./)?.[1];
    const theRefs = [...line.matchAll(/\bthe\s+([a-z][a-z ]{1,25}?)(?:[,;.]|\s+of\b|\s+in\b)/gi)];
    for (const ref of theRefs) {
      const term = ref[1].trim().toLowerCase();
      if (["claim", "invention", "device", "method", "system", "present"].includes(term)) continue;
      const hasIntro =
        line.toLowerCase().includes(`a ${term}`) || line.toLowerCase().includes(`an ${term}`);
      if (!hasIntro) {
        issues.push({
          type: "ANTECEDENT_BASIS",
          severity: "HIGH",
          message: `Claim ${claimNum}: "the ${term}" may lack antecedent basis`,
          metadata: { location: `Claim ${claimNum}` },
        });
        break;
      }
    }
  }

  return issues;
}
