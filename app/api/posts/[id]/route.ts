import { NextResponse } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { deletePost, getEditablePost, getPostDetail, updatePost } from "@/lib/data";
import { errorToResponse, jsonError } from "@/lib/http";
import { postUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;
    const post = await getPostDetail(id, viewer.userId);

    if (!post) {
      return jsonError("Post not found.", 404);
    }

    return NextResponse.json({ post });
  } catch (error) {
    return errorToResponse(error, "Could not load post.");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewer = await getViewerAuth();
    const { id } = await params;

    if (!viewer.userId) {
      return jsonError("You must be signed in to edit posts.", 401);
    }

    const existingPost = await getEditablePost(id);
    if (!existingPost) {
      return jsonError("Post not found.", 404);
    }

    const canEdit = existingPost.clerk_id === viewer.userId;
    if (!canEdit) {
      return jsonError("You do not have permission to edit this post.", 403);
    }

    const payload = postUpdateSchema.parse(await request.json());
    const post = await updatePost(id, payload);

    return NextResponse.json({ post });
  } catch (error) {
    return errorToResponse(error, "Could not update post.");
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
      return jsonError("You must be signed in to delete posts.", 401);
    }

    const existingPost = await getEditablePost(id);
    if (!existingPost) {
      return jsonError("Post not found.", 404);
    }

    const canDelete = viewer.isAdmin || existingPost.clerk_id === viewer.userId;
    if (!canDelete) {
      return jsonError("You do not have permission to delete this post.", 403);
    }

    const post = await deletePost(id);
    if (!post) {
      return jsonError("Post not found.", 404);
    }

    return NextResponse.json({ post });
  } catch (error) {
    return errorToResponse(error, "Could not delete post.");
  }
}
