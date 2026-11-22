import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const u = await requireRole(["ADMIN","STAFF"]);
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const page = Number(url.searchParams.get("page") || 1);
  const take = 10;
  const where: any = { role: "CUSTOMER" };
  if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip: (page-1)*take, take, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ data: items, meta: { page, total, pages: Math.ceil(total/take) } });
}

const createSchema = z.object({ name: z.string().min(1), email: z.string().email(), phone: z.string().optional() });

export async function POST(req: Request) {
  await requireRole(["STAFF","ADMIN"]);
  const body = createSchema.parse(await req.json());
  const temp = "TempPass123!";
  const bcrypt = await import("bcryptjs");
  const user = await prisma.user.create({ data: { name: body.name, email: body.email, phone: body.phone, passwordHash: await bcrypt.hash(temp,10), role: "CUSTOMER" } });
  return NextResponse.json({ data: user, tempPassword: temp }, { status: 201 });
}
