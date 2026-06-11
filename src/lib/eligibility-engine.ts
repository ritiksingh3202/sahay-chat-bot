import { SCHEMES } from "./schemes-data";
import type { EligibilityAnswers, LangCode, MatchedScheme, PersonaId } from "./types";

function mapLand(v: string): "yes" | "no" | "any" {
  if (v === "Yes") return "yes";
  if (v === "No") return "no";
  return "any";
}

function mapIncome(v: string): "below1l" | "1to3l" | "3to8l" | "above8l" | "any" {
  if (v.startsWith("Below")) return "below1l";
  if (v.includes("1L") && v.includes("3L")) return "1to3l";
  if (v.includes("3L") && v.includes("8L")) return "3to8l";
  if (v.startsWith("Above")) return "above8l";
  return "any";
}

function mapYesNo(v: string): "yes" | "no" | "any" {
  if (v === "Yes") return "yes";
  if (v === "No") return "no";
  return "any";
}

function ruleMatch(actual: string | undefined, expected: string | undefined): boolean {
  if (!expected || expected === "any") return true;
  if (!actual || actual === "any") return true;
  return actual === expected;
}

export function matchSchemes(
  answers: EligibilityAnswers,
  persona: PersonaId | null,
  lang: LangCode,
): MatchedScheme[] {
  const land = mapLand(answers.land);
  const income = mapIncome(answers.income);
  const aadhaarBank = mapYesNo(answers.aadhaarBank);
  const primaryEarner = mapYesNo(answers.primaryEarner);

  const scored = SCHEMES.map((scheme) => {
    let score = 0;
    if (persona && scheme.personas.includes(persona)) score += 3;
    if (ruleMatch(land, scheme.rules.land)) score += 2;
    else score -= 2;
    if (ruleMatch(income, scheme.rules.income)) score += 2;
    else if (scheme.rules.income && scheme.rules.income !== "any") score -= 1;
    if (ruleMatch(aadhaarBank, scheme.rules.aadhaarBank)) score += 1;
    if (ruleMatch(primaryEarner, scheme.rules.primaryEarner)) score += 1;

    const qualifies = score >= 4;
    const match: MatchedScheme["match"] =
      score >= 7 ? "High" : score >= 5 ? "Medium" : "Low";

    return {
      id: scheme.id,
      name: scheme.name,
      tag: scheme.tag[lang] ?? scheme.tag.en,
      match,
      qualifies,
      score,
      desc: scheme.desc[lang] ?? scheme.desc.en,
      source: scheme.source,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
