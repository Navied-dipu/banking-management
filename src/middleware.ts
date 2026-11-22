import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as any)?.role;
  if (pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/login", req.url));
  if (pathname.startsWith("/staff") && role !== "STAFF" && role !== "ADMIN") return NextResponse.redirect(new URL("/login", req.url));
  if (pathname.startsWith("/customer") && !role) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*", "/staff/:path*", "/customer/:path*"] };
