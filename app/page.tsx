import { PaginationControls } from "@/components/pagination-controls";
import { PostCard } from "@/components/post-card";
import { PostForm } from "@/components/post-form";
import { SortTabs } from "@/components/sort-tabs";
import { PAGE_SIZE } from "@/lib/constants";
import { getViewerAuth } from "@/lib/auth";
import { listPosts } from "@/lib/data";
import { paginationSchema, sortSchema } from "@/lib/validators";

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawSort = getSingleValue(resolvedSearchParams.sort);
  const rawPage = getSingleValue(resolvedSearchParams.page);
  const rawLimit = getSingleValue(resolvedSearchParams.limit);

  const sort = sortSchema.safeParse(rawSort).data ?? "newest";
  const pagination = paginationSchema.safeParse({
    page: rawPage,
    limit: rawLimit ?? PAGE_SIZE.toString(),
  }).data ?? { page: 1, limit: PAGE_SIZE };

  const viewer = await getViewerAuth();
  const { posts, totalCount } = await listPosts({
    sort,
    page: pagination.page,
    limit: pagination.limit,
    viewerUserId: viewer.userId,
  });

  return (
    <main className="grid gap-6 pb-12">
      <PostForm />

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-sm font-medium tracking-wide text-muted">Posts</h1>
          <SortTabs sort={sort} limit={pagination.limit} />
        </div>

        {posts.length === 0 ? (
          <div className="surface-card rounded-[24px] p-6 text-sm text-muted">
            No posts yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <PaginationControls page={pagination.page} totalCount={totalCount} limit={pagination.limit} sort={sort} />
      </section>
    </main>
  );
}
