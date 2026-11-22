export class ApiError extends Error { constructor(public code: string, public message: string, public status: number) { super(message); } }
export async function requireRole(roles: string[]) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("UNAUTHENTICATED", "Not authenticated", 401);
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== "ACTIVE") throw new ApiError("FORBIDDEN", "Inactive user", 403);
  if (!roles.includes(user.role)) throw new ApiError("FORBIDDEN", "Insufficient permissions", 403);
  return { id: user.id, role: user.role };
}
