import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["ADMIN","STAFF","CUSTOMER"]);
  const acc = await prisma.account.findUnique({ where: { id: (await params).id }, include: { user: { select: { id: true, name: true, email: true } } } });
  if (!acc) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  if (u.role === "CUSTOMER" && acc.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not yours" } }, { status: 403 });
  return NextResponse.json({ data: acc });
}

const patchSchema = z.object({
  status: z.enum(["ACTIVE","FROZEN","CLOSED"]).optional(),
  dailyTransferLimit: z.number().optional(),
  singleTransactionLimit: z.number().optional(),
  minBalance: z.number().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["ADMIN"]);
  const body = patchSchema.parse(await req.json());
  const data: any = {};
  if (body.status) data.status = body.status;
  if (body.dailyTransferLimit !== undefined) data.dailyTransferLimit = body.dailyTransferLimit;
  if (body.singleTransactionLimit !== undefined) data.singleTransactionLimit = body.singleTransactionLimit;
  if (body.minBalance !== undefined) data.minBalance = body.minBalance;
  const acc = await prisma.account.update({ where: { id: (await params).id }, data });
  return NextResponse.json({ data: acc });
}

