import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/errors/api-error";
import { approveRequest, rejectRequest } from "@/features/requests/service/handleRequest";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole(["STAFF","ADMIN"]);
  const id = (await params).id;
  const body = z.object({ action: z.enum(["approve","reject"]), note: z.string().optional() }).parse(await req.json());
  try {
    if (body.action === "approve") { const txn = await approveRequest(id, u.id, body.note); return NextResponse.json({ data: txn }); }
    await rejectRequest(id, u.id, body.note); return NextResponse.json({ data: { ok: true } });
  } catch (e: any) { return NextResponse.json({ error: { code: e.code ?? "ERROR", message: e.message } }, { status: 400 }); }
}
