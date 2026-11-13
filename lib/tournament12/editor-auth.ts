import { currentUser } from "@clerk/nextjs/server";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { editorAllowed } from "./editors";

// The signed-in viewer's Clerk user ID and display name when one of their
// verified emails is on the editor list (lib/tournament12/editors.ts); null
// for everyone else.
export async function signedInEditor(): Promise<{ id: string; name: string } | null> {
  if (!clerkEnabled) return null;
  const user = await currentUser();
  if (!user) return null;
  const verified = user.emailAddresses
    .filter((entry) => entry.verification?.status === "verified")
    .map((entry) => entry.emailAddress);
  if (!editorAllowed(verified)) return null;
  const name =
    user.fullName?.trim() ||
    user.primaryEmailAddress?.emailAddress.split("@")[0] ||
    "Scorer";
  return { id: user.id, name: name.slice(0, 80) };
}
