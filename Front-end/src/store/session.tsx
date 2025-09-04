"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "supervisor" | "seller" | "kitchen" | "delivery";

export type Session = {
  userId: number;
  name: string;
  role: Role;
  token: string;
  email?: string;
  storeId?: number;
};

type SessionContextType = {
  session: Session | null;
  login: (s: Session) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("session") : null;
    if (raw) {
      try { setSession(JSON.parse(raw)); } catch {}
    }
  }, []);

  const value = useMemo(() => ({
    session,
    login: (s: Session) => {
      setSession(s);
      if (typeof window !== "undefined") localStorage.setItem("session", JSON.stringify(s));
    },
    logout: () => {
      setSession(null);
      if (typeof window !== "undefined") localStorage.removeItem("session");
    }
  }), [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
