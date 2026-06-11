import type { ChatMessage, EligibilityAnswers, LangCode, PersonaId, UserSession } from "./types";
import { cacheSchemesOffline } from "./schemes-data";

const KEY = "sahay_session";

const defaultSession = (): UserSession => ({
  lang: "en",
  persona: null,
  eligibility: null,
  matchedSchemeIds: [],
  chatTurns: 0,
  chatHistory: [],
  pilotEvents: [],
});

export function loadSession(): UserSession {
  if (typeof localStorage === "undefined") return defaultSession();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSession();
    return { ...defaultSession(), ...(JSON.parse(raw) as Partial<UserSession>) };
  } catch {
    return defaultSession();
  }
}

export function saveSession(patch: Partial<UserSession>): UserSession {
  const next = { ...loadSession(), ...patch };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  return next;
}

export function trackEvent(type: string): void {
  const s = loadSession();
  saveSession({
    pilotEvents: [...s.pilotEvents, { type, at: new Date().toISOString() }],
  });
}

export function setLanguage(lang: LangCode): UserSession {
  trackEvent(`lang:${lang}`);
  return saveSession({ lang });
}

export function setPersona(persona: PersonaId): UserSession {
  trackEvent(`persona:${persona}`);
  return saveSession({ persona });
}

export function setEligibility(eligibility: EligibilityAnswers, matchedSchemeIds: string[]): UserSession {
  trackEvent("eligibility_complete");
  return saveSession({ eligibility, matchedSchemeIds });
}

export function appendChat(messages: ChatMessage[], turns: number): UserSession {
  const chatHistory = messages.map((m) =>
    m.attachment?.previewUrl
      ? { ...m, attachment: { name: m.attachment.name, type: m.attachment.type } }
      : m,
  );
  return saveSession({ chatHistory, chatTurns: turns });
}

export function resetChat(greeting: ChatMessage): ChatMessage[] {
  saveSession({ chatHistory: [greeting], chatTurns: 0 });
  trackEvent("chat:new");
  return [greeting];
}

export function initOfflineCache(): void {
  cacheSchemesOffline();
}

export function getPilotStats() {
  const s = loadSession();
  const completed = s.pilotEvents.filter((e) => e.type === "eligibility_complete").length;
  const chats = s.pilotEvents.filter((e) => e.type.startsWith("chat:")).length;
  return {
    sessions: s.pilotEvents.length,
    eligibilityCompleted: completed,
    chatMessages: chats,
    matchedCount: s.matchedSchemeIds.length,
    lang: s.lang,
    persona: s.persona,
  };
}
