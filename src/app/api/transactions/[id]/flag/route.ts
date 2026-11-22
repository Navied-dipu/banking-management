import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["STAFF","ADMIN"]);
  const id = (await params).id;
  const body = z.object({ reason: z.string().min(1) }).parse(await req.json());
  await prisma.transaction.update({ where: { id }, data: { flagged: true, flagReason: body.reason, flaggedById: u.id } });
  return NextResponse.json({ data: { ok: true } });
}
