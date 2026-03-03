export type City = {
  id: string;
  name: string;
  description: string;
  image: string;
  position: { top: string; left: string };
  lat: number;
  lon: number;
};

export const CITIES: City[] = [
  {
    id: "shkoder",
    name: "Shkodër",
    description:
      "One of the oldest and most historic places in Albania, Shkodër is a cultural center featuring the legendary Rozafa Castle.",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f8/The_City_and_the_Prokletije_from_the_castle.jpg",
    position: { top: "14%", left: "42%" },
    lat: 42.0675,
    lon: 19.5141,
  },
  {
    id: "tirana",
    name: "Tirana",
    description:
      "The vibrant capital city of Albania, known for its colorful architecture and lively atmosphere.",
    image: "/src/assets/images/city-tirana.jpg",
    position: { top: "38%", left: "52%" },
    lat: 41.3275,
    lon: 19.8187,
  },
  {
    id: "berat",
    name: "Berat",
    description:
      "Known as the 'City of a Thousand Windows', Berat is a UNESCO World Heritage site with a well-preserved Ottoman center.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "58%", left: "54%" },
    lat: 40.7086,
    lon: 19.952,
  },
  {
    id: "vlore",
    name: "Vlorë",
    description:
      "Where the Adriatic meets the Ionian Sea. Vlorë is famous for its beautiful riviera and stunning beaches.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "70%", left: "35%" },
    lat: 40.4661,
    lon: 19.4914,
  },
  {
    id: "gjirokaster",
    name: "Gjirokastër",
    description:
      "A magical 'City of Stone' with steep cobblestone streets and a massive fortress.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Gjirokaster_2016-2017.jpg",
    position: { top: "84%", left: "60%" },
    lat: 40.0758,
    lon: 20.1389,
  },
  {
    id: "kukes",
    name: "Kukës",
    description:
      "Located in the mountainous north, Kukës is known for its dramatic landscapes and the artificial lake Fierza.",
    image: "https://euronews.al/en/wp-content/uploads/2024/02/kukes-albania.webp",
    position: { top: "20%", left: "75%" },
    lat: 42.0769,
    lon: 20.4217,
  },
  {
    id: "durres",
    name: "Durrës",
    description:
      "Albania's main port and one of its oldest cities, Durrës boasts a large Roman amphitheater and popular beaches.",
    image: "/src/assets/images/header-tirana-new.jpg",
    position: { top: "40%", left: "30%" },
    lat: 41.3236,
    lon: 19.4544,
  },
  {
    id: "korce",
    name: "Korçë",
    description:
      "Known for its elegant old villas, cultural festivals, and nearby mountain landscapes, Korçë is one of Albania's most charming southeastern cities.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "78%", left: "72%" },
    lat: 40.6167,
    lon: 20.7833,
  },
  {
    id: "tropoje",
    name: "Tropojë",
    description:
      "A gateway to dramatic alpine valleys and the Valbona region, Tropojë is a top destination for mountain trekking and nature escapes.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Valbona%20Village.jpg",
    position: { top: "9%", left: "63%" },
    lat: 42.3573,
    lon: 20.0768,
  },
];

export const CITY_DETAILS: Record<
  string,
  {
    tagline: string;
    intro: string;
    highlights: string[];
    localTip: string;
  }
