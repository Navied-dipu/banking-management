import { NextResponse } from "next/server";
import { ApiError } from "@/lib/errors/api-error";
import { ZodError } from "zod";

export function apiHandler(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try { return await fn(req); }
    catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
      if (e instanceof ZodError) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: e.message } }, { status: 400 });
      return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
    }
  };
}
