import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["CUSTOMER"]);
  const id = (await params).id;
  const body = z.object({ accountId: z.string(), pin: z.string() }).parse(await req.json());
  const loan = await prisma.loan.findUnique({ where: { id }, include: { repayments: { where: { status: "PENDING" }, orderBy: { installmentNo: "asc" }, take: 1 } } });
  if (!loan || loan.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not yours" } }, { status: 403 });
  const installment = loan.repayments[0];
  if (!installment) return NextResponse.json({ error: { code: "NO_DUE", message: "No due installment" } }, { status: 400 });

  const acc = await prisma.account.findUnique({ where: { id: body.accountId } });
  if (!acc || acc.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not your account" } }, { status: 403 });
  if (!acc.transactionPinHash || !(await bcrypt.compare(body.pin, acc.transactionPinHash))) return NextResponse.json({ error: { code: "INVALID_PIN", message: "Invalid PIN" } }, { status: 400 });
  if (acc.balance.lt(installment.amount)) return NextResponse.json({ error: { code: "INSUFFICIENT_FUNDS", message: "Insufficient funds" } }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.account.update({ where: { id: acc.id }, data: { balance: acc.balance.sub(installment.amount) } });
    await tx.loanRepayment.update({ where: { id: installment.id }, data: { status: "PAID", paidAt: new Date() } });
    const txn = await tx.transaction.create({ data: { transactionId: `TXN-${Date.now()}-${Math.floor(Math.random()*1e6)}`, type: "LOAN_REPAYMENT", amount: installment.amount, fee: 0, status: "COMPLETED", description: "Loan repayment", senderAccountId: acc.id, createdById: u.id } });
    await tx.loanRepayment.update({ where: { id: installment.id }, data: { transactionId: txn.id } });
    const newRemaining = loan.remainingBalance.sub(installment.amount);
    await tx.loan.update({ where: { id }, data: { remainingBalance: newRemaining.lt(0) ? 0 : newRemaining, status: newRemaining.lte(0) ? "COMPLETED" : "ACTIVE" } });
  });
  return NextResponse.json({ data: { ok: true } });
}
