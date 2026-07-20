import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

type AuthState = "loading" | "anonymous" | "authenticated";

function LoginPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState(data.session ? "authenticated" : "anonymous");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setState(session ? "authenticated" : "anonymous");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state === "authenticated") {
      navigate({ to: "/admin", replace: true });
    }
  }, [state, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError("פרטי ההתחברות שגויים");
      return;
    }
    // onAuthStateChange will flip state → redirect
  }

  return (
    <main
      dir="rtl"
      lang="he"
      className="flex min-h-screen items-center justify-center bg-background px-6 py-12"
    >
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">התחברות למערכת</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            רפאל שמאות רכוש · ניהול תוכן
          </p>

          {state === "loading" ? (
            <div className="mt-8 flex justify-center py-8" aria-live="polite">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
                aria-label="טוען"
              />
            </div>
          ) : state === "authenticated" ? (
            <div className="mt-8 py-8 text-center text-sm text-muted-foreground">
              מעביר לממשק הניהול…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  אימייל
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  סיסמה
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? "מתחבר…" : "התחברות"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
