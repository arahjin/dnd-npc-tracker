/**
 * Image URL allowlist.
 *
 * User-supplied image URLs (NPC.image, Charakter.image) are rendered through
 * `next/image`, which proxies them server-side. Without restrictions, any URL
 * could be requested via the Vercel image-proxy → SSRF.
 *
 * This list MUST stay in sync with `next.config.ts:remotePatterns`.
 */
const ALLOWED_HOSTS_EXACT = new Set([
  "i.imgur.com",
  "imgur.com",
  "s.gravatar.com",
  "oaidalleapiprodscus.blob.core.windows.net",
]);

const ALLOWED_HOST_SUFFIXES = [
  ".public.blob.vercel-storage.com", // Vercel Blob (where AI-generated images live)
  ".cloudinary.com",
  ".googleusercontent.com",
];

/** Returns true iff `url` is a syntactically valid https URL on an allowlisted host. */
export function isAllowedImageUrl(url: string | null | undefined): boolean {
  if (!url) return true; // empty is fine — means "no image"
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (ALLOWED_HOSTS_EXACT.has(host)) return true;
  return ALLOWED_HOST_SUFFIXES.some((s) => host.endsWith(s));
}

/** Returns the URL trimmed if allowed, throws a friendly Error if not. */
export function validateImageUrl(url: string | null | undefined): string | null {
  if (!url || (typeof url === "string" && !url.trim())) return null;
  const trimmed = (url as string).trim();
  if (!isAllowedImageUrl(trimmed)) {
    throw new Error(
      "Bild-URL nicht erlaubt. Erlaubt sind: Vercel Blob (AI-generiert), Imgur, Cloudinary, Google, Gravatar.",
    );
  }
  return trimmed;
}
