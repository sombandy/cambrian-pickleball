import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  RANKINGS_COOKIE,
  isValidPassword,
  rankingsAccessToken,
} from "@/lib/rankings-access";

export const metadata: Metadata = {
  title: "Enter password - Cambrian Pickleball Rankings",
  robots: { index: false, follow: false },
};

async function unlock(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const token = rankingsAccessToken();

  if (!token || !isValidPassword(password)) {
    redirect("/rankings/unlock?error=1");
  }

  (await cookies()).set(RANKINGS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/rankings");
}

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Rankings</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter the password to view the rankings.
      </p>
      <form action={unlock} className="mt-6 flex flex-col gap-3">
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
