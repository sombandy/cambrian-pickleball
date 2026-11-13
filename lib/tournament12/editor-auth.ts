import { currentUser } from "@clerk/nextjs/server";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { editorAllowed } from "./editors";

// Clerk user ID of the signed-in viewer when one of their verified emails is on
// the editor list (lib/tournament12/editors.ts); null for everyone else.
export async function signedInEditorId(): Promise<string | null> {
  if (!clerkEnabled) return null;
  const user = await currentUser();
  if (!user) return null;
  const verified = user.emailAddresses
    .filter((entry) => entry.verification?.status === "verified")
    .map((entry) => entry.emailAddress);
  return editorAllowed(verified) ? user.id : null;
}
