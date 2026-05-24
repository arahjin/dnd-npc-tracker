"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import L from "leaflet";
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
  location: { id: string; name: string; art: string | null; sichtbarkeit: string };
};

type AvailableLocation = { id: string; name: string };
type AvailableMap = { id: string; name: string };

type Props = {
  mapId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  placements: MapPlacement[];
  canEdit: boolean;
  availableLocations: AvailableLocation[];
  availableMaps?: AvailableMap[];
};

type DrawMode = null | "point" | "polygon" | "circle" | "rect" | "edit" | "delete";

const DEFAULT_COLOR = "#C9A84C";

function pinIcon(opts: { color: string; icon?: string | null; privateLook: boolean }) {
  const color = opts.color || (opts.privateLook ? "#C84040" : DEFAULT_COLOR);
  if (opts.icon && PIN_ICONS[opts.icon]) {
    const emoji = PIN_ICONS[opts.icon];
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

export default function MapView({
  mapId,
  imageUrl,
  imageWidth,
  imageHeight,
  placements: initialPlacements,
  canEdit,
  availableLocations,
  availableMaps = [],
}: Props) {
  const t = useTranslations("karten");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [placements, setPlacements] = useState<MapPlacement[]>(initialPlacements);
  const [editMode, setEditMode] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);

  // Polygon draft
  const [polygonDraft, setPolygonDraft] = useState<[number, number][]>([]);
  // Circle/Rect draft (during drag)
  const [draftRect, setDraftRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [draftCircle, setDraftCircle] = useState<{ x: number; y: number; r: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

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
  const focusedPlacementId = searchParams.get("placement");
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

  async function putPlacement(id: string, payload: Record<string, unknown>) {
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
  }

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

  function handleMapEvent(ev: DrawEvent) {
    if (!canEdit || !editMode) return;

    const { x, y } = "lat" in ev ? llToNorm(ev.lat, ev.lng) : { x: 0, y: 0 };

    if (drawMode === "point" && ev.kind === "click") {
      if (!selectedLocationId) {
        setError(t("selectLocationFirst"));
        return;
      }
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      void postPlacement({ locationId: selectedLocationId, shape: { type: "point", x, y } });
      setDrawMode(null);
      return;
    }

    if (drawMode === "polygon") {
      if (ev.kind === "click") {
        setPolygonDraft((prev) => [...prev, [x, y]]);
      } else if (ev.kind === "dblclick") {
        if (!selectedLocationId) {
          setError(t("selectLocationFirst"));
          setPolygonDraft([]);
          return;
        }
        if (polygonDraft.length < 3) {
          setError(t("polygonNeedsThree"));
          setPolygonDraft([]);
          return;
        }
        void postPlacement({
          locationId: selectedLocationId,
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
        if (!selectedLocationId) {
          setError(t("selectLocationFirst"));
        } else if (draftCircle.r > 0.005) {
          void postPlacement({
            locationId: selectedLocationId,
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
        if (!selectedLocationId) {
          setError(t("selectLocationFirst"));
        } else if (draftRect.w > 0.005 && draftRect.h > 0.005) {
          void postPlacement({
            locationId: selectedLocationId,
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
    if (p.linkedMapId) {
      router.push(`/karten/${p.linkedMapId}`);
    }
  }

  function renderPlacement(p: MapPlacement) {
    const shape = p.shape ?? ({ type: "point", x: p.x, y: p.y } as MapShape);
    const privateLook = p.location.sichtbarkeit !== "public";
    const color = p.color || (privateLook ? "#C84040" : DEFAULT_COLOR);
    const fillOpts = { color, weight: 2, fillColor: color, fillOpacity: 0.25 };
    const isFocused = focusedPlacementId === p.id;
    const focusedStyle = isFocused ? { ...fillOpts, weight: 3, fillOpacity: 0.4 } : fillOpts;
    const handleClick = () => placementClick(p);

    if (shape.type === "point") {
      const [lat, lng] = normToLL(shape.x, shape.y);
      return (
        <Marker
          key={p.id}
          position={[lat, lng]}
          icon={pinIcon({ color, icon: p.icon, privateLook })}
          eventHandlers={{ click: handleClick }}
        >
          {!p.linkedMapId && (!editMode || (drawMode !== "edit" && drawMode !== "delete")) && (
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
        >
          {!p.linkedMapId && (!editMode || (drawMode !== "edit" && drawMode !== "delete")) && (
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
        >
          {!p.linkedMapId && (!editMode || (drawMode !== "edit" && drawMode !== "delete")) && (
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
        >
          {!p.linkedMapId && (!editMode || (drawMode !== "edit" && drawMode !== "delete")) && (
            <Popup>{renderPopupBody(p)}</Popup>
          )}
        </Rectangle>
      );
    }
    return null;
  }

  function renderPopupBody(p: MapPlacement) {
    return (
      <div style={{ minWidth: 160 }}>
        <div
          className="font-cinzel"
          style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1A1100", marginBottom: 4 }}
        >
          {p.location.name}
        </div>
        {p.location.art && (
          <div style={{ fontSize: "0.75rem", color: "#444", marginBottom: 6 }}>{p.location.art}</div>
        )}
        <Link
          href={`/locations/${p.location.id}`}
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

  const cursor = drawMode === "point" || drawMode === "polygon"
    ? "crosshair"
    : drawMode === "circle" || drawMode === "rect"
      ? "crosshair"
      : drawMode === "delete"
        ? "not-allowed"
        : undefined;

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
              <ToolbarButton active={drawMode === "point"} onClick={() => setDrawMode(drawMode === "point" ? null : "point")} title={t("drawPoint")}>📍</ToolbarButton>
              <ToolbarButton active={drawMode === "polygon"} onClick={() => setDrawMode(drawMode === "polygon" ? null : "polygon")} title={t("drawPolygon")}>⬢</ToolbarButton>
              <ToolbarButton active={drawMode === "circle"} onClick={() => setDrawMode(drawMode === "circle" ? null : "circle")} title={t("drawCircle")}>⭕</ToolbarButton>
              <ToolbarButton active={drawMode === "rect"} onClick={() => setDrawMode(drawMode === "rect" ? null : "rect")} title={t("drawRect")}>▭</ToolbarButton>
              <ToolbarButton active={drawMode === "edit"} onClick={() => setDrawMode(drawMode === "edit" ? null : "edit")} title={t("editShape")}>✏️</ToolbarButton>
              <ToolbarButton active={drawMode === "delete"} onClick={() => setDrawMode(drawMode === "delete" ? null : "delete")} title={t("deleteShape")}>🗑️</ToolbarButton>
              {drawMode && (
                <span className="font-cinzel text-xs" style={{ color: "var(--dnd-text-muted)" }}>
                  {t("drawHint")}
                </span>
              )}
            </>
          )}
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
          {canEdit && editMode && <MapEventHandler onEvent={handleMapEvent} />}

          {placements.map(renderPlacement)}

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
  availableMaps,
  onClose,
  onSave,
  onDelete,
  busy,
}: {
  placement: MapPlacement;
  availableLocations: { id: string; name: string }[];
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
  const [locationId, setLocationId] = useState(placement.location.id);

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
          {t("selectLocation")}
        </label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="font-cinzel text-sm w-full px-3 py-2 mb-3"
          style={{ background: "#0A0A0A", border: "1px solid var(--dnd-border)", color: "var(--dnd-text)" }}
        >
          {availableLocations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

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
                  title={t(`icon.${k}`)}
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
            disabled={busy}
            onClick={() =>
              onSave({
                locationId,
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
