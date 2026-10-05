import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { RANKINGS_COOKIE, hasRankingsAccess } from "@/lib/rankings-access";

let handler: NextMiddleware | null = null;

if (clerkEnabled) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { clerkMiddleware } = require("@clerk/nextjs/server");
  handler = clerkMiddleware({
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  });
}

function needsRankingsPassword(pathname: string) {
  const isRankings = pathname === "/rankings" || pathname.startsWith("/rankings/");
  return isRankings && pathname !== "/rankings/unlock";
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (
    needsRankingsPassword(pathname) &&
    !hasRankingsAccess(request.cookies.get(RANKINGS_COOKIE)?.value)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/rankings/unlock";
    url.search = "";
    if (pathname !== "/rankings") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (handler) return handler(request, event);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|webp|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api)(.*)",
  ],
};
