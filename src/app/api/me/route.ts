import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not authenticated" } }, { status: 401 });
  return NextResponse.json({ data: session.user });
}
