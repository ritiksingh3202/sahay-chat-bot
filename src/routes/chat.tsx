import { createFileRoute, Link } from "@tanstack/react-router";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { Navbar } from "@/components/Navbar";
import { citationLabel } from "@/lib/citation-label";
import { Mic, Paperclip, Plus, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aiStatusLabel, buildGroqHistory, fetchChatReply } from "@/lib/chat-api";
import { chatWithGroq } from "@/lib/chat-groq.fn";
import { t } from "@/lib/i18n";
import { appendChat, loadSession, resetChat, trackEvent } from "@/lib/session";
import type { ChatAttachment, ChatMessage } from "@/lib/types";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Sahay" }] }),
  component: Chat,
});

const suggestionsEn = ["Check my eligibility", "Find schemes for farmers", "Documents required for PM-KISAN"];
const suggestionsHi = ["पात्रता जांचें", "किसान योजनाएं", "PM-KISAN दस्तावेज़"];

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function greetingMessage(lang: ReturnType<typeof useSession>["session"]["lang"]): ChatMessage {
  return { role: "bot", text: t("chatGreeting", lang), time: nowTime() };
}

type PendingFile = ChatAttachment & { textSnippet?: string };

async function readAttachment(file: File): Promise<PendingFile> {
  const base: PendingFile = { name: file.name, type: file.type };

  if (file.type.startsWith("image/")) {
    base.previewUrl = URL.createObjectURL(file);
    return base;
  }

  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    const text = await file.text();
    base.textSnippet = text.slice(0, 2000);
    return base;
  }

  return base;
}

