import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ── vi.hoisted: define mocks before vi.mock factories are evaluated ───────────
const { mockRequireAuthUser, mockFindMany, mockCreate, mockArtifactCreate } = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockArtifactCreate: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({ requireAuthUser: mockRequireAuthUser }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findMany: mockFindMany, create: mockCreate },
    projectArtifact: { create: mockArtifactCreate },
  },
}));

import { GET, POST } from "@/app/api/projects/route";

const MOCK_USER = { id: "user-1", email: "test@example.com" };

function makePostRequest(body: object) {
  return new NextRequest("http://localhost/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── GET /api/projects ────────────────────────────────────────────────────────

describe("GET /api/projects", () => {
  it("returns 401 when not authenticated", async () => {
    mockRequireAuthUser.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns projects list for authenticated user", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    const mockProjects = [{ id: "proj-1", title: "My Invention" }];
    mockFindMany.mockResolvedValue(mockProjects);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.projects).toEqual(mockProjects);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
  });
});

// ─── POST /api/projects ───────────────────────────────────────────────────────

describe("POST /api/projects", () => {
  it("returns 401 when not authenticated", async () => {
    mockRequireAuthUser.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const res = await POST(makePostRequest({ title: "Test" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    const res = await POST(makePostRequest({ title: "" }));
    expect(res.status).toBe(400);
  });

  it("creates and returns a project when input is valid", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    const mockProject = { id: "proj-new", title: "My Invention", userId: "user-1" };
    mockCreate.mockResolvedValue(mockProject);
    mockArtifactCreate.mockResolvedValue({});

    const res = await POST(
      makePostRequest({ title: "My Invention", intakeNotes: "A detailed description." })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.project).toEqual(mockProject);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "My Invention", userId: "user-1" }),
      })
    );
  });

  it("creates project without intakeNotes", async () => {
    mockRequireAuthUser.mockResolvedValue(MOCK_USER);
    const mockProject = { id: "proj-no-notes", title: "Quick Patent", userId: "user-1" };
    mockCreate.mockResolvedValue(mockProject);

    const res = await POST(makePostRequest({ title: "Quick Patent" }));
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ intakeNotes: null }),
      })
    );
  });
});
