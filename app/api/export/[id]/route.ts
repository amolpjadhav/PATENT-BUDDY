import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildDocx } from "@/lib/docx";

function getTokenList(req: NextRequest): string[] {
  const raw = req.cookies.get("patent_buddy_session")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// GET /api/export/[id] - export project as DOCX
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokens = getTokenList(req);

  const project = await prisma.project.findUnique({
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
    return NextResponse.json({ error: "No draft to export" }, { status: 400 });
  }

  const buffer = await buildDocx({
    title: project.title,
    inventorName: project.inventorName,
    sections: project.sections,
    claims: project.claims,
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
