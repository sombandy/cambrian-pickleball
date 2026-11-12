import { auth } from "@clerk/nextjs/server";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { editorAllowed } from "@/lib/tournament12/protocol";

export const dynamic = "force-dynamic";
export async function GET() {
  const { userId } = clerkEnabled ? await auth() : { userId: null };
  return Response.json(
    { canEdit: editorAllowed(userId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
