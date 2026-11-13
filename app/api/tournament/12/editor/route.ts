import { signedInEditorId } from "@/lib/tournament12/editor-auth";

export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(
    { canEdit: (await signedInEditorId()) !== null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
