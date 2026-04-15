import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/data/cities";
import { ALBANIA_MAP_PATH, projectAlbaniaPoint } from "@/data/albaniaMap";

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

const TRIP_SERVICES = [
  {
    title: "Hotels",
    description: "Book boutique stays or larger resorts based on your route.",
    url: "https://www.booking.com/",
    label: "Browse hotels",
  },
  {
    title: "Airbnb",
    description: "Find local apartments and seaside rentals.",
    url: "https://www.airbnb.com/",
    label: "Rent an Airbnb",
  },
  {
    title: "Car Rental",
    description: "Best for coast-to-mountain routes and flexible day trips.",
    url: "https://www.rentalcars.com/",
    label: "Compare rentals",
  },
];

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
        image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-berat.jpg",
      },
      {
        title: "Albania Official Tourism",
        excerpt:
          "Useful for regional updates, destination highlights, and official event information.",
        url: "https://albania.al/",
        source: "Official Albania Tourism",
        image: "/public/images/header-tirana-new.jpg",
      },
      {
        title: "Responsible Mountain Travel",
        excerpt:
          "Trail and mountain etiquette principles that help preserve highland routes for everyone.",
        url: "https://lnt.org/why/7-principles/",
        source: "Leave No Trace",
        image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-shkoder.jpg",
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
        image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-tirana.jpg",
      },
      {
        title: "IATA Travel Centre",
        excerpt:
          "Entry and transit requirement checks before departure.",
        url: "https://www.iatatravelcentre.com/",
        source: "IATA",
        image: "/public/images/header-tirana.jpg",
      },
      {
        title: "OpenStreetMap Albania",
        excerpt:
          "A reliable map base to inspect roads, terrain, and route alternatives.",
        url: "https://www.openstreetmap.org/relation/53292",
        source: "OpenStreetMap",
        image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-vlore.jpg",
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
        image: "/public/images/city-durres.jpg",
      },
      {
        title: "Meteoblue Climate Explorer",
        excerpt:
          "Useful for month-by-month weather patterns when picking travel windows.",
        url: "https://www.meteoblue.com/en/weather/historyclimate/climatemodelled/",
        source: "Meteoblue",
        image: "/public/images/city-gjirokaster.jpg",
      },
      {
        title: "UNESCO Albania Map",
        excerpt:
          "Anchor your itinerary around heritage locations for a stronger culture-focused trip.",
        url: "https://whc.unesco.org/en/statesparties/al",
        source: "UNESCO",
        image: "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-berat.jpg",
      },
    ],
  },
};

