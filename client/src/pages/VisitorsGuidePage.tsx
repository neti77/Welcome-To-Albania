import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Resource = {
  title: string;
  excerpt: string;
  url: string;
  source: string;
  image: string;
};

const QUICK_START = [
  {
    title: "Entry & documents",
    body: "Check entry rules, passport validity, and insurance requirements before booking.",
  },
  {
    title: "Timing your trip",
    body: "Coast shines late spring to early fall; mountains feel best from June to September.",
  },
  {
    title: "Route logic",
    body: "Pick 2-3 hubs and build day trips to avoid long daily drives.",
  },
];

const TRAVEL_NOTES = [
  {
    title: "Cash + cards",
    body: "Carry some cash for villages and small cafés; cards are more common in cities.",
  },
  {
    title: "Local transport",
    body: "Use buses for budget routes and rentals for remote areas or alpine access.",
  },
  {
    title: "Language",
    body: "English is common in tourist zones; basic greetings go a long way elsewhere.",
  },
  {
    title: "Stay style",
    body: "Mix a boutique city stay with guesthouses in the Alps or coastal villages.",
  },
];

const RESOURCES: Resource[] = [
  {
    title: "Albania Travel Advisory",
    excerpt: "Official safety guidance and entry notes for U.S. travelers.",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/albania-travel-advisory.html",
    source: "U.S. Department of State",
    image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-tirana.jpg",
  },
  {
    title: "UNESCO Albania Heritage",
    excerpt: "World Heritage entries to anchor culture-heavy itineraries.",
    url: "https://whc.unesco.org/en/statesparties/al",
    source: "UNESCO World Heritage Centre",
    image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-berat.jpg",
  },
  {
    title: "Rome2Rio Trip Planner",
    excerpt: "Compare routes, transfers, and transport options between cities.",
    url: "https://www.rome2rio.com/",
    source: "Rome2Rio",
    image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-vlore.jpg",
  },
];

export default function VisitorsGuidePage() {
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

      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-14 space-y-10">
        <section className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">Visitors Guide</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A clean starting point for first-time travelers: practical planning,
            routes that make sense, and the best sources to double-check before you go.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUICK_START.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Travel Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRAVEL_NOTES.map((note) => (
              <Card key={note.title}>
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold">{note.title}</h3>
                  <p className="text-sm text-muted-foreground">{note.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Short Reads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESOURCES.map((article) => (
              <Card
                key={article.title}
                className="border-primary/20 overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold leading-snug">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                  <p className="text-xs uppercase tracking-wider text-primary">{article.source}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline underline-offset-2"
                  >
                    Read source
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
