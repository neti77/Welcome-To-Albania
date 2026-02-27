import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TOKEN_KEY = "admin_dashboard_token";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [, navigate] = useLocation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      setErrorMessage("Enter admin key.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message ?? "Invalid admin key.");
        return;
      }

      window.localStorage.setItem(TOKEN_KEY, token.trim());
      navigate("/admin/newsletter");
    } catch {
      setErrorMessage("Could not verify admin key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8 lg:px-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-serif font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter the admin key to access the newsletter dashboard.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Admin key"
              className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking..." : "Access Dashboard"}
            </Button>
          </form>
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          <Link href="/" className="text-sm underline underline-offset-2 inline-block">
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
