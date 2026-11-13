import { z } from "zod";

const team = z.enum(["A", "B", "C", "D", "E", "F"]);
const score = z.number().int().min(0).max(23);
const position = z.number().int().min(1).max(5);
export const actionSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("score"),
      id: z.string().regex(/^(L([1-9]|[1-5]\d|60)|(SF[12]|F|P3)-[1-5])$/),
      a: score,
      b: score,
    })
    .strict(),
  z
    .object({
      type: z.literal("names"),
      team,
      names: z.array(z.string().trim().min(1).max(80)).length(5),
    })
    .strict(),
  z
    .object({
      type: z.literal("prepare-semis"),
      seeds: z.array(team).length(6),
    })
    .strict(),
  z
    .object({
      type: z.literal("swap"),
      team,
      first: position,
      second: position,
    })
    .strict(),
  z.object({ type: z.literal("publish-lineups") }).strict(),
  z.object({ type: z.literal("prepare-finals") }).strict(),
  z
    .object({
      type: z.literal("tiebreak"),
      series: z.enum(["SF1", "SF2", "F", "P3"]),
      a: score,
      b: score,
      positions: z.array(position).length(2),
    })
    .strict(),
]);
export const writeSchema = z
  .object({
    action: actionSchema,
    revision: z.number().int().min(0).max(2147483646),
    operation: z.uuid(),
    editor: z.string().trim().min(1).max(80),
  })
  .strict();
export type Command = z.infer<typeof writeSchema>;
