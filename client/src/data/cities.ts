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
    id: "lezhe",
    name: "Lezhë",
    description:
      "A historic northern city near the coast, known for Skanderbeg's memorial and easy access to beach villages.",
    image: "/src/assets/images/city-shkoder.jpg",
    position: { top: "24%", left: "40%" },
    lat: 41.78194,
    lon: 19.64444,
  },
  {
    id: "shengjin",
    name: "Shëngjin",
    description:
      "A laid-back Adriatic seaside town with long beaches and quick access to Lezhë and Rana e Hedhun dunes.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "22%", left: "34%" },
    lat: 41.81361,
    lon: 19.59389,
  },
  {
    id: "kruje",
    name: "Krujë",
    description:
      "A hilltop heritage town famous for its castle, bazaar, and panoramic views above Tirana.",
    image: "/src/assets/images/city-tirana.jpg",
    position: { top: "32%", left: "53%" },
    lat: 41.51083,
    lon: 19.7925,
  },
  {
    id: "tirana",
    name: "Tirana",
    description:
      "The vibrant capital city of Albania, known for its colorful architecture and lively atmosphere.",
    image: "/src/assets/images/Tirana.jpeg",
    position: { top: "38%", left: "52%" },
    lat: 41.3275,
    lon: 19.8187,
  },
  {
    id: "elbasan",
    name: "Elbasan",
    description:
      "A central crossroads city with a historic fortress core and a gateway to eastern road trips.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "44%", left: "60%" },
    lat: 41.11111,
    lon: 20.08056,
  },
  {
    id: "durres",
    name: "Durrës",
    description:
      "Albania's main port and one of its oldest cities, Durrës boasts a large Roman amphitheater and popular beaches.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Durr%C3%ABs%20seafront%20promenade%20(Albania)%2009.jpg",
    position: { top: "40%", left: "30%" },
    lat: 41.3236,
    lon: 19.4544,
  },
  {
    id: "fier",
    name: "Fier",
    description:
      "A key hub in the southwest, known for nearby Apollonia and quick routes toward the Riviera.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "56%", left: "44%" },
    lat: 40.725,
    lon: 19.55722,
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
    id: "pogradec",
    name: "Pogradec",
    description:
      "A calm lakeside city on Lake Ohrid, ideal for slow walks and eastern road trips.",
    image: "/src/assets/images/city-berat.jpg",
    position: { top: "70%", left: "76%" },
    lat: 40.9,
    lon: 20.65,
  },
  {
    id: "vlore",
    name: "Vlorë",
    description:
      "Where the Adriatic meets the Ionian Sea. Vlorë is famous for its beautiful riviera and stunning beaches.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Promenade_of_Vlor%C3%AB_along_the_Adriatic_Sea.jpg",
    position: { top: "70%", left: "35%" },
    lat: 40.4661,
    lon: 19.4914,
  },
  {
    id: "himare",
    name: "Himarë",
    description:
      "A Riviera classic with coves, stone villages, and a calm Ionian Sea atmosphere.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "75%", left: "30%" },
    lat: 40.11667,
    lon: 19.73333,
  },
  {
    id: "sarande",
    name: "Sarandë",
    description:
      "Southern seaside base with quick access to Ksamil, Butrint, and the Blue Eye spring.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "90%", left: "32%" },
    lat: 39.875,
    lon: 20.01,
  },
  {
    id: "ksamil",
    name: "Ksamil",
    description:
      "Turquoise coves and island viewpoints just south of Sarandë.",
    image: "/src/assets/images/city-vlore.jpg",
    position: { top: "92%", left: "34%" },
    lat: 39.767,
    lon: 20,
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
    id: "korce",
    name: "Korçë",
    description:
      "Known for its elegant old villas, cultural festivals, and nearby mountain landscapes, Korçë is one of Albania's most charming southeastern cities.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kor%C3%A7aVonOben.JPG",
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
  {
    id: "theth",
    name: "Theth",
    description:
      "A remote alpine village known for dramatic hikes, waterfalls, and stone guesthouses.",
    image: "/src/assets/images/city-shkoder.jpg",
    position: { top: "12%", left: "55%" },
    lat: 42.4,
    lon: 19.767,
  },
  {
    id: "valbona",
    name: "Valbonë",
    description:
      "Highland valley with iconic peaks and the Valbonë to Theth trekking route.",
    image: "/src/assets/images/city-shkoder.jpg",
    position: { top: "13%", left: "68%" },
    lat: 42.45333,
    lon: 19.88778,
  },
];

export const MAIN_CITY_IDS = [
  "shkoder",
  "tirana",
  "durres",
  "berat",
  "vlore",
  "gjirokaster",
  "korce",
  "sarande",
  "kukes",
  "theth",
];

