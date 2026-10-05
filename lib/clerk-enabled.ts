// Clerk is always on in production, so a missing key fails loudly as it did before.
// Locally, Clerk is skipped when no key is set so the app runs without an account setup.
export const clerkEnabled =
  process.env.NODE_ENV === "production" ||
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
