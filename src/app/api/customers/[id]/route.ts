import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["ADMIN","STAFF"]);
  const user = await prisma.user.findUnique({ where: { id: (await params).id }, include: { accounts: true } });
  if (!user) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  // customers scoped: staff/admin ok
  return NextResponse.json({ data: user });
}

const patchSchema = z.object({ status: z.enum(["ACTIVE","INACTIVE","BLOCKED"]).optional(), verified: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["ADMIN","STAFF"]);
  const body = patchSchema.parse(await req.json());
  // staff cannot block
  if (body.status === "BLOCKED" && u.role !== "ADMIN") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Staff cannot block" } }, { status: 403 });
  const data: any = {};
  if (body.status) data.status = body.status;
  const user = await prisma.user.update({ where: { id: (await params).id }, data });
  return NextResponse.json({ data: user });
}

