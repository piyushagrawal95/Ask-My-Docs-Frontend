import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
    setTimeout(() => navigate("/"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-serif text-3xl text-ink">Ask My Docs</p>
          <p className="mt-2 text-sm text-ink-soft">Set a new password</p>
        </div>

        <div className="border border-stone-line bg-stone-card p-8">
          {linkError && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-rust">{linkError}</p>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="text-xs text-ink-soft hover:text-brass transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}

          {!linkError && !ready && (
            <p className="text-sm text-ink-soft text-center">Verifying link…</p>
          )}

          {ready && done && (
            <p className="text-sm text-sage text-center">
              Password updated. Redirecting you in…
            </p>
          )}

          {ready && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="password">
                  New password
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
              <div>
                <label className="block text-xs text-ink-soft mb-1.5" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-stone-line bg-white/60 px-3 py-2 text-sm text-ink focus:border-brass outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-rust">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-ink text-stone-bg py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
              >
                {busy ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}