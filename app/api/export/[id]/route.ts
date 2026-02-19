import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildDocx } from "@/lib/docx";
import { getSessionIdsFromRequest } from "@/lib/session";

// GET /api/export/[id] — download project as DOCX
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ids = getSessionIdsFromRequest(req.cookies.get("patent_buddy_session")?.value);
  if (!ids.includes(id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { sections: true },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
