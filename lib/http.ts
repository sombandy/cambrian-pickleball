import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { RateLimitError } from "@/lib/data";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function errorToResponse(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof RateLimitError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? fallback, 400);
  }

  if (error instanceof Error) {
    return jsonError(error.message || fallback, 400);
  }

  return jsonError(fallback, 500);
}
