export type LangCode = "en" | "hi" | "ta" | "mr" | "bn" | "te";

export type PersonaId =
  | "farmer"
  | "woman"
  | "wage"
  | "gig"
  | "student"
  | "senior"
  | "business";

export type EligibilityAnswers = {
  land: string;
  income: string;
  state: string;
  primaryEarner: string;
  aadhaarBank: string;
};

export type MatchedScheme = {
  id: string;
  name: string;
  tag: string;
  match: "High" | "Medium" | "Low";
  qualifies: boolean;
  score: number;
  desc: string;
  source: string;
};

export type ChatAttachment = {
  name: string;
  type: string;
  previewUrl?: string;
};

export type ChatMessage = {
  role: "user" | "bot";
  text: string;
  time: string;
  citations?: string[];
  attachment?: ChatAttachment;
};

export type UserSession = {
  lang: LangCode;
  persona: PersonaId | null;
  eligibility: EligibilityAnswers | null;
  matchedSchemeIds: string[];
  chatTurns: number;
  chatHistory: ChatMessage[];
  pilotEvents: { type: string; at: string }[];
};

export type LocalizedStrings = Record<LangCode, string>;

export type SchemeRecord = {
  id: string;
  name: string;
  tag: LocalizedStrings;
  source: string;
  personas: PersonaId[];
  rules: {
    land?: "yes" | "no" | "any";
    income?: "below1l" | "1to3l" | "3to8l" | "above8l" | "any";
    aadhaarBank?: "yes" | "no" | "any";
    primaryEarner?: "yes" | "no" | "any";
  };
  desc: LocalizedStrings;
  benefits: Record<LangCode, string[]>;
  eligibility: Record<LangCode, string[]>;
  apply: Record<LangCode, string[]>;
  documents: Record<LangCode, string[]>;
  keywords: string[];
};
