import { cookies } from "next/headers";

const SESSION_COOKIE = "patent_buddy_session";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: "/",
};

export async function getSessionProjectIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function addProjectToSession(projectId: string): Promise<void> {
  const cookieStore = await cookies();
  const existing = await getSessionProjectIds();
  if (!existing.includes(projectId)) existing.push(projectId);
  cookieStore.set(SESSION_COOKIE, JSON.stringify(existing), COOKIE_OPTS);
}

export async function removeProjectFromSession(projectId: string): Promise<void> {
  const cookieStore = await cookies();
  const existing = await getSessionProjectIds();
  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify(existing.filter((id) => id !== projectId)),
    COOKIE_OPTS
  );
}

/** Read project IDs from a raw Request cookie header (for API routes). */
export function getSessionIdsFromRequest(cookieValue: string | undefined): string[] {
  if (!cookieValue) return [];
  try {
    return JSON.parse(cookieValue) as string[];
  } catch {
    return [];
  }
}
