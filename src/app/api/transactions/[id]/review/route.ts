import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["ADMIN"]);
  const id = (await params).id;
  const body = z.object({ action: z.enum(["reviewed","reverse"]) }).parse(await req.json());
  const txn = await prisma.transaction.findUnique({ where: { id } });
  if (!txn) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  if (body.action === "reviewed") {
    await prisma.transaction.update({ where: { id }, data: { flagged: false } });
    return NextResponse.json({ data: { ok: true } });
  }
  // reverse
  await prisma.$transaction(async (tx) => {
    if (txn.status === "REVERSED") throw new Error("Already reversed");
    // reverse balances
    if (txn.senderAccountId) {
      const s = await tx.account.findUnique({ where: { id: txn.senderAccountId } });
      if (s) await tx.account.update({ where: { id: s.id }, data: { balance: s.balance.add(txn.amount).add(txn.fee) } });
    }
    if (txn.receiverAccountId) {
      const r = await tx.account.findUnique({ where: { id: txn.receiverAccountId } });
      if (r) await tx.account.update({ where: { id: r.id }, data: { balance: r.balance.sub(txn.amount) } });
    }
    await tx.transaction.update({ where: { id }, data: { status: "REVERSED" } });
    await tx.transaction.create({ data: { transactionId: `TXN-REV-${Date.now()}`, type: txn.type, amount: txn.amount, fee: txn.fee, status: "COMPLETED", description: `Reversal of ${txn.transactionId}`, senderAccountId: txn.receiverAccountId, receiverAccountId: txn.senderAccountId, createdById: u.id } });
  });
  return NextResponse.json({ data: { ok: true } });
}
