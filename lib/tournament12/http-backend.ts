import type { Backend } from "./store";

export function httpBackend(request: typeof fetch = fetch): Backend {
  const call = async (path: string, options: RequestInit = {}) => {
    const response = await request(`/api/tournament/12/${path}`, {
      ...options,
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "SCOREBOARD_UNAVAILABLE");
    return body;
  };
  return {
    load: () => call("scores"),
    canEdit: async () => (await call("editor")).canEdit === true,
    save: (write) =>
      call("scores", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CPL-Editor": "1" },
        body: JSON.stringify({
          action: write.action,
          revision: write.revision,
          operation: write.operation,
          editor: write.editor,
        }),
      }),
  };
}
