import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  // Handle the redirect back from Google. Supabase may send either
  // ?code=... (PKCE flow) or #access_token=...&refresh_token=... (implicit
  // flow, which is what this project uses) — we handle both.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");

    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href).then(({ error: exchangeError }) => {
        window.history.replaceState(null, "", window.location.pathname);
        if (!exchangeError) {
          navigate("/");
        } else {
          setError(exchangeError.message);
        }
      });
    } else if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error: sessionError }) => {
        window.history.replaceState(null, "", window.location.pathname);
        if (!sessionError) {
          navigate("/");
        } else {
          setError(sessionError.message);
        }
      });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate("/");
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const alreadyRegistered = signUpData?.user?.identities?.length === 0;
      if (alreadyRegistered) {
        setError("An account with this email already exists. Please sign in instead.");
        setMode("signin");
        return;
      }

      setInfo("Check your email to confirm your account, then sign in.");
      setMode("signin");
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetSent(true);
  }

  async function handleGoogleSignIn() {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });
    // Browser redirects to Google here — no further code runs until it comes back.
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-serif text-3xl text-ink">Ask My Docs</p>
          <p className="mt-2 text-sm text-ink-soft">
            Read your documents by asking them questions.
          </p>
        </div>

        <div className="border border-stone-line bg-stone-card p-8">
          <div className="mb-6 flex gap-6 border-b border-stone-line text-sm">
            <button
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                mode === "signin"
                  ? "border-brass text-ink font-medium"
                  : "border-transparent text-ink-soft"
              }`}
              onClick={() => {
                setMode("signin");
                setShowForgot(false);
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                mode === "signup"
                  ? "border-brass text-ink font-medium"
                  : "border-transparent text-ink-soft"
              }`}
              onClick={() => {
                setMode("signup");
                setShowForgot(false);
              }}
              type="button"
            >
              Create account
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-stone-line bg-white/60 py-2.5 text-sm font-medium text-ink hover:bg-white transition-colors mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.5 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.9-5.4l-6.4-5.4C29.4 34.9 26.8 36 24 36c-5.4 0-9.9-3.5-11.4-8.3l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.4 5.4C41.4 35.5 44 30.1 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-stone-line" />
            <span className="text-xs text-ink-soft">or</span>
            <div className="h-px flex-1 bg-stone-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-stone-line bg-white/60 px-3 py-2 text-sm text-ink focus:border-brass outline-none"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-ink-soft mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-line bg-white/60 px-3 py-2 text-sm text-ink focus:border-brass outline-none"
                placeholder="you@example.com"
              />
            </div>
            {!showForgot && (
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-stone-line bg-white/60 px-3 py-2 text-sm text-ink focus:border-brass outline-none"
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === "signin" && !showForgot && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setError("");
                    setInfo("");
                    setResetSent(false);
                  }}
                  className="text-xs text-ink-soft hover:text-brass transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-sm text-rust">{error}</p>}
            {info && <p className="text-sm text-sage">{info}</p>}

            {!showForgot && (
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-ink text-stone-bg py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            )}
          </form>

          {showForgot && (
            <div className="mt-4 border-t border-stone-line pt-4">
              {resetSent ? (
                <div className="space-y-3">
                  <p className="text-sm text-sage">
                    Reset link sent to <span className="font-medium">{email}</span>. Check your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="text-xs text-ink-soft hover:text-brass transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-ink-soft">
                    Enter your email above and we'll send you a reset link.
                  </p>
                  <button
                    type="button"
                    disabled={busy || !email}
                    onClick={handleForgotPassword}
                    className="w-full bg-ink text-stone-bg py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
                  >
                    {busy ? "Sending…" : "Send reset link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="text-xs text-ink-soft hover:text-brass transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}