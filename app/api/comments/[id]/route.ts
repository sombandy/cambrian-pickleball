import { NextResponse } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { deleteComment, getEditableComment, updateComment } from "@/lib/data";
import { errorToResponse, jsonError } from "@/lib/http";
import { commentPayloadSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;

    if (!viewer.userId) {
      return jsonError("You must be signed in to edit comments.", 401);
    }

    const existingComment = await getEditableComment(id);
    if (!existingComment) {
      return jsonError("Comment not found.", 404);
    }

    const canEdit = existingComment.clerk_id === viewer.userId;
    if (!canEdit) {
      return jsonError("You do not have permission to edit this comment.", 403);
    }

    const payload = commentPayloadSchema.parse(await request.json());
    const comment = await updateComment(id, payload);

    return NextResponse.json({ comment });
  } catch (error) {
    return errorToResponse(error, "Could not update comment.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;

    if (!viewer.userId) {
      return jsonError("You must be signed in to delete comments.", 401);
    }

    const existingComment = await getEditableComment(id);
    if (!existingComment) {
      return jsonError("Comment not found.", 404);
    }

    const canDelete = viewer.isAdmin || existingComment.clerk_id === viewer.userId;
    if (!canDelete) {
      return jsonError("You do not have permission to delete this comment.", 403);
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
