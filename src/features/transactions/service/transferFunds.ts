import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export class TransferError extends Error { constructor(public code: string, message: string) { super(message); } }

export async function transferFunds(input: {
  fromAccountId: string; recipientAccountNumber: string; amount: string; description?: string; pin: string; idempotencyKey: string; callerId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;

    const sender = await tx.account.findUnique({ where: { id: input.fromAccountId } });
    if (!sender) throw new TransferError("ACCOUNT_NOT_FOUND", "Sender not found");
    const receiver = await tx.account.findUnique({ where: { accountNumber: input.recipientAccountNumber } });
    if (!receiver) throw new TransferError("ACCOUNT_NOT_FOUND", "Receiver not found");
    if (sender.id === receiver.id) throw new TransferError("SAME_ACCOUNT", "Cannot transfer to same account");

    // lock rows in id order
    const ids = [sender.id, receiver.id].sort();
    await tx.$queryRaw`SELECT id FROM "Account" WHERE id IN (${ids[0]}, ${ids[1]}) FOR UPDATE`;

    // re-read
    const s = await tx.account.findUnique({ where: { id: sender.id } });
    const r = await tx.account.findUnique({ where: { id: receiver.id } });
    if (!s || !r) throw new TransferError("ACCOUNT_NOT_FOUND", "Account not found");

    const owner = await tx.user.findUnique({ where: { id: s.userId } });
    const recvOwner = await tx.user.findUnique({ where: { id: r.userId } });
    if (!owner || owner.status !== "ACTIVE") throw new TransferError("USER_INACTIVE", "User inactive");
    if (recvOwner?.status !== "ACTIVE") throw new TransferError("USER_INACTIVE", "Receiver inactive");
    if (s.status !== "ACTIVE" || r.status !== "ACTIVE") throw new TransferError("ACCOUNT_FROZEN", "Account not active");

    // PIN check
    if (s.pinLockedUntil && s.pinLockedUntil > new Date()) throw new TransferError("PIN_LOCKED", "PIN locked");
    const pinOk = s.transactionPinHash ? await bcrypt.compare(input.pin, s.transactionPinHash) : false;
    if (!pinOk) {
      const attempts = s.failedPinAttempts + 1;
      await tx.account.update({ where: { id: s.id }, data: { failedPinAttempts: attempts, pinLockedUntil: attempts >= 5 ? new Date(Date.now() + 15*60*1000) : null } });
      throw new TransferError("INVALID_PIN", "Invalid PIN");
    }
    await tx.account.update({ where: { id: s.id }, data: { failedPinAttempts: 0, pinLockedUntil: null } });

    const amt = new Prisma.Decimal(input.amount);
    if (amt.lte(0)) throw new TransferError("INVALID_AMOUNT", "Amount must be positive");

    // limits
    if (amt.gt(s.singleTransactionLimit)) throw new TransferError("LIMIT_EXCEEDED", "Single transaction limit exceeded");

    // daily
    const start = new Date(); start.setHours(0,0,0,0);
    const agg = await tx.transaction.aggregate({ where: { senderAccountId: s.id, status: "COMPLETED", createdAt: { gte: start } }, _sum: { amount: true } });
    const todayTotal = new Prisma.Decimal(agg._sum.amount ?? 0);
    if (todayTotal.add(amt).gt(s.dailyTransferLimit)) throw new TransferError("LIMIT_EXCEEDED", "Daily limit exceeded");

    // fee
    let fee = new Prisma.Decimal(0);
    if (s.userId !== r.userId) {
      fee = amt.mul(0.01);
      if (fee.lt(5)) fee = new Prisma.Decimal(5);
    }

    const total = amt.add(fee);
    const newBalance = s.balance.sub(total);
    if (newBalance.lt(s.minBalance)) throw new TransferError("INSUFFICIENT_FUNDS", "Insufficient funds");

    await tx.account.update({ where: { id: s.id }, data: { balance: newBalance } });
    await tx.account.update({ where: { id: r.id }, data: { balance: r.balance.add(amt) } });

    const txn = await tx.transaction.create({
      data: {
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
        idempotencyKey: input.idempotencyKey,
        type: "TRANSFER",
        amount: amt,
        fee,
        status: "COMPLETED",
        description: input.description ?? null,
        senderAccountId: s.id,
        receiverAccountId: r.id,
        createdById: input.callerId,
      },
    });
    return txn;
  }, { isolationLevel: "Serializable" });
}


