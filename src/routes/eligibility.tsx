import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { hasCompletedOnboarding, OnboardingResumeDialog } from "@/components/OnboardingResumeDialog";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { eligibilityQuestions, normalizeEligibilityAnswers, t } from "@/lib/i18n";
import { matchSchemes } from "@/lib/eligibility-engine";
import { isAuthenticated } from "@/lib/auth";
import { loadSession, setEligibility } from "@/lib/session";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/eligibility")({
  head: () => ({ meta: [{ title: "Eligibility Check — Sahay" }] }),
  component: Eligibility,
});

function Eligibility() {
  const { session, refresh, user } = useSession();
  const lang = session.lang;
  const questions = eligibilityQuestions[lang] ?? eligibilityQuestions.en;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resumeOpen, setResumeOpen] = useState(false);
  const allowFlowRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAuthenticated() && hasCompletedOnboarding(session)) {
      setResumeOpen(true);
    }
  }, [user, session]);
  const total = questions.length;
  const current = questions[step];

  function finish(nextAnswers: string[]) {
    const normalized = normalizeEligibilityAnswers(nextAnswers, lang);
    const persona = loadSession().persona;
    const matched = matchSchemes(normalized, persona, lang);
    const ids = matched.filter((m) => m.qualifies).map((m) => m.id);
    setEligibility(normalized, ids);
    refresh();
    if (isAuthenticated()) {
      navigate({ to: "/app" });
    } else {
      navigate({ to: "/auth", search: { next: "/app" } });
    }
  }

  function answer(a: string) {
    const next = [...answers];
    next[step] = a;
    setAnswers(next);
    setTimeout(() => {
      if (step < total - 1) setStep(step + 1);
      else finish(next);
    }, 250);
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
        lang={lang}
        onRecheck={() => {
          allowFlowRef.current = true;
          setResumeOpen(false);
        }}
      />
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-20">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-1 flex-1 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500"
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            Step {step + 1} of {total}
          </span>
        </div>

        <Reveal key={step}>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("eligibilityCheck", lang)}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            {current.q}
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            {current.a.map((opt) => (
              <button
                key={opt}
                onClick={() => answer(opt)}
                className={`rounded-full border px-6 py-3 text-sm transition-colors ${
                  answers[step] === opt
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 hover:border-foreground"
                }`}
                style={{ minHeight: 48 }}
              >
                {opt}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 flex items-center justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground disabled:opacity-30"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <button
            disabled={!answers[step]}
            onClick={() => (step < total - 1 ? setStep(step + 1) : finish(answers))}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background disabled:opacity-30"
          >
            {step < total - 1 ? "Continue" : t("seeResults", lang)} <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
