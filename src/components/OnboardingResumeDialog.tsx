import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LangCode } from "@/lib/types";

type OnboardingResumeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: LangCode;
  onRecheck: () => void;
};

export function OnboardingResumeDialog({ open, onOpenChange, lang, onRecheck }: OnboardingResumeDialogProps) {
  const navigate = useNavigate();

  const title =
    lang === "hi"
      ? "आपने पहले ही प्रोफ़ाइल भर ली है"
      : lang === "ta"
        ? "நீங்கள் ஏற்கனவே விவரங்களை நிரப்பியுள்ளீர்கள்"
        : "You have already completed your profile";

  const desc =
    lang === "hi"
      ? "आपकी भाषा, प्रोफ़ाइल और पात्रता जानकारी सहेजी है। क्या आप दोबारा जांच करना चाहते हैं या डैशबोर्ड पर जाना चाहते हैं?"
      : lang === "ta"
        ? "உங்கள் மொழி, சுயவிவரம் மற்றும் தகுதி விவரங்கள் சேமிக்கப்பட்டுள்ளன. மீண்டும் சரிபார்க்க வேண்டுமா அல்லது டாஷ்போர்டுக்குச் செல்ல வேண்டுமா?"
        : "Your language, profile, and eligibility details are saved. Would you like to run the check again or go to your dashboard?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">{desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onRecheck();
            }}
            className="rounded-full border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            {lang === "hi" ? "दोबारा जांचें" : lang === "ta" ? "மீண்டும் சரிபார்" : "Recheck eligibility"}
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate({ to: "/app" });
            }}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            {lang === "hi" ? "डैशबोर्ड पर जाएं" : lang === "ta" ? "டாஷ்போர்டுக்குச் செல்" : "Go to dashboard"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function hasCompletedOnboarding(session: {
  eligibility: unknown;
  persona: unknown;
  matchedSchemeIds: string[];
}): boolean {
  return Boolean(session.eligibility) || (Boolean(session.persona) && session.matchedSchemeIds.length > 0);
}
