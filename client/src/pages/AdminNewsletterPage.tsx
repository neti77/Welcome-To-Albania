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

type NewsItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: "draft" | "published";
  createdAt: string;
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submittingDraft, setSubmittingDraft] = useState(false);

  const [manualRecipients, setManualRecipients] = useState<string[]>([]);
  const [manualSubject, setManualSubject] = useState("");
  const [manualContent, setManualContent] = useState("");

  const [newsTitle, setNewsTitle] = useState("");
  const [newsDescription, setNewsDescription] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [publishingNews, setPublishingNews] = useState(false);
  const [newsImageError, setNewsImageError] = useState(false);

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
  const draftCount = useMemo(
    () => inboxItems.filter((item) => item.status === "draft").length,
    [inboxItems],
  );

  const normalizeImageUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const newsImagePreview = normalizeImageUrl(newsImageUrl);

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
      const newsResult = await fetchJson("/api/admin/news", {
        headers: { "x-admin-token": token.trim() },
      });

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
        setNewsItems([]);
        if (inboxResult.response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(inboxResult.data?.message ?? "Could not load admin data.");
        return;
      }

      if (!newsResult.response.ok) {
        setSubscribers([]);
        setInboxItems([]);
        setNewsItems([]);
        if (newsResult.response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(newsResult.data?.message ?? "Could not load admin data.");
        return;
      }

      setSubscribers(subsResult.data?.subscribers ?? []);
      setInboxItems(inboxResult.data?.items ?? []);
      setNewsItems(newsResult.data?.items ?? []);
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

  const saveNewsDraft = async () => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }

    setPublishingNews(true);
    setErrorMessage("");
    setActionMessage("");
    try {
      const { response, data } = await fetchJson("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token.trim(),
        },
        body: JSON.stringify({
          title: newsTitle,
          description: newsDescription,
          imageUrl: normalizeImageUrl(newsImageUrl),
          status: "draft",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(data?.message ?? "Could not publish news.");
        return;
      }

      setNewsTitle("");
      setNewsDescription("");
      setNewsImageUrl("");
      setNewsImageError(false);
      setActionMessage("News draft saved.");
      await loadAdminData();
    } catch {
      setErrorMessage("Could not save news.");
    } finally {
      setPublishingNews(false);
    }
  };

  const publishNewsItem = async (itemId: string) => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }
    setErrorMessage("");
    setActionMessage("");
    try {
      const { response, data } = await fetchJson(`/api/admin/news/${itemId}/publish`, {
        method: "POST",
        headers: { "x-admin-token": token.trim() },
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(data?.message ?? "Could not publish news.");
        return;
      }
      setActionMessage("News published.");
      await loadAdminData();
    } catch {
      setErrorMessage("Could not publish news.");
    }
  };

  const unpublishNewsItem = async (itemId: string) => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }
    setErrorMessage("");
    setActionMessage("");
    try {
      const { response, data } = await fetchJson(`/api/admin/news/${itemId}/unpublish`, {
        method: "POST",
        headers: { "x-admin-token": token.trim() },
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(data?.message ?? "Could not move to draft.");
        return;
      }
      setActionMessage("News moved to drafts.");
      await loadAdminData();
    } catch {
      setErrorMessage("Could not move to draft.");
    }
  };

  const deleteNewsItem = async (itemId: string) => {
    if (!token?.trim()) {
      navigate("/admin/login");
      return;
    }
    setErrorMessage("");
    setActionMessage("");
    try {
      const { response, data } = await fetchJson(`/api/admin/news/${itemId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token.trim() },
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          navigate("/admin/login");
          return;
        }
        setErrorMessage(data?.message ?? "Could not delete news.");
        return;
      }
      setActionMessage("News deleted.");
      await loadAdminData();
    } catch {
      setErrorMessage("Could not delete news.");
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Admin Control Center
            </p>
            <h1 className="text-3xl font-serif font-bold">Newsletter + News</h1>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Subscribers
              </p>
              <p className="text-2xl font-semibold">{subscribers.length}</p>
              <p className="text-xs text-muted-foreground">{subscribersLabel}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Drafts
              </p>
              <p className="text-2xl font-semibold">{draftCount}</p>
              <p className="text-xs text-muted-foreground">{inboxLabel}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                News Posts
              </p>
              <p className="text-2xl font-semibold">{newsItems.length}</p>
              <p className="text-xs text-muted-foreground">Published items</p>
            </CardContent>
          </Card>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Create News Draft</h2>
              <p className="text-sm text-muted-foreground">
                Add a headline, short description, and a direct image URL (https://).
              </p>
              <input
                value={newsTitle}
                onChange={(event) => setNewsTitle(event.target.value)}
                placeholder="Headline"
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
              <textarea
                value={newsDescription}
                onChange={(event) => setNewsDescription(event.target.value)}
                placeholder="Short description"
                rows={4}
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
              <input
                value={newsImageUrl}
                onChange={(event) => {
                  setNewsImageUrl(event.target.value);
                  setNewsImageError(false);
                }}
                placeholder="Image URL"
                className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
              />
              <div className="rounded-lg border border-dashed border-border/70 bg-secondary/30 p-3">
                {newsImagePreview && !newsImageError ? (
                  <img
                    key={newsImagePreview}
                    src={newsImagePreview}
                    alt="News preview"
                    className="h-36 w-full object-cover rounded-md"
                    loading="lazy"
                    decoding="async"
                    onError={() => setNewsImageError(true)}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {newsImagePreview
                      ? "Preview unavailable. Check the URL or use a direct image link."
                      : "Paste an image URL to preview it here."}
                  </div>
                )}
              </div>
              <Button onClick={saveNewsDraft} disabled={publishingNews}>
                {publishingNews ? "Saving..." : "Save Draft"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Latest News</h2>
                <p className="text-sm text-muted-foreground">
                  {newsItems.length} posts
                </p>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto">
                {newsItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-border overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-28 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.src = "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-tirana.jpg";
                      }}
                    />
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {(item.status ?? "published").toUpperCase()} ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {item.status === "draft" ? (
                          <Button
                            size="sm"
                            onClick={() => publishNewsItem(item.id)}
                          >
                            Publish
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unpublishNewsItem(item.id)}
                          >
                            Move to Draft
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNewsItem(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {!newsItems.length && (
                  <p className="text-sm text-muted-foreground">No news published yet.</p>
                )}
              </div>
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
