import type { LangCode, PersonaId } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const LANG_NAMES: Record<LangCode, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  mr: "Marathi",
  bn: "Bangla",
  te: "Telugu",
};

export type GroqChatParams = {
  message: string;
  lang: LangCode;
  persona: PersonaId | null;
  context: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
};

export function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY?.trim() || undefined;
}

export async function callGroqChat(params: GroqChatParams): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const langName = LANG_NAMES[params.lang];
  const personaLine = params.persona ? `User persona: ${params.persona}.` : "";

  const system = `You are Sahay, a helpful Indian government welfare scheme assistant.
Rules:
- Answer ONLY using the SCHEME CONTEXT below (sourced from MyScheme.gov.in).
- If the answer is not in context, say you are not sure and suggest visiting /eligibility or naming a specific scheme.
- Respond in ${langName}. Understand code-mixed Hinglish/Tanglish if the user writes that way.
- Be warm, concise, and practical (max ~120 words unless listing documents).
- When mentioning a scheme, use its exact name from context and wrap scheme names in **double asterisks** for emphasis.
- Never invent benefit amounts, eligibility rules, or URLs not in context.
${personaLine}

SCHEME CONTEXT:
${params.context}`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: system },
    ...params.history.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: params.message },
  ];

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.35,
      max_tokens: 512,
      top_p: 0.9,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty Groq response");
  return text;
}
