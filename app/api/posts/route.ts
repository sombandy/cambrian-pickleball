import { NextResponse, type NextRequest } from "next/server";

import { getViewerAuth } from "@/lib/auth";
import { createPost, enforceCreateRateLimit, listPosts } from "@/lib/data";
import { errorToResponse } from "@/lib/http";
import { getActorKey } from "@/lib/request";
import { paginationSchema, postPayloadSchema, sortSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const viewer = await getViewerAuth();
    const rawSort = request.nextUrl.searchParams.get("sort") ?? undefined;
    const rawPage = request.nextUrl.searchParams.get("page") ?? undefined;
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? undefined;

    const sort = sortSchema.safeParse(rawSort).data ?? "newest";
    const pagination = paginationSchema.safeParse({
      page: rawPage,
      limit: rawLimit,
    }).data ?? { page: 1, limit: 12 };

    const result = await listPosts({
      sort,
      page: pagination.page,
      limit: pagination.limit,
      viewerUserId: viewer.userId,
    });

    return NextResponse.json({
      ...result,
      sort,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    return errorToResponse(error, "Could not load posts.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewerAuth();
    const body = await request.json();
    const payload = postPayloadSchema.parse(body);

    await enforceCreateRateLimit(getActorKey(request, viewer.userId), "post");

    const post = await createPost({
      title: payload.title,
      body: payload.body,
      category: payload.category,
      userId: viewer.userId,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return errorToResponse(error, "Could not create post.");
  }
}
