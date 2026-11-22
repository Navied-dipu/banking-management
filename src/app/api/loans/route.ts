import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const u = await requireRole(["CUSTOMER","STAFF","ADMIN"]);
  const where: any = u.role === "CUSTOMER" ? { userId: u.id } : {};
  const loans = await prisma.loan.findMany({ where, include: { repayments: true, notes: true } });
  return NextResponse.json({ data: loans });
}

const applySchema = z.object({ accountId: z.string(), loanType: z.string(), requestedAmount: z.string(), durationMonths: z.number(), monthlyIncome: z.string(), employmentStatus: z.string(), description: z.string().optional() });

export async function POST(req: Request) {
  const u = await requireRole(["CUSTOMER"]);
  const body = applySchema.parse(await req.json());
  const acc = await prisma.account.findUnique({ where: { id: body.accountId } });
  if (!acc || acc.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not your account" } }, { status: 403 });
  const loan = await prisma.loan.create({ data: { userId: u.id, accountId: body.accountId, loanType: body.loanType, requestedAmount: body.requestedAmount, durationMonths: body.durationMonths, interestRate: 0, monthlyIncome: body.monthlyIncome, employmentStatus: body.employmentStatus, description: body.description ?? null, remainingBalance: 0 } });
  return NextResponse.json({ data: loan }, { status: 201 });
}
