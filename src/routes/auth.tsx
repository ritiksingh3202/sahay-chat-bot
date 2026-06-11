import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { login, signup } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useSession } from "@/hooks/use-session";

type AuthSearch = {
  next?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    next: typeof search.next === "string" ? search.next : "/app",
  }),
  beforeLoad: ({ search }) => {
    if (isAuthenticated()) {
      const next = search.next ?? "/app";
      const schemeMatch = next.match(/^\/schemes\/([^/]+)$/);
      if (schemeMatch) {
        throw redirect({ to: "/schemes/$id", params: { id: schemeMatch[1] } });
      }
      if (next === "/app") {
        throw redirect({ to: "/app" });
      }
      if (next === "/admin") {
        throw redirect({ to: "/admin" });
      }
      throw redirect({ to: "/app" });
    }
  },
  head: () => ({ meta: [{ title: "Sign in — Sahay" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { next = "/app" } = Route.useSearch();
  const { session, refreshAuth } = useSession();
  const lang = session.lang;
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const matchedCount = session.matchedSchemeIds.length;

  function goNext() {
    const schemeMatch = next.match(/^\/schemes\/([^/]+)$/);
    if (schemeMatch) {
      navigate({ to: "/schemes/$id", params: { id: schemeMatch[1] } });
    } else if (next === "/app") {
      navigate({ to: "/app" });
    } else if (next === "/admin") {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/app" });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      if (password !== confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const result = signup(name, email, phone, password);
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
    } else {
      const result = login(identifier, password);
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
    }

    refreshAuth();
    setLoading(false);
    goNext();
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-12 md:grid-cols-2 md:py-20">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("authStep", lang)}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {t("authTitle", lang)}
          </h1>
          <p className="mt-4 text-muted-foreground">{t("authSubtitle", lang)}</p>

          {matchedCount > 0 && (
            <div className="mt-8 rounded-2xl border border-foreground bg-muted/40 p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ready for you</p>
              <p className="mt-2 font-display text-3xl font-bold">{matchedCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("authResultsWaiting", lang, { n: matchedCount })}
              </p>
            </div>
          )}

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-foreground">✓</span> Save your matched schemes
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">✓</span> Download document checklists
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">✓</span> Continue on any device with your mobile
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-foreground p-6 md:p-8">
            <div className="flex rounded-full border border-foreground/30 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 rounded-full py-2.5 text-sm transition-colors ${
                  mode === "signup" ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {t("signUp", lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 rounded-full py-2.5 text-sm transition-colors ${
                  mode === "login" ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {t("logIn", lang)}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ramesh Kumar"
                      className="mt-1.5 w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Mobile number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="mt-1.5 w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                      required
                    />
                  </div>
                </>
              )}

              {mode === "login" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email or mobile</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Write your email"
                    className="mt-1.5 w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 pr-10 text-sm outline-none focus:border-foreground"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label="Toggle password"
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Confirm password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-foreground/30 bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-foreground/30 bg-muted px-4 py-3 text-sm text-foreground">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm text-background disabled:opacity-50"
              >
                {mode === "signup" ? t("createAccount", lang) : t("logIn", lang)}
                <ArrowRight className="size-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {t("authTerms", lang)}
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/eligibility" className="underline underline-offset-4">
              ← Back to eligibility
            </Link>
          </p>
        </Reveal>
      </div>
    </main>
  );
}
