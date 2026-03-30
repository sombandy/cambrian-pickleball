import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminPage } from "@/lib/auth";
import { listAdmins } from "@/lib/admin";
import {
  listRecentActivity,
  listRecentCommentsForAdmin,
  listRecentPostsForAdmin,
} from "@/lib/data";

export default async function AdminPage() {
  await requireAdminPage();

  const [admins, posts, comments, activity] = await Promise.all([
    listAdmins(),
    listRecentPostsForAdmin(),
    listRecentCommentsForAdmin(),
    listRecentActivity(),
  ]);

  return (
    <main className="grid gap-6">
      <section className="surface-card fade-rise rounded-[2.3rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-court">Moderation</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Keep the board readable, fair, and useful.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          Admins can edit any post, delete bad content, and manage the small moderation team directly through Clerk metadata.
        </p>
      </section>

      <AdminDashboard admins={admins} posts={posts} comments={comments} activity={activity} />
    </main>
  );
}
