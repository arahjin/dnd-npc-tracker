/**
 * Shared SVG icon library — replaces all emoji pictographs app-wide.
 * All icons accept a `size` prop (default 16) and inherit `currentColor`
 * unless a specific color is passed. Stroke-based, no font dependency.
 */

type IconProps = { size?: number; color?: string; className?: string };

const base = (size: number, color?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: color ?? "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  display: "inline-block" as const,
  verticalAlign: "middle" as const,
  flexShrink: 0,
});

/** 👤  Person / NPC */
export function IconPerson({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2.5 14 C2.5 11 5 9.5 8 9.5 C11 9.5 13.5 11 13.5 14" />
    </svg>
  );
}

/** 🏛  Organisation / building */
export function IconOrganisation({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      {/* Base */}
      <line x1="1.5" y1="14" x2="14.5" y2="14" />
      {/* Columns */}
      <rect x="3" y="7" width="1.5" height="6" />
      <rect x="7.25" y="7" width="1.5" height="6" />
      <rect x="11.5" y="7" width="1.5" height="6" />
      {/* Entablature */}
      <line x1="2" y1="7" x2="14" y2="7" />
      {/* Pediment */}
      <path d="M2 7 L8 3 L14 7" />
    </svg>
  );
}

/** ⚔  Charakter / sword */
export function IconSword({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      {/* Blade */}
      <line x1="8" y1="1.5" x2="8" y2="11" strokeWidth={1.8} />
      {/* Guard */}
      <line x1="5" y1="7" x2="11" y2="7" />
      {/* Tip */}
      <path d="M6.8 1.5 L9.2 1.5 L8 0" fill="currentColor" opacity={0.5} stroke="none" />
      {/* Pommel */}
      <circle cx="8" cy="12.5" r="1.5" />
    </svg>
  );
}

