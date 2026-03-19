import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CITIES, CITY_DETAILS } from "@/data/cities";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type CityComment = {
  id: string;
  city_id: string;
  author_email: string;
  author_name?: string | null;
  reply_to_comment_id?: string | null;
  reply_to_email?: string | null;
  reply_to_name?: string | null;
  reply_to_preview?: string | null;
  content: string;
  created_at: string;
};

export default function CityDetails() {
  const [location] = useLocation();
  const cityId = decodeURIComponent(location.split("/")[2] || "");
  const city = CITIES.find((item) => item.id === cityId);
  const [comments, setComments] = useState<CityComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentHoneypot, setCommentHoneypot] = useState("");
  const [commentFormStartedAt] = useState(() => Date.now());
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [commentsPageSize] = useState(25);
  const [commentsStatus, setCommentsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [commentsRetryTick, setCommentsRetryTick] = useState(0);
  const [replyTarget, setReplyTarget] = useState<CityComment | null>(null);

  const loadComments = async (targetCityId: string, offset = 0, append = false) => {
    const supabaseClient = supabase;
    if (!supabaseClient) return;
    const fetchWithColumns = (columns: string) =>
      supabaseClient
        .from("city_comments")
        .select(columns)
        .eq("city_id", targetCityId)
        .order("created_at", { ascending: false })
        .range(offset, offset + commentsPageSize - 1);

    setCommentsLoading(true);
    setCommentsStatus("loading");
    const { data, error } = await fetchWithColumns(
      "id, city_id, author_email, author_name, reply_to_comment_id, reply_to_email, reply_to_name, reply_to_preview, content, created_at",
    );

    if (!error && data) {
      const next = data as unknown as CityComment[];
      setComments((current) => (append ? [...current, ...next] : next));
      setCommentsHasMore(next.length === commentsPageSize);
      setCommentsStatus("ready");
      setCommentsLoading(false);
      return;
    }

    const needsFallback =
      typeof error.message === "string" &&
      (error.message.includes("author_name") || error.message.includes("reply_to"));
    if (!needsFallback) return;

    const fallback = await fetchWithColumns(
      "id, city_id, author_email, content, created_at",
    );
    if (!fallback.error && fallback.data) {
      const next = fallback.data as unknown as CityComment[];
      setComments((current) => (append ? [...current, ...next] : next));
      setCommentsHasMore(next.length === commentsPageSize);
      setCommentsStatus("ready");
      setCommentsLoading(false);
      return;
    }
    setCommentsStatus("error");
    setCommentsLoading(false);
  };

  useEffect(() => {
    if (city) {
      setComments([]);
      setCommentsHasMore(true);
      setCommentsStatus("loading");
      setReplyTarget(null);
      void loadComments(city.id, 0, false);
    }
  }, [city?.id]);

  useEffect(() => {
    if (!city?.id || commentsStatus !== "error") return;
    const timer = window.setTimeout(() => {
      setCommentsRetryTick((tick) => tick + 1);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [commentsStatus, city?.id]);

  useEffect(() => {
    if (!city?.id || commentsStatus !== "error") return;
    void loadComments(city.id, 0, false);
  }, [commentsRetryTick, commentsStatus, city?.id]);

  const loadMoreComments = async () => {
    if (!city || commentsLoading || !commentsHasMore) return;
    await loadComments(city.id, comments.length, true);
  };

  const onSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !city) {
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

      const { error } = await supabase.from("city_comments").insert({
        city_id: city.id,
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

        const retry = await supabase.from("city_comments").insert({
          city_id: city.id,
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
          context_type: "city",
          context_id: city.id,
          message: body.slice(0, 160),
        });
      }

      setNewComment("");
      setCommentMessage("Comment posted.");
      setLastCommentAt(Date.now());
      setReplyTarget(null);
      await loadComments(city.id);
    } catch {
      setCommentMessage("Could not post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-xl w-full">
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="text-3xl font-bold">City Not Found</h1>
            <p className="text-muted-foreground">The city page you requested does not exist.</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const details = CITY_DETAILS[city.id];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <img src={city.image} alt={city.name} className="w-full h-full object-cover brightness-[0.55]" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 px-4 md:px-8 lg:px-16 flex flex-col justify-between py-8">
          <Button asChild variant="outline" className="w-fit bg-black/35 text-white border-white/40 hover:bg-black/50">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to map
            </Link>
          </Button>
          <div className="text-white max-w-3xl">
            <p className="text-sm uppercase tracking-[0.18em] text-white/80 mb-3">Explore Albania</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-2">{city.name}</h1>
            <p className="text-lg md:text-xl text-white/90">{details.tagline}</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-7">
              <h2 className="text-2xl font-bold mb-4">About {city.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{details.intro}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-7">
              <h3 className="text-xl font-bold mb-3">Quick Notes</h3>
              <p className="text-muted-foreground text-sm mb-2">Coordinates</p>
              <p className="font-medium mb-4">
                {city.lat.toFixed(4)}, {city.lon.toFixed(4)}
              </p>
              <p className="text-muted-foreground text-sm mb-2">Local tip</p>
              <p className="text-sm">{details.localTip}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardContent className="p-7">
              <h2 className="text-2xl font-bold mb-4">Top Highlights</h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {details.highlights.map((item) => (
                  <li key={item} className="rounded-xl border border-border p-4 text-sm bg-secondary/25">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardContent className="p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Community Comments</h2>
                {!hasSupabaseConfig && (
                  <p className="text-xs text-muted-foreground">
                    Configure Supabase to enable comments.
                  </p>
                )}
              </div>
              <form onSubmit={onSubmitComment} className="space-y-3">
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
                  placeholder="Share a tip for this city..."
                  rows={3}
                  className="border border-border rounded-md px-3 py-2 text-sm w-full bg-background"
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
                <Button type="submit" disabled={submittingComment || !hasSupabaseConfig}>
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </form>
              {commentMessage && (
                <p className="text-sm text-muted-foreground">{commentMessage}</p>
              )}
              <div className="space-y-2">
                {commentsStatus === "loading" && (
                  <p className="text-xs text-muted-foreground">Loading comments…</p>
                )}
                {commentsStatus === "error" && (
                  <p className="text-xs text-muted-foreground">Reconnecting…</p>
                )}
                {commentsHasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreComments}
                    disabled={commentsLoading}
                  >
                    {commentsLoading ? "Loading..." : "Load more comments"}
                  </Button>
                )}
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-border rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {(comment.author_name || comment.author_email)} ·{" "}
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                    {(comment.reply_to_name || comment.reply_to_preview) && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Replying to {comment.reply_to_name ?? "someone"}
                        {comment.reply_to_preview ? `: "${comment.reply_to_preview}"` : ""}
                      </p>
                    )}
                    <p className="text-sm">{comment.content}</p>
                    <button
                      type="button"
                      className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      onClick={() => setReplyTarget(comment)}
                    >
                      Reply
                    </button>
                  </div>
                ))}
                {!comments.length && (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
