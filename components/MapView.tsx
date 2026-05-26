"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polygon,
  Circle,
  Rectangle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useTranslations } from "next-intl";
import {
  PIN_ICONS,
  PIN_ICON_KEYS,
  SHAPE_COLORS,
  shapeCenter,
  type MapShape,
} from "@/lib/mapShapes";

export type MapPlacement = {
  id: string;
  x: number;
  y: number;
  shape: MapShape | null;
  color: string | null;
  icon: string | null;
  linkedMapId: string | null;
  linkedMap?: { id: string; name: string } | null;
  location: { id: string; name: string; art: string | null; sichtbarkeit: string } | null;
  quest: { id: string; title: string; status: string; sichtbarkeit: string } | null;
};

type AvailableLocation = { id: string; name: string };
type AvailableQuest = { id: string; title: string; status: string };
type AvailableMap = { id: string; name: string };

type Props = {
  mapId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  placements: MapPlacement[];
  canEdit: boolean;
  availableLocations: AvailableLocation[];
  availableQuests?: AvailableQuest[];
  availableMaps?: AvailableMap[];
};

type TargetKind = "location" | "quest";

/** Resolves a placement into a uniform target descriptor regardless of type. */
function targetOf(p: MapPlacement):
  | {
      kind: TargetKind;
      id: string;
      name: string;
      sub: string | null;
      sichtbarkeit: string;
      detailHref: string;
      defaultColor: string;
      defaultIcon: string;
    }
  | null {
  if (p.quest) {
    return {
      kind: "quest",
      id: p.quest.id,
      name: p.quest.title,
      sub: p.quest.status,
      sichtbarkeit: p.quest.sichtbarkeit,
      detailHref: `/quests/${p.quest.id}`,
      defaultColor: DEFAULT_QUEST_COLOR,
      defaultIcon: "📜",
    };
  }
  if (p.location) {
    return {
      kind: "location",
      id: p.location.id,
      name: p.location.name,
      sub: p.location.art,
      sichtbarkeit: p.location.sichtbarkeit,
      detailHref: `/locations/${p.location.id}`,
      defaultColor: DEFAULT_COLOR,
      defaultIcon: "📍",
    };
  }
  return null;
}

type DrawMode =
  | null
  | "point"
  | "polygon"
  | "circle"
  | "rect"
  | "edit"
  | "delete"
  | "geo";

const DEFAULT_COLOR = "#C9A84C";
const DEFAULT_QUEST_COLOR = "#3B82F6";

// ── Geoman augmentation (typed loosely — Geoman doesn't ship strict types) ──
type PMLayer = L.Layer & {
  pm?: {
    enable?: (opts?: Record<string, unknown>) => void;
    disable?: () => void;
  };
};
type PMMap = L.Map & {
  pm?: {
    addControls?: (opts: Record<string, unknown>) => void;
    setGlobalOptions?: (opts: Record<string, unknown>) => void;
    enableGlobalEditMode?: (opts?: Record<string, unknown>) => void;
    disableGlobalEditMode?: () => void;
    enableGlobalDragMode?: () => void;
    disableGlobalDragMode?: () => void;
  };
};

function pinIcon(opts: { color: string; icon?: string | null; privateLook: boolean; fallbackGlyph?: string }) {
  const color = opts.color || (opts.privateLook ? "#C84040" : DEFAULT_COLOR);
  const emoji = opts.icon && PIN_ICONS[opts.icon] ? PIN_ICONS[opts.icon] : opts.fallbackGlyph;
  if (emoji) {
    const html = `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#0E0E0E;border:2px solid ${color};font-size:18px;line-height:1;color:${color};">${emoji}</div>`;
    return L.divIcon({
      html,
      className: "map-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  }
  const stroke = opts.privateLook ? "#6B1111" : "#6B5511";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 22 14 22s14-12.5 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/><circle cx="14" cy="14" r="5" fill="#0E0E0E"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "map-pin",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds);
  }, [map, bounds]);
  return null;
}

/** When `focus` is provided (e.g. ?placement=ID), fly to it. */
function FocusOnPlacement({
  focus,
}: {
  focus: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], focus.zoom ?? Math.max(map.getZoom(), 1), { duration: 0.8 });
    }
  }, [map, focus]);
  return null;
}

type DrawEvent =
  | { kind: "click"; lat: number; lng: number }
  | { kind: "dblclick"; lat: number; lng: number }
  | { kind: "mousemove"; lat: number; lng: number }
  | { kind: "mousedown"; lat: number; lng: number }
  | { kind: "mouseup"; lat: number; lng: number };

