import { NextResponse } from "next/server";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const u = await requireRole(["CUSTOMER"]);
  const accounts = await prisma.account.findMany({ where: { userId: u.id } });
  const ids = accounts.map(a => a.id);
  const txns = await prisma.transaction.findMany({ where: { OR: [{ senderAccountId: { in: ids } }, { receiverAccountId: { in: ids } }] } });
  const loans = await prisma.loan.findMany({ where: { userId: u.id, status: "ACTIVE" } });
  const totalBalance = accounts.reduce((a, c) => a + Number(c.balance), 0);
  const deposits = txns.filter(t => t.type === "DEPOSIT").reduce((a, c) => a + Number(c.amount), 0);
  const withdrawals = txns.filter(t => t.type === "WITHDRAWAL").reduce((a, c) => a + Number(c.amount), 0);
  return NextResponse.json({ data: { totalBalance, deposits, withdrawals, accounts, recent: txns.slice(0,10), activeLoans: loans.length } });
}
