import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

type NewsletterInboxItem = {
  id: string;
  subject: string;
  content: string;
  status: "draft" | "sent";
  createdAt: string;
  sentAt: string | null;
};

const TOKEN_KEY = "admin_dashboard_token";

export default function AdminNewsletterPage() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [inboxItems, setInboxItems] = useState<NewsletterInboxItem[]>([]);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submittingDraft, setSubmittingDraft] = useState(false);

  const [manualRecipients, setManualRecipients] = useState<string[]>([]);
  const [manualSubject, setManualSubject] = useState("");
  const [manualContent, setManualContent] = useState("");

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      navigate("/admin/login");
      return;
    }
    setToken(savedToken);
  }, [navigate]);

  const subscribersLabel = useMemo(
    () => `${subscribers.length} subscribers`,
    [subscribers.length],
  );
  const inboxLabel = useMemo(
    () => `${inboxItems.length} newsletters`,
    [inboxItems.length],
  );

  const fetchJson = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init);
    const data = await response.json();
    return { response, data };
  };

  const loadAdminData = async () => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setActionMessage("");
    try {
      const [subsResult, inboxResult] = await Promise.all([
        fetchJson("/api/admin/newsletter/subscribers", {
          headers: { "x-admin-token": token.trim() },
        }),
        fetchJson("/api/admin/newsletter/inbox", {
          headers: { "x-admin-token": token.trim() },
        }),
      ]);

      if (!subsResult.response.ok) {
        setSubscribers([]);
        setInboxItems([]);
        if (subsResult.response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(subsResult.data?.message ?? "Could not load admin data.");
        return;
      }

      if (!inboxResult.response.ok) {
        setSubscribers([]);
        setInboxItems([]);
        if (inboxResult.response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(inboxResult.data?.message ?? "Could not load admin data.");
        return;
      }

      setSubscribers(subsResult.data?.subscribers ?? []);
      setInboxItems(inboxResult.data?.items ?? []);
    } catch {
      setErrorMessage("Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadAdminData();
  }, [token]);

  const createDraft = async () => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }

    setSubmittingDraft(true);
    setErrorMessage("");
    setActionMessage("");
    try {
      const { response, data } = await fetchJson("/api/admin/newsletter/inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token.trim(),
        },
        body: JSON.stringify({ subject, content }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(data?.message ?? "Could not create draft.");
        return;
      }

      setSubject("");
      setContent("");
      setActionMessage("Draft saved.");
      await loadAdminData();
    } catch {
      setErrorMessage("Could not create draft.");
    } finally {
      setSubmittingDraft(false);
    }
  };

  const manualSend = async (item: NewsletterInboxItem) => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }

    setErrorMessage("");
    setActionMessage("");
    try {
      const { response, data } = await fetchJson(
        `/api/admin/newsletter/inbox/${item.id}/send`,
        {
          method: "POST",
          headers: { "x-admin-token": token.trim() },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(data?.message ?? "Could not mark newsletter as sent.");
        return;
      }

      setManualRecipients(data?.recipients ?? []);
      setManualSubject(item.subject);
      setManualContent(item.content);
      setActionMessage(
        `Marked as sent. ${data?.recipientCount ?? 0} recipients ready for manual sending.`,
      );
      await loadAdminData();
    } catch {
      setErrorMessage("Could not complete manual send.");
    }
  };

  const copyRecipients = async () => {
    try {
      await navigator.clipboard.writeText(manualRecipients.join(","));
      setActionMessage("Recipient list copied.");
    } catch {
      setErrorMessage("Could not copy recipients.");
    }
  };

  const copyBody = async () => {
    try {
      await navigator.clipboard.writeText(manualContent);
      setActionMessage("Newsletter content copied.");
    } catch {
      setErrorMessage("Could not copy content.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Newsletter Admin</h1>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Admin session active.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadAdminData} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.localStorage.removeItem(TOKEN_KEY);
                    navigate("/admin/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            {actionMessage && <p className="text-sm text-green-600">{actionMessage}</p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Subscribers</h2>
                <p className="text-sm text-muted-foreground">{subscribersLabel}</p>
              </div>
              <div className="space-y-2 max-h-[340px] overflow-y-auto">
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <p className="text-sm font-medium">{subscriber.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {!subscribers.length && (
                  <p className="text-sm text-muted-foreground">No subscribers loaded.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Create Newsletter Draft</h2>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject"
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write newsletter content..."
                rows={8}
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
              <Button onClick={createDraft} disabled={submittingDraft}>
                {submittingDraft ? "Saving..." : "Save Draft"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Newsletter Inbox</h2>
              <p className="text-sm text-muted-foreground">{inboxLabel}</p>
            </div>
            <div className="space-y-3">
              {inboxItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border px-4 py-3 space-y-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => manualSend(item)}
                        disabled={item.status === "sent"}
                      >
                        {item.status === "sent" ? "Sent" : "Manual Send"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content}
                  </p>
                </div>
              ))}
              {!inboxItems.length && (
                <p className="text-sm text-muted-foreground">No draft created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {manualRecipients.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Manual Send Package</h2>
              <p className="text-sm text-muted-foreground">
                Use this to send manually from your email provider.
              </p>
              <p className="text-sm">
                <span className="font-semibold">Subject:</span> {manualSubject}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={copyRecipients}>
                  Copy Recipients
                </Button>
                <Button size="sm" variant="outline" onClick={copyBody}>
                  Copy Content
                </Button>
              </div>
              <p className="text-xs text-muted-foreground break-all">
                {manualRecipients.join(",")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
