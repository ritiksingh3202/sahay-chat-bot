import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type AuthUser, loadAuthUser, logout as authLogout } from "@/lib/auth";
import { initOfflineCache, loadSession, saveSession, type UserSession } from "@/lib/session";
import type { LangCode } from "@/lib/types";

type SessionContextValue = {
  session: UserSession;
  user: AuthUser | null;
  refresh: () => void;
  refreshAuth: () => void;
  logout: () => void;
  setLang: (lang: LangCode) => void;
  online: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession>(() => loadSession());
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const refresh = useCallback(() => setSession(loadSession()), []);
  const refreshAuth = useCallback(() => setUser(loadAuthUser()), []);
  const logout = useCallback(() => {
    authLogout();
    saveSession({ lang: "en" });
    setSession(loadSession());
    setUser(null);
  }, []);

  useEffect(() => {
    initOfflineCache();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const setLang = useCallback(
    (lang: LangCode) => {
      saveSession({ lang });
      refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({ session, user, refresh, refreshAuth, logout, setLang, online }),
    [session, user, refresh, refreshAuth, logout, setLang, online],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
