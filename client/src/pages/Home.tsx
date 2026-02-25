import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sun, Compass, Camera, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// City Data with corrected geographic coordinates for the real outline map
const CITIES = [
  {
    id: "shkoder",
    name: "Shkodër",
    description: "One of the oldest and most historic places in Albania, Shkodër is a cultural center featuring the legendary Rozafa Castle.",
    image: "/src/assets/images/city-shkoder.jpg",
    position: { top: "14%", left: "37%" }
  },
  {
    id: "tirana",
    name: "Tirana",
    description: "The vibrant capital city of Albania, known for its colorful architecture and lively atmosphere.",
    image: "/src/assets/images/city-tirana.jpg",
    position: { top: "38%", left: "47%" }
  },
  {
    id: "berat",
    name: "Berat",
    description: "Known as the 'City of a Thousand Windows', Berat is a UNESCO World Heritage site with a well-preserved Ottoman center.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "58%", left: "49%" }
  },
  {
    id: "vlore",
    name: "Vlorë",
    description: "Where the Adriatic meets the Ionian Sea. Vlorë is famous for its beautiful riviera and stunning beaches.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "67%", left: "33%" }
  },
  {
    id: "gjirokaster",
    name: "Gjirokastër",
    description: "A magical 'City of Stone' with steep cobblestone streets and a massive fortress.",
    image: "/src/assets/images/city-gjirokaster.jpg",
    position: { top: "81%", left: "57%" }
  }
];

const GUIDES = [
  { title: "Albanian Riviera", icon: Sun, description: "Crystal clear waters from Vlorë to Ksamil." },
  { title: "Ancient History", icon: Landmark, description: "Explore Illyrian ruins and Ottoman castles." },
  { title: "Accursed Mountains", icon: Compass, description: "Breathtaking alpine landscapes in Theth and Valbonë." },
  { title: "Cultural Heritage", icon: Camera, description: "Experience the unique 'Besa' hospitality." }
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
        
        <div className="z-10 text-center px-4 flex flex-col items-center mt-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6"
          >
            Welcome to <span className="text-primary">Albania</span>
          </motion.h1>
          <Button onClick={scrollToExplore} className="bg-primary rounded-full px-8 py-6">
            Start Your Journey
          </Button>
        </div>

        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/80" />
        </motion.div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-24 px-4 md:px-8 lg:px-16 w-full bg-background">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left: City Info Card */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-3xl font-serif font-bold mb-6">Destinations</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border"
              >
                <img src={selectedCity.image} className="h-48 w-full object-cover" alt={selectedCity.name} />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{selectedCity.name}</h3>
                  <p className="text-muted-foreground mb-4">{selectedCity.description}</p>
                  <Button variant="outline">Plan Trip</Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: The Interactive Map */}
          <div className="w-full lg:w-2/3 relative flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[4/5]">
              <img 
                src="/src/assets/images/albania-outline.png" 
                className="w-full h-full object-contain opacity-80"
                alt="Albania Outline"
              />

              {CITIES.map((city) => (
                <motion.button
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className="absolute z-20 group -translate-x-1/2 -translate-y-1/2"
                  style={{ top: city.position.top, left: city.position.left }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full border-2 border-white transition-all ${
                      selectedCity.id === city.id ? 'bg-primary scale-125' : 'bg-red-600'
                    }`} />
                    {selectedCity.id === city.id && (
                      <div className="absolute w-8 h-8 bg-primary/40 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-white text-black px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                    {city.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Guide Section */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GUIDES.map((guide) => (
            <Card key={guide.title} className="border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <guide.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h4 className="font-bold mb-2">{guide.title}</h4>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Visit Albania. Go your own way.</p>
      </footer>
    </div>
  );
}