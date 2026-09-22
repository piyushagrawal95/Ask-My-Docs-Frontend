import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { validatePassword, getPasswordChecks } from "../lib/validation";
import { useDarkMode } from "../hooks/useDarkMode";

export default function ResetPasswordPage() {
  const [isDark, setIsDark] = useDarkMode();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      setLinkError("This reset link is invalid or has expired. Please request a new one.");
      return;
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(({ error: sessionError }) => {
      if (sessionError) {
        setLinkError("This reset link is invalid or has expired. Please request a new one.");
      } else {
        setReady(true);
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    // Supabase ne is temporary session ko sign in kar diya hai jab reset link
    // open hua — password set hone ke baad usko sign out karke login screen
    // par bhejna hai, seedha app mein nahi.
    await supabase.auth.signOut();
    setTimeout(() => navigate("/auth"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper relative">
      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={() => setIsDark((prev) => !prev)}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute top-5 right-5 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-paper-line bg-paper-card text-ink-soft hover:text-ink hover:border-moss/40 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
      >
        {isDark ? (
          <>
            <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            </span>
            <span className="text-[12px] font-medium text-ink">Dark</span>
          </>
        ) : (
          <>
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-700">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-[12px] font-medium text-ink">Light</span>
          </>
        )}
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-serif text-3xl text-ink">Ask My Docs</p>
          <p className="mt-2 text-sm text-ink-soft">Set a new password</p>
        </div>

        <div className="rounded-lg border border-paper-line bg-paper-card p-8 shadow-sm">
          {linkError && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-rust">{linkError}</p>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="text-xs text-ink-soft hover:text-moss transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}

          {!linkError && !ready && (
            <p className="text-sm text-ink-soft text-center">Verifying link…</p>
          )}

          {ready && done && (
            <p className="text-sm text-moss text-center">
              Password updated. Redirecting you to sign in…
            </p>
          )}

          {ready && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="password">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordTouched(true)}
                    className="w-full rounded-lg border border-paper-line bg-paper-card px-3 py-2.5 pr-10 text-sm text-ink focus:border-moss focus:ring-2 focus:ring-moss-soft outline-none transition-shadow"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-moss transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordTouched && (
                  <ul className="mt-2 space-y-1">
                    {getPasswordChecks(password).map((check) => (
                      <li
                        key={check.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          check.met ? "text-moss" : "text-ink-soft"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="w-3.5 h-3.5 shrink-0"
                        >
                          {check.met ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          ) : (
                            <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                          )}
                        </svg>
                        {check.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-paper-line bg-paper-card px-3 py-2.5 text-sm text-ink focus:border-moss focus:ring-2 focus:ring-moss-soft outline-none transition-shadow"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-rust">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-moss text-white py-2.5 text-sm font-medium shadow-sm hover:bg-moss-dark active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {busy && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{busy ? "Updating…" : "Update password"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}