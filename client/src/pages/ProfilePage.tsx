import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState<"native" | "tourist" | "visitor">("visitor");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        setEmail(session.user.email ?? null);
        setDisplayName(session.user.user_metadata?.display_name ?? "");
        setUserType(session.user.user_metadata?.user_type ?? "visitor");
      } else {
        setEmail(null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setEmail(session.user.email ?? null);
        setDisplayName(session.user.user_metadata?.display_name ?? "");
        setUserType(session.user.user_metadata?.user_type ?? "visitor");
      } else {
        setEmail(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async () => {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    if (!email) {
      setMessage("Please sign in to update your profile.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const trimmedName = displayName.trim();
      const { error } = await supabase.auth.updateUser({
        data: {
          user_type: userType,
          display_name: trimmedName || undefined,
        },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Profile updated.");
    } catch {
      setMessage("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setEmail(null);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 md:px-8 lg:px-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Profile</h1>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {!hasSupabaseConfig && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to
                enable profiles.
              </p>
            </CardContent>
          </Card>
        )}

        {!email ? (
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in to manage your display name and user type.
              </p>
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your public name"
                  className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  I am a
                </label>
                <select
                  value={userType}
                  onChange={(event) =>
                    setUserType(event.target.value as "native" | "tourist" | "visitor")
                  }
                  className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
                >
                  <option value="native">Native</option>
                  <option value="tourist">Tourist</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={updateProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Sign out
                </Button>
              </div>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
