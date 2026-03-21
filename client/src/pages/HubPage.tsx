import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Article = {
  title: string;
  excerpt: string;
  url: string;
  source: string;
  image: string;
};

type PageContent = {
  title: string;
  subtitle: string;
  quickGuide: string[];
  articles: Article[];
};

const PAGE_CONTENT: Record<string, PageContent> = {
  "/for-albanians": {
    title: "For Albanians",
    subtitle:
      "Practical local inspiration: short trips, seasonal ideas, and destination refreshers across the country.",
    quickGuide: [
      "2-day escapes: coast, mountain, and heritage versions",
      "Shoulder-season picks for fewer crowds and better prices",
      "Weekend route templates from Tirana, Shkodër, and Korçë",
    ],
    articles: [
      {
        title: "UNESCO Sites in Albania",
        excerpt:
          "A concise reference for heritage destinations you can build weekend routes around.",
        url: "https://whc.unesco.org/en/statesparties/al",
        source: "UNESCO World Heritage Centre",
        image: "/src/assets/images/city-berat.jpg",
      },
      {
        title: "Albania Official Tourism",
        excerpt:
          "Useful for regional updates, destination highlights, and official event information.",
        url: "https://albania.al/",
        source: "Official Albania Tourism",
        image: "/src/assets/images/header-tirana-new.jpg",
      },
      {
        title: "Responsible Mountain Travel",
        excerpt:
          "Trail and mountain etiquette principles that help preserve highland routes for everyone.",
        url: "https://lnt.org/why/7-principles/",
        source: "Leave No Trace",
        image: "/src/assets/images/city-shkoder.jpg",
      },
    ],
  },
  "/for-visitors": {
    title: "For Visitors",
    subtitle:
      "A clean starting point for first-time travelers: entry basics, safety, logistics, and route planning.",
    quickGuide: [
      "First-timer sequence: Tirana -> heritage -> coast or Alps",
      "How many days to allocate by region",
      "What to expect with roads, timing, and transit",
    ],
    articles: [
      {
        title: "Albania Travel Advice",
        excerpt:
          "Current official guidance on safety, practicalities, and common travel considerations.",
        url: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Albania.html",
        source: "U.S. Department of State",
        image: "/src/assets/images/city-tirana.jpg",
      },
      {
        title: "IATA Travel Centre",
        excerpt:
          "Entry and transit requirement checks before departure.",
        url: "https://www.iatatravelcentre.com/",
        source: "IATA",
        image: "/src/assets/images/header-tirana.jpg",
      },
      {
        title: "OpenStreetMap Albania",
        excerpt:
          "A reliable map base to inspect roads, terrain, and route alternatives.",
        url: "https://www.openstreetmap.org/relation/53292",
        source: "OpenStreetMap",
        image: "/src/assets/images/city-vlore.jpg",
      },
    ],
  },
  "/whats-new": {
    title: "What's New",
    subtitle:
      "Fresh platform updates and timely travel context so returning visitors always find something new.",
    quickGuide: [
      "Recently added city pages and map refinements",
      "Upcoming content: blog stories + curated route drops",
      "Roadmap focus: practical travel tools over filler content",
    ],
    articles: [
      {
        title: "Open-Meteo Docs",
        excerpt:
          "The weather source behind destination cards, useful if you want to understand forecast data quality.",
        url: "https://open-meteo.com/en/docs",
        source: "Open-Meteo",
        image: "/src/assets/images/city-tirana.jpg",
      },
      {
        title: "geoBoundaries Project",
        excerpt:
          "Boundary-data reference used for accurate country geometry and mapping quality.",
        url: "https://www.geoboundaries.org/",
        source: "geoBoundaries",
        image: "/src/assets/images/city-shkoder.jpg",
      },
      {
        title: "Wikimedia Commons Albania",
        excerpt:
          "A broad media source for historical imagery and destination references.",
        url: "https://commons.wikimedia.org/wiki/Category:Albania",
        source: "Wikimedia Commons",
        image: "/src/assets/images/city-berat.jpg",
      },
    ],
  },
  "/plan-your-trip": {
    title: "Plan Your Trip",
    subtitle:
      "Turn ideas into a real itinerary with practical timing, route logic, and destination tradeoffs.",
    quickGuide: [
      "3-day, 5-day, and 8-day route templates",
      "Coast-vs-mountain pacing guide",
      "Pack, transport, and day-structure checklist",
    ],
    articles: [
      {
        title: "Rome2Rio Route Planning",
        excerpt:
          "Quickly compare transport routes and transfer options between key destinations.",
        url: "https://www.rome2rio.com/",
        source: "Rome2Rio",
        image: "/src/assets/images/city-durres.jpg",
      },
      {
        title: "Meteoblue Climate Explorer",
        excerpt:
          "Useful for month-by-month weather patterns when picking travel windows.",
        url: "https://www.meteoblue.com/en/weather/historyclimate/climatemodelled/",
        source: "Meteoblue",
        image: "/src/assets/images/city-gjirokaster.jpg",
      },
      {
        title: "UNESCO Albania Map",
        excerpt:
          "Anchor your itinerary around heritage locations for a stronger culture-focused trip.",
        url: "https://whc.unesco.org/en/statesparties/al",
        source: "UNESCO",
        image: "/src/assets/images/city-berat.jpg",
      },
    ],
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

      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-14 space-y-10">
        <section>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{content.subtitle}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.quickGuide.map((point) => (
              <Card key={point}>
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed">{point}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Short Reads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.articles.map((article) => (
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
