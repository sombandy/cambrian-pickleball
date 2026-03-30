import { z } from "zod";

import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { sanitizeRichText } from "@/lib/sanitize";
import { stripHtml } from "@/lib/utils";

const trimmedString = z.string().trim();

export const sortSchema = z.enum(SORT_OPTIONS);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const postPayloadSchema = z.object({
  title: trimmedString.min(10, "Title must be at least 10 characters.").max(120, "Title must be 120 characters or fewer."),
  body: z
    .string()
    .transform((value) => sanitizeRichText(value))
    .refine((value) => stripHtml(value).length > 0, "Description is required."),
  category: z.enum(CATEGORIES),
});

export const postUpdateSchema = postPayloadSchema;

export const commentPayloadSchema = z.object({
  body: trimmedString.min(1, "Comment cannot be empty.").max(1000, "Comment must be 1000 characters or fewer."),
});
