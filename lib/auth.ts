import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // JWT strategy: session is stored in a signed cookie, not in the DB Session
  // table. This lets the proxy (withAuth) decode the session without a DB call.
  // PrismaAdapter still manages User + Account rows on sign-in.
  session: { strategy: "jwt" },
  callbacks: {
    // Persist user.id into the JWT on first sign-in (token.sub = user.id by default,
    // but we also store it explicitly for clarity).
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Expose user.id in the session object returned by getServerSession().
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    // Respect same-origin callbackUrl (e.g. /projects/new set by the proxy).
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
