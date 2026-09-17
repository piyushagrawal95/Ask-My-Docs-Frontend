import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { validateEmail, validatePassword, getPasswordChecks } from "../lib/validation";

export default function AuthPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFieldError,setEmailFieldError]=useState("");
  const [passwordTouched,setPasswordTouched]=useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const isEmailConfirmation = params.get("confirmed") === "1";

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    const hashType = hashParams.get("type"); // "signup" for email confirmation links

    function finishAuthLanding({ error: sessionError }) {
      window.history.replaceState(null, "", window.location.pathname);
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      if (isEmailConfirmation || hashType === "signup") {
        // Link ne sirf email verify kiya hai — user ko signed-in nahi rakhna.
        supabase.auth.signOut().then(() => {
          setInfo("Your email is confirmed. Please sign in below.");
          setMode("signin");
        });
        return;
      }
      navigate("/");
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href).then(finishAuthLanding);
    } else if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(finishAuthLanding);
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "signup") {
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

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
          emailRedirectTo: `${window.location.origin}/auth?confirmed=1`,
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
        queryParams:{
          prompt:"select_account"
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — the desk. Hidden on small screens. */}
      <div className="hidden lg:flex w-[42%] shrink-0 bg-shell flex-col justify-between px-14 py-14">
        <p className="font-serif text-xl text-ink-onshell">Ask My Docs</p>
        <div>
          <svg viewBox="0 0 64 64" className="w-12 h-12 mb-6 text-brass" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 14a4 4 0 0 1 4-4h16v40H12a4 4 0 0 1-4-4V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M56 14a4 4 0 0 0-4-4H36v40h16a4 4 0 0 0 4-4V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M28 14v36M14 18h10M14 24h10M14 30h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="font-serif text-[34px] leading-[1.2] text-ink-onshell max-w-sm">
            Read your documents by asking them questions.
          </p>
          <p className="mt-4 text-[14px] text-ink-onshellsoft max-w-xs leading-relaxed">
            Upload a PDF, DOCX or TXT file and get answers grounded in what it actually says, with citations back to the source.
          </p>
        </div>
        <p className="text-[12px] text-ink-onshellsoft">Your files stay in your workspace.</p>
      </div>

      {/* Right panel — the form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <p className="font-serif text-3xl text-ink">Ask My Docs</p>
            <p className="mt-2 text-sm text-ink-soft">Read your documents by asking them questions.</p>
          </div>

          <div className="mb-6 flex gap-6 border-b border-paper-line text-sm">
            <button
              className={`pb-3 -mb-px border-b-2 transition-colors ${
                mode === "signin"
                  ? "border-moss text-ink font-medium"
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
                  ? "border-moss text-ink font-medium"
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
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-paper-line bg-paper-card py-2.5 text-sm font-medium text-ink hover:border-ink/20 transition-colors mb-4"
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
            <div className="h-px flex-1 bg-paper-line" />
            <span className="text-xs text-ink-soft">or</span>
            <div className="h-px flex-1 bg-paper-line" />
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
                  className="w-full rounded-lg border border-paper-line bg-paper-card px-3 py-2.5 text-sm text-ink focus:border-moss focus:ring-2 focus:ring-moss-soft outline-none transition-shadow"
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
                onChange={(e) =>{ setEmail(e.target.value);
                  if(mode==="signup"){
                    setEmailFieldError(validateEmail(e.target.value)||"");
                  }
                }}
                className="w-full rounded-lg border border-paper-line bg-paper-card px-3 py-2.5 text-sm text-ink focus:border-moss focus:ring-2 focus:ring-moss-soft outline-none transition-shadow"
                placeholder="you@example.com"
              />
              {mode === "signup" && emailFieldError && (
                <p className="mt-1.5 text-xs text-rust">{emailFieldError}</p>
              )}
            </div>
            {!showForgot && (
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="password">
                  Password
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
                {mode === "signup" && passwordTouched && (
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
                  className="text-xs text-ink-soft hover:text-moss transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-sm text-rust">{error}</p>}
            {info && <p className="text-sm text-moss">{info}</p>}

            {!showForgot && (
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-moss text-white py-2.5 text-sm font-medium shadow-sm hover:bg-moss-dark active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            )}
          </form>

          {showForgot && (
            <div className="mt-4 border-t border-paper-line pt-4">
              {resetSent ? (
                <div className="space-y-3">
                  <p className="text-sm text-moss">
                    Reset link sent to <span className="font-medium">{email}</span>. Check your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="text-xs text-ink-soft hover:text-moss transition-colors"
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
                    className="w-full rounded-lg bg-moss text-white py-2.5 text-sm font-medium shadow-sm hover:bg-moss-dark active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {busy ? "Sending…" : "Send reset link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="text-xs text-ink-soft hover:text-moss transition-colors"
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