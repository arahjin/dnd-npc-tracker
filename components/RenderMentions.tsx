import Link from "next/link";
import { MENTION_REGEX, MENTION_HREF } from "@/lib/mentions";
import { IconPerson, IconOrganisation, IconSword, IconPin } from "@/components/Icons";

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

function MentionIcon({ typ }: { typ: string }) {
  const props = { size: 13, color: "var(--dnd-gold)", className: "mr-0.5 relative" };
  switch (typ) {
    case "PERSON":       return <IconPerson {...props} />;
    case "ORGANISATION": return <IconOrganisation {...props} />;
    case "CHARAKTER":    return <IconSword {...props} />;
    case "LOCATION":     return <IconPin {...props} />;
    default:             return null;
  }
}

export default function RenderMentions({ text, className, style }: Props) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(MENTION_REGEX.source, "g");

  for (const match of text.matchAll(regex)) {
    const [fullMatch, name, typ, id] = match;
    const index = match.index!;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <Link key={`${id}-${index}`}
        href={`${MENTION_HREF[typ] ?? "#"}/${id}`}
        className="font-semibold hover:underline transition-colors inline-flex items-center gap-0.5"
        style={{ color: "var(--dnd-gold)" }}>
        <MentionIcon typ={typ} />
        {name}
      </Link>
    );

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <span className={className} style={style}>
      {parts.map((part, i) =>
        typeof part === "string"
          ? part.split("\n").map((line, j, arr) => (
              <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))
          : part
      )}
    </span>
  );
}
