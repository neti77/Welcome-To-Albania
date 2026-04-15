import { useState, useEffect, useRef, useLayoutEffect, type FormEvent } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowDown, Sun, Compass, Camera, Landmark, Mountain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CITIES } from "@/data/cities";
import { ALBANIA_MAP_PATH, projectAlbaniaPoint } from "@/data/albaniaMap";
import { supabase } from "@/lib/supabase";

const GUIDES = [
  { title: "Albanian Riviera", icon: Sun, description: "Crystal clear waters from Vlorë to Ksamil." },
  { title: "Ancient History", icon: Landmark, description: "Explore Illyrian ruins and Ottoman castles." },
  { title: "Accursed Mountains", icon: Mountain, description: "Breathtaking alpine landscapes in Theth and Valbonë." },
  { title: "Beautiful Destinations", icon: Camera, description: "Experience the unique 'Besa' hospitality." }
];

const NAV_ITEMS = [
  { label: "For Albanians", href: "/thashetheme-square" },
  { label: "For Visitors", href: "/visitors-guide" },
  { label: "Plan Your Trip", href: "/plan-your-trip" },
];

const GASTRONOMY = [
  {
    title: "Tavë Kosi",
    description: "Baked lamb and yogurt dish from Elbasan, one of Albania's signature foods.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Tav%C3%AB_kosi.jpg?width=900",
    source: "https://commons.wikimedia.org/wiki/File:Tav%C3%AB_kosi.jpg",
  },
  {
    title: "Fërgesë",
    description: "Traditional mix of peppers, tomatoes, onions, and cheese, often served warm with bread.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fergese-albanian-dish.jpg?width=900",
    source: "https://commons.wikimedia.org/wiki/File:Fergese-albanian-dish.jpg",
  },
  {
    title: "Byrek",
    description: "Flaky layered pastry with savory fillings, a staple in Albanian homes and bakeries.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Albanian_triangle_byrek.jpg?width=900",
    source: "https://commons.wikimedia.org/wiki/File:Albanian_triangle_byrek.jpg",
  },
];

const PLAN_VISIT_STEPS = [
  "Pick your route: coast, mountains, or a mixed trip.",
  "Choose your city bases and day trips.",
  "Lock in local food spots and sunset viewpoints.",
];

const DESTINATION_GALLERY = [
  {
    title: "Durres",
    image: "https://i.pinimg.com/736x/2a/7c/1c/2a7c1c78be29ffb82a9d58d8ab34e79c.jpg",
  },
  {
    title: "Theth",
    image: "https://i.pinimg.com/1200x/e7/df/0c/e7df0c578ba270ed52978dd17c04bc93.jpg",
  },
  {
    title: "Tropoje",
    image: "https://i.pinimg.com/736x/6f/40/e4/6f40e4fde39456c303759e6aa649c789.jpg",
  },
  {
    title: "Berat",
    image: "https://i.pinimg.com/736x/b4/ba/c0/b4bac0e46339a017dd9a49aabc5d533d.jpg",
  },
  {
    title: "Vlore",
    image: "https://i.pinimg.com/736x/77/b1/57/77b157d3fd5a20bbd3ccc9dddc15cb40.jpg",
  },
];

const DESTINATION_GRADIENTS = [
  "linear-gradient(120deg, rgba(16,30,45,0.92), rgba(72,42,36,0.85))",
  "linear-gradient(120deg, rgba(18,32,40,0.92), rgba(64,72,90,0.85))",
  "linear-gradient(120deg, rgba(20,28,24,0.92), rgba(54,78,58,0.85))",
  "linear-gradient(120deg, rgba(28,24,36,0.92), rgba(84,64,72,0.85))",
  "linear-gradient(120deg, rgba(12,26,34,0.92), rgba(42,82,72,0.85))",
];

const VINTAGE_GALLERY = [
  "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-vlore.jpg",
  "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-shkoder.jpg",
  "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-berat.jpg",
];

