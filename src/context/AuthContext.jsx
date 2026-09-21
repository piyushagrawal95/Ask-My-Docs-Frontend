import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

const IDLE_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours
const LAST_ACTIVITY_KEY = "last_activity_at";
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const idleTimerRef = useRef(null);

  const signOut = () => {
    // Purana activity timestamp clear karo, taaki agli baar fresh sign-in
    // hone par ye stale value idle-check ko galat trigger na kare.
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.removeItem("cleaned_empty_chats_session");
    return supabase.auth.signOut();
  };

  const resetIdleTimer = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(signOut, IDLE_LIMIT_MS);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_IN") {
        // Fresh sign-in (password ya Google OAuth) — ye khud hi "activity"
        // hai. Purane localStorage timestamp ko turant "abhi" par reset karo,
        // warna neeche wala idle-check kal/purane stale timestamp ko dekh
        // kar galti se turant sign-out kar dega.
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      }
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Idle-timeout: IDLE_LIMIT_MS tak koi activity na ho to auto sign-out.
  useEffect(() => {
    if (!session) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    // Tab band karke IDLE_LIMIT_MS se zyada der baad wapas khola ho, to turant logout kar do.
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