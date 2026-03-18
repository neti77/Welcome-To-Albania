import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sun, Compass, Camera, Landmark } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CITIES } from "@/data/cities";
import { ALBANIA_MAP_PATH, projectAlbaniaPoint } from "@/data/albaniaMap";
import { supabase } from "@/lib/supabase";

const GUIDES = [
  { title: "Albanian Riviera", icon: Sun, description: "Crystal clear waters from Vlorë to Ksamil." },
  { title: "Ancient History", icon: Landmark, description: "Explore Illyrian ruins and Ottoman castles." },
  { title: "Accursed Mountains", icon: Compass, description: "Breathtaking alpine landscapes in Theth and Valbonë." },
  { title: "Cultural Heritage", icon: Camera, description: "Experience the unique 'Besa' hospitality." }
];

const NAV_ITEMS = [
  { label: "For Albanians", href: "/thashetheme-square" },
  { label: "For Visitors", href: "/visitors-guide" },
  { label: "What's New", href: "/whats-new" },
  { label: "Plan Your Trip", href: "/plan-your-trip" },
];

const GASTRONOMY = [
  {
    title: "Tavë Kosi",
    description: "Baked lamb and yogurt dish from Elbasan, one of Albania's signature foods.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Tav%C3%AB_kosi.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Tav%C3%AB_kosi.jpg",
  },
  {
    title: "Fërgesë",
    description: "Traditional mix of peppers, tomatoes, onions, and cheese, often served warm with bread.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fergese-albanian-dish.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Fergese-albanian-dish.jpg",
  },
  {
    title: "Byrek",
    description: "Flaky layered pastry with savory fillings, a staple in Albanian homes and bakeries.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Albanian_triangle_byrek.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Albanian_triangle_byrek.jpg",
  },
];

const PLAN_VISIT_STEPS = [
  "Pick your route: coast, mountains, or a mixed trip.",
  "Choose your city bases and day trips.",
  "Lock in local food spots and sunset viewpoints.",
];

const VINTAGE_GALLERY = [
  "/src/assets/images/city-vlore.jpg",
  "/src/assets/images/city-shkoder.jpg",
  "/src/assets/images/city-berat.jpg",
];

const IN_VIEW = { once: true, amount: 0.25 } as const;
const HERO_SLIDES = Array.from(
  new Set([
    "/src/assets/images/header-tirana-new.jpg",
    ...CITIES.map((city) => city.image),
  ]),
);

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
            <h2 className="text-4xl font-serif font-bold mb-7 text-foreground">Destinations</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border relative"
              >
                <img src={selectedCity.image} className="h-60 md:h-72 w-full object-cover" alt={selectedCity.name} />
                
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
        <div className="max-w-7xl mx-auto">
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
                  onError={(event) => {
                    event.currentTarget.src = "/src/assets/images/header-tirana-new.jpg";
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-10">Plan Your Visit</h2>
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
