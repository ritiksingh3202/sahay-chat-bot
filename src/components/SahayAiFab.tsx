import { Link, useLocation } from "@tanstack/react-router";

const hiddenOn = ["/chat"];

export function SahayAiFab() {
  const { pathname } = useLocation();

  if (hiddenOn.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <Link
      to="/chat"
      aria-label="Open Sahay AI chat"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-full border border-foreground/25 bg-background py-2 pl-2 pr-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all hover:border-foreground/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] active:scale-[0.98] sm:bottom-6 sm:right-6 sm:py-2.5 sm:pl-2.5 sm:pr-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground ring-2 ring-background sm:size-11">
        <img
          src="/sahay-logo.png"
          alt=""
          className="size-6 dark:invert"
          aria-hidden
        />
      </span>
      <span className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
        Sahay AI
      </span>
    </Link>
  );
}
