import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

type Props = {
  initialMode?: Mode;
};

export default function AuthPage({ initialMode = "sign-in" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState<"native" | "tourist" | "visitor">("visitor");
  const [honeypot, setHoneypot] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const resetMessage = () => setMessage("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (honeypot.trim()) {
      if (mode === "sign-up") {
        setMessage("Account created. Check your email to confirm your account.");
      } else {
        navigate("/");
      }
      return;
    }
    if (Date.now() - formStartedAt < 1200) {
      setMessage(mode === "sign-up" ? "Could not sign up." : "Could not sign in.");
      return;
    }
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType,
              display_name: displayName.trim() || undefined,
            },
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage("Account created. Check your email to confirm your account.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }
      await supabase.auth.updateUser({
        data: {
          user_type: userType,
        },
      });
      navigate("/");
    } catch {
      setMessage(mode === "sign-up" ? "Could not sign up." : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold">
              {mode === "sign-up" ? "Create Account" : "Sign In"}
            </h1>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                resetMessage();
              }}
              className="text-xs uppercase tracking-widest text-primary"
            >
              {mode === "sign-up" ? "Have an account?" : "Need an account?"}
            </button>
          </div>

          {!hasSupabaseConfig && (
            <p className="text-sm text-muted-foreground">
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
            />
            {mode === "sign-up" && (
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
            )}
            <select
              value={userType}
              onChange={(event) =>
                setUserType(event.target.value as "native" | "tourist" | "visitor")
              }
              className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
            >
              <option value="native">I am a native</option>
              <option value="tourist">I am a tourist</option>
              <option value="visitor">I am a visitor</option>
            </select>
            <input
              type="text"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <Button type="submit" className="w-full" disabled={loading || !hasSupabaseConfig}>
              {loading
                ? mode === "sign-up"
                  ? "Creating..."
                  : "Signing in..."
                : mode === "sign-up"
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                resetMessage();
              }}
              className="underline underline-offset-2"
            >
              {mode === "sign-up" ? "Already have an account" : "Create account"}
            </button>
            <Link href="/" className="underline underline-offset-2">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
