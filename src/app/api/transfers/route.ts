import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";
import { transferFunds, TransferError } from "@/features/transactions/service/transferFunds";

const schema = z.object({
  fromAccountId: z.string(),
  recipientAccountNumber: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  description: z.string().optional(),
  pin: z.string().min(4),
  idempotencyKey: z.string().uuid(),
});

export async function POST(req: Request) {
  const u = await requireRole(["CUSTOMER"]);
  let body;
  try { body = schema.parse(await req.json()); }
  catch (e) { return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input" } }, { status: 400 }); }
  // ownership check
  const acc = await prisma.account.findUnique({ where: { id: body.fromAccountId } });
  if (!acc || acc.userId !== u.id) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Not your account" } }, { status: 403 });
  try {
    const txn = await transferFunds({ ...body, callerId: u.id });
    return NextResponse.json({ data: txn });
  } catch (e: any) {
    if (e instanceof TransferError) return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 400 });
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed" } }, { status: 500 });
  }
}
