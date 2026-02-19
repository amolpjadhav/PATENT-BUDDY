import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionIdsFromRequest } from "@/lib/session";
import { z } from "zod";

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200),
  jurisdiction: z.string().optional(),
});

// GET /api/projects — list projects for this session
export async function GET(req: NextRequest) {
  const ids = getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
  if (ids.length === 0) return NextResponse.json({ projects: [] });

  const projects = await prisma.project.findMany({
    where: { id: { in: ids } },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { answers: true, sections: true, qualityIssues: true } },
    },
  });

  return NextResponse.json({ projects });
}

// POST /api/projects — create project
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      title: parsed.data.title.trim(),
      jurisdiction: parsed.data.jurisdiction ?? "US",
    },
  });

  const existing = getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
  if (!existing.includes(project.id)) existing.push(project.id);

  const response = NextResponse.json({ project });
  response.cookies.set("patent_buddy_session", JSON.stringify(existing), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
