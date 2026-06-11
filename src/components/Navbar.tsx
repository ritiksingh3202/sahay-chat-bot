import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatarMenu } from "@/components/UserAvatarMenu";
import { isAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useSession } from "@/hooks/use-session";

const baseNav = [
  { to: "/", label: "Home" },
  { to: "/app", label: "Dashboard" },
  { to: "/chat", label: "Chat" },
  { to: "/schemes", label: "Schemes" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, session } = useSession();
  const lang = session.lang;

  const nav = useMemo(() => {
    if (user && isAdmin(user)) {
      return [...baseNav, { to: "/admin" as const, label: "Admin" }];
    }
    return [...baseNav];
  }, [user]);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo textClassName="text-xl" imageClassName="size-9" />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                pathname === n.to || pathname.startsWith(`${n.to}/`)
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserAvatarMenu user={user} lang={lang} onLogout={handleLogout} />
          ) : (
            <>
              <Link
                to="/auth"
                search={{ next: "/app" }}
                className="hidden rounded-full border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted md:inline-flex"
              >
                {t("logIn", lang)}
              </Link>
              <Link
                to="/start"
                className="hidden rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 md:inline-flex"
              >
                Get started
              </Link>
            </>
          )}
          <button
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full border border-foreground md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-foreground/10 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            {user && (
              <div className="mb-2 flex items-center gap-3 border-b border-foreground/10 pb-3">
                <div className="grid size-9 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {(user.name.trim()[0] ?? "?").toUpperCase()}
                </div>
                <span className="text-sm text-muted-foreground">{user.name}</span>
              </div>
            )}
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-foreground/10 py-3 text-sm last:border-0"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 rounded-full border border-foreground px-5 py-3 text-center text-sm"
              >
                {t("logOut", lang)}
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ next: "/app" }}
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-full border border-foreground px-5 py-3 text-center text-sm"
                >
                  {t("logIn", lang)}
                </Link>
                <Link
                  to="/start"
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-full bg-foreground px-5 py-3 text-center text-sm font-medium text-background"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
