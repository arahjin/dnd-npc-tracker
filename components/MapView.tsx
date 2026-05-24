"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, ImageOverlay, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useTranslations } from "next-intl";

export type MapPlacement = {
  id: string;
  x: number;
  y: number;
  location: { id: string; name: string; art: string | null; sichtbarkeit: string };
};

type AvailableLocation = { id: string; name: string };

type Props = {
  mapId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  placements: MapPlacement[];
  canEdit: boolean;
  availableLocations: AvailableLocation[];
};

function pinIcon(privateLook: boolean) {
  const color = privateLook ? "#C84040" : "#C9A84C";
  const stroke = privateLook ? "#6B1111" : "#6B5511";
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

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
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
}: Props) {
  const t = useTranslations("karten");
  const [placements, setPlacements] = useState<MapPlacement[]>(initialPlacements);
  const [editMode, setEditMode] = useState(false);
  const [placeMode, setPlaceMode] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const bounds = useMemo<L.LatLngBoundsExpression>(
    () => [
      [0, 0],
      [imageHeight, imageWidth],
    ],
    [imageWidth, imageHeight],
  );

  // Reset placeMode when leaving edit mode
  useEffect(() => {
    if (!editMode) setPlaceMode(false);
  }, [editMode]);

  async function handleMapClick(lat: number, lng: number) {
    if (!canEdit || !editMode || !placeMode || !selectedLocationId || busy) return;
    // Convert Leaflet coords back to normalized 0..1 (Y is inverted)
    const x = lng / imageWidth;
    const y = 1 - lat / imageHeight;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/maps/${mapId}/placements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: selectedLocationId, x, y }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fehler beim Speichern.");
      } else {
        setPlacements((prev) => [...prev, data as MapPlacement]);
        setPlaceMode(false);
        setSelectedLocationId("");
      }
    } catch {
      setError("Netzwerkfehler.");
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

  return (
    <div ref={containerRef}>
      {canEdit && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
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
              <button
                type="button"
                disabled={!selectedLocationId || busy}
                onClick={() => setPlaceMode((v) => !v)}
                className="ddb-cta"
                style={
                  placeMode
                    ? { background: "var(--dnd-gold)", borderColor: "var(--dnd-gold)", color: "#1A1100" }
                    : !selectedLocationId
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : undefined
                }
              >
                {t("placePointMode")}
              </button>
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
          cursor: placeMode ? "crosshair" : undefined,
        }}
      >
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          minZoom={-4}
          maxZoom={4}
          style={{ width: "100%", height: "100%", background: "#0A0A0A" }}
          attributionControl={false}
        >
          <FitBounds bounds={bounds} />
          <ImageOverlay url={imageUrl} bounds={bounds} />
          <ClickHandler onClick={handleMapClick} />
          {placements.map((p) => {
            const lat = imageHeight * (1 - p.y);
            const lng = imageWidth * p.x;
            const privateLook = p.location.sichtbarkeit !== "public";
            return (
              <Marker key={p.id} position={[lat, lng]} icon={pinIcon(privateLook)}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <div
                      className="font-cinzel"
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#1A1100",
                        marginBottom: 4,
                      }}
                    >
                      {p.location.name}
                    </div>
                    {p.location.art && (
                      <div style={{ fontSize: "0.75rem", color: "#444", marginBottom: 6 }}>
                        {p.location.art}
                      </div>
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
                    {canEdit && editMode && (
                      <div style={{ marginTop: 8, borderTop: "1px solid #ddd", paddingTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleRemove(p.id)}
                          disabled={busy}
                          style={{
                            fontSize: "0.7rem",
                            color: "#7F1D1D",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          ✕ {t("removePlacement")}
                        </button>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
