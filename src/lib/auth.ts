import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credsSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || user.status !== "ACTIVE") return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = (user as any).id; token.role = (user as any).role; token.status = (user as any).status; } return token; },
    session({ session, token }) { (session.user as any).id = token.id; (session.user as any).role = token.role; (session.user as any).status = token.status; return session; },
  },
  pages: { signIn: "/login" },
});
