import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-helpers";
import { z } from "zod";

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200),
  jurisdiction: z.string().optional(),
  intakeNotes: z.string().optional(),
});

// GET /api/projects — list projects for this user
export async function GET() {
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { answers: true, sections: true, qualityIssues: true } },
    },
  });

  return NextResponse.json({ projects });
}

// POST /api/projects — create project
export async function POST(req: NextRequest) {
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const intakeNotes = parsed.data.intakeNotes?.trim() || null;
  const project = await prisma.project.create({
    data: {
      title: parsed.data.title.trim(),
      jurisdiction: parsed.data.jurisdiction ?? "US",
      intakeNotes,
      userId,
    },
  });

  // Store notes as a NOTES artifact so the pipeline can read it. Non-fatal.
  if (intakeNotes) {
    try {
      await prisma.projectArtifact.create({
        data: { projectId: project.id, type: "NOTES", content: intakeNotes },
      });
    } catch (artifactErr) {
      console.warn("[projects] Could not create NOTES artifact:", artifactErr);
    }
  }

  return NextResponse.json({ project });
}
