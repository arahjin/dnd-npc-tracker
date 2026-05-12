import { z } from "zod";
import {
  STATUS_OPTIONS,
  BEZIEHUNG_OPTIONS,
  GESCHLECHT_OPTIONS,
  ALIGNMENT_OPTIONS,
  ORGANISATION_TYP_OPTIONS,
} from "./constants";

const sichtbarkeit = z.enum(["public", "privat"]);

// Coerces "" / null / undefined to null and trims, applies max length.
const optStr = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (typeof v === "string" ? (v.trim() ? v.trim() : null) : null))
    .pipe(z.string().max(max).nullable());

// Optional enum: empty string or null is mapped to null.
const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .union([z.enum(values), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? (v as T[number]) : null));

// Association arrays
const orgRef = z.object({
  organisationId: z.string().min(1),
  rolle: z.string().max(200).optional().nullable().transform((v) => v ?? null),
});

// ─── NPC ────────────────────────────────────────────────
const npcBase = {
  name: z.string().trim().min(1, "Name erforderlich.").max(200),
  status: z.enum(STATUS_OPTIONS).default("Unbekannt"),
  beziehung: z.enum(BEZIEHUNG_OPTIONS).default("Unbekannt"),
  geschlecht: optEnum(GESCHLECHT_OPTIONS),
  region: optStr(200),
  alter: optStr(50),
  rasse: optStr(100),
  herkunft: optStr(200),
  aktuellePosition: optStr(200),
  gottheit: optStr(100),
  notizen: optStr(20000),
  sichtbarkeit: sichtbarkeit.default("public"),
  privateNotizen: optStr(20000),
  organisationen: z.array(orgRef).optional(),
};
export const npcCreateSchema = z.object(npcBase);
export const npcUpdateSchema = z.object({
  ...npcBase,
  name: npcBase.name.optional(),
  status: npcBase.status.optional(),
  beziehung: npcBase.beziehung.optional(),
  sichtbarkeit: sichtbarkeit.optional(),
}).partial();

// ─── Organisation ───────────────────────────────────────
const orgBase = {
  name: z.string().trim().min(1, "Name erforderlich.").max(200),
  beschreibung: optStr(10000),
  image: optStr(2000),
  typ: optEnum(ORGANISATION_TYP_OPTIONS),
  region: optStr(200),
  alignment: optEnum(ALIGNMENT_OPTIONS),
  beziehungZurGruppe: optStr(200),
  gottheit: optStr(100),
  sichtbarkeit: sichtbarkeit.default("public"),
  privateNotizen: optStr(20000),
};
export const organisationCreateSchema = z.object(orgBase);
export const organisationUpdateSchema = z.object({
  ...orgBase,
  name: orgBase.name.optional(),
  sichtbarkeit: sichtbarkeit.optional(),
}).partial();

// ─── Charakter ──────────────────────────────────────────
const charBase = {
  name: z.string().trim().min(1, "Name erforderlich.").max(200),
  status: z.enum(STATUS_OPTIONS).default("Lebendig"),
  beziehung: z.enum(BEZIEHUNG_OPTIONS).default("Neutral"),
  geschlecht: optEnum(GESCHLECHT_OPTIONS),
  region: optStr(200),
  alter: optStr(50),
  rasse: optStr(100),
  herkunft: optStr(200),
  aktuellePosition: optStr(200),
  gottheit: optStr(100),
  notizen: optStr(20000),
  sichtbarkeit: sichtbarkeit.default("public"),
  privateNotizen: optStr(20000),
  organisationen: z.array(orgRef).optional(),
};
export const charakterCreateSchema = z.object(charBase);
export const charakterUpdateSchema = z.object({
  ...charBase,
  name: charBase.name.optional(),
  status: charBase.status.optional(),
  beziehung: charBase.beziehung.optional(),
  sichtbarkeit: sichtbarkeit.optional(),
}).partial();

// ─── Location ───────────────────────────────────────────
const idArray = z.array(z.string().min(1)).optional();
const locationBase = {
  name: z.string().trim().min(1, "Name erforderlich.").max(200),
  image: optStr(2000),
  art: optStr(100),
  land: optStr(200),
  region: optStr(200),
  population: z
    .union([z.number().int().nonnegative(), z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
    }),
  klima: optStr(200),
  floraFauna: optStr(10000),
  wissenswertes: optStr(20000),
  sichtbarkeit: sichtbarkeit.default("public"),
  privateNotizen: optStr(20000),
  npcIds: idArray,
  orgIds: idArray,
  charakterIds: idArray,
};
export const locationCreateSchema = z.object(locationBase);
export const locationUpdateSchema = z.object({
  ...locationBase,
  name: locationBase.name.optional(),
  sichtbarkeit: sichtbarkeit.optional(),
}).partial();

// ─── Journal ────────────────────────────────────────────
const journalTagSchema = z.object({
  tagTyp: z.enum(["PERSON", "ORGANISATION", "CHARAKTER", "SPIELER", "LOCATION"]),
  referenzId: z.string().min(1).max(100),
});
const journalBase = {
  titel: optStr(300),
  inhalt: z.string().trim().min(1, "Inhalt darf nicht leer sein.").max(50000),
  typ: z.enum(["TAGEBUCH", "GESCHICHTE"]),
  tags: z.array(journalTagSchema).max(200).optional(),
};
export const journalCreateSchema = z.object(journalBase);
export const journalUpdateSchema = z.object({
  titel: optStr(300),
  inhalt: z.string().trim().min(1).max(50000),
  tags: z.array(journalTagSchema).max(200).optional(),
});

/** Convenience helper: parse a body, return either the data or a NextResponse-friendly error string. */
export function parseOrError<T>(schema: z.ZodType<T>, body: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(body);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, error: r.error.issues[0]?.message ?? "Ungültige Eingabe." };
}
