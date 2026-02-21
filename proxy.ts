import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import type { NextFetchEvent, NextRequest } from "next/server";

const authHandler = withAuth({
  pages: { signIn: "/auth/signin" },
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return authHandler(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*"],
};