export default function HubPage() {
  const [location] = useLocation();
  const content = PAGE_CONTENT[location] ?? PAGE_CONTENT["/for-visitors"];
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [routeError, setRouteError] = useState<string>("");
  const [routeSummary, setRouteSummary] = useState<{
    distance: number;
    duration: number;
    legs: Array<{ from: string; to: string; distance: number; duration: number }>;
    steps: Array<{ instruction: string; distance: number; duration: number }>;
  } | null>(null);
  const [routeLine, setRouteLine] = useState<Array<{ x: number; y: number }>>([]);

  const selectedCityObjects = useMemo(
    () => CITIES.filter((city) => selectedCities.includes(city.id)),
    [selectedCities],
  );

  const toggleCity = (cityId: string) => {
    setSelectedCities((current) => {
      if (current.includes(cityId)) {
        return current.filter((id) => id !== cityId);
      }
      return [...current, cityId];
    });
  };

  const formatDistance = (meters: number) => {
    if (!Number.isFinite(meters)) return "--";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "--";
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours) return `${minutes} min`;
    return `${hours}h ${minutes}m`;
  };

  const buildRoute = async () => {
    setRouteError("");
    setRouteSummary(null);
    setRouteLine([]);
    if (selectedCityObjects.length < 2) {
      setRouteError("Pick at least two cities to build a route.");
      setRouteStatus("error");
      return;
    }

    setRouteStatus("loading");
    try {
      const coordinates = selectedCityObjects.map((city) => [city.lon, city.lat]);
      const response = await fetch("/api/ors/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRouteError(data?.message ?? "Could not build a route.");
        setRouteStatus("error");
        return;
      }

      const routeFeature = data?.features?.[0];
      const route = routeFeature?.properties;
      if (!route) {
        setRouteError(data?.message ?? "Route data is unavailable.");
        setRouteStatus("error");
        return;
      }

      const legs = Array.isArray(route.segments)
        ? route.segments.map((segment: { distance: number; duration: number }, index: number) => ({
            from: selectedCityObjects[index]?.name ?? "Stop",
            to: selectedCityObjects[index + 1]?.name ?? "Next stop",
            distance: segment.distance,
            duration: segment.duration,
          }))
        : [];

      const steps = Array.isArray(route.segments)
        ? route.segments.flatMap(
            (segment: { steps?: Array<{ instruction: string; distance: number; duration: number }> }) =>
              Array.isArray(segment.steps)
                ? segment.steps.map((step) => ({
                    instruction: step.instruction,
                    distance: step.distance,
                    duration: step.duration,
                  }))
                : [],
          )
        : [];

      const geometry = routeFeature?.geometry?.coordinates;
      if (Array.isArray(geometry)) {
        const projected = geometry.map((pair: [number, number]) => {
          const point = projectAlbaniaPoint(pair[1], pair[0]);
          return { x: point.x, y: point.y };
        });
        setRouteLine(projected);
      } else {
        setRouteLine([]);
      }

      setRouteSummary({
        distance: route.summary?.distance ?? 0,
        duration: route.summary?.duration ?? 0,
        legs,
        steps,
      });
      setRouteStatus("ready");
    } catch {
      setRouteError("Could not build a route.");
      setRouteStatus("error");
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

      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-14 space-y-10">
        <section>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{content.subtitle}</p>
        </section>

        

        {location === "/plan-your-trip" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Build Your Route</h2>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Tap cities on the map to create a custom route. We’ll estimate travel time and distance between each stop.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
              <div className="relative rounded-2xl border border-border/60 bg-secondary/10 p-8 overflow-hidden h-[520px] md:h-[620px]">
                <svg viewBox="0 0 100 200" className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)]">
                  <path
                    d={ALBANIA_MAP_PATH}
                    fill="rgba(255,255,255,0.08)"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="0.4"
                  />
                  {routeLine.length > 1 && (
                    <polyline
                      points={routeLine.map((point) => `${point.x},${point.y}`).join(" ")}
                      fill="none"
                      stroke="rgba(244,63,94,0.85)"
                      strokeWidth="0.6"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}
                  {CITIES.map((city) => {
                    const point = projectAlbaniaPoint(city.lat, city.lon);
                    const selected = selectedCities.includes(city.id);
                    return (
                      <circle
                        key={city.id}
                        cx={point.x}
                        cy={point.y}
                        r={selected ? 1.4 : 1.2}
                        fill={selected ? "rgb(244 63 94)" : "rgba(255,255,255,0.85)"}
                        stroke={selected ? "rgb(244 63 94)" : "rgba(255,255,255,0.7)"}
                        strokeWidth="0.4"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleCity(city.id)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute bottom-4 left-4 right-4 text-xs text-muted-foreground">
                  Selected: {selectedCityObjects.length} / {CITIES.length}
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-lg font-semibold">Selected Stops</h3>
                    {!selectedCityObjects.length && (
                      <p className="text-sm text-muted-foreground">
                        Pick at least two cities to build a route.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {selectedCityObjects.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => toggleCity(city.id)}
                          className="rounded-full border border-primary/40 px-3 py-1 text-xs"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={buildRoute}
                      disabled={routeStatus === "loading"}
                      className="w-full"
                    >
                      {routeStatus === "loading" ? "Building route..." : "Generate tour"}
                    </Button>
                    {routeStatus === "error" && (
                      <p className="text-xs text-rose-500">{routeError}</p>
                    )}
                  </CardContent>
                </Card>

                {routeSummary && (
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold">Route Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Total distance {formatDistance(routeSummary.distance)} · Total time{" "}
                        {formatDuration(routeSummary.duration)}
                      </p>
                      <div className="space-y-2 text-sm">
                        {routeSummary.legs.map((leg) => (
                          <div key={`${leg.from}-${leg.to}`} className="flex items-center justify-between">
                            <span>{leg.from} → {leg.to}</span>
                            <span className="text-muted-foreground">
                              {formatDistance(leg.distance)} · {formatDuration(leg.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {routeSummary?.steps?.length ? (
                  <Card>
                    <CardContent className="p-5 space-y-3 max-h-[320px] overflow-y-auto">
                      <h3 className="text-lg font-semibold">Turn-by-Turn</h3>
                      <ol className="space-y-2 text-sm">
                        {routeSummary.steps.map((step, index) => (
                          <li key={`${step.instruction}-${index}`} className="flex gap-3">
                            <span className="text-xs text-muted-foreground w-8">{index + 1}.</span>
                            <div className="flex-1">
                              <p>{step.instruction}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistance(step.distance)} · {formatDuration(step.duration)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {location === "/plan-your-trip" && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Book Your Stay</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRIP_SERVICES.map((service) => (
                <Card key={service.title}>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline underline-offset-2"
                    >
                      {service.label}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
