import { SCHEMES } from "./schemes-data";
import { normalizeQuery } from "./rag-chat";
import type { LangCode, PersonaId, SchemeRecord } from "./types";

export function retrieveSchemes(
  query: string,
  persona: PersonaId | null,
  matchedIds: string[] = [],
  limit = 5,
): SchemeRecord[] {
  const q = normalizeQuery(query);
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);

  const scored = SCHEMES.map((scheme) => {
    let score = 0;
    const hay = `${scheme.name} ${scheme.id} ${scheme.keywords.join(" ")} ${scheme.desc.en}`.toLowerCase();
    for (const t of tokens) {
      if (hay.includes(t)) score += 2;
    }
    if (persona && scheme.personas.includes(persona)) score += 3;
    if (matchedIds.includes(scheme.id)) score += 4;
    return { scheme, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const personaSchemes = persona ? SCHEMES.filter((s) => s.personas.includes(persona)) : SCHEMES;
    const matched = matchedIds.map((id) => SCHEMES.find((s) => s.id === id)).filter(Boolean) as SchemeRecord[];
    const merged = [...matched, ...personaSchemes.slice(0, 3)];
    const unique = Array.from(new Map(merged.map((s) => [s.id, s])).values());
    return unique.slice(0, limit);
  }

  return scored.slice(0, limit).map((s) => s.scheme);
}

export function buildRagContext(schemes: SchemeRecord[], lang: LangCode): string {
  return schemes
    .map((s) => {
      const desc = s.desc[lang] ?? s.desc.en;
      const benefits = (s.benefits[lang] ?? s.benefits.en).join("; ");
      const eligibility = (s.eligibility[lang] ?? s.eligibility.en).join("; ");
      const docs = (s.documents[lang] ?? s.documents.en).join(", ");
      const apply = (s.apply[lang] ?? s.apply.en).join(" → ");
      return `### ${s.name} (id: ${s.id})
Source: ${s.source}
Description: ${desc}
Benefits: ${benefits}
Eligibility: ${eligibility}
Documents: ${docs}
How to apply: ${apply}`;
    })
    .join("\n\n");
}
