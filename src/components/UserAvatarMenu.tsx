import { LogOut } from "lucide-react";
import { t } from "@/lib/i18n";
import type { AuthUser } from "@/lib/auth";
import type { LangCode } from "@/lib/types";

type UserAvatarMenuProps = {
  user: AuthUser;
  lang: LangCode;
  onLogout: () => void;
};

export function UserAvatarMenu({ user, lang, onLogout }: UserAvatarMenuProps) {
  const initial = (user.name.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="group relative hidden md:block">
      <button
        type="button"
        aria-label={`Account: ${user.name}`}
        className="grid size-10 place-items-center rounded-full border border-foreground bg-foreground font-display text-sm font-semibold text-background transition-transform group-hover:scale-105"
      >
        {initial}
      </button>
      <div className="pointer-events-none absolute right-0 top-full z-50 w-40 pt-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="overflow-hidden rounded-xl border border-foreground/20 bg-background shadow-lg">
          <p className="truncate border-b border-foreground/10 px-3 py-2 text-xs text-muted-foreground">{user.name}</p>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
          >
            <LogOut className="size-3.5" />
            {t("logOut", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
