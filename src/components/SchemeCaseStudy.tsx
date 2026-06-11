import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/Reveal";
import { downloadChecklistPdf, sendChecklistSms } from "@/lib/checklist";
import { t } from "@/lib/i18n";
import { getSchemeDetailMeta } from "@/lib/scheme-detail-meta";
import type { LangCode, SchemeRecord } from "@/lib/types";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "insight", label: "Key insight" },
  { id: "benefits", label: "Benefits" },
  { id: "eligibility", label: "Eligibility" },
  { id: "apply", label: "How to apply" },
  { id: "impact", label: "Results & impact" },
  { id: "documents", label: "Documents" },
  { id: "faq", label: "FAQ" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function SchemeCaseStudy({ scheme, lang }: { scheme: SchemeRecord; lang: LangCode }) {
  const meta = getSchemeDetailMeta(scheme);
  const docs = scheme.documents[lang] ?? scheme.documents.en;
  const benefits = scheme.benefits[lang] ?? scheme.benefits.en;
  const eligibility = scheme.eligibility[lang] ?? scheme.eligibility.en;
  const apply = scheme.apply[lang] ?? scheme.apply.en;
  const desc = scheme.desc[lang] ?? scheme.desc.en;
  const tag = scheme.tag[lang] ?? scheme.tag.en;

  const [active, setActive] = useState<SectionId>("overview");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#documents") {
      setTimeout(() => scrollTo("documents"), 100);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id as SectionId);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );

    for (const { id } of SECTIONS) {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: SectionId) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="scheme-case-study">
      {/* Breadcrumbs + back */}
      <div className="mx-auto max-w-7xl px-6 pt-8 md:pt-12">
        <Link to="/schemes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to results
        </Link>
        <nav className="mt-4 flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/schemes" className="hover:text-foreground">
            Schemes
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{scheme.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-6 pb-10 pt-6 md:pb-14">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Welfare scheme · {tag}</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-foreground px-3 py-1 text-xs">{tag}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs text-background">
                  <Check className="size-3" /> {t("youQualify", lang)}
                </span>
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                {scheme.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Last updated · MyScheme.gov.in
                </span>
                <a
                  href={scheme.source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
                >
                  Official source <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            {/* Hero visual — monochrome scheme card */}
            <div className="scheme-hero-card relative overflow-hidden rounded-2xl bg-foreground p-8 text-background md:p-10">
              <div className="font-display text-5xl font-bold tracking-tight opacity-90">{initials(scheme.name)}</div>
              <p className="mt-4 text-sm opacity-70">Government of India</p>
              <p className="mt-8 font-display text-2xl font-semibold leading-tight">{meta.primaryBenefit}</p>
              <p className="mt-1 text-xs uppercase tracking-wider opacity-60">Primary benefit</p>
            </div>
          </div>
        </Reveal>
      </header>

      {/* Two-column body */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 lg:grid-cols-[1fr_280px] lg:gap-16">
        {/* Main content */}
        <div className="min-w-0 space-y-20">
          <section
            id="overview"
            ref={(el) => {
              sectionRefs.current.overview = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">01 — Overview</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">The challenge for beneficiaries</h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{meta.challenge}</p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{desc}</p>
            </Reveal>
          </section>

          <section
            id="insight"
            ref={(el) => {
              sectionRefs.current.insight = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">02 — Key insight</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">What we learned in the field</h2>
              <blockquote className="scheme-quote relative mt-8 rounded-2xl border border-foreground/20 bg-muted/50 p-8 md:p-10">
                <span className="font-display text-6xl leading-none text-foreground/10" aria-hidden>
                  "
                </span>
                <p className="relative -mt-6 font-display text-xl font-medium leading-snug italic md:text-2xl">
                  {meta.insight}
                </p>
                <footer className="mt-8 flex items-center gap-3 border-t border-foreground/10 pt-6">
                  <div className="grid size-10 place-items-center rounded-full border border-foreground text-xs font-bold">S</div>
                  <div>
                    <div className="text-sm font-semibold">{meta.insightBy}</div>
                    <div className="text-xs text-muted-foreground">Sahay pilot cohort</div>
                  </div>
                </footer>
              </blockquote>
            </Reveal>
          </section>

          <section
            id="benefits"
            ref={(el) => {
              sectionRefs.current.benefits = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">03 — Benefits</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">What you receive</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Core benefits verified against MyScheme.gov.in. Amounts and rules may vary by state.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {benefits.map((b, i) => (
                  <div key={b} className="rounded-2xl border border-foreground/20 bg-background p-5 shadow-sm">
                    <div className="font-display text-2xl font-bold">{i === 0 ? meta.primaryBenefit.split(" ")[0] : `${i + 1}`}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Benefit {i + 1}</div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <section
            id="eligibility"
            ref={(el) => {
              sectionRefs.current.eligibility = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">04 — Eligibility</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Who can apply</h2>
              <ul className="mt-6 space-y-3">
                {eligibility.map((e) => (
                  <li key={e} className="flex gap-3 text-base leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />
                    {e}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section
            id="apply"
            ref={(el) => {
              sectionRefs.current.apply = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">05 — Application</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">How to apply</h2>
              <ol className="mt-6 space-y-4">
                {apply.map((step, i) => (
                  <li key={step} className="flex gap-4 rounded-xl border border-foreground/15 p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground font-mono text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <section
            id="impact"
            ref={(el) => {
              sectionRefs.current.impact = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">06 — Impact</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Results and impact at scale
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                National programme reach (illustrative). Your personal eligibility was matched by Sahay from your answers.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {meta.impactStats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-foreground/20 p-5">
                    <div className="font-display text-3xl font-bold tracking-tight">{s.value}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-8 space-y-3">
                {meta.impactBullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />
                    {renderBold(b)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section
            id="documents"
            ref={(el) => {
              sectionRefs.current.documents = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">07 — Documents</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Document checklist</h2>
              <p className="mt-3 text-muted-foreground">Tick what you already have. Download or SMS the list to yourself.</p>
              <div className="mt-6 divide-y divide-foreground/10 rounded-2xl border border-foreground">
                {docs.map((d) => (
                  <label key={d} className="flex cursor-pointer items-center gap-4 px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setChecked((c) => ({ ...c, [d]: !c[d] }))}
                      className={`grid size-6 shrink-0 place-items-center rounded-md border border-foreground transition-colors ${
                        checked[d] ? "bg-foreground text-background" : ""
                      }`}
                    >
                      {checked[d] && <Check className="size-4" />}
                    </button>
                    <span className={`flex-1 text-sm ${checked[d] ? "line-through opacity-50" : ""}`}>{d}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => downloadChecklistPdf(scheme.name, docs, lang)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background"
                >
                  <Download className="size-4" /> {t("downloadPdf", lang)}
                </button>
                <button
                  type="button"
                  onClick={() => sendChecklistSms(scheme.name, docs, lang)}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm"
                >
                  <Share2 className="size-4" /> {t("sendSms", lang)}
                </button>
              </div>
            </Reveal>
          </section>

          <section
            id="faq"
            ref={(el) => {
              sectionRefs.current.faq = el;
            }}
            className="scroll-mt-28"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">08 — FAQ</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h2>
              <Accordion type="single" collapsible className="mt-8" defaultValue="faq-0">
                {meta.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`faq-${i}`} className="border-foreground/15">
                    <AccordionTrigger className="font-display text-base font-semibold hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </section>
        </div>

        {/* Sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div className="rounded-2xl border border-foreground/20 bg-muted/40 p-6">
              <div className="space-y-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Primary benefit</div>
                  <div className="mt-1 font-display text-xl font-bold">{meta.primaryBenefit}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Category</div>
                  <div className="mt-1 font-display text-lg font-semibold">{tag}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Delivery</div>
                  <div className="mt-1 text-sm font-medium">{meta.delivery}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">National reach</div>
                  <div className="mt-1 font-display text-lg font-bold">{meta.reach}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Processing</div>
                  <div className="mt-1 text-sm">{meta.processingDays}</div>
                </div>
              </div>
              <a
                href={scheme.source}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm text-background"
              >
                Apply on MyScheme <ArrowRight className="size-4" />
              </a>
              <button
                type="button"
                onClick={() => downloadChecklistPdf(scheme.name, docs, lang)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-foreground px-5 py-3 text-sm"
              >
                <Download className="size-4" /> Download checklist
              </button>
            </div>

            <nav>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">In this scheme</p>
              <ul className="mt-4 space-y-1">
                {SECTIONS.map(({ id, label }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(id)}
                      className={`scheme-toc-link flex w-full items-center border-l-2 py-2 pl-4 text-left text-sm transition-colors ${
                        active === id
                          ? "border-foreground font-semibold text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
