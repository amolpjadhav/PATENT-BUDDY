import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildDocx } from "@/lib/docx";
import { requireAuthUser } from "@/lib/auth-helpers";

// GET /api/export/[id] — download project as DOCX
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await requireAuthUser();
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { sections: true },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (project.sections.length === 0) {
    return NextResponse.json({ error: "No draft to export" }, { status: 400 });
  }

  const buffer = await buildDocx({
    title: project.title,
    jurisdiction: project.jurisdiction,
    sections: project.sections,
  });

  const filename = `${project.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_provisional.docx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
