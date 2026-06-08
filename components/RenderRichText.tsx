import React from "react";
import Link from "next/link";
import { MENTION_REGEX, MENTION_HREF } from "@/lib/mentions";
import { parseBBCode, type Node } from "@/lib/bbcode";
import { IconPerson, IconOrganisation, IconSword, IconPin } from "@/components/Icons";

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

// ── Mention rendering (re-used inside text nodes) ────────────────────────────

function MentionIcon({ typ }: { typ: string }) {
  const p = { size: 13, color: "var(--dnd-gold)", className: "mr-0.5 relative" };
  switch (typ) {
    case "PERSON":       return <IconPerson {...p} />;
    case "ORGANISATION": return <IconOrganisation {...p} />;
    case "CHARAKTER":    return <IconSword {...p} />;
    case "LOCATION":     return <IconPin {...p} />;
    default:             return null;
  }
}

/** Render a plain-text string while parsing @-mentions into links. */
function renderTextWithMentions(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(MENTION_REGEX.source, "g");

  for (const match of text.matchAll(regex)) {
    const [fullMatch, name, typ, id] = match;
    const index = match.index!;

    if (index > lastIndex) {
      parts.push(renderTextWithLineBreaks(text.slice(lastIndex, index), `${keyPrefix}-t${lastIndex}`));
    }

    parts.push(
      <Link key={`${keyPrefix}-m${id}-${index}`}
        href={`${MENTION_HREF[typ] ?? "#"}/${id}`}
        className="font-semibold hover:underline transition-colors inline-flex items-center gap-0.5"
        style={{ color: "var(--dnd-gold)" }}>
        <MentionIcon typ={typ} />
        {name}
      </Link>,
    );

    lastIndex = index + fullMatch.length;
  }
  if (lastIndex < text.length) {
    parts.push(renderTextWithLineBreaks(text.slice(lastIndex), `${keyPrefix}-t${lastIndex}`));
  }
  return parts;
}

/** Convert `\n` into <br/> elements inside a text fragment. */
function renderTextWithLineBreaks(text: string, keyPrefix: string): React.ReactNode {
  if (!text.includes("\n")) return text;
  const parts = text.split("\n");
  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

// ── AST → React ──────────────────────────────────────────────────────────────

function renderNodes(nodes: Node[], keyPrefix: string): React.ReactNode[] {
  return nodes.map((n, i) => renderNode(n, `${keyPrefix}-${i}`));
}

function renderNode(node: Node, key: string): React.ReactNode {
  switch (node.type) {
    case "text":
      return (
        <React.Fragment key={key}>
          {renderTextWithMentions(node.content, key)}
        </React.Fragment>
      );

    case "bold":
      return <strong key={key} className="font-semibold">{renderNodes(node.children, key)}</strong>;

    case "italic":
      return <em key={key}>{renderNodes(node.children, key)}</em>;

    case "underline":
      return <span key={key} style={{ textDecoration: "underline" }}>{renderNodes(node.children, key)}</span>;

    case "strike":
      return <span key={key} style={{ textDecoration: "line-through", opacity: 0.6 }}>{renderNodes(node.children, key)}</span>;

    case "color":
      return <span key={key} style={{ color: node.value }}>{renderNodes(node.children, key)}</span>;

    case "url":
      return (
        <a
          key={key}
          href={node.value}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--dnd-gold)", textDecoration: "underline" }}
        >
          {renderNodes(node.children, key)}
        </a>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-2 pl-3 italic my-2"
          style={{ borderColor: "var(--dnd-red)", color: "var(--dnd-text-muted)" }}
        >
          {renderNodes(node.children, key)}
        </blockquote>
      );

    case "code":
      return (
        <code
          key={key}
          className="font-mono px-1.5 py-0.5 text-sm"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
        >
          {renderNodes(node.children, key)}
        </code>
      );

    case "list":
      return (
        <ul key={key} className="list-disc list-inside my-2">
          {renderNodes(node.children, key)}
        </ul>
      );

    case "listItem":
      return <li key={key}>{renderNodes(node.children, key)}</li>;

    case "h": {
      const cls = "font-cinzel font-bold mt-3 mb-1";
      const style = { color: "var(--dnd-heading)" } as React.CSSProperties;
      if (node.level === 1) return <h3 key={key} className={`${cls} text-xl`} style={style}>{renderNodes(node.children, key)}</h3>;
      if (node.level === 2) return <h4 key={key} className={`${cls} text-lg`} style={style}>{renderNodes(node.children, key)}</h4>;
      return <h5 key={key} className={`${cls} text-base`} style={style}>{renderNodes(node.children, key)}</h5>;
    }

    case "hr":
      return <hr key={key} className="my-3" style={{ borderColor: "var(--dnd-border)" }} />;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RenderRichText({ text, className, style }: Props) {
  const ast = parseBBCode(text ?? "");
  return (
    <div className={className} style={{ whiteSpace: "pre-wrap", ...style }}>
      {renderNodes(ast, "n")}
    </div>
  );
}
