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
    title: "North Albania Trails Watch",
    description:
      "Locals are sharing updates on trail conditions, signage refreshes, and access notes for hikers.",
    imageUrl: "/src/assets/images/city-shkoder.jpg",
  },
  {
    id: "coastal-renewal",
    title: "Riviera Weekender Pulse",
    description:
      "A rolling thread on beachfront cleanups, sunset spots, and quiet coves opening up.",
    imageUrl: "/src/assets/images/city-vlore.jpg",
  },
  {
    id: "heritage-events",
    title: "Heritage Night Walks",
    description:
      "Residents are highlighting evening openings, castle strolls, and guide-led tours.",
    imageUrl: "/src/assets/images/city-berat.jpg",
  },
  {
    id: "capital-chatter",
    title: "Tirana City Chatter",
    description:
      "Fresh talk on new cafes, pop-up markets, and city events worth catching this week.",
    imageUrl: "/src/assets/images/city-tirana.jpg",
  },
];

export default function ThashethemeSquarePage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(DEFAULT_NEWS_ITEMS);
  const [selectedNews, setSelectedNews] = useState(DEFAULT_NEWS_ITEMS[0]);
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
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsPageSize] = useState(30);
  const [minimumCommentsToShow, setMinimumCommentsToShow] = useState(10);
  const [commentsStatus, setCommentsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [commentsRetryTick, setCommentsRetryTick] = useState(0);
  const [replyTarget, setReplyTarget] = useState<NewsComment | null>(null);
  const commentsCacheTtlMs = 5 * 60 * 1000;

  const loadComments = async (newsId: string, offset = 0, append = false) => {
    const supabaseClient = supabase;
    if (!supabaseClient) return;
    const existing = comments;
    const fetchWithColumns = (columns: string) =>
      supabaseClient
        .from("news_comments")
        .select(columns)
        .eq("news_id", newsId)
        .order("created_at", { ascending: false })
        .range(offset, offset + commentsPageSize - 1);

    if (!append && offset === 0) {
      try {
        const cacheKey = `news_comments_cache_${newsId}`;
        const cachedRaw = window.localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as {
            updatedAt: number;
            comments: NewsComment[];
          };
          if (Date.now() - cached.updatedAt < commentsCacheTtlMs) {
            setComments(cached.comments);
            setCommentsStatus("ready");
          }
        }
      } catch {
        // ignore cache errors
      }
    }

    setCommentsLoading(true);
    setCommentsStatus("loading");
    const { data, error } = await fetchWithColumns(
      "id, news_id, author_email, author_name, reply_to_comment_id, reply_to_email, reply_to_name, reply_to_preview, content, created_at",
    );

    if (!error && data) {
      const batch = data as unknown as NewsComment[];
      const ordered = batch.slice().reverse();
      const merged = append ? [...ordered, ...existing] : ordered;
      setComments(merged);
      setCommentsHasMore(batch.length === commentsPageSize);
      if (!append && ordered.length < minimumCommentsToShow && batch.length > 0 && offset === 0) {
        void loadComments(newsId, ordered.length, true);
      } else {
        setCommentsStatus("ready");
      }
      try {
        if (!append && offset === 0) {
          const cacheKey = `news_comments_cache_${newsId}`;
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({ updatedAt: Date.now(), comments: merged }),
          );
        }
      } catch {
        // ignore cache errors
      }
      setCommentsLoading(false);
      return;
    }

    const needsFallback =
      typeof error.message === "string" &&
      (error.message.includes("author_name") || error.message.includes("reply_to"));
    if (!needsFallback) return;

    const fallback = await fetchWithColumns(
      "id, news_id, author_email, content, created_at",
    );
    if (!fallback.error && fallback.data) {
      const batch = fallback.data as unknown as NewsComment[];
      const ordered = batch.slice().reverse();
      const merged = append ? [...ordered, ...existing] : ordered;
      setComments(merged);
      setCommentsHasMore(batch.length === commentsPageSize);
      if (!append && ordered.length < minimumCommentsToShow && batch.length > 0 && offset === 0) {
        void loadComments(newsId, ordered.length, true);
      } else {
        setCommentsStatus("ready");
      }
      try {
        if (!append && offset === 0) {
          const cacheKey = `news_comments_cache_${newsId}`;
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({ updatedAt: Date.now(), comments: merged }),
          );
        }
      } catch {
        // ignore cache errors
      }
      setCommentsLoading(false);
      return;
    }
    setCommentsStatus("error");
    setCommentsLoading(false);
  };

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch("/api/news");
        const data = await response.json();
        const items = Array.isArray(data?.items) ? (data.items as NewsItem[]) : [];
        if (items.length) {
          setNewsItems(items);
          setSelectedNews(items[0]);
        }
      } catch {
        setNewsItems(DEFAULT_NEWS_ITEMS);
      }
    };
    void loadNews();
  }, []);

  useEffect(() => {
    if (selectedNews?.id) {
      setComments([]);
      setCommentsHasMore(true);
      setCommentsStatus("loading");
      setReplyTarget(null);
      void loadComments(selectedNews.id, 0, false);
    }
  }, [selectedNews?.id]);

  useEffect(() => {
    if (!selectedNews?.id) return;
    if (comments.length >= minimumCommentsToShow || (!commentsHasMore && comments.length > 0)) {
      setCommentsStatus("ready");
    }
  }, [comments.length, commentsHasMore, minimumCommentsToShow, selectedNews?.id]);

  useEffect(() => {
    if (!selectedNews?.id || commentsStatus !== "error") return;
    const timer = window.setTimeout(() => {
      setCommentsRetryTick((tick) => tick + 1);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [commentsStatus, selectedNews?.id]);

  useEffect(() => {
    if (!selectedNews?.id || commentsStatus !== "error") return;
    void loadComments(selectedNews.id, 0, false);
  }, [commentsRetryTick, commentsStatus, selectedNews?.id]);

  const loadMoreComments = async () => {
    if (!selectedNews?.id || commentsLoading || !commentsHasMore) return;
    await loadComments(selectedNews.id, comments.length, true);
  };

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
    if (!supabaseClient) return;
    const channel = supabaseClient
      .channel(`news-comments-${selectedNews.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "news_comments",
          filter: `news_id=eq.${selectedNews.id}`,
        },
        (payload) => {
          const next = payload.new as NewsComment;
          setComments((current) => {
            if (current.some((comment) => comment.id === next.id)) {
              return current;
            }
            return [...current, next];
          });
        }
      )
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [selectedNews.id]);

  useEffect(() => {
    if (comments.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [comments, selectedNews.id]);

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
      await loadComments(selectedNews.id);
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
            {newsItems.map((news) => (
              <Card
                key={news.id}
                className={`overflow-hidden transition-all ${
                  selectedNews.id === news.id ? "border-primary/40 shadow-lg" : "border-border"
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
                  <h2 className="text-2xl font-semibold">{selectedNews.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedNews.description}</p>
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
                      Reconnecting… Retrying now.
                    </div>
                  )}
                  {commentsHasMore && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMoreComments}
                        disabled={commentsLoading}
                      >
                        {commentsLoading ? "Loading..." : "Load older messages"}
                      </Button>
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
                  {!comments.length && commentsStatus !== "loading" && (
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
