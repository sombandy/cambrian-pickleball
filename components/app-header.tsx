import { UserButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

type AppHeaderProps = {
  viewerIsAdmin: boolean;
  viewerIsSignedIn: boolean;
};

export function AppHeader({ viewerIsAdmin, viewerIsSignedIn }: AppHeaderProps) {
  return (
    <header className="mb-7 flex items-center justify-between gap-4 rounded-[28px] border border-white/75 bg-white/74 px-4 py-4 shadow-[0_24px_48px_-38px_rgba(30,41,59,0.28)] backdrop-blur-xl md:px-6">
      <Link href="/" className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf3ff_0%,#dfeaff_100%)] text-sm font-semibold text-court shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          CP
        </span>
        <div>
          <span className="font-display text-[1.08rem] font-semibold tracking-tight text-ink">
            Cambrian Pickleball Feedback
          </span>
          <p className="text-xs text-muted">Community issues, ideas, and tournament feedback</p>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {viewerIsAdmin ? (
          <Link
            href="/admin"
            className="secondary-button inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        ) : null}

        {!viewerIsSignedIn ? (
          <>
            <Link
              href="/sign-in"
              className="secondary-button rounded-2xl px-3.5 py-2.5 text-sm font-medium"
            >
              Sign in
            </Link>
          </>
        ) : null}

        {viewerIsSignedIn ? (
          <div className="rounded-2xl border border-outline bg-white/92 p-1.5 shadow-[0_18px_30px_-28px_rgba(30,41,59,0.26)]">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 rounded-xl",
                },
              }}
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
