// Shared types & validation for map placement shapes.
// Coordinates are normalized 0..1 within the image.

export type PointShape = { type: "point"; x: number; y: number };
export type PolygonShape = { type: "polygon"; points: number[][] };
export type CircleShape = { type: "circle"; x: number; y: number; r: number };
export type RectShape = { type: "rect"; x: number; y: number; w: number; h: number };

export type MapShape = PointShape | PolygonShape | CircleShape | RectShape;

export const PIN_ICONS: Record<string, string> = {
  point: "📍",
  castle: "🏰",
  town: "🏘️",
  forest: "🌲",
  mountain: "⛰️",
  lake: "🌊",
  port: "⚓",
  battle: "⚔️",
  danger: "💀",
  magical: "✨",
  temple: "⛪",
  inn: "🍺",
};

export const PIN_ICON_KEYS = Object.keys(PIN_ICONS);

export const SHAPE_COLORS = [
  "#C9A84C",
  "#DC2626",
  "#2563EB",
  "#16A34A",
  "#9333EA",
  "#EA580C",
  "#0A0A0A",
  "#F5EDD6",
];

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isHexColor(s: unknown): s is string {
  return typeof s === "string" && HEX_RE.test(s);
}

function inUnit(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

/** Validate + normalize a shape JSON. Throws Error with friendly message. */
export function validateShape(input: unknown): MapShape {
  if (!input || typeof input !== "object") {
    throw new Error("Shape erforderlich.");
  }
  const s = input as { type?: unknown };
  if (s.type === "point") {
    const { x, y } = s as { x?: unknown; y?: unknown };
    if (!inUnit(x) || !inUnit(y)) throw new Error("Punkt-Koordinaten müssen zwischen 0 und 1 liegen.");
    return { type: "point", x, y };
  }
  if (s.type === "polygon") {
    const { points } = s as { points?: unknown };
    if (!Array.isArray(points) || points.length < 3) {
      throw new Error("Polygon braucht mindestens 3 Punkte.");
    }
    const cleaned: number[][] = [];
    for (const p of points) {
      if (!Array.isArray(p) || p.length !== 2) throw new Error("Polygon-Punkt ungültig.");
      const [x, y] = p;
      if (!inUnit(x) || !inUnit(y)) throw new Error("Polygon-Koordinaten müssen zwischen 0 und 1 liegen.");
      cleaned.push([x, y]);
    }
    return { type: "polygon", points: cleaned };
  }
  if (s.type === "circle") {
    const { x, y, r } = s as { x?: unknown; y?: unknown; r?: unknown };
    if (!inUnit(x) || !inUnit(y)) throw new Error("Kreis-Koordinaten müssen zwischen 0 und 1 liegen.");
    if (typeof r !== "number" || !Number.isFinite(r) || r <= 0 || r > 2) {
      throw new Error("Kreis-Radius ungültig.");
    }
    return { type: "circle", x, y, r };
  }
  if (s.type === "rect") {
    const { x, y, w, h } = s as { x?: unknown; y?: unknown; w?: unknown; h?: unknown };
    if (!inUnit(x) || !inUnit(y)) throw new Error("Rechteck-Position ungültig.");
    if (typeof w !== "number" || typeof h !== "number" || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0 || x + w > 1.0001 || y + h > 1.0001) {
      throw new Error("Rechteck-Größe ungültig.");
    }
    return { type: "rect", x, y, w, h };
  }
  throw new Error("Unbekannter Shape-Typ.");
}

/** Return a representative point (x,y) for a shape, used e.g. for centering on it. */
export function shapeCenter(shape: MapShape): { x: number; y: number } {
  if (shape.type === "point") return { x: shape.x, y: shape.y };
  if (shape.type === "circle") return { x: shape.x, y: shape.y };
  if (shape.type === "rect") return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
  // polygon: centroid of vertices
  const n = shape.points.length;
  let sx = 0;
  let sy = 0;
  for (const [x, y] of shape.points) {
    sx += x;
    sy += y;
  }
  return { x: sx / n, y: sy / n };
}
