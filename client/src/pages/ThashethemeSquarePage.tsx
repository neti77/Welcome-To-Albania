import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type NewsItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status?: "draft" | "published";
};

type NewsComment = {
  id: string;
  news_id: string;
  author_email: string;
  author_name?: string | null;
  reply_to_comment_id?: string | null;
  reply_to_email?: string | null;
  reply_to_name?: string | null;
  reply_to_preview?: string | null;
  content: string;
  created_at: string;
};

const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "north-alps",
    title: "Open chat",
    description:
      "Please keep the chat friendly and avoid sharing personal information. Message from Neti here, have a great day! ",
    imageUrl: "https://eiti.org/sites/default/files/styles/full_height_hero_desktop/public/2022-03/Albania_shutterstock_1443788372.webp?itok=nCE2pmc2",
    status: "published",
  },
  
];

const NEWS_CACHE_KEY = "albania_news_cache";

const getCachedNews = (): NewsItem[] => {
  if (typeof window === "undefined") return DEFAULT_NEWS_ITEMS;
  try {
    const saved = window.localStorage.getItem(NEWS_CACHE_KEY);
    if (saved === null) return DEFAULT_NEWS_ITEMS;
    const parsed = JSON.parse(saved) as NewsItem[];
    return Array.isArray(parsed) ? parsed : DEFAULT_NEWS_ITEMS;
  } catch {
    return DEFAULT_NEWS_ITEMS;
  }
};

