import { prisma } from "@/lib/prisma";
import { TransferError } from "@/features/transactions/service/transferFunds";

export async function approveRequest(requestId: string, reviewerId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.moneyRequest.findUnique({ where: { id: requestId } });
    if (!req || req.status !== "PENDING") throw new TransferError("INVALID_STATE", "Not pending");
    if (req.userId === reviewerId) throw new TransferError("SELF_APPROVAL", "Cannot approve own request");
    const acc = await tx.account.findUnique({ where: { id: req.accountId } });
    if (!acc || acc.status !== "ACTIVE") throw new TransferError("ACCOUNT_FROZEN", "Account not active");
    const amt = req.amount;
    if (req.type === "WITHDRAWAL") {
      const newBal = acc.balance.sub(amt);
      if (newBal.lt(acc.minBalance)) throw new TransferError("INSUFFICIENT_FUNDS", "Insufficient funds");
      await tx.account.update({ where: { id: acc.id }, data: { balance: newBal } });
    } else {
      await tx.account.update({ where: { id: acc.id }, data: { balance: acc.balance.add(amt) } });
    }
    const txn = await tx.transaction.create({
      data: {
        transactionId: `TXN-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
        type: req.type === "DEPOSIT" ? "DEPOSIT" : "WITHDRAWAL",
        amount: amt,
        fee: 0,
        status: "COMPLETED",
        description: req.description ?? null,
        senderAccountId: req.type === "WITHDRAWAL" ? acc.id : null,
        receiverAccountId: req.type === "DEPOSIT" ? acc.id : null,
        createdById: req.userId,
      },
    });
    await tx.moneyRequest.update({ where: { id: req.id }, data: { status: "APPROVED", reviewedById: reviewerId, reviewedAt: new Date(), reviewNote: note ?? null, transactionId: txn.id } });
    return txn;
  });
}

export async function rejectRequest(requestId: string, reviewerId: string, note?: string) {
  const req = await prisma.moneyRequest.findUnique({ where: { id: requestId } });
  if (!req || req.status !== "PENDING") throw new TransferError("INVALID_STATE", "Not pending");
  if (req.userId === reviewerId) throw new TransferError("SELF_APPROVAL", "Cannot reject own request");
  await prisma.moneyRequest.update({ where: { id: requestId }, data: { status: "REJECTED", reviewedById: reviewerId, reviewedAt: new Date(), reviewNote: note ?? null } });
}
