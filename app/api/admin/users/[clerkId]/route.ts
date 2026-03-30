import { NextResponse } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { revokeAdmin } from "@/lib/admin";
import { errorToResponse, jsonError } from "@/lib/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ clerkId: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { clerkId } = await params;

    if (!viewer.userId) {
      return jsonError("You must be signed in.", 401);
    }

    if (!viewer.isAdmin) {
      return jsonError("Only admins can revoke admin access.", 403);
    }

    await revokeAdmin(clerkId);
    return NextResponse.json({ clerkId });
  } catch (error) {
    return errorToResponse(error, "Could not revoke admin access.");
  }
}
