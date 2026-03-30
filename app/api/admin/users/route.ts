import { NextResponse } from "next/server";
import { z } from "zod";

import { getViewerAuth } from "@/lib/auth";
import { grantAdminByEmail, listAdmins } from "@/lib/admin";
import { errorToResponse, jsonError } from "@/lib/http";

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export async function GET() {
  try {
    const viewer = await getViewerAuth();

    if (!viewer.userId) {
      return jsonError("You must be signed in.", 401);
    }

    if (!viewer.isAdmin) {
      return jsonError("Only admins can view the admin list.", 403);
    }

    const admins = await listAdmins();
    return NextResponse.json({ admins });
  } catch (error) {
    return errorToResponse(error, "Could not load admins.");
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewerAuth();

    if (!viewer.userId) {
      return jsonError("You must be signed in.", 401);
    }

    if (!viewer.isAdmin) {
      return jsonError("Only admins can grant admin access.", 403);
    }

    const payload = emailSchema.parse(await request.json());
    const clerkId = await grantAdminByEmail(payload.email);

    if (!clerkId) {
      return jsonError("No Clerk account exists for that email. Ask them to sign up first.", 404);
    }

    return NextResponse.json({ clerkId });
  } catch (error) {
    return errorToResponse(error, "Could not grant admin access.");
  }
}
