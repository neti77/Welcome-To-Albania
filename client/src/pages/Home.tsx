import { useState, useEffect } from "react"; // Added useEffect here
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sun, Compass, Camera, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchWeatherApi } from "openmeteo";
// City Data
const CITIES = [
  {
    id: "shkoder",
    name: "Shkodër",
    description: "One of the oldest and most historic places in Albania, Shkodër is a cultural center featuring the legendary Rozafa Castle.",
    image: "/src/assets/images/city-shkoder.jpg",
    position: { top: "14%", left: "42%" },
    lat: 42.0675, lon: 19.5141, 
  },
  {
    id: "tirana",
    name: "Tirana",
    description: "The vibrant capital city of Albania, known for its colorful architecture and lively atmosphere.",
    image: "/src/assets/images/city-tirana.jpg",
    position: { top: "38%", left: "52%" },
    lat: 41.3275, lon: 19.8187,
  },
  {
    id: "berat",
    name: "Berat",
    description: "Known as the 'City of a Thousand Windows', Berat is a UNESCO World Heritage site with a well-preserved Ottoman center.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "58%", left: "54%" },
    lat: 40.7086, lon: 19.9520,
  },
  {
    id: "vlore",
    name: "Vlorë",
    description: "Where the Adriatic meets the Ionian Sea. Vlorë is famous for its beautiful riviera and stunning beaches.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "70%", left: "35%" },
    lat: 40.4661, lon: 19.4914,
  },
  {
    id: "gjirokaster",
    name: "Gjirokastër",
    description: "A magical 'City of Stone' with steep cobblestone streets and a massive fortress.",
    image: "/src/assets/images/city-gjirokaster.jpg",
    position: { top: "84%", left: "60%" },
    lat: 40.0758, lon: 20.1389,
  }
];

const GUIDES = [
  { title: "Albanian Riviera", icon: Sun, description: "Crystal clear waters from Vlorë to Ksamil." },
  { title: "Ancient History", icon: Landmark, description: "Explore Illyrian ruins and Ottoman castles." },
  { title: "Accursed Mountains", icon: Compass, description: "Breathtaking alpine landscapes in Theth and Valbonë." },
  { title: "Cultural Heritage", icon: Camera, description: "Experience the unique 'Besa' hospitality." }
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState(CITIES[1]);
  const [weather, setWeather] = useState<{ temp: number; symbol: string } | null>(null);

  // Weather Fetch Logic
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current_weather=true`
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
            <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">Destinations</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border relative"
              >
                <img src={selectedCity.image} className="h-48 w-full object-cover" alt={selectedCity.name} />
                
                {/* Weather Badge - This is where the weather shows up! */}
               {weather ? (
  <div className="...">...</div>
) : (
  <div className="absolute top-4 right-4 text-white">Loading...</div>
)}

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{selectedCity.name}</h3>
                  <p className="text-muted-foreground mb-4">{selectedCity.description}</p>
                  <Button variant="outline">Plan Trip</Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Map */}
          <div className="w-full lg:w-2/3 relative flex justify-center items-center min-h-[600px]">
            <div className="relative w-full max-w-[400px] aspect-[1/2]">
              <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" fill="none">
                <motion.path
                  d="M52.3,2.4 C54.5,1.2 59.8,3.5 62.1,6.8 C64.4,10.1 63.2,16.7 65.8,20.4 C68.4,24.1 76.5,26.7 78.4,32.4 C80.3,38.1 77.2,46.8 79.5,53.2 C81.8,59.6 89.2,65.4 90.5,72.4 C91.8,79.4 88.4,89.5 89.2,98.5 C90,107.5 94.2,115.6 92.5,123.4 C90.8,131.2 84.5,138.4 83.4,147.2 C82.3,156 84.5,165.4 81.2,172.5 C77.9,179.6 70.4,185.3 62.4,188.4 C54.4,191.5 45.6,189.2 38.4,184.2 C31.2,179.2 28.4,170.1 26.5,160.4 C24.6,150.7 20.2,142.1 18.4,132.5 C16.6,122.9 19.5,112.4 16.4,103.2 C13.3,94 6.5,86.4 5.2,78.2 C3.9,70 10.2,62.1 13.4,54.2 C16.6,46.3 14.2,36.5 18.5,28.4 C22.8,20.3 30.2,15.4 38.4,10.2 C46.6,5 50.1,3.6 52.3,2.4 Z"
                  stroke="white"
                  strokeWidth="1"
                  fill="rgba(255,255,255,0.05)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3 }}
                />
              </svg>

              {CITIES.map((city) => (
                <motion.button
                  key={city.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 3.2 }}
                  onClick={() => setSelectedCity(city)}
                  className="absolute z-20 group -translate-x-1/2 -translate-y-1/2"
                  style={{ top: city.position.top, left: city.position.left }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full border border-white transition-all duration-300 ${
                      selectedCity.id === city.id ? 'bg-red-500 scale-150 shadow-[0_0_10px_red]' : 'bg-red-600'
                    }`} />
                    {selectedCity.id === city.id && (
                      <div className="absolute w-6 h-6 bg-red-500/30 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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