import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { PostForm } from "@/components/post-form";
import { getViewerAuth } from "@/lib/auth";
import { getEditablePost } from "@/lib/data";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authState = await auth();

  if (!authState.userId) {
    return authState.redirectToSignIn();
  }

  const viewer = await getViewerAuth();
  const post = await getEditablePost(id);

  if (!post) {
    notFound();
  }

  const canEdit = viewer.isAdmin || post.clerk_id === viewer.userId;

  if (!canEdit) {
    redirect(`/posts/${id}`);
  }

  return (
    <main className="grid gap-5">
      <section className="surface-card fade-rise rounded-[2.3rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Edit</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Update this post without losing the conversation around it.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Title, description, and category can all change here. Existing comments and votes remain attached to the post.
        </p>
      </section>

      <PostForm
        mode="edit"
        postId={post.id}
        initialValues={{
          title: post.title,
          body: post.body,
          category: post.category,
        }}
      />
    </main>
  );
}
