// BB-Code parser → AST.
// Unknown / unbalanced tags are emitted as literal text.
// No HTML is produced here — the renderer (components/RenderRichText.tsx) maps
// the AST to React elements.

export type Node =
  | { type: "text"; content: string }
  | { type: "bold"; children: Node[] }
  | { type: "italic"; children: Node[] }
  | { type: "underline"; children: Node[] }
  | { type: "strike"; children: Node[] }
  | { type: "color"; value: string; children: Node[] }
  | { type: "url"; value: string; children: Node[] }
  | { type: "quote"; children: Node[] }
  | { type: "code"; children: Node[] }
  | { type: "list"; children: Node[] }
  | { type: "listItem"; children: Node[] }
  | { type: "h"; level: 1 | 2 | 3; children: Node[] }
  | { type: "hr" };

// ── Limits (DoS protection) ──────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 50_000;
const MAX_DEPTH = 6;

// ── Color whitelist ──────────────────────────────────────────────────────────

export const COLOR_NAMES: Record<string, string> = {
  red:    "#DC2626",
  gold:   "#C9A84C",
  blue:   "#3B82F6",
  green:  "#22C55E",
  purple: "#A855F7",
  orange: "#F97316",
};

/** Returns a CSS-safe color value, or null if invalid. */
export function validateColor(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (COLOR_NAMES[s]) return COLOR_NAMES[s];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(s)) return s;
  return null;
}

/** Returns the URL string if it is http/https, else null. */
export function validateUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return null;
  } catch {
    return null;
  }
}

// ── Tokenizer ────────────────────────────────────────────────────────────────

type Token =
  | { kind: "text"; value: string }
  | { kind: "open"; name: string; value?: string; raw: string }
  | { kind: "close"; name: string; raw: string }
  | { kind: "selfClose"; name: string; raw: string };

const KNOWN_TAGS = new Set([
  "b", "i", "u", "s",
  "color", "url",
  "quote", "code",
  "list", "*",
  "h1", "h2", "h3", "hr",
]);

const VALUE_TAGS = new Set(["color", "url"]);
const SELF_CLOSING = new Set(["hr"]);

const TAG_RE = /\[(\/?)([a-zA-Z][a-zA-Z0-9]*|\*)(?:=([^\]]*))?\]/g;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;

  // Reset regex (we use exec in a loop)
  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(input)) !== null) {
    const idx = m.index;
    if (idx > last) tokens.push({ kind: "text", value: input.slice(last, idx) });

    const [raw, slash, nameRaw, valueRaw] = m;
    const name = nameRaw.toLowerCase();

    if (!KNOWN_TAGS.has(name)) {
      tokens.push({ kind: "text", value: raw });
    } else if (slash) {
      tokens.push({ kind: "close", name, raw });
    } else if (SELF_CLOSING.has(name)) {
      tokens.push({ kind: "selfClose", name, raw });
    } else if (VALUE_TAGS.has(name)) {
      tokens.push({ kind: "open", name, value: valueRaw ?? "", raw });
    } else {
      // Reject `[b=foo]` (value supplied for tag that doesn't take one)
      if (valueRaw !== undefined) tokens.push({ kind: "text", value: raw });
      else tokens.push({ kind: "open", name, raw });
    }

    last = idx + raw.length;
  }
  if (last < input.length) tokens.push({ kind: "text", value: input.slice(last) });

  return tokens;
}

// ── Parser ───────────────────────────────────────────────────────────────────

type Frame = {
  token: Extract<Token, { kind: "open" }>;
  children: Node[];
};

const TAG_TO_TYPE: Record<string, Node["type"]> = {
  b: "bold",
  i: "italic",
  u: "underline",
  s: "strike",
  color: "color",
  url: "url",
  quote: "quote",
  code: "code",
  list: "list",
  h1: "h",
  h2: "h",
  h3: "h",
};

function pushText(target: Node[], text: string) {
  if (!text) return;
  const last = target[target.length - 1];
  if (last && last.type === "text") last.content += text;
  else target.push({ type: "text", content: text });
}

/** Wraps an open token as if its content were plain text (used for failures). */
function rawOpen(token: Extract<Token, { kind: "open" }>): string {
  return token.raw;
}

