import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const u = await requireRole(["ADMIN","STAFF","CUSTOMER"]);
  const url = new URL(req.url);
  const where: any = {};
  if (u.role === "CUSTOMER") {
    const userAccounts = await prisma.account.findMany({ where: { user: { id: u.id } } });
    return NextResponse.json({ data: userAccounts });
  }
  if (url.searchParams.get("userId")) where.userId = url.searchParams.get("userId");
  const items = await prisma.account.findMany({ where, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: items });
}

const createSchema = z.object({ userId: z.string(), type: z.enum(["SAVINGS","CURRENT","BUSINESS"]), pin: z.string().min(4) });

export async function POST(req: Request) {
  await requireRole(["STAFF","ADMIN"]);
  const body = createSchema.parse(await req.json());
  const num = "100" + Math.floor(Math.random()*1e9).toString().padStart(9,"0");
  const acc = await prisma.account.create({ data: { accountNumber: num, userId: body.userId, type: body.type, transactionPinHash: await bcrypt.hash(body.pin,10) } });
  return NextResponse.json({ data: acc }, { status: 201 });
}
