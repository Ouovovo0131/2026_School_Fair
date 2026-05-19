import { NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/site";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export function middleware(request: NextRequest) {
  const siteOrigin = getSiteOrigin();
  const siteHost = new URL(siteOrigin).hostname;
  const currentHost = request.nextUrl.hostname;

  if (LOCAL_HOSTNAMES.has(currentHost) || currentHost === siteHost) {
    return NextResponse.next();
  }

  const destination = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, siteOrigin);
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
