import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({ accountId: z.string(), type: z.enum(["DEPOSIT","WITHDRAWAL"]), amount: z.string(), description: z.string().optional(), requestDate: z.string().optional() });

export async function GET(req: Request) {
  const u = await requireRole(["CUSTOMER","STAFF","ADMIN"]);
  const url = new URL(req.url);
  const pending = url.searchParams.get("pending") === "true";
  const where: any = {};
  if (u.role === "CUSTOMER") where.userId = u.id;
  else if (pending) where.status = "PENDING";
  const items = await prisma.moneyRequest.findMany({ where, orderBy: { requestDate: "desc" } });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const u = await requireRole(["CUSTOMER"]);
  const body = createSchema.parse(await req.json());
  const acc = await prisma.account.findUnique({ where: { id: body.accountId } });
  if (!acc || acc.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not your account" } }, { status: 403 });
  const r = await prisma.moneyRequest.create({ data: { accountId: body.accountId, userId: u.id, type: body.type, amount: body.amount, description: body.description ?? null, requestDate: body.requestDate ? new Date(body.requestDate) : new Date() } });
  return NextResponse.json({ data: r }, { status: 201 });
}
