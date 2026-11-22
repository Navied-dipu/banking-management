import { NextResponse } from "next/server";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireRole(["ADMIN"]);
  const [customers, accounts, txns, pendingLoans] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.account.findMany(),
    prisma.transaction.findMany(),
    prisma.loan.count({ where: { status: "PENDING" } }),
  ]);
  const totalBalance = accounts.reduce((a, c) => a + Number(c.balance), 0);
  const deposits = txns.filter(t => t.type === "DEPOSIT").reduce((a, c) => a + Number(c.amount), 0);
  const withdrawals = txns.filter(t => t.type === "WITHDRAWAL").reduce((a, c) => a + Number(c.amount), 0);
  return NextResponse.json({ data: { customers, accounts: accounts.length, totalBalance, deposits, withdrawals, transactions: txns.length, pendingLoans } });
}
