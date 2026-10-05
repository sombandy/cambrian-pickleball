import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  RANKINGS_COOKIE,
  isValidPassword,
  rankingsAccessToken,
  safeRankingsPath,
} from "@/lib/rankings-access";

export const metadata: Metadata = {
  title: "Enter password - Cambrian Pickleball Rankings",
  robots: { index: false, follow: false },
};

async function unlock(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const next = safeRankingsPath(String(formData.get("next") ?? ""));
  const token = rankingsAccessToken();

  if (!token || !isValidPassword(password)) {
    // Slow down repeated guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const params = new URLSearchParams({ error: "1" });
    if (next !== "/rankings") params.set("next", next);
    redirect(`/rankings/unlock?${params}`);
  }

  (await cookies()).set(RANKINGS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  if (!rankingsAccessToken()) {
    console.error("RANKINGS_PASSWORD is not set; rankings pages are locked.");
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
        <h1 className="text-2xl font-semibold">Rankings</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Rankings are temporarily unavailable. Please check back later.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Rankings</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter the password to view the rankings.
      </p>
      <form action={unlock} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="next" value={safeRankingsPath(next)} />
        <input
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Password"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">Incorrect password.</p>}
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-2 text-white"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
