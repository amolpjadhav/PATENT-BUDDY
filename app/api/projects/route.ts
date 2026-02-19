import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProjectToken } from "@/lib/session";
import { z } from "zod";

const CreateProjectSchema = z.object({
  title: z.string().min(3).max(200),
  inventorName: z.string().optional(),
});

// GET /api/projects - list projects by session tokens
export async function GET(req: NextRequest) {
  const tokens = req.cookies.get("patent_buddy_session")?.value;
  if (!tokens) return NextResponse.json({ projects: [] });

  let tokenList: string[];
  try {
    tokenList = JSON.parse(tokens) as string[];
  } catch {
    return NextResponse.json({ projects: [] });
  }

  const projects = await prisma.project.findMany({
    where: { token: { in: tokenList } },
    orderBy: { updatedAt: "desc" },
    include: {
      interview: { select: { currentStep: true, completed: true } },
      sections: { select: { id: true } },
      claims: { select: { id: true } },
    },
  });

  return NextResponse.json({ projects });
}

// POST /api/projects - create a new project
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const token = generateProjectToken();

  const project = await prisma.project.create({
    data: {
      token,
      title: parsed.data.title,
      inventorName: parsed.data.inventorName,
      interview: {
        create: {
          answers: "{}",
          currentStep: 0,
          completed: false,
          updatedAt: new Date(),
        },
      },
    },
  });

  // Add token to session cookie
  const existingTokens = req.cookies.get("patent_buddy_session")?.value;
  let tokenList: string[] = [];
  if (existingTokens) {
    try {
      tokenList = JSON.parse(existingTokens) as string[];
    } catch {
      tokenList = [];
    }
  }
  tokenList.push(token);

  const response = NextResponse.json({ project, token });
  response.cookies.set("patent_buddy_session", JSON.stringify(tokenList), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
