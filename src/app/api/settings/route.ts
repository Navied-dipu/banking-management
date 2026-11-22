import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireRole(["ADMIN"]);
  const items = await prisma.systemSetting.findMany();
  return NextResponse.json({ data: items });
}

const schema = z.object({ dailyTransferLimit: z.string().optional(), singleTransactionLimit: z.string().optional(), minBalance: z.string().optional() });

export async function PATCH(req: Request) {
  await requireRole(["ADMIN"]);
  const body = schema.parse(await req.json());
  if (body.dailyTransferLimit) await prisma.systemSetting.upsert({ where: { key: "defaultDailyTransferLimit" }, update: { value: body.dailyTransferLimit }, create: { key: "defaultDailyTransferLimit", value: body.dailyTransferLimit } });
  if (body.singleTransactionLimit) await prisma.systemSetting.upsert({ where: { key: "defaultSingleTransactionLimit" }, update: { value: body.singleTransactionLimit }, create: { key: "defaultSingleTransactionLimit", value: body.singleTransactionLimit } });
  if (body.minBalance) await prisma.systemSetting.upsert({ where: { key: "defaultMinBalance" }, update: { value: body.minBalance }, create: { key: "defaultMinBalance", value: body.minBalance } });
  return NextResponse.json({ data: { ok: true } });
}
