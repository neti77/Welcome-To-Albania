import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"native" | "tourist" | "visitor">("visitor");
  const [honeypot, setHoneypot] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (honeypot.trim()) {
      setMessage("Account created. Check your email to confirm your account.");
      return;
    }
    if (Date.now() - formStartedAt < 1200) {
      setMessage("Could not sign up.");
      return;
    }
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Account created. Check your email to confirm your account.");
    } catch {
      setMessage("Could not sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-serif font-bold">Create Account</h1>
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
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <div className="flex items-center justify-between text-sm">
            <Link href="/sign-in" className="underline underline-offset-2">
              Already have an account
            </Link>
            <Link href="/" className="underline underline-offset-2">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
