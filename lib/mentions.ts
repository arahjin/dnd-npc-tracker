// Mention format: @[Name](PERSON|ORGANISATION|CHARAKTER|LOCATION:id)
export const MENTION_REGEX = /@\[([^\]]+)\]\((PERSON|ORGANISATION|CHARAKTER|LOCATION):([^)]+)\)/g;

export type MentionOption = { id: string; label: string; typ: string };

export const MENTION_HREF: Record<string, string> = {
  PERSON: "/npc",
  ORGANISATION: "/organisationen",
  CHARAKTER: "/charaktere",
  LOCATION: "/locations",
};

export const MENTION_ICON: Record<string, string> = {
  PERSON: "👤",
  ORGANISATION: "🏛",
  CHARAKTER: "⚔",
  LOCATION: "📍",
};

/** Strip @mention syntax, leaving only the display name */
export function stripMentions(text: string): string {
  return text.replace(/@\[([^\]]+)\]\((PERSON|ORGANISATION|CHARAKTER|LOCATION):[^)]+\)/g, "$1");
}

/** Extract unique tags from @mention syntax in a text string */
export function extractTagsFromText(text: string): Array<{ tagTyp: string; referenzId: string }> {
  const tags: Array<{ tagTyp: string; referenzId: string }> = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(MENTION_REGEX)) {
    const [, , typ, id] = match;
    const key = `${typ}:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      tags.push({ tagTyp: typ, referenzId: id });
    }
  }
  return tags;
}
