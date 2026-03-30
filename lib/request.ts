import { createHash } from "node:crypto";

type HeaderSource = {
  headers: Headers;
};

export function getRequestIp(request: HeaderSource) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

export function getActorKey(request: HeaderSource, userId: string | null) {
  if (userId) {
    return `user:${userId}`;
  }

  const ip = getRequestIp(request);
  const ipHash = createHash("sha256").update(ip).digest("hex");
  return `ip:${ipHash}`;
}