function Chat() {
  const { session, online } = useSession();
  const lang = session.lang;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadSession().chatHistory;
    if (saved.length) return saved;
    return [greetingMessage(lang)];
  });
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [aiProvider, setAiProvider] = useState<"groq" | "local">("groq");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const suggestions = lang === "hi" ? suggestionsHi : suggestionsEn;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, pendingFile]);

  useEffect(() => {
    return () => {
      if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    };
  }, [pendingFile]);

  function startNewChat() {
    if (typing) return;
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
    setInput("");
    setVoiceError("");
    const fresh = resetChat(greetingMessage(lang));
    setMessages(fresh);
  }

  async function send(text: string, attachment?: ChatAttachment, fileSnippet?: string) {
    const value = text.trim();
    if ((!value && !attachment) || typing) return;

    let messageText = value;
    if (attachment) {
      const prefix = value || (lang === "hi" ? "मैंने एक फ़ाइल संलग्न की है" : "I attached a file");
      messageText = `${prefix}\n📎 ${attachment.name}`;
      if (fileSnippet) {
        messageText += `\n\n${fileSnippet.slice(0, 1500)}`;
      } else if (attachment.type.startsWith("image/")) {
        messageText +=
          lang === "hi"
            ? "\n\n(छवि संलग्न — कृपया बताएं मुझे किस योजना के दस्तावेज़ की जानकारी चाहिए।)"
            : "\n\n(Image attached — tell me which scheme or document help you need.)";
      }
    }

    const now = nowTime();
    const userMsg: ChatMessage = {
      role: "user",
      text: messageText,
      time: now,
      attachment,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
    setTyping(true);
    trackEvent("chat:user");

    try {
      const reply = await fetchChatReply(
        {
          message: messageText,
          lang,
          persona: session.persona,
          matchedSchemeIds: session.matchedSchemeIds,
          history: buildGroqHistory(next),
        },
        chatWithGroq,
      );

      setAiProvider(reply.provider);
      const botMsg: ChatMessage = {
        role: "bot",
        text: reply.text,
        time: now,
        citations: reply.citations,
      };
      const full = [...next, botMsg];
      setMessages(full);
      appendChat(full, full.filter((m) => m.role === "user").length);
      trackEvent(reply.provider === "groq" ? "chat:groq" : "chat:local");
    } finally {
      setTyping(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      setVoiceError(lang === "hi" ? `फ़ाइल ${maxMb}MB से छोटी होनी चाहिए` : `File must be under ${maxMb}MB`);
      return;
    }

    setVoiceError("");
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    const parsed = await readAttachment(file);
    setPendingFile(parsed);
    if (!input.trim()) {
      setInput(lang === "hi" ? "इस दस्तावेज़ के बारे में मदद चाहिए" : "Help me with this document");
    }
  }

  function toggleVoice() {
    setVoiceError("");
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      setVoiceError(
        lang === "hi"
          ? "आवाज़ इनपुट इस ब्राउज़र में उपलब्ध नहीं है"
          : "Voice input is not supported in this browser",
      );
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognitionCtor();
    rec.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "mr" ? "mr-IN" : "en-IN";
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join("");
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      setVoiceError(lang === "hi" ? "आवाज़ पहचान विफल" : "Could not capture voice. Try again.");
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const attachment = pendingFile
      ? { name: pendingFile.name, type: pendingFile.type, previewUrl: pendingFile.previewUrl }
      : undefined;
    void send(input, attachment, pendingFile?.textSnippet);
  }

  return (
    <main className="flex h-dvh flex-col">
      <Navbar />
      {!online && (
        <div className="border-b border-foreground/10 bg-muted px-6 py-2 text-center text-xs text-muted-foreground">
          {t("offlineBanner", lang)}
        </div>
      )}

      <div className="border-b border-foreground/10 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold">Sahay Chat</h1>
            <p className="truncate text-xs text-muted-foreground">
              {lang === "hi"
                ? "योजनाएं, दस्तावेज़ और पात्रता, MyScheme.gov.in पर आधारित"
                : "Schemes, documents and eligibility, grounded in MyScheme.gov.in"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={startNewChat}
              disabled={typing}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">{lang === "hi" ? "नई चैट" : "New chat"}</span>
            </button>
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider sm:inline-flex ${
                aiProvider === "groq"
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/30 text-muted-foreground"
              }`}
            >
              <Sparkles className="size-3" />
              {aiStatusLabel(lang, aiProvider)}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 py-4 md:px-6">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-foreground bg-foreground">
                  <img src="/sahay-logo.png" alt="" className="size-5 dark:invert" aria-hidden />
                </div>
              )}
              <div className={`max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {m.attachment?.previewUrl && (
                  <img
                    src={m.attachment.previewUrl}
                    alt={m.attachment.name}
                    className="mb-2 max-h-40 rounded-xl border border-foreground/20 object-cover"
                  />
                )}
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-foreground text-background"
                      : "rounded-tl-sm border border-foreground bg-background"
                  }`}
                >
                  {m.role === "bot" ? <ChatMarkdown text={m.text} /> : m.text}
                </div>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-2 px-1">
                    {[...new Set(m.citations)].map((c) => (
                      <a
                        key={c}
                        href={c}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-foreground/20 px-2.5 py-0.5 text-[10px] underline-offset-2 hover:underline"
                      >
                        {citationLabel(c)} ↗
                      </a>
                    ))}
                  </div>
                )}
                <span className="mt-1 px-1 text-[10px] text-muted-foreground">{m.time}</span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-foreground bg-foreground">
                <img src="/sahay-logo.png" alt="" className="size-5 dark:invert" aria-hidden />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-foreground bg-background px-4 py-3">
                <span className="typing-dot size-1.5 rounded-full bg-foreground" />
                <span className="typing-dot size-1.5 rounded-full bg-foreground" />
                <span className="typing-dot size-1.5 rounded-full bg-foreground" />
                <span className="text-xs text-muted-foreground">Sahay is thinking…</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 py-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              disabled={typing}
              className="rounded-full border border-foreground px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-40"
            >
              {s}
            </button>
          ))}
          <Link to="/eligibility" className="rounded-full border border-foreground px-3 py-1.5 text-xs hover:bg-muted">
            Full eligibility check →
          </Link>
        </div>

        {pendingFile && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-foreground/20 bg-muted/50 px-3 py-2 text-xs">
            <Paperclip className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate font-medium">{pendingFile.name}</span>
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => {
                if (pendingFile.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
                setPendingFile(null);
              }}
              className="grid size-6 place-items-center rounded-full hover:bg-background"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {voiceError && <p className="mb-2 text-center text-xs text-red-600 dark:text-red-400">{voiceError}</p>}

        <form
          onSubmit={handleSubmit}
          className="mt-1 flex items-center gap-1.5 rounded-full border border-foreground bg-background p-1.5 shadow-sm sm:gap-2"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.txt,text/plain,.pdf,application/pdf"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
          <button
            type="button"
            aria-label="Attach file"
            onClick={() => fileRef.current?.click()}
            disabled={typing}
            className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-muted disabled:opacity-40 sm:size-10"
          >
            <Paperclip className="size-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === "hi" ? "अपना संदेश लिखें…" : "Ask about schemes, documents, eligibility…"}
            disabled={typing}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 sm:px-4"
          />
          <button
            type="button"
            aria-label={listening ? "Stop voice input" : "Voice input"}
            onClick={toggleVoice}
            disabled={typing}
            className={`grid size-9 shrink-0 place-items-center rounded-full hover:bg-muted disabled:opacity-40 sm:size-10 ${
              listening ? "bg-foreground text-background" : ""
            }`}
          >
            <Mic className="size-4" />
          </button>
          <button
            type="submit"
            aria-label="Send"
            disabled={typing || (!input.trim() && !pendingFile)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background disabled:opacity-40 sm:size-10"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
