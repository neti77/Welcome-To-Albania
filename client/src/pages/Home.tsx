import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, MapPin, Compass, Sun, Camera, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// City Data
const CITIES = [
  {
    id: "shkoder",
    name: "Shkodër",
    description: "One of the oldest and most historic places in Albania, Shkodër is a cultural center featuring the legendary Rozafa Castle, offering panoramic views of the lake and surrounding mountains.",
    image: "/src/assets/images/city-shkoder.jpg",
    position: { top: "15%", left: "30%" }
  },
  {
    id: "tirana",
    name: "Tirana",
    description: "The vibrant capital city of Albania, known for its colorful architecture and lively atmosphere. Pastel buildings surround the city's focal point, Skanderbeg Square.",
    image: "/src/assets/images/city-tirana.jpg",
    position: { top: "35%", left: "45%" }
  },
  {
    id: "berat",
    name: "Berat",
    description: "Known as the 'City of a Thousand Windows', Berat is a UNESCO World Heritage site with a remarkably well-preserved Ottoman historical center and a stunning castle.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "55%", left: "40%" }
  },
  {
    id: "vlore",
    name: "Vlorë",
    description: "Where the Adriatic meets the Ionian Sea. Vlorë is a historic coastal city famous for its beautiful riviera, stunning beaches, and rich history.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "65%", left: "25%" }
  },
  {
    id: "gjirokaster",
    name: "Gjirokastër",
    description: "A magical 'City of Stone' with steep cobblestone streets, majestic slate-roofed houses, and a massive fortress. A proud UNESCO World Heritage site.",
    image: "/src/assets/images/city-gjirokaster.jpg",
    position: { top: "75%", left: "55%" }
  }
];

const GUIDES = [
  {
    title: "Albanian Riviera",
    icon: Sun,
    description: "Crystal clear waters, hidden coves, and vibrant nightlife stretching from Vlorë to Ksamil."
  },
  {
    title: "Ancient History",
    icon: Landmark,
    description: "Explore Illyrian ruins, Roman amphitheatres, and Ottoman castles preserved through time."
  },
  {
    title: "Accursed Mountains",
    icon: Compass,
    description: "Breathtaking alpine landscapes perfect for hiking, featuring traditional guest houses in Theth and Valbonë."
  },
  {
    title: "Cultural Heritage",
    icon: Camera,
    description: "Experience the unique 'Besa' hospitality, polyphonic singing, and rich culinary traditions."
  }
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(CITIES[1]); // Default to Tirana

  const scrollToExplore = () => {
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/header-tirana-new.jpg" 
            alt="Tirana Skyline" 
            className="w-full h-full object-cover brightness-[0.6]"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="z-10 text-center px-4 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-8 drop-shadow-lg"
          >
            Welcome to <span className="text-primary">Albania</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-medium transition-all shadow-lg hover:shadow-primary/50"
              onClick={scrollToExplore}
              data-testid="button-start-journey"
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 cursor-pointer animate-bounce"
          onClick={scrollToExplore}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
        >
          <ArrowDown className="w-8 h-8 text-white/80" />
        </motion.div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-24 px-4 md:px-8 lg:px-16 w-full bg-background">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left: City Info (Smaller part) */}
          <div className="w-full lg:w-1/3 flex flex-col justify-start">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Destinations</h2>
              <p className="text-muted-foreground text-base">Select a city on the map to explore.</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border"
              >
                <div className="h-48 sm:h-56 relative overflow-hidden">
                  <img 
                    src={selectedCity.image} 
                    alt={selectedCity.name} 
                    className="w-full h-full object-cover"
                    data-testid={`img-city-${selectedCity.id}`}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-3" data-testid={`text-city-name-${selectedCity.id}`}>
                    {selectedCity.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-6" data-testid={`text-city-desc-${selectedCity.id}`}>
                    {selectedCity.description}
                  </p>
                  <Button variant="outline" size="sm" className="rounded-full px-5" data-testid={`button-plan-${selectedCity.id}`}>
                    Plan Trip
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Map (Larger part) */}
          <div className="w-full lg:w-2/3 relative flex flex-col items-center">
            <div className="relative w-full max-w-[600px] aspect-[4/5] bg-secondary/20 rounded-[2rem] border border-border/30 shadow-2xl overflow-hidden flex items-center justify-center">
              {/* Actual Map Path of Albania */}
              <svg viewBox="0 0 400 600" className="absolute inset-0 w-full h-full text-secondary/40 p-10" fill="currentColor">
                <path d="M185 35 C170 45, 155 40, 140 55 C125 70, 135 90, 130 110 C125 130, 100 145, 95 165 C90 185, 105 205, 100 225 C95 245, 80 260, 85 285 C90 310, 110 330, 115 355 C120 380, 110 405, 120 430 C130 455, 155 460, 180 470 C205 480, 230 500, 255 495 C280 490, 300 460, 315 440 C330 420, 335 390, 330 365 C325 340, 310 320, 320 295 C330 270, 345 245, 340 220 C335 195, 315 180, 310 155 C305 130, 320 100, 305 80 C290 60, 260 55, 240 45 C220 35, 200 25, 185 35 Z" />
              </svg>

              {/* Map Points */}
              {CITIES.map((city) => (
                <div
                  key={city.id}
                  className={`map-point ${selectedCity.id === city.id ? 'active' : ''}`}
                  style={{ top: city.position.top, left: city.position.left }}
                  onClick={() => setSelectedCity(city)}
                  data-testid={`map-point-${city.id}`}
                >
                  <span className="map-point-label">{city.name}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* Travel Guide Section */}
      <section className="py-24 px-4 md:px-8 bg-secondary/50 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Travel Guide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Everything you need to know for the perfect Albanian adventure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUIDES.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-card hover:shadow-xl transition-shadow duration-300 border-none">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                      <guide.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold mb-3">{guide.title}</h4>
                    <p className="text-muted-foreground">{guide.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 text-center border-t-4 border-primary">
        <h2 className="text-3xl font-serif font-bold mb-4">Albania</h2>
        <p className="text-background/70 max-w-md mx-auto mb-8">Go your own way. Experience the undiscovered beauty of the Mediterranean.</p>
        <p className="text-sm text-background/50">© {new Date().getFullYear()} Visit Albania. All rights reserved.</p>
      </footer>
    </div>
  );
}
