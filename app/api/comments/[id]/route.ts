import { NextResponse } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { deleteComment } from "@/lib/data";
import { errorToResponse, jsonError } from "@/lib/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;

    if (!viewer.userId) {
      return jsonError("You must be signed in.", 401);
    }

    if (!viewer.isAdmin) {
      return jsonError("Only admins can delete comments.", 403);
    }

    const comment = await deleteComment(id);
    if (!comment) {
      return jsonError("Comment not found.", 404);
    }

    return NextResponse.json({ comment });
  } catch (error) {
    return errorToResponse(error, "Could not delete comment.");
  }
}