export function parseBBCode(input: string): Node[] {
  // Truncate (don't throw) for safety
  const text = input.length > MAX_TEXT_LENGTH
    ? input.slice(0, MAX_TEXT_LENGTH)
    : input;

  const tokens = tokenize(text);
  const root: Node[] = [];
  const stack: Frame[] = [];

  function currentChildren(): Node[] {
    return stack.length ? stack[stack.length - 1].children : root;
  }

  for (const tok of tokens) {
    if (tok.kind === "text") {
      pushText(currentChildren(), tok.value);
      continue;
    }

    if (tok.kind === "selfClose") {
      if (tok.name === "hr") currentChildren().push({ type: "hr" });
      continue;
    }

    if (tok.kind === "open") {
      // `[*]` is treated as a listItem boundary inside a `[list]`
      if (tok.name === "*") {
        // Find nearest list (or list-item) frame
        const inList = stack.some((f) => f.token.name === "list");
        if (!inList) {
          pushText(currentChildren(), tok.raw);
          continue;
        }
        // Close any open list-item first
        while (stack.length && stack[stack.length - 1].token.name === "*") {
          const top = stack.pop()!;
          currentChildren().push({
            type: "listItem",
            children: top.children,
          });
        }
        // Open a new list-item frame
        stack.push({ token: tok, children: [] });
        continue;
      }

      // Depth guard
      if (stack.length >= MAX_DEPTH) {
        pushText(currentChildren(), tok.raw);
        continue;
      }

      // Validate value-tags eagerly — invalid → emit raw
      if (tok.name === "color") {
        const ok = validateColor(tok.value ?? "");
        if (!ok) { pushText(currentChildren(), tok.raw); continue; }
      } else if (tok.name === "url") {
        const ok = validateUrl(tok.value ?? "");
        if (!ok) { pushText(currentChildren(), tok.raw); continue; }
      }

      stack.push({ token: tok, children: [] });
      continue;
    }

    if (tok.kind === "close") {
      // Find matching open on the stack
      const idx = (() => {
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].token.name === tok.name) return i;
        }
        return -1;
      })();

      if (idx === -1) {
        // No matching opener → render the raw close tag as text
        pushText(currentChildren(), tok.raw);
        continue;
      }

      // Auto-close anything between (unbalanced nested tags become text).
      // Exception: a `[*]` frame becomes a real listItem when its parent list
      // is being closed.
      while (stack.length - 1 > idx) {
        const dropped = stack.pop()!;
        const parentChildren = stack.length ? stack[stack.length - 1].children : root;
        if (dropped.token.name === "*") {
          parentChildren.push({ type: "listItem", children: dropped.children });
        } else {
          pushText(parentChildren, rawOpen(dropped.token));
          for (const c of dropped.children) parentChildren.push(c);
        }
      }

      // Close the matching one
      const frame = stack.pop()!;
      const parentChildren = stack.length ? stack[stack.length - 1].children : root;

      if (frame.token.name === "list") {
        // Wrap any trailing list-item that wasn't closed
        // (handled by [*]-driven close above — but ensure any plain children
        // outside list-items are dropped or wrapped)
        // We'll keep things simple: any non-listItem children inside list are
        // wrapped into a final listItem only if they're non-empty.
        const items: Node[] = [];
        let buf: Node[] = [];
        for (const c of frame.children) {
          if (c.type === "listItem") {
            if (buf.length) { items.push({ type: "listItem", children: buf }); buf = []; }
            items.push(c);
          } else {
            buf.push(c);
          }
        }
        if (buf.length) {
          // If everything is whitespace text, drop it
          const allWs = buf.every((n) => n.type === "text" && !n.content.trim());
          if (!allWs) items.push({ type: "listItem", children: buf });
        }
        parentChildren.push({ type: "list", children: items });
        continue;
      }

      const t = TAG_TO_TYPE[frame.token.name];
      if (!t) {
        // shouldn't happen
        pushText(parentChildren, rawOpen(frame.token));
        for (const c of frame.children) parentChildren.push(c);
        continue;
      }

      if (frame.token.name === "color") {
        parentChildren.push({
          type: "color",
          value: validateColor(frame.token.value ?? "") ?? "",
          children: frame.children,
        });
      } else if (frame.token.name === "url") {
        parentChildren.push({
          type: "url",
          value: validateUrl(frame.token.value ?? "") ?? "",
          children: frame.children,
        });
      } else if (frame.token.name === "h1" || frame.token.name === "h2" || frame.token.name === "h3") {
        const level = (frame.token.name === "h1" ? 1 : frame.token.name === "h2" ? 2 : 3) as 1 | 2 | 3;
        parentChildren.push({ type: "h", level, children: frame.children });
      } else {
        parentChildren.push({
          type: t,
          children: frame.children,
        } as Node);
      }
    }
  }

  // Any unclosed frames → emit raw open + children
  while (stack.length) {
    const dropped = stack.pop()!;
    const parentChildren = stack.length ? stack[stack.length - 1].children : root;
    if (dropped.token.name === "*") {
      // dangling list-item: wrap as listItem (lenient)
      parentChildren.push({ type: "listItem", children: dropped.children });
    } else {
      pushText(parentChildren, rawOpen(dropped.token));
      for (const c of dropped.children) parentChildren.push(c);
    }
  }

  return root;
}
