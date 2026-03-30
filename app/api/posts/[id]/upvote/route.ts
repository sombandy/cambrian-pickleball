import { NextResponse } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { getEditablePost, toggleUpvote } from "@/lib/data";
import { errorToResponse, jsonError } from "@/lib/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;

    if (!viewer.userId) {
      return jsonError("Sign in to upvote.", 401);
    }

    const post = await getEditablePost(id);
    if (!post) {
      return jsonError("Post not found.", 404);
    }

    const result = await toggleUpvote(id, viewer.userId);
    return NextResponse.json(result);
  } catch (error) {
    return errorToResponse(error, "Could not update vote.");
  }
}