export default function ThashethemeSquarePage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => getCachedNews());
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(
    () => getCachedNews()[0] ?? null,
  );
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentHoneypot, setCommentHoneypot] = useState("");
  const [commentFormStartedAt] = useState(() => Date.now());
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsStatus, setCommentsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [replyTarget, setReplyTarget] = useState<NewsComment | null>(null);

  const loadComments = async (newsId: string) => {
    const supabaseClient = supabase;
    if (!supabaseClient) return;

    setCommentsLoading(true);
    setCommentsStatus("loading");
    const { data, error } = await supabaseClient
      .from("news_comments")
      .select(
        "id, news_id, author_email, author_name, reply_to_comment_id, reply_to_email, reply_to_name, reply_to_preview, content, created_at",
      )
      .eq("news_id", newsId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      setCommentsStatus("error");
      setCommentsLoading(false);
      return;
    }

    const ordered = (data ?? []).slice().reverse();
    setComments(ordered as unknown as NewsComment[]);
    setCommentsStatus("ready");
    setCommentsLoading(false);
  };

  const loadNews = async () => {
    try {
      const response = await fetch("/api/news");
      const data = await response.json();
      const items = Array.isArray(data?.items) ? (data.items as NewsItem[]) : [];
      setNewsItems(items);
      if (items.length) {
        setSelectedNews((current) => {
          const stillExists = current ? items.find((item) => item.id === current.id) : null;
          return stillExists ?? items[0];
        });
      } else {
        setSelectedNews(null);
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(items));
      }
    } catch {
      setNewsItems(DEFAULT_NEWS_ITEMS);
    }
  };

  useEffect(() => {
    void loadNews();
    const refresh = () => {
      if (document.hidden) return;
      void loadNews();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    const newsId = selectedNews?.id;
    if (newsId) {
      setComments([]);
      setCommentsStatus("loading");
      setReplyTarget(null);
      void loadComments(newsId);
    }
  }, [selectedNews?.id]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setCurrentUserEmail(data.session?.user?.email ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserEmail(session?.user?.email ?? null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const supabaseClient = supabase;
    const newsId = selectedNews?.id;
    if (!supabaseClient || !newsId) return;
    const channel = supabaseClient
      .channel(`news-comments-${newsId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "news_comments",
          filter: `news_id=eq.${newsId}`,
        },
        (payload) => {
          const next = payload.new as NewsComment;
          setComments((current) => [...current, next]);
        }
      )
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [selectedNews?.id]);

  useEffect(() => {
    if (comments.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [comments, selectedNews?.id]);

  const onSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setCommentMessage("Comments are unavailable.");
      return;
    }

    if (commentHoneypot.trim()) {
      setCommentMessage("Comment posted.");
      return;
    }

    const submittedAfterMs = Date.now() - commentFormStartedAt;
    if (submittedAfterMs < 1200) {
      setCommentMessage("Could not post comment.");
      return;
    }

    if (Date.now() - lastCommentAt < 8000) {
      setCommentMessage("Please wait a few seconds before posting again.");
      return;
    }

    const body = newComment.trim();
    if (!body) return;
    if (!selectedNews?.id) {
      setCommentMessage("No news selected yet.");
      return;
    }

    setSubmittingComment(true);
    setCommentMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setCommentMessage("Sign in to leave a comment.");
        return;
      }

      const replyPreview = replyTarget?.content
        ? replyTarget.content.slice(0, 120)
        : null;

      const { error } = await supabase.from("news_comments").insert({
        news_id: selectedNews.id,
        author_email: session.user.email,
        author_name: session.user.user_metadata?.display_name ?? null,
        reply_to_comment_id: replyTarget?.id ?? null,
        reply_to_email: replyTarget?.author_email ?? null,
        reply_to_name: replyTarget?.author_name ?? null,
        reply_to_preview: replyPreview,
        content: body,
      });

      if (error) {
        const needsFallback =
          typeof error.message === "string" && error.message.includes("author_name");
        if (!needsFallback) {
          setCommentMessage("Could not post comment.");
          return;
        }

        const retry = await supabase.from("news_comments").insert({
          news_id: selectedNews.id,
          author_email: session.user.email,
          content: body,
        });
        if (retry.error) {
          setCommentMessage("Could not post comment.");
          return;
        }
      }

      if (
        replyTarget?.author_email &&
        replyTarget.author_email !== session.user.email
      ) {
        await supabase.from("comment_notifications").insert({
          recipient_email: replyTarget.author_email,
          sender_email: session.user.email,
          sender_name: session.user.user_metadata?.display_name ?? null,
          context_type: "news",
          context_id: selectedNews.id,
          message: body.slice(0, 160),
        });
      }

      setNewComment("");
      setCommentMessage("Comment posted.");
      setLastCommentAt(Date.now());
      setReplyTarget(null);
      if (selectedNews?.id) {
        await loadComments(selectedNews.id);
      }
    } catch {
      setCommentMessage("Could not post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl">
            Visit Albania
          </Link>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 space-y-8">
        <section>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
            Thashetheme Square
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            A community corner for locals to share updates, discuss city news, and
            keep the conversation alive.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Latest News Board</h2>
              <p className="text-sm text-muted-foreground">
                Community-shared headlines and updates. Pick a thread to join the discussion.
              </p>
            </div>
            {!newsItems.length && (
              <p className="text-sm text-muted-foreground">
                No published news yet. Check back soon.
              </p>
            )}
            {newsItems.map((news) => (
              <Card
                key={news.id}
                className={`overflow-hidden transition-all ${
                  selectedNews?.id === news.id ? "border-primary/40 shadow-lg" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedNews(news)}
                  className="w-full text-left"
                >
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <CardContent className="p-5 space-y-2">
                    <p className="text-xs uppercase tracking-wider text-primary">Thashetheme News</p>
                    <h3 className="text-xl font-semibold">{news.title}</h3>
                    <p className="text-sm text-muted-foreground">{news.description}</p>
                  </CardContent>
                </button>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="h-[560px] md:h-[620px] flex flex-col overflow-hidden">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="border-b border-border px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-primary">Discussion</p>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-500 border border-emerald-500/30 rounded-full px-2 py-0.5">
                      Live
                    </span>
                  </div>
                  {selectedNews ? (
                    <>
                      <h2 className="text-2xl font-semibold">{selectedNews.title}</h2>
                      <p className="text-sm text-muted-foreground">{selectedNews.description}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No news selected yet.
                    </p>
                  )}
                  {!hasSupabaseConfig && (
                    <p className="text-xs text-muted-foreground">Configure Supabase to enable comments.</p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                  {commentsStatus === "loading" && (
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Loading messages...
                    </div>
                  )}
                  {commentsStatus === "error" && (
                    <div className="text-xs text-muted-foreground">
                      Could not load comments. Retrying now.
                    </div>
                  )}
                  {comments.map((comment) => {
                    const isMine = currentUserEmail && comment.author_email === currentUserEmail;
                    const displayName = comment.author_name || comment.author_email;
                    return (
                      <div
                        key={comment.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isMine
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/60 text-foreground"
                          }`}
                        >
                          <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                            {displayName}
                          </p>
                          {(comment.reply_to_name || comment.reply_to_preview) && (
                            <div className="rounded-md border border-border/40 bg-background/70 px-2 py-1 text-[11px] text-muted-foreground mb-2">
                              Replying to {comment.reply_to_name ?? "someone"}
                              {comment.reply_to_preview ? `: "${comment.reply_to_preview}"` : ""}
                            </div>
                          )}
                          <p>{comment.content}</p>
                          <p className="text-[10px] opacity-70 mt-2">
                            {new Date(comment.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-[11px] uppercase tracking-wider opacity-70 hover:opacity-100"
                            onClick={() => setReplyTarget(comment)}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {newComment.trim().length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      You are typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                  {!comments.length && commentsStatus === "ready" && (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>

                <div className="border-t border-border px-5 py-4">
                  <form onSubmit={onSubmitComment} className="space-y-2">
                    {replyTarget && (
                      <div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-xs">
                        <span>
                          Replying to {replyTarget.author_name || replyTarget.author_email}
                        </span>
                        <button
                          type="button"
                          className="uppercase tracking-wider text-[10px]"
                          onClick={() => setReplyTarget(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <textarea
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background resize-none"
                    />
                    <input
                      type="text"
                      value={commentHoneypot}
                      onChange={(event) => setCommentHoneypot(event.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between gap-3">
                      {commentMessage && (
                        <p className="text-xs text-muted-foreground">{commentMessage}</p>
                      )}
                      <Button type="submit" disabled={submittingComment || !hasSupabaseConfig}>
                        {submittingComment ? "Posting..." : "Send"}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
