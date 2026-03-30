import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNowStrict, format as formatDateFns } from "date-fns";
import { twMerge } from "tailwind-merge";

import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category } from "@/lib/types";

type ClerkUserShape = {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
  emailAddresses?: Array<{
    emailAddress?: string | null;
  }>;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryLabel(category: Category) {
  return CATEGORY_LABELS[category];
}

export function getDisplayName(user: ClerkUserShape | null | undefined) {
  if (!user) {
    return "Community Player";
  }

  const fullName = user.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const firstAndLast = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (firstAndLast) {
    return firstAndLast;
  }

  const username = user.username?.trim();
  if (username) {
    return username;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress?.trim();
  if (primaryEmail) {
    return primaryEmail.split("@")[0] ?? primaryEmail;
  }

  const fallbackEmail = user.emailAddresses?.[0]?.emailAddress?.trim();
  if (fallbackEmail) {
    return fallbackEmail.split("@")[0] ?? fallbackEmail;
  }

  return "Community Player";
}

export function formatRelativeTime(date: string | Date) {
  return `${formatDistanceToNowStrict(new Date(date), { addSuffix: false })} ago`;
}

export function formatCalendarDate(date: string | Date) {
  return formatDateFns(new Date(date), "MMM d, yyyy");
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeHtml(text: string) {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

export function plainTextToHtml(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

export function htmlToPlainText(html: string) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/ul>|<\/ol>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

export function excerpt(text: string, maxLength = 180) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) {
    return "CP";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatCommentCount(count: number) {
  return `${count} comment${count === 1 ? "" : "s"}`;
}

export function formatVoteCount(count: number) {
  return `${count} vote${count === 1 ? "" : "s"}`;
}