/** 🎲  Spieler / dice */
export function IconDice({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <rect x="2" y="2" width="12" height="12" rx="2.5" />
      {/* Four dots */}
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 📍  Location / map pin */
export function IconPin({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M8 1.5 C5.2 1.5 3 3.7 3 6.5 C3 10.5 8 14.5 8 14.5 C8 14.5 13 10.5 13 6.5 C13 3.7 10.8 1.5 8 1.5 Z" />
      <circle cx="8" cy="6.5" r="2" />
    </svg>
  );
}

/** 🔍  Search / magnifying glass */
export function IconSearch({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="6.5" cy="6.5" r="4" />
      <line x1="9.5" y1="9.5" x2="13.5" y2="13.5" strokeWidth={2} />
    </svg>
  );
}

/** 📖  Journal / open book */
export function IconBook({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M8 3 L2 5 L2 13 L8 11 Z" />
      <path d="M8 3 L14 5 L14 13 L8 11 Z" />
      <line x1="8" y1="3" x2="8" y2="11" />
      <line x1="4" y1="7" x2="7" y2="6.3" opacity={0.6} />
      <line x1="4" y1="9" x2="7" y2="8.3" opacity={0.6} />
      <line x1="9" y1="6.3" x2="12" y2="7" opacity={0.6} />
    </svg>
  );
}

/** 🗺️  Map / empty state for grids */
export function IconMap({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <polygon points="5.5,2 5.5,13 10.5,11.5 10.5,0.5" opacity={0.7} />
      <line x1="1.5" y1="3.5" x2="5.5" y2="2" />
      <line x1="1.5" y1="14.5" x2="5.5" y2="13" />
      <line x1="10.5" y1="0.5" x2="14.5" y2="2" />
      <line x1="10.5" y1="11.5" x2="14.5" y2="13" />
      <line x1="1.5" y1="3.5" x2="1.5" y2="14.5" />
      <line x1="14.5" y1="2" x2="14.5" y2="13" />
    </svg>
  );
}

/** ★  Admin / crown */
export function IconAdmin({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <path d="M2 12 L3.5 6.5 L8 10 L12.5 3.5 L14 12 Z" fill="currentColor" fillOpacity={0.2} />
      <path d="M2 12 L3.5 6.5 L8 10 L12.5 3.5 L14 12" />
      <line x1="2" y1="14" x2="14" y2="14" />
      {/* Crown jewels */}
      <circle cx="8" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 🌐  Globe / Kontinent (Location art) */
export function IconGlobe({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <circle cx="8" cy="8" r="6" />
      <ellipse cx="8" cy="8" rx="3" ry="6" />
      <line x1="2.2" y1="5.5" x2="13.8" y2="5.5" />
      <line x1="2.2" y1="10.5" x2="13.8" y2="10.5" />
    </svg>
  );
}

/** 🔒  Lock / private notes */
export function IconLock({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      <rect x="3.5" y="7" width="9" height="7.5" rx="1.5" />
      <path d="M5.5 7 L5.5 5 C5.5 3.3 10.5 3.3 10.5 5 L10.5 7" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 🏰  Castle/Stadt */
export function IconCastle({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      {/* Base wall */}
      <rect x="2" y="8" width="12" height="7" />
      {/* Battlements */}
      <rect x="2" y="5" width="2.5" height="3" />
      <rect x="6.75" y="5" width="2.5" height="3" />
      <rect x="11.5" y="5" width="2.5" height="3" />
      {/* Gate arch */}
      <path d="M6 15 L6 11 Q8 9.5 10 11 L10 15" />
    </svg>
  );
}

/** 🏘️  Village/Dorf */
export function IconHouses({ size = 16, color, className }: IconProps) {
  return (
    <svg {...base(size, color)} className={className}>
      {/* House 1 */}
      <path d="M1 14 L1 8 L5 5 L9 8 L9 14" />
      <line x1="1" y1="14" x2="9" y2="14" />
      {/* House 2 (smaller, behind) */}
      <path d="M7 14 L7 9 L11 6.5 L15 9 L15 14" />
      <line x1="7" y1="14" x2="15" y2="14" />
      {/* Doors */}
      <rect x="3.5" y="11" width="3" height="3" />
      <rect x="10" y="11" width="2.5" height="3" />
    </svg>
  );
}

/** Location art icon — renders the right icon for a given art string */
export function LocationArtIcon({ art, size = 16, color }: { art?: string | null; size?: number; color?: string }) {
  const p = { size, color: color ?? "currentColor" };
  switch (art) {
    case "Kontinent":
    case "Land":      return <IconGlobe {...p} />;
    case "Region":    return <IconMap {...p} />;
    case "Stadt":
    case "Festung":   return <IconCastle {...p} />;
    case "Dorf":
    case "Siedlung":  return <IconHouses {...p} />;
    default:          return <IconPin {...p} />;
  }
}

/**
 * Lorehub icon mark — pointy-top hexagon with mountain range + diamond.
 * Use `size` for pixel width; height auto-scales (aspect ≈ 100:114).
 * Pass `style` for responsive sizing (e.g. style={{ width:"100%", height:"auto" }}).
 */
export function LogoIcon({
  size = 48,
  color,
  style,
  className,
}: {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const c = color ?? "currentColor";
  return (
    <svg
      viewBox="0 0 100 114"
      width={size}
      height={Math.round(size * 1.14)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
    >
      {/* Pointy-top hexagon outline */}
      <polygon
        points="50,5 95,31 95,83 50,109 5,83 5,31"
        stroke={c}
        strokeWidth="6"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Left mountain */}
      <polygon points="30,36 14,70 47,70" fill={c} />
      {/* Right mountain */}
      <polygon points="70,36 53,70 86,70" fill={c} />
      {/* Center mountain — tallest, drawn last to sit in front */}
      <polygon points="50,20 31,70 69,70" fill={c} />
      {/* Diamond / gem below mountains */}
      <polygon points="50,73 64,84 50,97 36,84" fill={c} />
    </svg>
  );
}

/**
 * Lorehub full logo — icon mark + "Lorehub" wordmark side by side.
 * Control size via `style` (e.g. style={{ height:"50px", width:"auto" }}).
 */
export function LogoFull({
  color,
  style,
  className,
}: {
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const c = color ?? "currentColor";
  return (
    <svg
      viewBox="0 0 344 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", ...style }}
      className={className}
    >
      {/* ── Icon mark ── */}
      <polygon
        points="50,5 95,31 95,83 50,109 5,83 5,31"
        stroke={c}
        strokeWidth="6"
        strokeLinejoin="round"
        fill="none"
      />
      <polygon points="30,36 14,70 47,70" fill={c} />
      <polygon points="70,36 53,70 86,70" fill={c} />
      <polygon points="50,20 31,70 69,70" fill={c} />
      <polygon points="50,73 64,84 50,97 36,84" fill={c} />

      {/* ── Wordmark ── */}
      <text
        x="114"
        y="78"
        fontFamily="'Cinzel', Georgia, serif"
        fontSize="55"
        fill={c}
        stroke="none"
        fontWeight="400"
        letterSpacing="1"
      >
        Lorehub
      </text>
    </svg>
  );
}
