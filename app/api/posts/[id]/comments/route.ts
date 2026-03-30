import { NextResponse, type NextRequest } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { createComment, enforceCreateRateLimit, getEditablePost } from "@/lib/data";
import { errorToResponse, jsonError } from "@/lib/http";
import { getActorKey } from "@/lib/request";
import { commentPayloadSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;
    const post = await getEditablePost(id);

    if (!post) {
      return jsonError("Post not found.", 404);
    }

    const payload = commentPayloadSchema.parse(await request.json());

    await enforceCreateRateLimit(getActorKey(request, viewer.userId), "comment");

    const comment = await createComment({
      postId: id,
      body: payload.body,
      userId: viewer.userId,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return errorToResponse(error, "Could not add comment.");
  }
}
