import { createServerFn } from "@tanstack/react-start";
import { callGroqChat } from "@/lib/groq-client.server";
import { buildRagContext, retrieveSchemes } from "@/lib/rag-context";
import type { LangCode, PersonaId } from "@/lib/types";

export type ChatGroqInput = {
  message: string;
  lang: LangCode;
  persona: PersonaId | null;
  matchedSchemeIds: string[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
};

export type ChatGroqOutput = {
  text: string;
  citations: string[];
  provider: "groq";
};

export const chatWithGroq = createServerFn({ method: "POST" })
  .validator((data: ChatGroqInput) => data)
  .handler(async ({ data }): Promise<ChatGroqOutput> => {
    const schemes = retrieveSchemes(data.message, data.persona, data.matchedSchemeIds);
    const context = buildRagContext(schemes, data.lang);
    const text = await callGroqChat({
      message: data.message,
      lang: data.lang,
      persona: data.persona,
      context,
      history: data.history,
    });

    const citations = [...new Set(schemes.map((s) => s.source))];
    return { text, citations, provider: "groq" };
  });
