import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

let handler: ((req: NextRequest) => any) | null = null;

if (hasClerkKeys) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { clerkMiddleware } = require("@clerk/nextjs/server");
  handler = clerkMiddleware({
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  });
}

export default function proxy(request: NextRequest) {
  if (handler) return handler(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|webp|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api)(.*)",
  ],
};
