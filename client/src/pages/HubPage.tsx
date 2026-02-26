import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_CONTENT: Record<
  string,
  { title: string; subtitle: string; points: string[]; futureNote: string }
> = {
  "/for-albanians": {
    title: "For Albanians",
    subtitle: "Local resources, national events, and tools for everyday travel and discovery inside Albania.",
    points: [
      "Weekend ideas by region and season",
      "Community highlights and local initiatives",
      "Domestic travel updates and practical tips",
    ],
    futureNote: "Future direction: open community blog submissions from Albanian writers and creators.",
  },
  "/for-visitors": {
    title: "For Visitors",
    subtitle: "A practical starter guide for first-time travelers to Albania.",
    points: [
      "What to pack and when to visit",
      "City-to-city route suggestions",
      "Culture and etiquette basics for a smooth trip",
    ],
    futureNote: "Future direction: visitor stories and curated travel blogs from recent guests.",
  },
  "/whats-new": {
    title: "What's New",
    subtitle: "Latest additions, destination updates, and new features in the platform.",
    points: [
      "New city spotlights and refreshed guides",
      "Upcoming events and seasonal recommendations",
      "Platform improvements and roadmap snapshots",
    ],
    futureNote: "Future direction: timeline-based blog feed with editor and community posts.",
  },
  "/plan-your-trip": {
    title: "Plan Your Trip",
    subtitle: "Build your Albania itinerary with city picks, timing ideas, and route logic.",
    points: [
      "Trip planner suggestions by length (3, 5, 7+ days)",
      "Mountain, culture, and coastline route mixes",
      "Checklist for transport, stays, and day plans",
    ],
    futureNote: "Future direction: personalized planner plus travel blog recommendations by destination.",
  },
};

export default function HubPage() {
  const [location] = useLocation();
  const content = PAGE_CONTENT[location] ?? PAGE_CONTENT["/for-visitors"];

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

      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-14">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{content.title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-10">{content.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {content.points.map((point) => (
            <Card key={point}>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed">{point}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/40 bg-secondary/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Future Blog Direction</h2>
            <p className="text-muted-foreground">{content.futureNote}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