> = {
  shkoder: {
    tagline: "Gateway to the Albanian Alps",
    intro:
      "Shkodër blends history, art, and mountain energy. It is a strong base for Rozafa Castle, Lake Shkodër, and day trips toward Theth.",
    highlights: [
      "Rozafa Castle and sunset views over three rivers",
      "Pedonalja promenade and Marubi photography museum",
      "Lake Shkodër waterfront and bike-friendly streets",
    ],
    localTip: "Plan one evening by the lake and one morning in the old center for the best contrast.",
  },
  tirana: {
    tagline: "Colorful capital with nonstop energy",
    intro:
      "Tirana is Albania's social and cultural heart, mixing cafes, museums, modern neighborhoods, and nightlife in compact distances.",
    highlights: [
      "Skanderbeg Square, Et'hem Bey Mosque, and National Museum",
      "Blloku district for cafes, bars, and dinner spots",
      "Dajti cable car for panoramic city views",
    ],
    localTip: "Use Tirana as your base, but keep one flexible day for nearby Krujë or Bovilla.",
  },
  berat: {
    tagline: "UNESCO town of stone and windows",
    intro:
      "Berat is famous for its hillside Ottoman houses and layered history. The city feels calm, photogenic, and deeply traditional.",
    highlights: [
      "Mangalem and Gorica quarters across the Osum river",
      "Berat Castle and the Onufri icon museum",
      "Sunset walks along the river boulevard",
    ],
    localTip: "Stay overnight if possible; early mornings are quieter and ideal for exploring the castle.",
  },
  vlore: {
    tagline: "Where two seas meet",
    intro:
      "Vlorë is a coastal hub and the entry point to the Albanian Riviera, with beaches, seafood, and access to dramatic seaside routes.",
    highlights: [
      "Lungomare promenade and city beach life",
      "Day trip toward Dhërmi, Himarë, or Llogara pass",
      "Historic landmarks tied to Albania's independence",
    ],
    localTip: "Start coastal drives early to avoid traffic and catch clearer water before afternoon winds.",
  },
  gjirokaster: {
    tagline: "Stone city of the south",
    intro:
      "Gjirokastër is a UNESCO-listed hill city with steep lanes, Ottoman-era architecture, and one of the region's most striking castles.",
    highlights: [
      "Gjirokastër Castle and sweeping valley views",
      "Traditional tower houses in the old bazaar area",
      "Craft shops, local cuisine, and stone-roof skyline",
    ],
    localTip: "Wear comfortable shoes; the old town has steep cobblestones and many stairs.",
  },
  kukes: {
    tagline: "Mountain landscapes and lake horizons",
    intro:
      "Kukës is one of Albania's most dramatic natural regions, known for alpine scenery, Fierza lake views, and access to remote routes.",
    highlights: [
      "Fierza reservoir viewpoints",
      "Mountain roads with wide panoramic overlooks",
      "Gateway potential for northern adventure itineraries",
    ],
    localTip: "Check road conditions before long drives, especially outside peak summer months.",
  },
  durres: {
    tagline: "Ancient port by the Adriatic",
    intro:
      "Durrës combines beach atmosphere with deep historical roots, including one of the largest Roman amphitheaters in the Balkans.",
    highlights: [
      "Roman amphitheater and archaeological zones",
      "Beachfront promenade and seafood restaurants",
      "Quick access from Tirana for a short coastal escape",
    ],
    localTip: "Visit the amphitheater early, then spend late afternoon by the sea promenade.",
  },
  korce: {
    tagline: "Cultural jewel of the southeast",
    intro:
      "Korçë blends refined architecture, winter charm, and a strong arts scene. It is one of Albania's most atmospheric cities for slow travel and local culture.",
    highlights: [
      "Old Bazaar quarter and restored cobbled streets",
      "Orthodox cathedral and cultural museums",
      "Mountain access toward Dardhë and nearby nature escapes",
    ],
    localTip: "Visit in the evening when the central pedestrian area comes alive with cafes and music.",
  },
  tropoje: {
    tagline: "Alpine gateway to Valbona",
    intro:
      "Tropojë is one of northern Albania's adventure hubs, surrounded by dramatic peaks and connected to iconic hiking routes.",
    highlights: [
      "Valbona valley entry and mountain trekking routes",
      "Scenic drives through rugged alpine landscapes",
      "Traditional guesthouses and local mountain cuisine",
    ],
    localTip: "Book mountain stays early in peak summer, especially if you're planning the Valbona-Theth trail.",
  },
};
