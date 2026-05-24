"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type MapView from "./MapView";

const DynamicMapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "70vh",
        minHeight: 480,
        background: "#0A0A0A",
        border: "1px solid var(--dnd-border)",
      }}
    />
  ),
});

export default function MapViewLoader(props: ComponentProps<typeof MapView>) {
  return <DynamicMapView {...props} />;
}