const IN_VIEW = { once: true, amount: 0.25 } as const;
const HERO_SLIDES = [
  "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/Tirana.jpeg",
  "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/city-berat.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/f/f8/The_City_and_the_Prokletije_from_the_castle.jpg",
];

type DestinationItem = {
  title: string;
  image: string;
};

function DestinationCard({
  item,
  onRef,
}: {
  item: DestinationItem;
  onRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={onRef} className="snap-center shrink-0 w-[300px] md:w-[450px] h-[500px] md:h-[600px]">
      <Card className="overflow-hidden h-full shadow-2xl border-white/10 bg-black/10">
        <div className="relative h-full">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-8 flex flex-col justify-end">
            <h3 className="text-2xl font-bold text-white">{item.title}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(CITIES[1]);
  const [weather, setWeather] = useState<{ temp: number; symbol: string } | null>(null);
  const [showNavButtons, setShowNavButtons] = useState(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterHoneypot, setNewsletterHoneypot] = useState("");
  const [newsletterFormStartedAt] = useState(() => Date.now());
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const destinationsRef = useRef<HTMLDivElement | null>(null);
  const destinationCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [destinationContainerWidth, setDestinationContainerWidth] = useState(0);
  const [carouselSidePadding, setCarouselSidePadding] = useState(210);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(0);
  const [carouselReady, setCarouselReady] = useState(false);
  const swipeStartXRef = useRef(0);
  const swipeStartScrollRef = useRef(0);
  const loopBoundsRef = useRef<{
    minEdge: number;
    maxEdge: number;
    jumpToStart: number;
    jumpToEnd: number;
  } | null>(null);
  const isJumpingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastJumpAtRef = useRef(0);
  const { scrollX } = useScroll({ container: destinationsRef });
  const [, navigate] = useLocation();

  // Weather Fetch Logic
  useEffect(() => {
    const fetchWeather = async () => {
      try {
       const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,weather_code&current_weather=true`
);
        const data = await response.json();
        
        const code = data.current_weather.weathercode;
        let symbol = "☀️"; 
        if (code >= 1 && code <= 3) symbol = "🌤️";
        if (code >= 45 && code <= 48) symbol = "🌫️";
        if (code >= 51 && code <= 67) symbol = "🌧️";
        if (code >= 71 && code <= 77) symbol = "❄️";
        if (code >= 80 && code <= 99) symbol = "⛈️";

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          symbol: symbol
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    };

    fetchWeather();
  }, [selectedCity]);

  useEffect(() => {
    const prefetchSources = [
      ...HERO_SLIDES,
      ...DESTINATION_GALLERY.map((item) => item.image),
      ...GASTRONOMY.map((item) => item.image),
      ...VINTAGE_GALLERY,
    ];

    const prefetch = () => {
      prefetchSources.forEach((src) => {
        const image = new Image();
        image.src = src;
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prefetch);
    } else {
      window.setTimeout(prefetch, 200);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowNavButtons(window.scrollY < 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const loopedDestinations =
    DESTINATION_GALLERY.length > 1
      ? [
          DESTINATION_GALLERY[DESTINATION_GALLERY.length - 1],
          ...DESTINATION_GALLERY,
          DESTINATION_GALLERY[0],
        ]
      : DESTINATION_GALLERY;

  useLayoutEffect(() => {
    const container = destinationsRef.current;
    if (!container) return;

    const measure = () => {
      const items = destinationCardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!items.length) return;
      setDestinationContainerWidth(container.clientWidth);
      const firstCard = items[0];
      if (firstCard) {
        setCarouselSidePadding(Math.round(firstCard.clientWidth / 2));
      }
      setCarouselReady(true);

      if (DESTINATION_GALLERY.length > 1 && items.length > 2) {
        const firstClone = items[0];
        const lastClone = items[items.length - 1];
        const firstReal = items[1];
        const lastReal = items[items.length - 2];
        loopBoundsRef.current = {
          minEdge: firstClone.offsetLeft,
          maxEdge: lastClone.offsetLeft + lastClone.offsetWidth,
          jumpToStart: firstReal.offsetLeft - 20,
          jumpToEnd: lastReal.offsetLeft - 20,
        };
        container.scrollTo({ left: firstReal.offsetLeft - 20, behavior: "instant" as ScrollBehavior });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(container);
    const readyTimer = window.setTimeout(measure, 200);

    const handlePointerDown = () => {
      isDraggingRef.current = true;
    };
    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("pointerdown", handlePointerDown, { passive: true });
    container.addEventListener("pointerup", handlePointerUp, { passive: true });
    container.addEventListener("pointercancel", handlePointerUp, { passive: true });
    container.addEventListener("touchstart", handlePointerDown, { passive: true });
    container.addEventListener("touchend", handlePointerUp, { passive: true });
    container.addEventListener("touchcancel", handlePointerUp, { passive: true });

    const handleSwipeStart = (event: PointerEvent | TouchEvent) => {
      const touch = "touches" in event ? event.touches[0] : (event as PointerEvent);
      swipeStartXRef.current = touch.clientX;
      swipeStartScrollRef.current = container.scrollLeft;
    };

    const handleSwipeEnd = (event: PointerEvent | TouchEvent) => {
      const touch = "changedTouches" in event ? event.changedTouches[0] : (event as PointerEvent);
      const deltaX = touch.clientX - swipeStartXRef.current;
      const scrollDelta = Math.abs(container.scrollLeft - swipeStartScrollRef.current);
      if (scrollDelta < 40) return;
      if (deltaX < -60) {
        scrollCarouselBy("next");
      } else if (deltaX > 60) {
        scrollCarouselBy("prev");
      }
    };

    container.addEventListener("touchstart", handleSwipeStart, { passive: true });
    container.addEventListener("touchend", handleSwipeEnd, { passive: true });
    container.addEventListener("pointerdown", handleSwipeStart, { passive: true });
    container.addEventListener("pointerup", handleSwipeEnd, { passive: true });

    return () => {
      window.clearTimeout(readyTimer);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("touchstart", handlePointerDown);
      container.removeEventListener("touchend", handlePointerUp);
      container.removeEventListener("touchcancel", handlePointerUp);
      container.removeEventListener("touchstart", handleSwipeStart);
      container.removeEventListener("touchend", handleSwipeEnd);
      container.removeEventListener("pointerdown", handleSwipeStart);
      container.removeEventListener("pointerup", handleSwipeEnd);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollCarouselBy = (direction: "prev" | "next") => {
    const container = destinationsRef.current;
    const items = destinationCardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!container || !items.length) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    items.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const targetIndex =
      direction === "next"
        ? Math.min(closestIndex + 1, items.length - 1)
        : Math.max(closestIndex - 1, 0);
    const target = items[targetIndex];
    const targetLeft = target.offsetLeft - (container.clientWidth - target.clientWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
  };

  useMotionValueEvent(scrollX, "change", (latest) => {
    const bounds = loopBoundsRef.current;
    if (!bounds || isJumpingRef.current || isDraggingRef.current || DESTINATION_GALLERY.length <= 1) return;
    if (!destinationContainerWidth) return;
    const buffer = 80;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastJumpAtRef.current < 250) return;

    if (latest + destinationContainerWidth >= bounds.maxEdge - buffer) {
      const container = destinationsRef.current;
      if (!container) return;
      isJumpingRef.current = true;
      lastJumpAtRef.current = now;
      const previousSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = "none";
      container.scrollTo({ left: bounds.jumpToStart, behavior: "instant" as ScrollBehavior });
      window.requestAnimationFrame(() => {
        container.style.scrollSnapType = previousSnap || "x mandatory";
        isJumpingRef.current = false;
      });
    } else if (latest <= bounds.minEdge + buffer) {
      const container = destinationsRef.current;
      if (!container) return;
      isJumpingRef.current = true;
      lastJumpAtRef.current = now;
      const previousSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = "none";
      container.scrollTo({ left: bounds.jumpToEnd, behavior: "instant" as ScrollBehavior });
      window.requestAnimationFrame(() => {
        container.style.scrollSnapType = previousSnap || "x mandatory";
        isJumpingRef.current = false;
      });
    }
  });

  useEffect(() => {
    const container = destinationsRef.current;
    if (!container) return;
    const total = loopedDestinations.length;
    const baseCount = DESTINATION_GALLERY.length;
    const toOriginalIndex = (idx: number) => {
      if (baseCount <= 1) return idx;
      if (idx === 0) return baseCount - 1;
      if (idx === total - 1) return 0;
      return idx - 1;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index ?? 0);
          setActiveDestinationIndex(toOriginalIndex(index));
        });
      },
      { root: container, threshold: 0.6 },
    );

    destinationCardRefs.current.forEach((node, idx) => {
      if (!node) return;
      node.dataset.index = String(idx);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [loopedDestinations.length]);

  const cycleHeroBackground = () => {
    setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const onNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newsletterHoneypot.trim()) {
      setNewsletterMessage("Thanks for joining. You're on the list.");
      return;
    }

    const submittedAfterMs = Date.now() - newsletterFormStartedAt;
    if (submittedAfterMs < 1200) {
      setNewsletterMessage("Could not subscribe right now. Please try again.");
      return;
    }

    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterMessage("Please enter your email.");
      return;
    }

    setNewsletterSubmitting(true);
    setNewsletterMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: newsletterHoneypot,
          submittedAfterMs,
        }),
      });

      if (!response.ok) {
        setNewsletterMessage("Could not subscribe right now. Please try again.");
        return;
      }

      setNewsletterMessage("Thanks for joining. You're on the list.");
      setNewsletterEmail("");
    } catch {
      setNewsletterMessage("Could not subscribe right now. Please try again.");
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={HERO_SLIDES[heroSlideIndex]}
              src={HERO_SLIDES[heroSlideIndex]}
              alt="Albania destination slideshow"
              className="w-full h-full object-cover brightness-[0.6]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div
          className={`absolute top-5 left-4 right-4 z-20 transition-all duration-300 md:hidden ${
            showNavButtons ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
          <nav
            className="flex items-center gap-2 overflow-x-auto whitespace-nowrap rounded-full border border-white/35 bg-black/35 backdrop-blur-md px-3 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 text-white/90 hover:text-white transition-colors border border-white/25 rounded-full px-3 py-1.5 text-xs"
              >
                {item.label}
              </Link>
            ))}
            {currentUserEmail ? (
              <Link
                href="/profile"
                className="shrink-0 text-white/90 hover:text-white transition-colors border border-white/25 rounded-full px-3 py-1.5 text-xs"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/auth"
                className="shrink-0 text-white/90 hover:text-white transition-colors border border-white/25 rounded-full px-3 py-1.5 text-xs"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>

        <div
          className={`absolute top-5 left-4 md:left-8 lg:left-16 z-20 transition-all duration-300 hidden md:block ${
            showNavButtons ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex items-center gap-2 md:gap-3 text-xs md:text-sm lg:text-base overflow-x-auto whitespace-nowrap">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/90 hover:text-white transition-colors border border-white/35 bg-black/35 backdrop-blur-md rounded-full px-4 py-2"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>

        <div
          className={`absolute top-5 right-4 md:right-8 lg:right-16 z-20 transition-all duration-300 hidden md:block ${
            showNavButtons ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2">
            {currentUserEmail ? (
              <Link
                href="/profile"
                className="text-white/90 hover:text-white transition-colors border border-white/35 bg-black/35 backdrop-blur-md rounded-full px-4 py-2 text-xs md:text-sm"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-white/90 hover:text-white transition-colors border border-white/35 bg-black/35 backdrop-blur-md rounded-full px-4 py-2 text-xs md:text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
        
        <div className="z-10 text-center px-4 flex flex-col items-center mt-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6"
          >
            Welcome to <span className="text-primary">Albania</span>
          </motion.h1>
          <Button onClick={cycleHeroBackground} className="bg-primary rounded-full px-8 py-6">
            Explore
          </Button>
        </div>

        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/80" />
        </motion.div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-24 px-4 md:px-8 lg:px-16 w-full bg-background">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-8 items-center lg:items-start">
          
          {/* Left: City Info Card */}
          <div className="w-full lg:w-[42%]">
            <h2 className="text-4xl font-serif font-bold mb-7 text-foreground">Cities</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border relative"
              >
                <img
                  src={selectedCity.image}
                  className="h-60 md:h-72 w-full object-cover"
                  alt={selectedCity.name}
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Weather Badge - This is where the weather shows up! */}
               {weather ? (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                  <span>{weather.symbol}</span>
                  <span>{weather.temp}°C</span>
                </div>
) : (
  <div className="absolute top-4 right-4 text-white">Loading...</div>
)}

                <div className="p-7">
                  <h3 className="text-3xl font-bold mb-3 text-foreground">{selectedCity.name}</h3>
                  <p className="text-base text-muted-foreground mb-5">{selectedCity.description}</p>
                  <Button
                    variant="outline"
                    className="px-6 py-5 text-base"
                    onClick={() => navigate(`/city/${selectedCity.id}`)}
                  >
                    Explore
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Map */}
          <div className="w-full lg:w-[58%] relative flex justify-center lg:justify-center items-center min-h-[520px]">
            <div className="relative w-full max-w-[300px] lg:max-w-[300px] aspect-[1/2] lg:translate-x-2">
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <div className="relative w-full h-full">
                  <svg
                    viewBox="0 0 100 200"
                    className="w-full h-full pointer-events-none drop-shadow-[0_0_16px_rgba(255,255,255,0.22)]"
                    fill="none"
                  >
                    <motion.path
                      d={ALBANIA_MAP_PATH}
                      stroke="hsl(var(--foreground))"
                      strokeWidth="0.95"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.9 }}
                      viewport={IN_VIEW}
                      transition={{ duration: 2.3, ease: "easeInOut" }}
                    />
                  </svg>

                  {CITIES.map((city, index) => {
                    const projected = projectAlbaniaPoint(city.lat, city.lon);
                    const isSelected = selectedCity.id === city.id;
                    return (
                    <motion.button
                      key={city.id}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={IN_VIEW}
                      transition={{ delay: index * 0.07, duration: 0.4 }}
                      onClick={() => setSelectedCity(city)}
                      className="absolute z-20 group -translate-x-1/2 -translate-y-1/2"
                      style={{
                        top: projected.top,
                        left: projected.left,
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full border border-white transition-all duration-300 ${
                          isSelected ? "bg-red-500 scale-150 shadow-[0_0_10px_red]" : "bg-red-600"
                        }`} />
                        {isSelected && (
                          <div className="absolute w-6 h-6 bg-red-500/30 rounded-full animate-ping" />
                        )}
                      </div>
                      <span
                        className={`absolute left-[14px] top-1/2 -translate-y-1/2 h-px bg-white/70 transition-all duration-300 ${
                          isSelected ? "w-3 opacity-100" : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-100"
                        }`}
                      />
                      <span className={`absolute left-7 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] transition-opacity whitespace-nowrap ${
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}>
                        {city.name}
                      </span>
                    </motion.button>
                  )})}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-background">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-serif font-bold mb-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW}
          >
            Gastronomy
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW}
            transition={{ delay: 0.08 }}
          >
            A taste of traditional Albanian food culture, from classic home dishes to bakery staples.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GASTRONOMY.map((dish, index) => (
              <motion.div
                key={dish.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={IN_VIEW}
                transition={{ delay: index * 0.1 }}
              >
              <Card className="overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = "https://zb3s1vzcpngfepj6.public.blob.vercel-storage.com/Tirana.jpeg";
                  }}
                />
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold mb-2">{dish.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{dish.description}</p>
                  <a
                    href={dish.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline underline-offset-2"
                  >
                    Image source: Wikimedia Commons
                  </a>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 px-4 md:px-8 lg:px-16 bg-secondary/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDestinationIndex}
            className="absolute inset-0"
            style={{ background: DESTINATION_GRADIENTS[activeDestinationIndex % DESTINATION_GRADIENTS.length] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/15" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.42) 75%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-serif font-bold mb-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW}
          >
            Destinations
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW}
            transition={{ delay: 0.08 }}
          >
            Explore main destinations and see what people said about them.
          </motion.p>
          <div
            ref={destinationsRef}
            className="flex gap-6 overflow-x-auto pb-12 pt-6 snap-x snap-mandatory overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              scrollSnapType: "x mandatory",
              scrollPaddingInline: "0px",
              paddingLeft: `calc(50% - ${carouselSidePadding}px)`,
              paddingRight: `calc(50% - ${carouselSidePadding}px)`,
              scrollSnapStop: "always",
              WebkitOverflowScrolling: "auto",
              overscrollBehaviorX: "contain",
            }}
          >
            {loopedDestinations.map((item, index) => (
              <DestinationCard
                key={`${item.title}-${index}`}
                item={item}
                onRef={(node) => {
                  if (node) {
                    destinationCardRefs.current[index] = node;
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-serif font-bold mb-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW}
          >
            KNOWN FOR
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUIDES.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={IN_VIEW}
                transition={{ delay: index * 0.08 }}
              >
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 text-center">
                  <guide.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h4 className="font-bold mb-2">{guide.title}</h4>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 lg:px-16 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Plan Your Visit</h2>
            <Button asChild className="w-fit">
              <Link href="/plan-your-trip">Plan the trip</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="relative pl-10">
              <motion.div
                className="absolute left-2 top-1 w-[2px] bg-primary/70 origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ height: "220px" }}
              />
              <div className="space-y-8">
                {PLAN_VISIT_STEPS.map((step, index) => (
                  <motion.div
                    key={step}
                    className="relative"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={IN_VIEW}
                    transition={{ delay: index * 0.12 }}
                  >
                    <span className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-primary/80 border border-primary/30" />
                    <p className="text-base md:text-lg">{index + 1}. {step}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative h-[360px]">
              {VINTAGE_GALLERY.map((image, index) => (
                <motion.img
                  key={image}
                  src={image}
                  alt={`Albania travel memory ${index + 1}`}
                  className="absolute w-[68%] h-[48%] object-cover rounded-md border border-white/20 shadow-xl"
                  loading="lazy"
                  decoding="async"
                  style={{
                    top: `${index * 22}%`,
                    left: `${index * 13}%`,
                    filter: "grayscale(0.55) sepia(0.35) contrast(1.05)",
                    transform: `rotate(${index === 1 ? "-4deg" : index === 2 ? "3deg" : "-1deg"})`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0a0a] text-white pt-16 pb-8 px-4 md:px-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Visit <span className="text-primary">Albania</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Helping you discover the last hidden corner of Europe. From the Accursed Mountains to the turquoise Ionian shores.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs text-primary">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">The Riviera</li>
              <li className="hover:text-white transition-colors cursor-pointer">Mountain Trails</li>
              <li className="hover:text-white transition-colors cursor-pointer">Local Cuisine</li>
            </ul>
              <h5 className="font-bold mt-6 mb-3 uppercase text-xs text-primary">Admin</h5>
            <ul className="space-y-0 space-x-0 text-sm text-gray-400">
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
            </div>
          
          
                  
             
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Live Status</h4>
            <div className="text-sm text-gray-400">
              <p>Tirana Time: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              <p>Local Temp: {weather?.temp ?? "--"}°C</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Get Updates</h4>
            <form className="space-y-2" onSubmit={onNewsletterSubmit}>
              <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                value={newsletterHoneypot}
                onChange={(event) => setNewsletterHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <Button
                type="submit"
                size="sm"
                disabled={newsletterSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                Join
              </Button>
            </div>
              {newsletterMessage && (
                <p className="text-xs text-gray-400">{newsletterMessage}</p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Visit Albania. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal#terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
