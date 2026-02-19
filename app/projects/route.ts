import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { title, jurisdiction } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: { title, jurisdiction: jurisdiction ?? "US" },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/projects failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ projects });
  } catch (e: any) {
    console.error("GET /api/projects failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}