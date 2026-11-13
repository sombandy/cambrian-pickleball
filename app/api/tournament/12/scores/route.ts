import { scoringDatabase } from "@/lib/tournament12/database";
import { signedInEditor } from "@/lib/tournament12/editor-auth";
import {
  loadTournament,
  saveTournament,
  ScoringError,
} from "@/lib/tournament12/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  try {
    return reply(await loadTournament(scoringDatabase()));
  } catch {
    return reply({ error: "SCOREBOARD_UNAVAILABLE" }, 503);
  }
}
export async function POST(request: Request) {
  // The custom header + JSON preflight prevent cross-site form submissions; no CORS is enabled.
  if (
    request.headers.get("x-cpl-editor") !== "1" ||
    !request.headers.get("content-type")?.startsWith("application/json")
  )
    return reply({ error: "INVALID_DATA" }, 415);
  const origin = request.headers.get("origin");
  const allowed = [new URL(request.url).origin];
  if (process.env.NEXT_PUBLIC_APP_URL)
    allowed.push(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
  if (origin && !allowed.includes(origin))
    return reply({ error: "NOT_EDITOR" }, 403);
  const editor = await signedInEditor();
  if (!editor) return reply({ error: "NOT_EDITOR" }, 403);
  try {
    // Bounded streaming read: do not trust Content-Length or accept arbitrary state snapshots.
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "INVALID_DATA" }, 422);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 8192) {
        await reader.cancel();
        return reply({ error: "INVALID_DATA" }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let input: unknown;
    try {
      input = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return reply({ error: "INVALID_DATA" }, 422);
    }
    // The history records the name on the signed-in account, not one typed in the browser.
    if (input && typeof input === "object" && !Array.isArray(input))
      input = { ...input, editor: editor.name };
    return reply(await saveTournament(scoringDatabase(), input, editor.id));
  } catch (error) {
    if (error instanceof ScoringError)
      return reply({ error: error.code }, error.status);
    return reply({ error: "SCOREBOARD_UNAVAILABLE" }, 503);
  }
}