export const MAIN_CITIES = CITIES.filter((city) => MAIN_CITY_IDS.includes(city.id));

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
  lezhe: {
    tagline: "Historic crossroads by the coast",
    intro:
      "Lezhë combines heritage history with easy access to nearby beaches and the northern Riviera.",
    highlights: [
      "Skanderbeg memorial and castle views",
      "Short drive to Shëngjin beach",
      "Easy stop on north-south coastal drives",
    ],
    localTip: "Pair Lezhë with a sunset stop at Shëngjin for a relaxed day trip.",
  },
  shengjin: {
    tagline: "Easy Adriatic escape",
    intro:
      "Shëngjin is known for long sandy beaches and casual seaside dining, perfect for a quick coastal break.",
    highlights: [
      "Beachfront promenade",
      "Nearby Rana e Hedhun dunes",
      "Fresh seafood with sunset views",
    ],
    localTip: "Go early in summer days to secure quieter beach spots.",
  },
  kruje: {
    tagline: "Castle town above Tirana",
    intro:
      "Krujë delivers history, craft bazaars, and wide panoramas only a short drive from the capital.",
    highlights: [
      "Skanderbeg Museum and Krujë Castle",
      "Old bazaar with handmade crafts",
      "Panoramic mountain viewpoints",
    ],
    localTip: "Plan for cooler evenings; the hilltop can be breezy after sunset.",
  },
  elbasan: {
    tagline: "Central gateway city",
    intro:
      "Elbasan sits at the heart of Albania's east-west routes and has a compact, walkable historic core.",
    highlights: [
      "Elbasan castle quarter",
      "Short drives toward mountain villages",
      "Convenient stop between Tirana and Korçë",
    ],
    localTip: "Grab lunch inside the old fortress district to break up longer drives.",
  },
  fier: {
    tagline: "Southwest connector",
    intro:
      "Fier is a strategic stop for reaching the Riviera, Apollonia, or southern cultural routes.",
    highlights: [
      "Apollonia archaeological park nearby",
      "Local markets and cafes",
      "Easy routing toward Vlorë and Berat",
    ],
    localTip: "Use Fier as a short logistics stop instead of an overnight if you want more time on the coast.",
  },
  pogradec: {
    tagline: "Lake Ohrid calm",
    intro:
      "Pogradec is a peaceful lakeside city with promenades, fresh fish, and relaxed summer energy.",
    highlights: [
      "Lake Ohrid shoreline walks",
      "Village trips toward Lin",
      "Sunset cafes by the water",
    ],
    localTip: "Stay overnight to enjoy the lake after day-trippers leave.",
  },
  himare: {
    tagline: "Ionian beach classic",
    intro:
      "Himarë blends beaches, hillside villages, and calm coastal evenings along the Riviera.",
    highlights: [
      "Beach coves and turquoise water",
      "Old town views",
      "Access to coastal hiking routes",
    ],
    localTip: "Plan a morning swim before the midday beach crowds.",
  },
  sarande: {
    tagline: "Southern seaside base",
    intro:
      "Sarandë is a lively base for southern Albania, with quick access to Ksamil, Butrint, and the Blue Eye spring.",
    highlights: [
      "Seaside promenade and port vibes",
      "Day trips to Ksamil and Butrint",
      "Golden-hour viewpoints across the bay",
    ],
    localTip: "Stay near the waterfront for walkable dining and boat-trip access.",
  },
  ksamil: {
    tagline: "Turquoise island coves",
    intro:
      "Ksamil is known for clear water, beach clubs, and tiny islands just offshore.",
    highlights: [
      "Shallow turquoise bays",
      "Short trips to Butrint",
      "Sunset swims and island views",
    ],
    localTip: "Arrive early to secure beach loungers during July and August.",
  },
  theth: {
    tagline: "Alpine village escape",
    intro:
      "Theth is a highland village surrounded by jagged peaks, waterfalls, and unforgettable hiking routes.",
    highlights: [
      "Theth waterfall and river pools",
      "Stone church and tower houses",
      "Trail access toward Valbonë",
    ],
    localTip: "Bring layers even in summer; mountain evenings are cool.",
  },
  valbona: {
    tagline: "Valley of dramatic peaks",
    intro:
      "Valbonë Valley offers classic alpine scenery and one of Albania's most iconic trekking corridors.",
    highlights: [
      "Panoramic valley hikes",
      "Traditional guesthouses",
      "Start of the Valbonë-Theth trail",
    ],
    localTip: "Book a guesthouse with dinner included to simplify mountain logistics.",
  },
};
