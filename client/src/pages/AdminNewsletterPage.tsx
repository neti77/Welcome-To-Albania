import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

const TOKEN_KEY = "admin_dashboard_token";

export default function AdminNewsletterPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    if (savedToken) setToken(savedToken);
  }, []);

  const countLabel = useMemo(() => `${subscribers.length} saved`, [subscribers]);

  const loadSubscribers = async () => {
    if (!token.trim()) {
      setErrorMessage("Enter your admin token.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      window.localStorage.setItem(TOKEN_KEY, token.trim());

      const response = await fetch("/api/admin/newsletter/subscribers", {
        headers: {
          "x-admin-token": token.trim(),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setSubscribers([]);
        setErrorMessage(data?.message ?? "Could not load subscribers.");
        return;
      }

      setSubscribers(data?.subscribers ?? []);
    } catch {
      setErrorMessage("Could not load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Newsletter Admin</h1>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter your admin token to view decrypted subscriber emails.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Admin token"
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
              <Button onClick={loadSubscribers} disabled={loading}>
                {loading ? "Loading..." : "Load"}
              </Button>
            </div>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Subscribers</h2>
              <p className="text-sm text-muted-foreground">{countLabel}</p>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-md border border-border px-3 py-2"
                >
                  <p className="text-sm font-medium">{subscriber.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(subscriber.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {!subscribers.length && (
                <p className="text-sm text-muted-foreground">No subscribers loaded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
