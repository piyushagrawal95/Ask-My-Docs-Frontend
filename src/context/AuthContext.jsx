import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

const IDLE_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours
const LAST_ACTIVITY_KEY = "last_activity_at";
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const idleTimerRef = useRef(null);

  const signOut = () => supabase.auth.signOut();

  const resetIdleTimer = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(signOut, IDLE_LIMIT_MS);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Idle-timeout: 30 min tak koi activity na ho to auto sign-out.
  useEffect(() => {
    if (!session) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    // Tab band karke 30 min baad wapas khola ho, to turant logout kar do.
    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
    if (Date.now() - lastActivity > IDLE_LIMIT_MS) {
      signOut();
      return;
    }

    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetIdleTimer));

    // Multiple tabs khule ho to ek tab ki activity baaki tabs ka timer bhi reset kare.
    const onStorage = (e) => {
      if (e.key === LAST_ACTIVITY_KEY) {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(signOut, IDLE_LIMIT_MS);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
      window.removeEventListener("storage", onStorage);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [session]);

  const value = {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}