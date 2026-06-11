import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { MessageSquare, Search, ListChecks, HelpCircle, ArrowRight, Bookmark } from "lucide-react";
import { getScheme } from "@/lib/schemes-data";
import { t } from "@/lib/i18n";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — Sahay" }] }),
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth", search: { next: "/app" } });
    }
  },
  component: Dashboard,
});

const actions = [
  { icon: Search, title: "Find Schemes", desc: "10 central schemes with MyScheme.gov.in data", to: "/schemes" as const },
  { icon: ListChecks, title: "Check Eligibility", desc: "60 second guided check", to: "/eligibility" as const },
  { icon: MessageSquare, title: "Ask a Question", desc: "Chat with Sahay AI", to: "/chat" as const },
  { icon: HelpCircle, title: "Document Help", desc: "Download checklists & SMS", to: "/chat" as const },
];

function Dashboard() {
  const { session, online } = useSession();
  const lang = session.lang;
  const recent = session.matchedSchemeIds.slice(0, 3).map((id) => {
    const scheme = getScheme(id);
    return {
      id,
      name: scheme?.name ?? id,
      status: t("youQualify", lang),
    };
  });

  const greeting =
    lang === "hi"
      ? "नमस्ते 👋"
      : lang === "ta"
        ? "வணக்கம் 👋"
        : lang === "mr"
          ? "नमस्कार 👋"
          : lang === "bn"
            ? "নমস্কার 👋"
            : lang === "te"
              ? "నమస్తే 👋"
              : "Namaste 👋";

  return (
    <main>
      <Navbar />
      {!online && (
        <div className="border-b border-foreground/10 bg-muted px-6 py-2 text-center text-xs text-muted-foreground">
          {t("offlineBanner", lang)}
        </div>
      )}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{greeting}</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {lang === "hi" ? "आज मैं आपकी कैसे मदद करूँ?" : "How can I help you today?"}
          </h1>
          {session.persona && (
            <p className="mt-2 text-sm text-muted-foreground">
              Persona: <span className="font-medium capitalize">{session.persona}</span> · Language: {lang.toUpperCase()}
            </p>
          )}
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <Link
                to={a.to}
                className="group flex h-full flex-col justify-between rounded-2xl border border-foreground bg-background p-6 transition-colors hover:bg-foreground hover:text-background"
              >
                <a.icon className="size-6" />
                <div className="mt-12">
                  <div className="font-display text-lg font-semibold">{a.title}</div>
                  <div className="mt-1 text-sm opacity-80">{a.desc}</div>
                </div>
                <ArrowRight className="mt-6 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {recent.length ? "Your matched schemes" : "Get started"}
              </h2>
              <Link to="/schemes" className="text-sm underline underline-offset-4">
                View all
              </Link>
            </div>
          </Reveal>
          {recent.length === 0 ? (
            <Reveal>
              <div className="mt-6 rounded-2xl border border-dashed border-foreground/30 p-8 text-center">
                <p className="text-muted-foreground">Complete onboarding and eligibility to see personalized matches.</p>
                <Link
                  to="/start"
                  className="mt-4 inline-flex rounded-full bg-foreground px-6 py-3 text-sm text-background"
                >
                  Start now
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recent.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.05}>
                  <Link to="/schemes/$id" params={{ id: r.id }} className="block rounded-2xl border border-foreground/30 p-5 hover:border-foreground">
                    <div className="flex items-start justify-between">
                      <div className="font-display text-lg font-semibold">{r.name}</div>
                      <Bookmark className="size-4" />
                    </div>
                    <div className="mt-6 inline-flex rounded-full border border-foreground px-3 py-1 text-xs">{r.status}</div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
