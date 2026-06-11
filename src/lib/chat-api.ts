import { generateRagReply } from "./rag-chat";
import type { ChatGroqInput } from "./chat-groq.fn";
import type { LangCode } from "./types";

export type ChatReply = {
  text: string;
  citations: string[];
  provider: "groq" | "local";
};

export async function fetchChatReply(
  input: ChatGroqInput,
  groqCall: (opts: { data: ChatGroqInput }) => Promise<{ text: string; citations: string[] }>,
): Promise<ChatReply> {
  try {
    const result = await groqCall({ data: input });
    return {
      text: result.text,
      citations: result.citations,
      provider: "groq",
    };
  } catch (error) {
    console.warn("Groq unavailable, using local RAG:", error);
    const local = generateRagReply(input.message, input.lang);
    return {
      text: local.text,
      citations: local.citations,
      provider: "local",
    };
  }
}

export function buildGroqHistory(
  messages: Array<{ role: "user" | "bot"; text: string }>,
): ChatGroqInput["history"] {
  return messages
    .filter((m) => m.text.trim())
    .slice(-8)
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
}

export function aiStatusLabel(lang: LangCode, provider: "groq" | "local"): string {
  if (provider === "groq") {
    return lang === "hi" ? "Sahay AI" : "Sahay AI";
  }
  return lang === "hi" ? "ऑफलाइन मोड" : "Offline mode";
}
