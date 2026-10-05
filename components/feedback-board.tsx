import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { PaginationControls } from "@/components/pagination-controls";
import { PostCard } from "@/components/post-card";
import { PostForm } from "@/components/post-form";
import { SortTabs } from "@/components/sort-tabs";
import { PAGE_SIZE } from "@/lib/constants";
import { getViewerAuth } from "@/lib/auth";
import { listPosts } from "@/lib/data";
import { paginationSchema, sortSchema } from "@/lib/validators";

export type FeedbackSearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function FeedbackBoard({
  heading,
  intro,
  basePath,
  tournamentSlug = null,
  searchParams,
}: {
  heading: string;
  intro?: React.ReactNode;
  basePath: string;
  // Null shows the general feedback board.
  tournamentSlug?: string | null;
  searchParams: FeedbackSearchParams;
}) {
  const rawSort = getSingleValue(searchParams.sort);
  const rawPage = getSingleValue(searchParams.page);
  const rawLimit = getSingleValue(searchParams.limit);

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
    tournamentSlug,
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {heading}
        </h1>
        {!viewer.isSignedIn ? (
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(`${basePath}#share-feedback`)}`}
            className="secondary-button rounded-full px-4 py-2.5 text-sm font-medium"
          >
            Sign in
          </Link>
        ) : (
          <div className="rounded-2xl border border-outline bg-white/92 p-1.5 shadow-[0_18px_30px_-28px_rgba(30,41,59,0.26)]">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 rounded-xl",
                },
              }}
            />
          </div>
        )}
      </div>

      {intro}

      <PostForm tournamentSlug={tournamentSlug} feedbackPath={basePath} />

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium tracking-wide text-muted">
            All feedback ({totalCount.toLocaleString()})
          </h2>
          <SortTabs sort={sort} limit={pagination.limit} basePath={basePath} />
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

        <PaginationControls
          page={pagination.page}
          totalCount={totalCount}
          limit={pagination.limit}
          sort={sort}
          basePath={basePath}
        />
      </section>
    </div>
  );
}
