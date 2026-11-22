import { requireRole } from "@/lib/errors/api-error";
import { NextResponse } from "next/server";

export async function GET() {
  await requireRole(["ADMIN"]);
  return NextResponse.json({ data: "pong" });
}
