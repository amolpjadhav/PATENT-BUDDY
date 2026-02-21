import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  email?: string | null;
}

/**
 * Returns the authenticated user from the current server session, or null if unauthenticated.
 * Works in both server components and API route handlers.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email };
}

/**
 * Returns AuthUser if authenticated, or a ready-to-return 401 NextResponse.
 * Usage:
 *   const authResult = await requireAuthUser();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { id: userId } = authResult;
 */
export async function requireAuthUser(): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
