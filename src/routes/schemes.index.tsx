import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { Check, Share2, FileText, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { matchSchemes } from "@/lib/eligibility-engine";
import { shareScheme } from "@/lib/checklist";
import { t } from "@/lib/i18n";
import { loadSession } from "@/lib/session";
import { useSession } from "@/hooks/use-session";
import { SCHEMES } from "@/lib/schemes-data";

export const Route = createFileRoute("/schemes/")({
  head: () => ({ meta: [{ title: "Matched Schemes — Sahay" }] }),
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth", search: { next: "/app" } });
    }
  },
  component: SchemesList,
});

function SchemesList() {
  const { session, online } = useSession();
  const lang = session.lang;

  const schemes = useMemo(() => {
    const s = loadSession();
    if (s.eligibility) {
      return matchSchemes(s.eligibility, s.persona, lang);
    }
    return SCHEMES.map((scheme) => ({
      id: scheme.id,
      name: scheme.name,
      tag: scheme.tag[lang] ?? scheme.tag.en,
      match: "Medium" as const,
      qualifies: true,
      score: 5,
      desc: scheme.desc[lang] ?? scheme.desc.en,
      source: scheme.source,
    }));
  }, [lang, session.eligibility, session.persona]);

  const qualified = schemes.filter((s) => s.qualifies);

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
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Results</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {t("schemesFound", lang, { n: qualified.length })}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Matched from your persona and eligibility answers. Grounded in MyScheme.gov.in data.
          </p>
        </Reveal>

        <div className="mt-12 space-y-4">
          {schemes.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.04}>
              <div className="grid items-start gap-6 rounded-2xl border border-foreground bg-background p-6 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-foreground px-3 py-1 text-xs">{s.tag}</span>
                    <span className="rounded-full border border-foreground px-3 py-1 text-xs">{s.match} match</span>
                    {s.qualifies ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs text-background">
                        <Check className="size-3" /> {t("youQualify", lang)}
                      </span>
                    ) : (
                      <span className="rounded-full border border-foreground px-3 py-1 text-xs text-muted-foreground">
                        Needs more info
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{s.name}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{s.desc}</p>
                  <a href={s.source} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs underline opacity-60">
                    Source: MyScheme.gov.in
                  </a>
                </div>
                <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
                  <Link
                    to="/schemes/$id"
                    params={{ id: s.id }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
                  >
                    View Details <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/schemes/$id"
                    params={{ id: s.id }}
                    hash="documents"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm"
                  >
                    <FileText className="size-4" /> Documents
                  </Link>
                  <button
                    type="button"
                    onClick={() => shareScheme(s.name, s.desc, s.source)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm"
                  >
                    <Share2 className="size-4" /> Share
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
