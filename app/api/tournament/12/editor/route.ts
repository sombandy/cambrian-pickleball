import { signedInEditor } from "@/lib/tournament12/editor-auth";

export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(
    { canEdit: (await signedInEditor()) !== null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