function MapEventHandler({ onEvent }: { onEvent: (e: DrawEvent) => void }) {
  useMapEvents({
    click(e) {
      onEvent({ kind: "click", lat: e.latlng.lat, lng: e.latlng.lng });
    },
    dblclick(e) {
      onEvent({ kind: "dblclick", lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mousemove(e) {
      onEvent({ kind: "mousemove", lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mousedown(e) {
      onEvent({ kind: "mousedown", lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseup(e) {
      onEvent({ kind: "mouseup", lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Activates/deactivates Geoman global edit mode based on `active`. */
function GeomanController({ active }: { active: boolean }) {
  const map = useMap() as PMMap;
  useEffect(() => {
    if (!map.pm) return;
    // Hide Geoman's built-in toolbar — we use our own buttons + programmatic API
    try {
      map.pm.addControls?.({
        position: "topleft",
        drawCircle: false,
        drawMarker: false,
        drawPolygon: false,
        drawPolyline: false,
        drawRectangle: false,
        drawCircleMarker: false,
        drawText: false,
        editMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false,
        rotateMode: false,
      });
    } catch {
      /* no-op */
    }
    map.pm.setGlobalOptions?.({
      allowSelfIntersection: false,
      snappable: false,
      preventMarkerRemoval: true,
    });
    return () => {
      try {
        map.pm?.disableGlobalEditMode?.();
        map.pm?.disableGlobalDragMode?.();
      } catch {
        /* no-op */
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map.pm) return;
    if (active) {
      try {
        map.pm.enableGlobalEditMode?.({ allowSelfIntersection: false });
        map.pm.enableGlobalDragMode?.();
      } catch {
        /* no-op */
      }
    } else {
      try {
        map.pm.disableGlobalEditMode?.();
        map.pm.disableGlobalDragMode?.();
      } catch {
        /* no-op */
      }
    }
  }, [map, active]);

  return null;
}

export default function MapView({
  mapId,
  imageUrl,
  imageWidth,
  imageHeight,
  placements: initialPlacements,
  canEdit,
  availableLocations,
  availableQuests = [],
  availableMaps = [],
}: Props) {
  const t = useTranslations("karten");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [placements, setPlacements] = useState<MapPlacement[]>(initialPlacements);
  const [editMode, setEditMode] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [drawTargetType, setDrawTargetType] = useState<TargetKind>("location");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedQuestId, setSelectedQuestId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);

  // Polygon draft
  const [polygonDraft, setPolygonDraft] = useState<[number, number][]>([]);
  // Circle/Rect draft (during drag)
  const [draftRect, setDraftRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [draftCircle, setDraftCircle] = useState<{ x: number; y: number; r: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Track layers per placement (for Geoman edit handlers)
  const layerRefs = useRef<Map<string, L.Layer>>(new Map());

  // ── Filters (Feature C) ───────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterArts, setFilterArts] = useState<Set<string> | null>(null); // null = all
  const [filterIcons, setFilterIcons] = useState<Set<string> | null>(null); // null = all
  const [filterVisibility, setFilterVisibility] = useState<Set<string> | null>(null); // null = all (only used for DM)
  const [filterTypes, setFilterTypes] = useState<Set<string> | null>(null); // null = all
  const [filterSearch, setFilterSearch] = useState("");

  const availableArts = useMemo(() => {
    const set = new Set<string>();
    for (const p of placements) {
      if (p.location?.art) set.add(p.location.art);
    }
    return Array.from(set).sort();
  }, [placements]);

  // "none" represents placements without an icon
  const availableIconKeys = useMemo(() => {
    const set = new Set<string>();
    let hasNone = false;
    for (const p of placements) {
      if (p.icon && PIN_ICONS[p.icon]) set.add(p.icon);
      else hasNone = true;
    }
    const keys = Array.from(set).sort();
    if (hasNone) keys.push("__none__");
    return keys;
  }, [placements]);

  const filteredPlacements = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return placements.filter((p) => {
      const target = targetOf(p);
      if (!target) return false;
      if (filterTypes && !filterTypes.has(target.kind)) return false;
      // Art filter only applies to Location placements; quests pass through.
      if (filterArts && target.kind === "location") {
        if (!filterArts.has(p.location?.art ?? "")) return false;
      }
      if (filterIcons) {
        const key = p.icon && PIN_ICONS[p.icon] ? p.icon : "__none__";
        if (!filterIcons.has(key)) return false;
      }
      if (filterVisibility && canEdit) {
        const v = target.sichtbarkeit === "public" ? "public" : "privat";
        if (!filterVisibility.has(v)) return false;
      }
      if (q && !target.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [placements, filterTypes, filterArts, filterIcons, filterVisibility, filterSearch, canEdit]);

  const bounds = useMemo<L.LatLngBoundsExpression>(
    () => [
      [0, 0],
      [imageHeight, imageWidth],
    ],
    [imageWidth, imageHeight],
  );
  const minSide = Math.min(imageWidth, imageHeight);

  // Normalize/denormalize helpers
  const llToNorm = useCallback(
    (lat: number, lng: number) => ({
      x: lng / imageWidth,
      y: 1 - lat / imageHeight,
    }),
    [imageWidth, imageHeight],
  );
  const normToLL = useCallback(
    (x: number, y: number): [number, number] => [imageHeight * (1 - y), imageWidth * x],
    [imageWidth, imageHeight],
  );

  // Reset draw mode when leaving edit mode
  useEffect(() => {
    if (!editMode) {
      setDrawMode(null);
      setPolygonDraft([]);
      setDraftRect(null);
      setDraftCircle(null);
      setEditingPlacementId(null);
    }
  }, [editMode]);

  // Reset drafts when changing draw mode
  useEffect(() => {
    setPolygonDraft([]);
    setDraftRect(null);
    setDraftCircle(null);
    dragStartRef.current = null;
  }, [drawMode]);

  // Focus from URL: ?placement=ID
  const focusedPlacementId = searchParams.get("placement") ?? searchParams.get("focus");
  const focusTarget = useMemo(() => {
    if (!focusedPlacementId) return null;
    const p = placements.find((pl) => pl.id === focusedPlacementId);
    if (!p) return null;
    const shape = p.shape ?? ({ type: "point", x: p.x, y: p.y } as MapShape);
    const c = shapeCenter(shape);
    const [lat, lng] = normToLL(c.x, c.y);
    return { lat, lng };
  }, [focusedPlacementId, placements, normToLL]);

  async function postPlacement(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/maps/${mapId}/placements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fehler beim Speichern.");
        return null;
      }
      setPlacements((prev) => [...prev, data as MapPlacement]);
      return data as MapPlacement;
    } catch {
      setError("Netzwerkfehler.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const putPlacement = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch(`/api/maps/${mapId}/placements/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Fehler beim Speichern.");
          return null;
        }
        setPlacements((prev) => prev.map((p) => (p.id === id ? (data as MapPlacement) : p)));
        return data as MapPlacement;
      } catch {
        setError("Netzwerkfehler.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [mapId],
  );

  async function handleRemove(placementId: string) {
    if (!canEdit || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/maps/${mapId}/placements/${placementId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Fehler beim Entfernen.");
      } else {
        setPlacements((prev) => prev.filter((p) => p.id !== placementId));
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setBusy(false);
    }
  }

  /** Builds the target payload chunk based on the current draw target type. */
  function drawTargetPayload(): Record<string, string> | null {
    if (drawTargetType === "quest") {
      if (!selectedQuestId) {
        setError(t("selectQuestFirst"));
        return null;
      }
      return { questId: selectedQuestId };
    }
    if (!selectedLocationId) {
      setError(t("selectLocationFirst"));
      return null;
    }
    return { locationId: selectedLocationId };
  }

  function handleMapEvent(ev: DrawEvent) {
    if (!canEdit || !editMode) return;

    const { x, y } = "lat" in ev ? llToNorm(ev.lat, ev.lng) : { x: 0, y: 0 };

    if (drawMode === "point" && ev.kind === "click") {
      const target = drawTargetPayload();
      if (!target) return;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      void postPlacement({ ...target, shape: { type: "point", x, y } });
      setDrawMode(null);
      return;
    }

    if (drawMode === "polygon") {
      if (ev.kind === "click") {
        setPolygonDraft((prev) => [...prev, [x, y]]);
      } else if (ev.kind === "dblclick") {
        const target = drawTargetPayload();
        if (!target) {
          setPolygonDraft([]);
          return;
        }
        if (polygonDraft.length < 3) {
          setError(t("polygonNeedsThree"));
          setPolygonDraft([]);
          return;
        }
        void postPlacement({
          ...target,
          shape: { type: "polygon", points: polygonDraft },
        });
        setPolygonDraft([]);
        setDrawMode(null);
      }
      return;
    }

    if (drawMode === "circle") {
      if (ev.kind === "mousedown") {
        dragStartRef.current = { x, y };
        setDraftCircle({ x, y, r: 0 });
      } else if (ev.kind === "mousemove" && dragStartRef.current) {
        const s = dragStartRef.current;
        const dx = (x - s.x) * imageWidth;
        const dy = (y - s.y) * imageHeight;
        const rPx = Math.sqrt(dx * dx + dy * dy);
        setDraftCircle({ x: s.x, y: s.y, r: rPx / minSide });
      } else if (ev.kind === "mouseup" && dragStartRef.current && draftCircle) {
        const target = drawTargetPayload();
        if (target && draftCircle.r > 0.005) {
          void postPlacement({
            ...target,
            shape: { type: "circle", x: draftCircle.x, y: draftCircle.y, r: draftCircle.r },
          });
          setDrawMode(null);
        }
        setDraftCircle(null);
        dragStartRef.current = null;
      }
      return;
    }

    if (drawMode === "rect") {
      if (ev.kind === "mousedown") {
        dragStartRef.current = { x, y };
        setDraftRect({ x, y, w: 0, h: 0 });
      } else if (ev.kind === "mousemove" && dragStartRef.current) {
        const s = dragStartRef.current;
        const x0 = Math.min(s.x, x);
        const y0 = Math.min(s.y, y);
        const w = Math.abs(x - s.x);
        const h = Math.abs(y - s.y);
        setDraftRect({ x: x0, y: y0, w, h });
      } else if (ev.kind === "mouseup" && draftRect) {
        const target = drawTargetPayload();
        if (target && draftRect.w > 0.005 && draftRect.h > 0.005) {
          void postPlacement({
            ...target,
            shape: { type: "rect", x: draftRect.x, y: draftRect.y, w: draftRect.w, h: draftRect.h },
          });
          setDrawMode(null);
        }
        setDraftRect(null);
        dragStartRef.current = null;
      }
      return;
    }
  }

  // ── Geoman edit handlers ──────────────────────────────────────────────────

  /** Convert a Leaflet layer (post-Geoman-edit) back to our normalized MapShape. */
  const layerToShape = useCallback(
    (layer: L.Layer, originalType: MapShape["type"]): MapShape | null => {
      if (originalType === "point" && layer instanceof L.Marker) {
        const { lat, lng } = layer.getLatLng();
        const { x, y } = llToNorm(lat, lng);
        return { type: "point", x: clamp01(x), y: clamp01(y) };
      }
      if (originalType === "polygon" && layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
        const rings = layer.getLatLngs() as L.LatLng[] | L.LatLng[][];
        // Support nested / single ring
        const ring = (Array.isArray(rings[0]) ? (rings[0] as L.LatLng[]) : (rings as L.LatLng[])) ?? [];
        if (ring.length < 3) return null;
        const points: number[][] = ring.map((ll) => {
          const { x, y } = llToNorm(ll.lat, ll.lng);
          return [clamp01(x), clamp01(y)];
        });
        return { type: "polygon", points };
      }
      if (originalType === "circle" && layer instanceof L.Circle) {
        const c = layer.getLatLng();
        const rMeters = layer.getRadius();
        const { x, y } = llToNorm(c.lat, c.lng);
        const r = rMeters / minSide;
        return { type: "circle", x: clamp01(x), y: clamp01(y), r: Math.max(0.001, Math.min(r, 2)) };
      }
      if (originalType === "rect" && layer instanceof L.Rectangle) {
        const b = layer.getBounds();
        const sw = b.getSouthWest();
        const ne = b.getNorthEast();
        const { x: x0, y: y0 } = llToNorm(sw.lat, ne.lng); // sw lat + ne lng? We want lower-left in our coords:
        // Our normalized rect uses (x, y) = top-left in image coords (y flipped).
        // In leaflet image overlay: north-east has lat=imageHeight, lng=imageWidth.
        // top-left of rect in image-coords = (min lng, max lat) → use NW corner.
        const nw = L.latLng(ne.lat, sw.lng);
        const seCorner = L.latLng(sw.lat, ne.lng);
        const tl = llToNorm(nw.lat, nw.lng);
        const br = llToNorm(seCorner.lat, seCorner.lng);
        const xN = clamp01(Math.min(tl.x, br.x));
        const yN = clamp01(Math.min(tl.y, br.y));
        const wN = Math.max(0.001, Math.min(1 - xN, Math.abs(br.x - tl.x)));
        const hN = Math.max(0.001, Math.min(1 - yN, Math.abs(br.y - tl.y)));
        return { type: "rect", x: xN, y: yN, w: wN, h: hN };
        // (x0/y0 kept above to satisfy potential unused-var if any — but we use only computed)
        void x0; void y0;
      }
      return null;
    },
    [llToNorm, minSide],
  );

  // Attach Geoman event listeners when a layer ref is set (only in geo-edit mode).
  const attachGeomanHandlers = useCallback(
    (placement: MapPlacement, layer: L.Layer | null) => {
      if (!layer) {
        layerRefs.current.delete(placement.id);
        return;
      }
      layerRefs.current.set(placement.id, layer);

      const shapeType = (placement.shape?.type ?? "point") as MapShape["type"];
      // Remove existing handlers, re-attach.
      layer.off("pm:edit");
      layer.off("pm:dragend");
      layer.off("pm:markerdragend");

      const handler = () => {
        const shape = layerToShape(layer, shapeType);
        if (!shape) return;
        void putPlacement(placement.id, { shape });
      };
      layer.on("pm:edit", handler);
      layer.on("pm:dragend", handler);
      layer.on("pm:markerdragend", handler);
    },
    [layerToShape, putPlacement],
  );

  // ── Rendering helpers ────────────────────────────────────────────────────

  function placementClick(p: MapPlacement) {
    if (editMode && drawMode === "delete") {
      if (confirm(t("confirmDelete"))) void handleRemove(p.id);
      return;
    }
    if (editMode && drawMode === "edit") {
      setEditingPlacementId(p.id);
      return;
    }
    if (editMode && drawMode === "geo") {
      // ignore clicks in geometry-edit mode (Geoman handles interactions)
      return;
    }
    if (p.linkedMapId) {
      router.push(`/karten/${p.linkedMapId}`);
    }
  }

  function renderPlacement(p: MapPlacement) {
    const target = targetOf(p);
    if (!target) return null;
    const shape = p.shape ?? ({ type: "point", x: p.x, y: p.y } as MapShape);
    const privateLook = target.sichtbarkeit !== "public";
    const color = p.color || (privateLook ? "#C84040" : target.defaultColor);
    const fillOpts = { color, weight: 2, fillColor: color, fillOpacity: 0.25 };
    const isFocused = focusedPlacementId === p.id;
    const focusedStyle = isFocused ? { ...fillOpts, weight: 3, fillOpacity: 0.4 } : fillOpts;
    const handleClick = () => placementClick(p);
    const refCb = (layer: L.Layer | null) => attachGeomanHandlers(p, layer);
    const popupBlocked = editMode && (drawMode === "edit" || drawMode === "delete" || drawMode === "geo");

    if (shape.type === "point") {
      const [lat, lng] = normToLL(shape.x, shape.y);
      // For quest pins without an explicit icon set, fall back to the scroll glyph.
      const effectiveIcon = p.icon ?? (target.kind === "quest" ? null : null);
      return (
        <Marker
          key={p.id}
          position={[lat, lng]}
          icon={pinIcon({
            color,
            icon: effectiveIcon,
            privateLook,
            fallbackGlyph: target.kind === "quest" ? "📜" : undefined,
          })}
          eventHandlers={{ click: handleClick }}
          ref={refCb}
        >
          {!p.linkedMapId && !popupBlocked && (
            <Popup>{renderPopupBody(p)}</Popup>
          )}
        </Marker>
      );
    }
    if (shape.type === "polygon") {
      const positions = shape.points.map(([x, y]) => normToLL(x, y));
      return (
        <Polygon
          key={p.id}
          positions={positions}
          pathOptions={focusedStyle}
          eventHandlers={{ click: handleClick }}
          ref={refCb}
        >
          {!p.linkedMapId && !popupBlocked && (
            <Popup>{renderPopupBody(p)}</Popup>
          )}
        </Polygon>
      );
    }
    if (shape.type === "circle") {
      const [lat, lng] = normToLL(shape.x, shape.y);
      const rPx = shape.r * minSide;
      return (
        <Circle
          key={p.id}
          center={[lat, lng]}
          radius={rPx}
          pathOptions={focusedStyle}
          eventHandlers={{ click: handleClick }}
          ref={refCb}
        >
          {!p.linkedMapId && !popupBlocked && (
            <Popup>{renderPopupBody(p)}</Popup>
          )}
        </Circle>
      );
    }
    if (shape.type === "rect") {
      const sw = normToLL(shape.x, shape.y + shape.h);
      const ne = normToLL(shape.x + shape.w, shape.y);
      return (
        <Rectangle
          key={p.id}
          bounds={[sw, ne]}
          pathOptions={focusedStyle}
          eventHandlers={{ click: handleClick }}
          ref={refCb}
        >
          {!p.linkedMapId && !popupBlocked && (
            <Popup>{renderPopupBody(p)}</Popup>
          )}
        </Rectangle>
      );
    }
    return null;
  }

  function renderPopupBody(p: MapPlacement) {
    const target = targetOf(p);
    if (!target) return null;
    return (
      <div style={{ minWidth: 160 }}>
        <div
          className="font-cinzel"
          style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1A1100", marginBottom: 4 }}
        >
          {target.name}
        </div>
        {target.sub && (
          <div style={{ fontSize: "0.75rem", color: "#444", marginBottom: 6 }}>{target.sub}</div>
        )}
        <Link
          href={target.detailHref}
          className="font-cinzel"
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--dnd-red)",
            textDecoration: "none",
          }}
        >
          {t("viewDetails")}
        </Link>
      </div>
    );
  }

  const editing = editingPlacementId
    ? placements.find((p) => p.id === editingPlacementId) ?? null
    : null;

  const cursor =
    drawMode === "point" || drawMode === "polygon"
      ? "crosshair"
      : drawMode === "circle" || drawMode === "rect"
        ? "crosshair"
        : drawMode === "delete"
          ? "not-allowed"
          : undefined;

  // helper toggles for filter set state
  function toggleInSet(
    current: Set<string> | null,
    all: string[],
    value: string,
  ): Set<string> | null {
    const base = current ?? new Set(all);
    const next = new Set(base);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    // If all selected → represent as null (default)
    if (next.size === all.length) return null;
    return next;
  }

  function isChecked(current: Set<string> | null, value: string): boolean {
    if (current === null) return true;
    return current.has(value);
  }

  function visibleVisibilities(): string[] {
    return ["public", "privat"];
  }

  const totalPlacements = placements.length;
  const visibleCount = filteredPlacements.length;

  return (
    <div>
      {canEdit && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className="ddb-cta"
            style={
              editMode
                ? { background: "var(--dnd-gold)", borderColor: "var(--dnd-gold)", color: "#1A1100" }
                : undefined
            }
          >
            {editMode ? t("viewMode") : t("editMode")}
          </button>

          {editMode && (
            <>
              {/* Target-Type Toggle: Location vs Quest */}
              <div className="flex" style={{ border: "1px solid var(--dnd-border)" }}>
                <button
                  type="button"
                  onClick={() => setDrawTargetType("location")}
                  className="font-cinzel text-xs px-3 py-2"
                  style={{
                    background: drawTargetType === "location" ? "var(--dnd-gold)" : "var(--dnd-bg-card)",
                    color: drawTargetType === "location" ? "#1A1100" : "var(--dnd-text)",
                    cursor: "pointer",
                    borderRight: "1px solid var(--dnd-border)",
                  }}
                  title={t("targetTypeLocation")}
                >
                  {t("targetTypeLocation")}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawTargetType("quest")}
                  className="font-cinzel text-xs px-3 py-2"
                  style={{
                    background: drawTargetType === "quest" ? "var(--dnd-gold)" : "var(--dnd-bg-card)",
                    color: drawTargetType === "quest" ? "#1A1100" : "var(--dnd-text)",
                    cursor: "pointer",
                  }}
                  title={t("targetTypeQuest")}
                >
                  {t("targetTypeQuest")}
                </button>
              </div>
              {drawTargetType === "location" ? (
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="font-cinzel text-sm px-3 py-2 outline-none tracking-wide"
                  style={{
                    background: "var(--dnd-bg-card)",
                    border: "1px solid var(--dnd-border)",
                    color: "var(--dnd-text)",
                  }}
                >
                  <option value="">{t("selectLocation")}</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedQuestId}
                  onChange={(e) => setSelectedQuestId(e.target.value)}
                  className="font-cinzel text-sm px-3 py-2 outline-none tracking-wide"
                  style={{
                    background: "var(--dnd-bg-card)",
                    border: "1px solid var(--dnd-border)",
                    color: "var(--dnd-text)",
                  }}
                >
                  <option value="">{t("selectQuest")}</option>
                  {availableQuests.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
              )}
              <ToolbarButton
                active={drawMode === "point"}
                onClick={() => setDrawMode(drawMode === "point" ? null : "point")}
                title={t("drawPoint")}
              >
                📍
              </ToolbarButton>
              <ToolbarButton
                active={drawMode === "polygon"}
                onClick={() => setDrawMode(drawMode === "polygon" ? null : "polygon")}
                title={t("drawPolygon")}
              >
                ⬢
              </ToolbarButton>
              <ToolbarButton
                active={drawMode === "circle"}
                onClick={() => setDrawMode(drawMode === "circle" ? null : "circle")}
                title={t("drawCircle")}
              >
                ⭕
              </ToolbarButton>
              <ToolbarButton
                active={drawMode === "rect"}
                onClick={() => setDrawMode(drawMode === "rect" ? null : "rect")}
                title={t("drawRect")}
              >
                ▭
              </ToolbarButton>
              <ToolbarButton
                active={drawMode === "edit"}
                onClick={() => setDrawMode(drawMode === "edit" ? null : "edit")}
                title={t("editShape")}
              >
                ✏️
              </ToolbarButton>
              <ToolbarButton
                active={drawMode === "geo"}
                onClick={() => setDrawMode(drawMode === "geo" ? null : "geo")}
                title={t("editGeometry")}
              >
                🔧
              </ToolbarButton>
              <ToolbarButton
                active={drawMode === "delete"}
                onClick={() => setDrawMode(drawMode === "delete" ? null : "delete")}
                title={t("deleteShape")}
              >
                🗑️
              </ToolbarButton>
              {drawMode === "geo" && (
                <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                  {t("editGeometryHint")}
                </span>
              )}
              {drawMode && drawMode !== "geo" && (
                <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                  {t("drawHint")}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Filter Bar (Feature C) */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="font-cinzel text-sm px-3 py-2"
          style={{
            background: filterOpen ? "var(--dnd-gold)" : "var(--dnd-bg-card)",
            border: "1px solid " + (filterOpen ? "var(--dnd-gold)" : "var(--dnd-border)"),
            color: filterOpen ? "#1A1100" : "var(--dnd-text)",
            cursor: "pointer",
          }}
        >
          {t("filterToggle")}
        </button>
        <input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder={t("filterSearch")}
          className="font-cinzel text-sm px-3 py-2 outline-none tracking-wide"
          style={{
            background: "var(--dnd-bg-card)",
            border: "1px solid var(--dnd-border)",
            color: "var(--dnd-text)",
            minWidth: 180,
          }}
        />
        <span
          className="font-cinzel text-xs"
          style={{ color: "var(--dnd-text-muted)" }}
        >
          {t("filterShowing", { visible: visibleCount, total: totalPlacements })}
        </span>
      </div>

      {filterOpen && (
        <div
          className="mb-3 p-3"
          style={{
            background: "var(--dnd-bg-card)",
            border: "1px solid var(--dnd-border)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* By Type (location/quest) */}
            <FilterSection
              title={t("filterByType")}
              all={["location", "quest"]}
              current={filterTypes}
              onChange={setFilterTypes}
              onAll={() => setFilterTypes(null)}
              onNone={() => setFilterTypes(new Set())}
              renderLabel={(v) => (v === "quest" ? t("targetTypeQuest") : t("targetTypeLocation"))}
              allLabel={t("filterShowAll")}
              noneLabel={t("filterHideAll")}
              isChecked={isChecked}
              toggle={(val) => setFilterTypes(toggleInSet(filterTypes, ["location", "quest"], val))}
            />
            {/* By Art */}
            <FilterSection
              title={t("filterByArt")}
              all={availableArts}
              current={filterArts}
              onChange={setFilterArts}
              onAll={() => setFilterArts(null)}
              onNone={() => setFilterArts(new Set())}
              renderLabel={(v) => v}
              allLabel={t("filterShowAll")}
              noneLabel={t("filterHideAll")}
              isChecked={isChecked}
              toggle={(val) => setFilterArts(toggleInSet(filterArts, availableArts, val))}
            />
            {/* By Icon */}
            <FilterSection
              title={t("filterByIcon")}
              all={availableIconKeys}
              current={filterIcons}
              onChange={setFilterIcons}
              onAll={() => setFilterIcons(null)}
              onNone={() => setFilterIcons(new Set())}
              renderLabel={(v) =>
                v === "__none__"
                  ? t("iconNone")
                  : `${PIN_ICONS[v] ?? ""} ${t(`icon.${v}` as never)}`
              }
              allLabel={t("filterShowAll")}
              noneLabel={t("filterHideAll")}
              isChecked={isChecked}
              toggle={(val) => setFilterIcons(toggleInSet(filterIcons, availableIconKeys, val))}
            />
            {/* By Visibility — DM only */}
            {canEdit && (
              <FilterSection
                title={t("filterByVisibility")}
                all={visibleVisibilities()}
                current={filterVisibility}
                onChange={setFilterVisibility}
                onAll={() => setFilterVisibility(null)}
                onNone={() => setFilterVisibility(new Set())}
                renderLabel={(v) => (v === "public" ? t("visibilityPublic") : t("visibilityPrivate"))}
                allLabel={t("filterShowAll")}
                noneLabel={t("filterHideAll")}
                isChecked={isChecked}
                toggle={(val) =>
                  setFilterVisibility(toggleInSet(filterVisibility, visibleVisibilities(), val))
                }
              />
            )}
          </div>
        </div>
      )}

      {error && (
        <p
          className="font-cinzel text-xs mb-2 px-3 py-2"
          style={{ background: "#200D0D", border: "1px solid #7F1D1D", color: "#F87171" }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          width: "100%",
          height: "70vh",
          minHeight: 480,
          background: "#0A0A0A",
          border: "1px solid var(--dnd-border)",
          cursor,
        }}
      >
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          minZoom={-4}
          maxZoom={4}
          style={{ width: "100%", height: "100%", background: "#0A0A0A" }}
          attributionControl={false}
          doubleClickZoom={drawMode !== "polygon"}
          dragging={drawMode !== "circle" && drawMode !== "rect"}
        >
          <FitBounds bounds={bounds} />
          <FocusOnPlacement focus={focusTarget} />
          <ImageOverlay url={imageUrl} bounds={bounds} />
          {canEdit && editMode && drawMode !== "geo" && <MapEventHandler onEvent={handleMapEvent} />}
          {canEdit && <GeomanController active={editMode && drawMode === "geo"} />}

          {filteredPlacements.map(renderPlacement)}

          {/* Drafts */}
          {polygonDraft.length > 0 && (
            <Polygon
              positions={polygonDraft.map(([x, y]) => normToLL(x, y))}
              pathOptions={{ color: "#C9A84C", weight: 2, dashArray: "4 4", fillOpacity: 0.15 }}
            />
          )}
          {draftCircle && (
            <Circle
              center={normToLL(draftCircle.x, draftCircle.y)}
              radius={draftCircle.r * minSide}
              pathOptions={{ color: "#C9A84C", weight: 2, dashArray: "4 4", fillOpacity: 0.15 }}
            />
          )}
          {draftRect && (
            <Rectangle
              bounds={[
                normToLL(draftRect.x, draftRect.y + draftRect.h),
                normToLL(draftRect.x + draftRect.w, draftRect.y),
              ]}
              pathOptions={{ color: "#C9A84C", weight: 2, dashArray: "4 4", fillOpacity: 0.15 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Edit popup */}
      {editing && (
        <PlacementEditDialog
          placement={editing}
          availableLocations={availableLocations}
          availableQuests={availableQuests}
          availableMaps={availableMaps.filter((m) => m.id !== mapId)}
          onClose={() => setEditingPlacementId(null)}
          onSave={async (payload) => {
            const updated = await putPlacement(editing.id, payload);
            if (updated) setEditingPlacementId(null);
          }}
          onDelete={async () => {
            await handleRemove(editing.id);
            setEditingPlacementId(null);
          }}
          busy={busy}
        />
      )}

    </div>
  );
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function FilterSection<T extends string>({
  title,
  all,
  current,
  onChange: _onChange,
  onAll,
  onNone,
  renderLabel,
  allLabel,
  noneLabel,
  isChecked,
  toggle,
}: {
  title: string;
  all: T[];
  current: Set<string> | null;
  onChange: (next: Set<string> | null) => void;
  onAll: () => void;
  onNone: () => void;
  renderLabel: (val: T) => string;
  allLabel: string;
  noneLabel: string;
  isChecked: (current: Set<string> | null, value: string) => boolean;
  toggle: (val: T) => void;
}) {
  void _onChange;
  if (all.length === 0) {
    return (
      <div>
        <p
          className="font-cinzel text-xs tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--dnd-label)" }}
        >
          {title}
        </p>
        <p className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
          —
        </p>
      </div>
    );
  }
  return (
    <div>
      <p
        className="font-cinzel text-xs tracking-[0.2em] uppercase mb-2"
        style={{ color: "var(--dnd-label)" }}
      >
        {title}
      </p>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={onAll}
          className="font-cinzel text-xs px-2 py-1"
          style={{
            background: "transparent",
            border: "1px solid var(--dnd-border)",
            color: "var(--dnd-text-muted)",
            cursor: "pointer",
          }}
        >
          {allLabel}
        </button>
        <button
          type="button"
          onClick={onNone}
          className="font-cinzel text-xs px-2 py-1"
          style={{
            background: "transparent",
            border: "1px solid var(--dnd-border)",
            color: "var(--dnd-text-muted)",
            cursor: "pointer",
          }}
        >
          {noneLabel}
        </button>
      </div>
      <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
        {all.map((val) => (
          <label
            key={val}
            className="font-cinzel text-xs flex items-center gap-2 cursor-pointer"
            style={{ color: "var(--dnd-text)" }}
          >
            <input
              type="checkbox"
              checked={isChecked(current, val)}
              onChange={() => toggle(val)}
            />
            <span>{renderLabel(val)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="font-cinzel text-sm px-3 py-2"
      style={{
        background: active ? "var(--dnd-gold)" : "var(--dnd-bg-card)",
        border: "1px solid " + (active ? "var(--dnd-gold)" : "var(--dnd-border)"),
        color: active ? "#1A1100" : "var(--dnd-text)",
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function PlacementEditDialog({
  placement,
  availableLocations,
  availableQuests,
  availableMaps,
  onClose,
  onSave,
  onDelete,
  busy,
}: {
  placement: MapPlacement;
  availableLocations: { id: string; name: string }[];
  availableQuests: { id: string; title: string; status: string }[];
  availableMaps: { id: string; name: string }[];
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: () => Promise<void>;
  busy: boolean;
}) {
  const t = useTranslations("karten");
  const [color, setColor] = useState(placement.color ?? "");
  const [icon, setIcon] = useState(placement.icon ?? "");
  const [linkedMapId, setLinkedMapId] = useState(placement.linkedMapId ?? "");
  const initialKind: TargetKind = placement.quest ? "quest" : "location";
  const [targetKind, setTargetKind] = useState<TargetKind>(initialKind);
  const [locationId, setLocationId] = useState(placement.location?.id ?? "");
  const [questId, setQuestId] = useState(placement.quest?.id ?? "");

  const shapeType = (placement.shape?.type ?? "point") as MapShape["type"];
  const canIcon = shapeType === "point";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--dnd-bg-card)",
          border: "1px solid var(--dnd-border)",
          padding: 20,
          minWidth: 320,
          maxWidth: 460,
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <h3 className="font-cinzel text-base mb-3" style={{ color: "var(--dnd-heading)" }}>
          {t("editShape")}
        </h3>

        <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-1" style={{ color: "var(--dnd-text-muted)" }}>
          {t("targetTypeLabel")}
        </label>
        <div className="flex mb-3" style={{ border: "1px solid var(--dnd-border)" }}>
          <button
            type="button"
            onClick={() => setTargetKind("location")}
            className="font-cinzel text-xs flex-1 px-3 py-2"
            style={{
              background: targetKind === "location" ? "var(--dnd-gold)" : "#0A0A0A",
              color: targetKind === "location" ? "#1A1100" : "var(--dnd-text)",
              cursor: "pointer",
              borderRight: "1px solid var(--dnd-border)",
            }}
          >
            {t("targetTypeLocation")}
          </button>
          <button
            type="button"
            onClick={() => setTargetKind("quest")}
            className="font-cinzel text-xs flex-1 px-3 py-2"
            style={{
              background: targetKind === "quest" ? "var(--dnd-gold)" : "#0A0A0A",
              color: targetKind === "quest" ? "#1A1100" : "var(--dnd-text)",
              cursor: "pointer",
            }}
          >
            {t("targetTypeQuest")}
          </button>
        </div>

        {targetKind === "location" ? (
          <>
            <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-1" style={{ color: "var(--dnd-text-muted)" }}>
              {t("selectLocation")}
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="font-cinzel text-sm w-full px-3 py-2 mb-3"
              style={{ background: "#0A0A0A", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
            >
              <option value="">—</option>
              {availableLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-1" style={{ color: "var(--dnd-text-muted)" }}>
              {t("selectQuest")}
            </label>
            <select
              value={questId}
              onChange={(e) => setQuestId(e.target.value)}
              className="font-cinzel text-sm w-full px-3 py-2 mb-3"
              style={{ background: "#0A0A0A", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
            >
              <option value="">—</option>
              {availableQuests.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-1" style={{ color: "var(--dnd-text-muted)" }}>
          {t("pinColor")}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {SHAPE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              title={c}
              style={{
                width: 26,
                height: 26,
                background: c,
                border: color === c ? "2px solid var(--dnd-gold)" : "1px solid var(--dnd-border)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#C9A84C"
          className="font-cinzel text-sm w-full px-3 py-2 mb-3"
          style={{ background: "#0A0A0A", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
        />

        {canIcon && (
          <>
            <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-1" style={{ color: "var(--dnd-text-muted)" }}>
              {t("pinIcon")}
            </label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIcon("")}
                style={{
                  padding: 6,
                  background: icon === "" ? "var(--dnd-gold)" : "#0A0A0A",
                  border: "1px solid var(--dnd-border)",
                  color: icon === "" ? "#1A1100" : "var(--dnd-text)",
                  cursor: "pointer",
                  fontSize: 11,
                  lineHeight: 1.2,
                }}
              >
                —
              </button>
              {PIN_ICON_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setIcon(k)}
                  title={t(`icon.${k}` as never)}
                  style={{
                    padding: 6,
                    background: icon === k ? "var(--dnd-gold)" : "#0A0A0A",
                    border: "1px solid var(--dnd-border)",
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  {PIN_ICONS[k]}
                </button>
              ))}
            </div>
          </>
        )}

        <label className="font-cinzel text-xs tracking-[0.15em] uppercase block mb-1" style={{ color: "var(--dnd-text-muted)" }}>
          {t("pinLink")}
        </label>
        <select
          value={linkedMapId}
          onChange={(e) => setLinkedMapId(e.target.value)}
          className="font-cinzel text-sm w-full px-3 py-2 mb-4"
          style={{ background: "#0A0A0A", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
        >
          <option value="">{t("pinLinkNone")}</option>
          {availableMaps.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={busy || (targetKind === "location" ? !locationId : !questId)}
            onClick={() =>
              onSave({
                ...(targetKind === "location"
                  ? { locationId, questId: null }
                  : { questId, locationId: null }),
                color: color || null,
                icon: canIcon ? icon || null : null,
                linkedMapId: linkedMapId || null,
              })
            }
            className="ddb-cta"
          >
            {t("save")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "var(--dnd-text-muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="font-cinzel text-xs tracking-widest uppercase ml-auto"
            style={{ color: "#F87171", background: "none", border: "none", cursor: "pointer" }}
          >
            {t("deleteShape")}
          </button>
        </div>
      </div>
    </div>
  );
}
