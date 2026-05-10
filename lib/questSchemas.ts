import { z } from "zod";
import {
  QUEST_STATUS_OPTIONS,
  QUEST_TYP_OPTIONS,
  QUEST_PRIORITAET_OPTIONS,
} from "./constants";

const optionalTrimmedString = (max: number) =>
  z.string().max(max).optional().nullable().transform((v) => (v ? v.trim() || null : null));

const sichtbarkeitSchema = z.enum(["public", "privat"]).default("public");

export const questCreateSchema = z.object({
  title: z.string().trim().min(1, "Titel erforderlich.").max(200),
  status: z.enum(QUEST_STATUS_OPTIONS).default("Aktiv"),
  typ: z.enum(QUEST_TYP_OPTIONS).default("Nebenquest"),
  prioritaet: z.enum(QUEST_PRIORITAET_OPTIONS).optional().nullable(),
  summary: optionalTrimmedString(2000),
  description: optionalTrimmedString(20000),
  reward: optionalTrimmedString(2000),
  gmNotes: optionalTrimmedString(20000),
  deadline: optionalTrimmedString(200),
  sichtbarkeit: sichtbarkeitSchema,
});

export const questUpdateSchema = questCreateSchema.partial();

export const questObjectiveCreateSchema = z.object({
  label: z.string().trim().min(1, "Label erforderlich.").max(500),
});

export const questObjectiveUpdateSchema = z.object({
  objectiveId: z.string().min(1),
  done: z.boolean(),
});

export const questObjectiveDeleteSchema = z.object({
  objectiveId: z.string().min(1),
});

export type QuestCreateInput = z.infer<typeof questCreateSchema>;
export type QuestUpdateInput = z.infer<typeof questUpdateSchema>;
