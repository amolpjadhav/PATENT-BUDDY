import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

const SESSION_COOKIE = "patent_buddy_session";
const TOKEN_LENGTH = 32;

export function generateProjectToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "").slice(0, TOKEN_LENGTH - 32);
}

export async function getSessionTokens(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function addTokenToSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  const existing = await getSessionTokens();
  if (!existing.includes(token)) {
    existing.push(token);
  }
  cookieStore.set(SESSION_COOKIE, JSON.stringify(existing), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

export async function removeTokenFromSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  const existing = await getSessionTokens();
  const updated = existing.filter((t) => t !== token);
  cookieStore.set(SESSION_COOKIE, JSON.stringify(updated), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function hasAccessToProject(token: string): Promise<boolean> {
  const tokens = await getSessionTokens();
  return tokens.includes(token);
}
