import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["CUSTOMER","STAFF","ADMIN"]);
  const id = (await params).id;
  const loan = await prisma.loan.findUnique({ where: { id }, include: { repayments: true, notes: { include: { author: { select: { name: true } } } } } });
  if (!loan) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  if (u.role === "CUSTOMER" && loan.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not yours" } }, { status: 403 });
  return NextResponse.json({ data: loan });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["STAFF","ADMIN"]);
  const id = (await params).id;
  const body = z.object({ action: z.enum(["forward","approve","reject","note"]), note: z.string().optional(), approvedAmount: z.string().optional(), interestRate: z.number().optional() }).parse(await req.json());
  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });

  if (body.action === "forward") {
    if (loan.status !== "PENDING") return NextResponse.json({ error: { code: "INVALID_STATE", message: "Not pending" } }, { status: 400 });
    await prisma.loan.update({ where: { id }, data: { status: "UNDER_REVIEW" } });
    return NextResponse.json({ data: { ok: true } });
  }
  if (body.action === "note") {
    await prisma.loanNote.create({ data: { loanId: id, authorId: u.id, note: body.note ?? "" } });
    return NextResponse.json({ data: { ok: true } });
  }
  if (body.action === "reject") {
    if (u.role !== "ADMIN") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admin only" } }, { status: 403 });
    await prisma.loan.update({ where: { id }, data: { status: "REJECTED" } });
    if (body.note) await prisma.loanNote.create({ data: { loanId: id, authorId: u.id, note: body.note } });
    return NextResponse.json({ data: { ok: true } });
  }
  // approve (admin)
  if (u.role !== "ADMIN") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admin only" } }, { status: 403 });
  if (loan.status === "APPROVED" || loan.status === "ACTIVE" || loan.status === "COMPLETED") return NextResponse.json({ error: { code: "ALREADY_APPROVED", message: "Already approved" } }, { status: 400 });

  const approvedAmount = new Prisma.Decimal(body.approvedAmount ?? loan.requestedAmount.toString());
  const rate = body.interestRate ?? 10;
  const months = loan.durationMonths;
  // EMI reducing balance
  const r = new Prisma.Decimal(rate).div(100).div(12);
  const emi = approvedAmount.mul(r).mul(new Prisma.Decimal(1).add(r).pow(months)).div(new Prisma.Decimal(1).add(r).pow(months).sub(1));
  // schedule
  let balance = approvedAmount;
  const installments: { installmentNo: number; dueDate: Date; amount: Prisma.Decimal }[] = [];
  const startDate = new Date();
  for (let i = 1; i <= months; i++) {
    const due = new Date(startDate); due.setMonth(due.getMonth() + i);
    let principal = emi.sub(balance.mul(r));
    if (i === months) principal = balance;
    const amt = i === months ? balance.add(balance.mul(r)) : emi;
    balance = balance.sub(principal);
    installments.push({ installmentNo: i, dueDate: due, amount: amt });
  }

  await prisma.$transaction(async (tx) => {
    await tx.loan.update({ where: { id }, data: { status: "ACTIVE", approvedAmount, interestRate: rate, remainingBalance: approvedAmount, approvedById: u.id } });
    for (const inst of installments) {
      await tx.loanRepayment.create({ data: { loanId: id, installmentNo: inst.installmentNo, dueDate: inst.dueDate, amount: inst.amount } });
    }
    // credit account
    const acc = await tx.account.findUnique({ where: { id: loan.accountId } });
    if (!acc) throw new Error("Account not found");
    await tx.account.update({ where: { id: acc.id }, data: { balance: acc.balance.add(approvedAmount) } });
    const txn = await tx.transaction.create({ data: { transactionId: `TXN-${Date.now()}-${Math.floor(Math.random()*1e6)}`, type: "LOAN_DISBURSEMENT", amount: approvedAmount, fee: 0, status: "COMPLETED", description: "Loan disbursement", receiverAccountId: acc.id, createdById: u.id } });
    await tx.loan.update({ where: { id }, data: { disbursementTxId: txn.id } });
  });
  return NextResponse.json({ data: { ok: true } });
}

