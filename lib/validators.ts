import { z } from "zod";

import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { sanitizeRichText } from "@/lib/sanitize";
import { getTournament } from "@/lib/tournaments";
import { stripHtml } from "@/lib/utils";

const trimmedString = z.string().trim();

export const sortSchema = z.enum(SORT_OPTIONS);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const postFieldsSchema = z.object({
  title: trimmedString.min(10, "Title must be at least 10 characters.").max(120, "Title must be 120 characters or fewer."),
  body: z
    .string()
    .transform((value) => sanitizeRichText(value))
    .refine((value) => stripHtml(value).length > 0, "Description is required."),
  category: z.enum(CATEGORIES),
});

export const postPayloadSchema = postFieldsSchema.extend({
  tournamentSlug: z
    .string()
    .nullish()
    .transform((value) => value ?? null)
    .refine(
      (value) => value === null || Boolean(getTournament(value)?.hasFeedbackBoard),
      "Unknown tournament.",
    ),
});

export const postUpdateSchema = postFieldsSchema;

export const commentPayloadSchema = z.object({
  body: trimmedString.min(1, "Comment cannot be empty.").max(1000, "Comment must be 1000 characters or fewer."),
});
