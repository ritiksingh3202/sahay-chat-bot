import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "@/lib/auth";
import { hasCompletedOnboarding, OnboardingResumeDialog } from "@/components/OnboardingResumeDialog";
import { ArrowRight, ArrowLeft, Tractor, GraduationCap, HeartPulse, Users, Briefcase, Hammer, Bike } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { t } from "@/lib/i18n";
import { setLanguage, setPersona } from "@/lib/session";
import type { LangCode, PersonaId } from "@/lib/types";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Get started | Sahay" },
      {
        name: "description",
        content: "Pick your language and tell us who you are. Sahay will match you to welfare schemes you qualify for.",
      },
    ],
  }),
  component: Start,
});

const langs: { code: LangCode; label: string; sub: string }[] = [
  { code: "hi", label: "हिंदी", sub: "Hindi" },
  { code: "ta", label: "தமிழ்", sub: "Tamil" },
  { code: "mr", label: "मराठी", sub: "Marathi" },
  { code: "bn", label: "বাংলা", sub: "Bangla" },
  { code: "te", label: "తెలుగు", sub: "Telugu" },
  { code: "en", label: "English", sub: "English" },
];

const personas: { id: PersonaId; icon: typeof Tractor; title: string; desc: string }[] = [
  { id: "farmer", icon: Tractor, title: "Farmer", desc: "Land owner, tenant, or agri worker" },
  { id: "woman", icon: Users, title: "Woman Head of Household", desc: "Schemes for women-led families" },
  { id: "gig", icon: Bike, title: "Gig / Platform Worker", desc: "Delivery, ride-share, daily gigs" },
  { id: "wage", icon: Hammer, title: "Daily Wage Worker", desc: "MGNREGA, labour welfare, insurance" },
  { id: "student", icon: GraduationCap, title: "Student", desc: "Scholarships and skill schemes" },
  { id: "senior", icon: HeartPulse, title: "Senior Citizen", desc: "Pension, health, and care schemes" },
  { id: "business", icon: Briefcase, title: "Small Business Owner", desc: "MSME credit and skill schemes" },
];

function Start() {
  const { refresh, session, user } = useSession();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<LangCode | null>(null);
  const [persona, setPersonaLocal] = useState<PersonaId | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const allowFlowRef = useRef(false);
  const navigate = useNavigate();

  const activeLang = lang ?? session.lang ?? "en";

  useEffect(() => {
    if (user && isAuthenticated() && hasCompletedOnboarding(session)) {
      setResumeOpen(true);
    }
  }, [user, session]);

  function finish() {
    if (lang) setLanguage(lang);
    if (persona) setPersona(persona);
    refresh();
    navigate({ to: "/eligibility" });
  }

  return (
    <main>
      <OnboardingResumeDialog
        open={resumeOpen}
        onOpenChange={(open) => {
          setResumeOpen(open);
          if (!open && !allowFlowRef.current) {
            navigate({ to: "/app" });
          }
        }}
        lang={activeLang}
        onRecheck={() => {
          allowFlowRef.current = true;
          setResumeOpen(false);
        }}
      />
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-1 flex-1 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: step === 0 ? "50%" : "100%" }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">Step {step + 1} of 2</span>
        </div>

        {step === 0 ? (
          <Reveal>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              {t("chooseLanguage", activeLang)}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Sahay speaks Hindi, Tamil, Marathi, Bangla, Telugu, and English.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    lang === l.code ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground"
                  }`}
                  style={{ minHeight: 96 }}
                >
                  <div className="font-display text-2xl font-semibold">{l.label}</div>
                  <div className="mt-1 text-xs opacity-70">{l.sub}</div>
                </button>
              ))}
            </div>
            <div className="mt-10 flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowLeft className="size-4" /> Back
              </Link>
              <button
                disabled={!lang}
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background disabled:opacity-30"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{t("whoAreYou", activeLang)}</h1>
            <p className="mt-3 text-muted-foreground">This personalizes schemes for farmer, gig worker, or woman-led households.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersonaLocal(p.id)}
                  className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                    persona === p.id ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground"
                  }`}
                >
                  <p.icon className="size-6 shrink-0" />
                  <div>
                    <div className="font-display text-lg font-semibold">{p.title}</div>
                    <div className="mt-1 text-sm opacity-80">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-10 flex items-center justify-between">
              <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowLeft className="size-4" /> Back
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate({ to: "/app" })} className="text-sm text-muted-foreground underline underline-offset-4">
                  Skip for now
                </button>
                <button
                  disabled={!persona}
                  onClick={finish}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background disabled:opacity-30"
                >
                  Start eligibility check <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
