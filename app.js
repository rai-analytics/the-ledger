// ── APP.JS ── THE LEDGER INTERACTIVE TWO-PANEL SPLIT CONTROLLER
// Pair programmed for premium PPSC candidate UX: Dashboard + Folders + Map Routing + 100-MCQ Booklet + Atlas

}


// 1. App State
let db = [];
let selectedDossier = null;
let searchQuery = "";
let map = null;     // Leaflet map instance
let mapMarkers = {}; // Cache of plotted markers
let mapPolylines = []; // Cache of plotted routed polylines
let orgOverlays = []; // Cache of plotted temporary organisation markers and dotted lines
let regionOverlays = []; // Cache of plotted temporary region shape overlays
let currentMode = 'dashboard'; // 'dashboard', 'folders', 'timeline', 'papers', or 'atlas'
let currentPath = ['Root']; // Directory path stack: e.g. ['Root'], ['Root', 'Pakistan Studies']
let activeExam = null; // { paperName, questions: [], choices: [], timer: 0, timerInterval: null, submitted: false, score: 0 }
let selectedAtlasItem = null; // Store selected Geopolitical Atlas item

// Progression State
let userXP = 0;
let userRank = "Field Informant";
let cardStates = {}; // Maps dossier ID to 'secured', 'compromised', or 'unvetted'

// Drill State (Top-header Quick Quiz)
let drillQueue = [];
let currentDrillIndex = 0;
let selectedOption = null;

// Premium Tactical Geographical Routes (Encyclopedia & Atlas)
const MAP_ROUTES = [
  {
    id: "route-kkh",
    name: "Karakoram Highway (KKH)",
    category: "passes",
    type: "highway",
    color: "#FF5722", // Neon Orange
    length: "1,300 km",
    description: "National Highway 35 (N-35) connecting Pakistan with Xinjiang, China. One of the highest paved roads in the world.",
    coords: [
      [33.8201, 72.6890], // Hassan Abdal
      [34.1688, 73.2215], // Abbottabad
      [34.7925, 73.0139], // Thakot
      [35.4217, 74.0950], // Chilas
      [35.9208, 74.3089], // Gilgit
      [36.3167, 74.6500], // Hunza (Aliabad)
      [36.8497, 75.4578], // Khunjerab Pass
      [39.4704, 75.9898]  // Kashgar
    ],
    places: ["Hassan Abdal", "Abbottabad", "Thakot", "Chilas", "Gilgit", "Hunza", "Khunjerab Pass", "Kashgar"]
  },
  {
    id: "route-indus",
    name: "Indus River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "3,180 km",
    description: "The primary river of Pakistan. Flowing from Tibet, through Gilgit-Baltistan and Punjab down to Sindh into the Arabian Sea.",
    coords: [
      [31.25, 81.33],     // Tibet source
      [34.1526, 77.5771], // Ladakh (Leh)
      [35.65, 74.63],     // Gilgit-Baltistan
      [34.0875, 72.6972], // Tarbela
      [32.9584, 71.5389], // Kalabagh
      [31.8333, 70.9010], // D.I. Khan
      [27.6892, 68.8267], // Sukkur Barrage
      [25.3960, 68.3578], // Hyderabad
      [23.95, 67.45]      // Arabian Sea Delta
    ],
    places: ["Tibet Source", "Leh Ladakh", "Bunji GB", "Tarbela", "Kalabagh", "D.I. Khan", "Sukkur", "Hyderabad", "Arabian Sea"]
  },
  {
    id: "route-nile",
    name: "Nile River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "6,650 km",
    description: "The longest river in the world, flowing northwards through northeastern Africa to the Mediterranean Sea.",
    coords: [
      [2.0, 32.3],   // Lake Victoria (Uganda)
      [9.5, 31.6],   // South Sudan
      [15.6, 32.5],  // Khartoum (Sudan)
      [19.0, 32.0],  // Sudan Bend
      [24.0, 32.9],  // Aswan (Egypt)
      [30.0, 31.2],  // Cairo (Egypt)
      [31.5, 31.0]   // Delta (Mediterranean Sea)
    ],
    places: ["Lake Victoria", "South Sudan", "Khartoum", "Aswan Dam", "Cairo", "Mediterranean Sea"]
  },
  {
    id: "route-amazon",
    name: "Amazon River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "6,400 km",
    description: "The largest river in the world by water flow, winding through the dense South American rainforest.",
    coords: [
      [-4.5, -73.5], // Peru Source
      [-3.4, -65.0], // Western Brazil
      [-3.1, -60.0], // Manaus
      [-2.5, -54.0], // Obidos
      [-1.5, -49.0], // Macapa
      [-0.1, -48.0]  // Atlantic Outlet
    ],
    places: ["Andes Source", "Manaus", "Macapa", "Atlantic Ocean"]
  },
  {
    id: "route-yangtze",
    name: "Yangtze River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "6,300 km",
    description: "The longest river in Asia, flowing from the Tibetan Plateau to the East China Sea.",
    coords: [
      [33.0, 92.0],   // Qinghai Source
      [27.0, 99.5],   // Yunnan Bend
      [29.5, 106.5],  // Chongqing
      [30.6, 114.3],  // Wuhan
      [32.0, 118.8],  // Nanjing
      [31.3, 121.5]   // Shanghai Delta
    ],
    places: ["Tibetan Plateau", "Chongqing", "Three Gorges", "Wuhan", "Nanjing", "Shanghai"]
  },
  {
    id: "route-mississippi",
    name: "Mississippi River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "3,730 km",
    description: "The chief river of the largest drainage system in North America, flowing south to the Gulf of Mexico.",
    coords: [
      [47.2, -95.2], // Lake Itasca
      [45.0, -93.2], // Minneapolis
      [38.6, -90.2], // St. Louis
      [35.1, -90.0], // Memphis
      [32.3, -90.9], // Vicksburg
      [30.0, -90.0], // New Orleans
      [29.1, -89.2]  // Gulf of Mexico
    ],
    places: ["Lake Itasca", "Minneapolis", "St. Louis", "Memphis", "New Orleans", "Gulf of Mexico"]
  },
  {
    id: "route-volga",
    name: "Volga River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "3,530 km",
    description: "The longest river in Europe, flowing through central Russia and widely regarded as Russia's national river.",
    coords: [
      [57.2, 32.5], // Valdai Hills Source
      [56.8, 35.9], // Tver
      [56.3, 44.0], // Nizhny Novgorod
      [55.8, 49.1], // Kazan
      [53.2, 50.1], // Samara
      [48.7, 44.5], // Volgograd
      [46.3, 48.0]  // Caspian Sea (Astrakhan)
    ],
    places: ["Valdai Hills", "Nizhny Novgorod", "Kazan", "Volgograd", "Astrakhan", "Caspian Sea"]
  },
  {
    id: "route-ganges",
    name: "Ganges River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "2,525 km",
    description: "A trans-boundary river of Asia flowing through India and Bangladesh, sacred in Hinduism.",
    coords: [
      [31.0, 79.0],  // Himalayas Source
      [30.0, 78.1],  // Haridwar
      [26.5, 80.3],  // Kanpur
      [25.5, 81.9],  // Allahabad
      [25.3, 83.0],  // Varanasi
      [25.6, 85.1],  // Patna
      [24.0, 88.5],  // Bangladesh Border
      [22.5, 89.5]   // Delta (Bay of Bengal)
    ],
    places: ["Himalayas", "Haridwar", "Allahabad", "Varanasi", "Patna", "Bay of Bengal"]
  },
  {
    id: "route-danube",
    name: "Danube River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "2,850 km",
    description: "Europe's second-longest river, flowing through ten countries and four capitals from Germany to the Black Sea.",
    coords: [
      [48.0, 8.5],   // Black Forest Source
      [48.3, 11.6],  // Regensburg
      [48.2, 16.4],  // Vienna (Austria)
      [47.5, 19.0],  // Budapest (Hungary)
      [44.8, 20.5],  // Belgrade (Serbia)
      [44.0, 26.3],  // Ruse
      [45.2, 28.8]   // Black Sea Delta (Romania)
    ],
    places: ["Black Forest", "Vienna", "Budapest", "Belgrade", "Ruse", "Black Sea"]
  },
  {
    id: "route-mekong",
    name: "Mekong River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "4,350 km",
    description: "A major trans-boundary river in East and Southeast Asia, vital for regional agriculture and trade.",
    coords: [
      [33.0, 94.0],   // Qinghai Source
      [22.0, 100.5],  // Yunnan
      [19.8, 102.1],  // Luang Prabang
      [18.0, 102.6],  // Vientiane
      [15.1, 105.8],  // Pakse
      [11.6, 104.9],  // Phnom Penh
      [10.2, 106.3]   // Delta (Vietnam)
    ],
    places: ["Tibet", "Yunnan", "Luang Prabang", "Vientiane", "Phnom Penh", "South China Sea"]
  },
  {
    id: "route-congo",
    name: "Congo River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "4,700 km",
    description: "The deepest recorded river in the world, flowing twice across the Equator through Africa's heartland.",
    coords: [
      [-11.5, 26.5], // Lualaba Source
      [-0.5, 25.2],  // Kisangani
      [2.0, 22.5],   // Congo loop north
      [-1.5, 17.0],  // Mbandaka
      [-4.3, 15.3],  // Kinshasa
      [-6.0, 12.4]   // Atlantic Outlet
    ],
    places: ["Katanga Source", "Kisangani", "Mbandaka", "Kinshasa", "Atlantic Ocean"]
  },
  {
    id: "route-yellow",
    name: "Yellow River Path (Huang He)",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "5,464 km",
    description: "The second-longest river in China, regarded as the cradle of Chinese civilization.",
    coords: [
      [34.5, 96.0],   // Bayankala Mountains
      [36.1, 100.6],  // Lanzhou
      [38.5, 106.2],  // Yinchuan
      [40.8, 107.5],  // Inner Mongolia loop
      [37.5, 110.5],  // Shanxi boundary
      [34.8, 113.6],  // Zhengzhou
      [37.8, 118.1]   // Bohai Sea Delta
    ],
    places: ["Bayankala Mountains", "Lanzhou", "Ordos Loop", "Zhengzhou", "Bohai Sea"]
  },
  {
    id: "route-murray",
    name: "Murray River Path",
    category: "rivers",
    type: "river",
    color: "#00E5FF", // Neon Cyan
    length: "2,508 km",
    description: "The longest river in Australia, forming the border between New South Wales and Victoria.",
    coords: [
      [-36.5, 148.0], // Alps Source
      [-36.0, 146.5], // Albury
      [-34.2, 142.2], // Mildura
      [-34.0, 140.0], // Renmark
      [-35.3, 139.3], // Murray Bridge
      [-35.5, 138.9]  // Lake Alexandrina
    ],
    places: ["Australian Alps", "Albury", "Mildura", "Renmark", "Lake Alexandrina"]
  },
  {
    id: "route-durand",
    name: "Durand Line",
    category: "borders",
    type: "border",
    color: "#FF1744", // Neon Red
    dashArray: "8, 8",
    length: "2,640 km",
    description: "The international border established in 1893 between Afghanistan and British India (now Pakistan).",
    coords: [
      [29.5542, 66.0211], // Nushki
      [30.9167, 66.4333], // Chaman
      [34.1264, 71.0903], // Torkham
      [35.8511, 71.7850]  // Chitral
    ],
    places: ["Nushki", "Chaman Crossing", "Torkham Pass", "Chitral Borders"]
  },
  {
    id: "route-sinopak",
    name: "Sino-Pakistan Boundary",
    category: "borders",
    type: "border",
    color: "#FFEA00", // Neon Yellow
    dashArray: "5, 5",
    length: "592 km",
    description: "The high-altitude border between Pakistan and China, running from Khunjerab Pass to Karakoram Pass.",
    coords: [
      [36.8497, 75.4578], // Khunjerab Pass
      [35.8808, 76.5158], // K2
      [35.5133, 77.8250]  // Karakoram Pass
    ],
    places: ["Khunjerab", "K2 Summit", "Karakoram Pass"]
  },
  {
    id: "route-khyber",
    name: "Khyber Pass Route",
    category: "passes",
    type: "pass",
    color: "#E040FB", // Bright Pink
    length: "53 km",
    description: "Mountain pass connecting Peshawar to Landi Kotal and Torkham border, a gateway through history.",
    coords: [
      [34.0150, 71.5250], // Peshawar
      [34.1000, 71.2500], // Jamrud
      [34.1264, 71.0903]  // Torkham
    ],
    places: ["Peshawar", "Jamrud Fort", "Torkham Border"]
  },
  {
    id: "route-bolan",
    name: "Bolan Pass Route",
    category: "passes",
    type: "pass",
    color: "#1DE9B6", // Teal
    length: "120 km",
    description: "Mountain pass through the Toba Kakar range in Balochistan, connecting Sibi with Quetta.",
    coords: [
      [29.5448, 67.8764], // Sibi
      [29.8500, 67.4500], // Mach
      [30.1798, 66.9986]  // Quetta
    ],
    places: ["Sibi Plains", "Mach Gorge", "Quetta Valley"]
  },
  {
    id: "route-babusar",
    name: "Babusar Pass Route",
    category: "passes",
    type: "pass",
    color: "#76FF03", // Lime Green
    length: "150 km",
    description: "Mountain pass connecting Kaghan Valley near Balakot to Chilas on the Karakoram Highway.",
    coords: [
      [34.5492, 73.3517], // Balakot
      [34.9000, 73.6500], // Naran
      [35.4217, 74.0950]  // Chilas
    ],
    places: ["Balakot", "Naran Valley", "Chilas Junction"]
  },
  {
    id: "route-lowari",
    name: "Lowari Pass Route",
    category: "passes",
    type: "pass",
    color: "#FF3D00", // Red Orange
    length: "100 km",
    description: "High mountain pass connecting Dir to Chitral, historically bypassed now by Lowari Tunnel.",
    coords: [
      [35.2078, 71.8778], // Dir
      [35.4500, 71.8000], // Lowari Tunnel/Pass
      [35.8511, 71.7850]  // Chitral
    ],
    places: ["Dir Upper", "Lowari Pass", "Chitral City"]
  }
];

const MAP_CONTINENTS = [
  {
    name: "Asia",
    color: "#FFEA00",
    coords: [
      [80.0, 30.0],
      [80.0, 170.0],
      [10.0, 170.0],
      [-10.0, 120.0],
      [-10.0, 80.0],
      [10.0, 30.0],
      [80.0, 30.0]
    ]
  },
  {
    name: "Europe",
    color: "#E040FB",
    coords: [
      [70.0, -20.0],
      [70.0, 45.0],
      [35.0, 45.0],
      [35.0, -20.0],
      [70.0, -20.0]
    ]
  },
  {
    name: "Africa",
    color: "#00FF88",
    coords: [
      [37.0, -20.0],
      [30.0, 32.0],
      [12.0, 52.0],
      [-35.0, 20.0],
      [-35.0, 10.0],
      [5.0, -15.0],
      [37.0, -20.0]
    ]
  },
  {
    name: "North America",
    color: "#00E5FF",
    coords: [
      [75.0, -170.0],
      [75.0, -50.0],
      [15.0, -80.0],
      [15.0, -120.0],
      [75.0, -170.0]
    ]
  },
  {
    name: "South America",
    color: "#00E5FF",
    coords: [
      [12.0, -85.0],
      [10.0, -35.0],
      [-56.0, -67.0],
      [-56.0, -78.0],
      [12.0, -85.0]
    ]
  },
  {
    name: "Oceania",
    color: "#FF5722",
    coords: [
      [-10.0, 110.0],
      [-10.0, 170.0],
      [-45.0, 170.0],
      [-45.0, 110.0],
      [-10.0, 110.0]
    ]
  }
];

// Strategic Organizations Database (For connection webs)
const ORGANISATIONS = [
  {
    id: "org-saarc",
    name: "SAARC",
    hqName: "Kathmandu (Secretariat)",
    hqCoords: [27.7172, 85.3240],
    color: "#00FF88", // Glowing Green
    members: [
      { name: "Pakistan", coords: [33.6844, 73.0479] },
      { name: "India", coords: [28.6139, 77.2090] },
      { name: "Bangladesh", coords: [23.8103, 90.4125] },
      { name: "Sri Lanka", coords: [6.9271, 79.8612] },
      { name: "Nepal", coords: [27.7172, 85.3240] },
      { name: "Bhutan", coords: [27.4728, 89.6393] },
      { name: "Maldives", coords: [4.1755, 73.5093] },
      { name: "Afghanistan", coords: [34.5553, 69.2075] }
    ]
  },
  {
    id: "org-eco",
    name: "ECO",
    hqName: "Tehran (Secretariat)",
    hqCoords: [35.6892, 51.3890],
    color: "#00E5FF", // Cyan
    members: [
      { name: "Iran", coords: [35.6892, 51.3890] },
      { name: "Pakistan", coords: [33.6844, 73.0479] },
      { name: "Turkey", coords: [39.9334, 32.8597] },
      { name: "Afghanistan", coords: [34.5553, 69.2075] },
      { name: "Azerbaijan", coords: [40.4093, 49.8671] },
      { name: "Kazakhstan", coords: [51.1694, 71.4491] },
      { name: "Kyrgyzstan", coords: [42.8746, 74.5698] },
      { name: "Tajikistan", coords: [38.5358, 68.7791] },
      { name: "Turkmenistan", coords: [37.9601, 58.3261] },
      { name: "Uzbekistan", coords: [41.2995, 69.2401] }
    ]
  },
  {
    id: "org-sco",
    name: "SCO",
    hqName: "Beijing (Secretariat)",
    hqCoords: [39.9042, 116.4074],
    color: "#FFEA00", // Yellow
    members: [
      { name: "China", coords: [39.9042, 116.4074] },
      { name: "Russia", coords: [55.7558, 37.6173] },
      { name: "Kazakhstan", coords: [51.1694, 71.4491] },
      { name: "Kyrgyzstan", coords: [42.8746, 74.5698] },
      { name: "Tajikistan", coords: [38.5358, 68.7791] },
      { name: "Uzbekistan", coords: [41.2995, 69.2401] },
      { name: "India", coords: [28.6139, 77.2090] },
      { name: "Pakistan", coords: [33.6844, 73.0479] },
      { name: "Iran", coords: [35.6892, 51.3890] },
      { name: "Belarus", coords: [53.9006, 27.5590] }
    ]
  },
  {
    id: "org-oic",
    name: "OIC",
    hqName: "Jeddah (Secretariat)",
    hqCoords: [21.5433, 39.1728],
    color: "#E040FB", // Pink
    members: [
      { name: "Saudi Arabia", coords: [24.7136, 46.6753] },
      { name: "Pakistan", coords: [33.6844, 73.0479] },
      { name: "Turkey", coords: [39.9334, 32.8597] },
      { name: "Iran", coords: [35.6892, 51.3890] },
      { name: "Egypt", coords: [30.0444, 31.2357] },
      { name: "Indonesia", coords: [-6.2088, 106.8456] },
      { name: "Malaysia", coords: [3.1390, 101.6869] },
      { name: "Morocco", coords: [34.0209, -6.8416] }
    ]
  },
  {
    id: "org-nato",
    name: "NATO",
    hqName: "Brussels (HQ)",
    hqCoords: [50.8503, 4.3517],
    color: "#FF1744", // Red
    members: [
      { name: "Belgium (HQ)", coords: [50.8503, 4.3517] },
      { name: "United States", coords: [38.9072, -77.0369] },
      { name: "United Kingdom", coords: [51.5074, -0.1278] },
      { name: "France", coords: [48.8566, 2.3522] },
      { name: "Germany", coords: [52.5200, 13.4050] },
      { name: "Canada", coords: [45.4215, -75.6972] },
      { name: "Turkey", coords: [39.9334, 32.8597] },
      { name: "Italy", coords: [41.9028, 12.4964] }
    ]
  },
  {
    id: "org-un",
    name: "UN",
    hqName: "New York (HQ)",
    hqCoords: [40.7128, -74.0060],
    color: "#2979FF", // Blue
    members: [
      { name: "United States (P5)", coords: [38.9072, -77.0369] },
      { name: "United Kingdom (P5)", coords: [51.5074, -0.1278] },
      { name: "France (P5)", coords: [48.8566, 2.3522] },
      { name: "Russia (P5)", coords: [55.7558, 37.6173] },
      { name: "China (P5)", coords: [39.9042, 116.4074] }
    ]
  }
];

// Strategic Encyclopedia Regions
const MAP_REGIONS = [
  {
    id: "region-kashmir",
    name: "Kashmir Disputed Zone",
    category: "borders",
    color: "#FF3D00", 
    type: "polygon",
    coords: [
      [34.0, 74.0],
      [34.5, 74.0],
      [35.5, 75.0],
      [35.0, 76.5],
      [34.0, 76.5],
      [33.5, 75.0]
    ],
    description: "Line of Control and disputed Himalayan territories between India and Pakistan."
  },
  {
    id: "region-gaza",
    name: "Gaza Strip Flashpoint",
    category: "borders",
    color: "#FF3D00",
    type: "polygon",
    coords: [
      [31.59, 34.54],
      [31.51, 34.58],
      [31.42, 34.45],
      [31.25, 34.25],
      [31.20, 34.22],
      [31.28, 34.15],
      [31.35, 34.22],
      [31.59, 34.54]
    ],
    description: "Narrow coastal territory along the Mediterranean, central to the Middle East conflict."
  },
  {
    id: "region-taiwan",
    name: "Taiwan Strait Chokepoint",
    category: "straits",
    color: "#FFEA00", 
    type: "polygon",
    coords: [
      [26.0, 119.5],
      [26.5, 121.0],
      [23.0, 121.0],
      [22.5, 119.5]
    ],
    description: "Maritime boundary and strategic shipping lanes separating China from Taiwan."
  },
  {
    id: "region-falkland",
    name: "Falkland Islands (Islas Malvinas)",
    category: "borders",
    color: "#E040FB", 
    type: "polygon",
    coords: [
      [-51.3, -61.2],
      [-51.1, -59.5],
      [-51.5, -57.8],
      [-52.3, -58.3],
      [-52.4, -60.2],
      [-51.9, -61.3],
      [-51.3, -61.2]
    ],
    description: "Disputed British Overseas Territory in the South Atlantic claimed by Argentina."
  },
  {
    id: "region-kuril",
    name: "Kuril Islands Chain",
    category: "borders",
    color: "#E040FB",
    type: "polygon",
    coords: [
      [43.5, 145.8],
      [45.5, 148.0],
      [45.0, 149.0],
      [43.0, 146.5]
    ],
    description: "Volcanic archipelago disputed between Japan and Russia since WWII."
  }
];

// Strategic Straits and Chokepoints (For Atlas Mode list)
const EXTRA_ATLAS_ITEMS = [
  {
    id: "region-gibraltar",
    name: "Strait of Gibraltar",
    category: "straits",
    color: "#00E5FF",
    type: "polyline",
    coords: [
      [35.92, -5.60],
      [35.95, -5.45],
      [35.98, -5.30]
    ],
    description: "A narrow strait connecting the Atlantic Ocean to the Mediterranean Sea, separating Europe from Africa."
  },
  {
    id: "region-malacca",
    name: "Strait of Malacca",
    category: "straits",
    color: "#FF5722",
    type: "polyline",
    coords: [
      [5.50, 95.30],
      [4.00, 98.50],
      [2.20, 101.90],
      [1.20, 103.80]
    ],
    description: "A narrow stretch of water between the Malay Peninsula and Sumatra, linking the Indian Ocean to the Pacific."
  },
  {
    id: "region-hormuz",
    name: "Strait of Hormuz",
    category: "straits",
    color: "#FFEA00",
    type: "polyline",
    coords: [
      [26.35, 56.00],
      [26.65, 56.25],
      [26.55, 56.50],
      [26.15, 56.80]
    ],
    description: "The Strait of Hormuz is a vital oil transit channel separating Iran from the Arabian Peninsula."
  },
  {
    id: "region-bab",
    name: "Bab-el-Mandeb Strait",
    category: "straits",
    color: "#FF1744",
    type: "polyline",
    coords: [
      [12.95, 43.15],
      [12.65, 43.35],
      [12.35, 43.50]
    ],
    description: "A strategic strait between Yemen and Djibouti, linking the Red Sea to the Gulf of Aden."
  }
];

// 2. Initialize App
window.onload = function() {
  db = typeof ledgerDatabase !== 'undefined' ? ledgerDatabase : [];
  loadProgression();
  setMode('dashboard');
  updateProgressUI();
  
  if (window.innerWidth > 900) {
    initMap();
  }
};

// 3. Load & Save Progression
function loadProgression() {
  userXP = parseInt(localStorage.getItem('ledger_xp')) || 0;
  
  try {
    const savedStates = localStorage.getItem('ledger_card_states');
    cardStates = savedStates ? JSON.parse(savedStates) : {};
  } catch (e) {
    cardStates = {};
  }
  
  db.forEach(card => {
    if (!cardStates[card.id]) {
      cardStates[card.id] = 'unvetted';
    }
  });
  
  calculateRank();
}

function saveProgression() {
  localStorage.setItem('ledger_xp', userXP);
  localStorage.setItem('ledger_card_states', JSON.stringify(cardStates));
  updateProgressUI();
}

function calculateRank() {
  // Threshold updated: The Director at 200,000 XP
  if (userXP >= 200000) userRank = "The Director";
  else if (userXP >= 50000) userRank = "Assistant Director";
  else if (userXP >= 15000) userRank = "Station Chief";
  else if (userXP >= 5000) userRank = "Special Agent";
  else if (userXP >= 1500) userRank = "Field Agent";
  else userRank = "Field Informant";
}

function updateProgressUI() {
  document.getElementById('user-xp').innerText = String(userXP).padStart(4, '0');
  document.getElementById('user-rank').innerText = userRank;
  
  const total = db.length;
  if (total === 0) return;
  
  const securedCount = Object.values(cardStates).filter(s => s === 'secured').length;
  const integrityPercent = Math.round((securedCount / total) * 100);
  
  document.getElementById('integrity-bar').style.width = `${integrityPercent}%`;
  document.getElementById('integrity-val').innerText = `${integrityPercent}%`;
}

// Extract year
function extractYear(dossier) {
  const idParts = dossier.id.split('-');
  const lastPart = idParts[idParts.length - 1];
  if (lastPart.match(/^\d+$/) && lastPart.length === 4) {
    return lastPart;
  }
  
  const yearMatch = dossier.question.match(/\b\d{4}\b/);
  if (yearMatch) return yearMatch[0];
  
  return "General";
}

function sortYears(a, b) {
  if (a === "General") return 1;
  if (b === "General") return -1;
  return parseInt(a) - parseInt(b);
}

function parsePastPaper(paperString) {
  if (!paperString) return { designation: "General", year: "General" };
  const yearMatch = paperString.match(/\((\d{4})\)$/);
  const year = yearMatch ? yearMatch[1] : "General";
  let designation = paperString;
  if (yearMatch) {
    designation = paperString.substring(0, yearMatch.index).trim();
  }
  return { designation, year };
}

// 4. Directory Controller Navigation
function renderDirectory() {
  const container = document.getElementById('dossier-list');
  container.innerHTML = "";
  
  const backBtn = document.getElementById('btn-dir-back');
  const pathLabel = document.getElementById('dir-path');
  
  if (currentMode === 'dashboard') {
    backBtn.style.display = "none";
    pathLabel.innerText = "ROOT > SYLLABUS DASHBOARD";
    renderSyllabusDashboard(container);
    return;
  }
  
  if (currentMode === 'atlas') {
    renderGeopoliticalAtlas(container, backBtn, pathLabel);
    return;
  }
  
  if (activeExam) {
    backBtn.style.display = "inline-block";
    pathLabel.innerText = `ROOT > MOCK EXAMS > ${activeExam.paperName.toUpperCase()}`;
    renderExamBookletHTML(container);
    return;
  }
  
  if (selectedDossier) {
    backBtn.style.display = "inline-block";
    pathLabel.innerText = `${currentPath.join(' > ').toUpperCase()} > ${selectedDossier.id}`;
    renderDossierInlineHTML(container, selectedDossier);
    return;
  }
  
  if (currentPath.length > 1) {
    backBtn.style.display = "inline-block";
  } else {
    backBtn.style.display = "none";
  }
  pathLabel.innerText = currentPath.join(' > ').toUpperCase();
  
  if (searchQuery.trim() !== "") {
    pathLabel.innerText = `SEARCH RESULTS // "${searchQuery.toUpperCase()}"`;
    backBtn.style.display = "none";
    renderSearchResults(container);
    return;
  }
  
  const filtered = filterDatabase();
  
  if (currentMode === 'folders') {
    if (currentPath.length === 1) {
      const subjects = {};
      filtered.forEach(d => {
        subjects[d.subject] = (subjects[d.subject] || 0) + 1;
      });
      
      const grid = document.createElement('div');
      grid.className = 'directory-grid';
      
      Object.keys(subjects).sort().forEach(subj => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.onclick = () => navigateInto(subj);
        card.innerHTML = `
          <div class="folder-icon">📁</div>
          <div class="folder-title">${subj}</div>
          <div class="folder-count">${subjects[subj]} FILES</div>
        `;
        grid.appendChild(card);
      });
      container.appendChild(grid);
      
    } else if (currentPath.length === 2) {
      const selectedSubject = currentPath[1];
      const subSubjects = {};
      filtered.forEach(d => {
        if (d.subject === selectedSubject) {
          subSubjects[d.sub_subject] = (subSubjects[d.sub_subject] || 0) + 1;
        }
      });
      
      const grid = document.createElement('div');
      grid.className = 'directory-grid';
      
      Object.keys(subSubjects).sort().forEach(sub => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.onclick = () => navigateInto(sub);
        card.innerHTML = `
          <div class="folder-icon">📂</div>
          <div class="folder-title" style="font-size: 10px;">${sub}</div>
          <div class="folder-count">${subSubjects[sub]} FILES</div>
        `;
        grid.appendChild(card);
      });
      container.appendChild(grid);
      
    } else if (currentPath.length === 3) {
      const selectedSubject = currentPath[1];
      const selectedSubSubject = currentPath[2];
      const files = filtered.filter(d => d.subject === selectedSubject && d.sub_subject === selectedSubSubject);
      
      const list = document.createElement('div');
      list.className = 'file-list';
      
      files.forEach(d => {
        const state = cardStates[d.id] || 'unvetted';
        let statusDot = '⚪';
        if (state === 'secured') statusDot = '🟢';
        else if (state === 'compromised') statusDot = '🔴';
        
        const row = document.createElement('div');
        row.className = `file-row`;
        row.onclick = () => selectFile(d);
        row.innerHTML = `
          <div class="file-name">📄 ${d.dossier_name}</div>
          <div class="file-meta">
            <span class="tag-badge" style="font-size: 9px;">${d.id}</span>
            <span>${statusDot}</span>
          </div>
        `;
        list.appendChild(row);
      });
      container.appendChild(list);
    }
    
  } else if (currentMode === 'timeline') {
    if (currentPath.length === 1) {
      const years = {};
      filtered.forEach(d => {
        const y = extractYear(d);
        years[y] = (years[y] || 0) + 1;
      });
      
      const grid = document.createElement('div');
      grid.className = 'directory-grid';
      
      Object.keys(years).sort(sortYears).forEach(yr => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.onclick = () => navigateInto(yr);
        card.innerHTML = `
          <div class="folder-icon">📅</div>
          <div class="folder-title">${yr}</div>
          <div class="folder-count">${years[yr]} FILES</div>
        `;
        grid.appendChild(card);
      });
      container.appendChild(grid);
      
    } else if (currentPath.length === 2) {
      const selectedYear = currentPath[1];
      const files = filtered.filter(d => extractYear(d) === selectedYear);
      
      const list = document.createElement('div');
      list.className = 'file-list';
      
      files.forEach(d => {
        const state = cardStates[d.id] || 'unvetted';
        let statusDot = '⚪';
        if (state === 'secured') statusDot = '🟢';
        else if (state === 'compromised') statusDot = '🔴';
        
        const row = document.createElement('div');
        row.className = `file-row`;
        row.onclick = () => selectFile(d);
        row.innerHTML = `
          <div class="file-name">📄 ${d.dossier_name}</div>
          <div class="file-meta">
            <span class="tag-badge" style="font-size: 9px;">${d.id}</span>
            <span>${statusDot}</span>
          </div>
        `;
        list.appendChild(row);
      });
      container.appendChild(list);
    }
    
  } else if (currentMode === 'papers') {
    if (currentPath.length === 1) {
      const designations = new Set();
      filtered.forEach(d => {
        if (d.past_paper) {
          const parsed = parsePastPaper(d.past_paper);
          designations.add(parsed.designation);
        }
      });
      
      const grid = document.createElement('div');
      grid.className = 'directory-grid';
      
      Array.from(designations).sort().forEach(desg => {
        const count = filtered.filter(d => d.past_paper && parsePastPaper(d.past_paper).designation === desg).length;
        
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.style.borderColor = 'var(--color-accent)';
        card.onclick = () => navigateInto(desg);
        card.innerHTML = `
          <div class="folder-icon">💼</div>
          <div class="folder-title" style="font-size: 10px; line-height: 1.2;">${desg.toUpperCase()}</div>
          <div class="folder-count" style="border-color: var(--color-accent);">${count} QUESTIONS</div>
        `;
        grid.appendChild(card);
      });
      container.appendChild(grid);
      
    } else if (currentPath.length === 2) {
      const selectedDesignation = currentPath[1];
      const years = {};
      filtered.forEach(d => {
        if (d.past_paper) {
          const parsed = parsePastPaper(d.past_paper);
          if (parsed.designation === selectedDesignation) {
            years[parsed.year] = (years[parsed.year] || 0) + 1;
          }
        }
      });
      
      const grid = document.createElement('div');
      grid.className = 'directory-grid';
      
      Object.keys(years).sort().forEach(yr => {
        const fullPaperName = `${selectedDesignation} (${yr})`;
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.style.borderColor = 'var(--color-success)';
        card.onclick = () => launchMockExam(fullPaperName);
        card.innerHTML = `
          <div class="folder-icon">📝</div>
          <div class="folder-title">${yr}</div>
          <div class="folder-count" style="border-color: var(--color-success);">${years[yr]} QUESTIONS</div>
        `;
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }
  }
  
  plotMapMarkers();
}

// 4.5 Syllabus Progress Dashboard Renderer
function renderSyllabusDashboard(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-wrapper';
  
  const total = db.length;
  const secured = Object.values(cardStates).filter(s => s === 'secured').length;
  const compromised = Object.values(cardStates).filter(s => s === 'compromised').length;
  const unvetted = total - secured - compromised;
  const overallMastery = total > 0 ? Math.round((secured / total) * 100) : 0;
  
  // Overall statistics card
  const summaryCard = document.createElement('div');
  summaryCard.className = 'dashboard-summary-card';
  summaryCard.innerHTML = `
    <div class="summary-metric">
      <span class="summary-metric-val" style="color: var(--color-accent);">${overallMastery}%</span>
      <span class="summary-metric-label">Mastery</span>
    </div>
    <div class="summary-metric">
      <span class="summary-metric-val" style="color: var(--color-success);">${secured}</span>
      <span class="summary-metric-label">Secured</span>
    </div>
    <div class="summary-metric">
      <span class="summary-metric-val" style="color: var(--color-danger);">${compromised}</span>
      <span class="summary-metric-label">Compromised</span>
    </div>
    <div class="summary-metric">
      <span class="summary-metric-val" style="color: var(--text-muted);">${unvetted}</span>
      <span class="summary-metric-label">Unvetted</span>
    </div>
  `;
  wrapper.appendChild(summaryCard);
  
  // Group by subjects and calculate sub-subjects stats
  const subjects = {};
  db.forEach(d => {
    if (!subjects[d.subject]) {
      subjects[d.subject] = { total: 0, secured: 0, compromised: 0, subSubjects: {} };
    }
    subjects[d.subject].total++;
    const state = cardStates[d.id] || 'unvetted';
    if (state === 'secured') subjects[d.subject].secured++;
    else if (state === 'compromised') subjects[d.subject].compromised++;
    
    // Sub-subject mapping
    if (!subjects[d.subject].subSubjects[d.sub_subject]) {
      subjects[d.subject].subSubjects[d.sub_subject] = { total: 0, secured: 0, compromised: 0 };
    }
    subjects[d.subject].subSubjects[d.sub_subject].total++;
    if (state === 'secured') subjects[d.subject].subSubjects[d.sub_subject].secured++;
    else if (state === 'compromised') subjects[d.subject].subSubjects[d.sub_subject].compromised++;
  });
  
  Object.keys(subjects).sort().forEach(subj => {
    const s = subjects[subj];
    const mastery = Math.round((s.secured / s.total) * 100);
    
    let colorClass = 'low';
    if (mastery >= 70) colorClass = 'high';
    else if (mastery >= 40) colorClass = 'mid';
    
    const card = document.createElement('div');
    card.className = 'subject-mastery-card';
    
    const accordionId = "accordion-" + subj.replace(/\s+/g, '-');
    const arrowId = "arrow-" + subj.replace(/\s+/g, '-');
    
    card.innerHTML = `
      <div class="subject-mastery-header" onclick="toggleSubjectAccordion('${subj.replace(/'/g, "\\'")}')" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <span class="subject-mastery-title">${subj.toUpperCase()}</span>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="subject-mastery-stats">${s.secured} / ${s.total} SECURED (${mastery}%)</span>
          <span class="accordion-arrow" id="${arrowId}" style="transition: transform 0.2s; font-size: 10px; color: var(--text-secondary);">▼</span>
        </div>
      </div>
      <div class="subject-mastery-progress">
        <div class="subject-mastery-bar ${colorClass}" style="width: ${mastery}%"></div>
      </div>
      
      <!-- Sub-subject accordion grid -->
      <div class="subject-accordion-content" id="${accordionId}" style="display: none; margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 12px;">
        <div class="sub-subject-grid" style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          ${Object.keys(s.subSubjects).sort().map(sub => {
            const ss = s.subSubjects[sub];
            const ssPercent = Math.round((ss.secured / ss.total) * 100);
            return `
              <div class="sub-subject-row" onclick="selectSyllabusSubSubject('${subj.replace(/'/g, "\\'")}', '${sub.replace(/'/g, "\\'")}')" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--bg-input); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; transition: border-color 0.2s, background-color 0.2s;" onmouseover="this.style.borderColor='var(--border-focus)'; this.style.backgroundColor='var(--bg-card)';" onmouseout="this.style.borderColor='var(--border)'; this.style.backgroundColor='var(--bg-input)';">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-size: 11px; font-weight: 600; color: var(--text-primary); font-family: var(--font-sans);">${sub}</span>
                  <span style="font-size: 9px; color: var(--text-muted); font-family: var(--font-mono);">${ss.secured}/${ss.total} SECURED</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-success); font-weight: bold;">${ssPercent}%</span>
                  <span style="font-size: 10px; color: var(--color-accent);">➔</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    wrapper.appendChild(card);
  });
  
  container.appendChild(wrapper);
}

// Helper: Toggle Accordion on Dashboard
function toggleSubjectAccordion(subj) {
  const id = "accordion-" + subj.replace(/\s+/g, '-');
  const arrowId = "arrow-" + subj.replace(/\s+/g, '-');
  const elem = document.getElementById(id);
  const arrow = document.getElementById(arrowId);
  if (elem) {
    if (elem.style.display === "none") {
      elem.style.display = "block";
      arrow.innerText = "▲";
      arrow.style.color = "var(--color-accent)";
      highlightSubjectOnMap(subj);
    } else {
      elem.style.display = "none";
      arrow.innerText = "▼";
      arrow.style.color = "";
      plotMapMarkers();
    }
  }
}

// Helper: Highlight all markers in a subject
function highlightSubjectOnMap(subjectName) {
  if (!map) return;
  const bounds = L.latLngBounds();
  let count = 0;
  
  db.forEach(dossier => {
    if (dossier.subject === subjectName && dossier.coordinates && Array.isArray(dossier.coordinates)) {
      bounds.extend(dossier.coordinates);
      count++;
      if (mapMarkers[dossier.id]) {
        mapMarkers[dossier.id].openTooltip();
      }
    }
  });
  
  if (count > 0) {
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 6,
      animate: true,
      duration: 1.2
    });
  }
}

// Helper: Select Sub-Subject and navigate
function selectSyllabusSubSubject(subj, subSubject) {
  currentMode = 'folders';
  currentPath = ['Root', subj, subSubject];
  selectedDossier = null;
  selectedAtlasItem = null;
  
  document.getElementById('btn-mode-dashboard').classList.remove('active');
  document.getElementById('btn-mode-folders').classList.add('active');
  
  renderDirectory();
  
  setTimeout(() => {
    if (!map) return;
    const bounds = L.latLngBounds();
    let count = 0;
    db.forEach(d => {
      if (d.subject === subj && d.sub_subject === subSubject && d.coordinates && Array.isArray(d.coordinates)) {
        bounds.extend(d.coordinates);
        count++;
      }
    });
    if (count > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7, animate: true, duration: 1.2 });
    }
  }, 100);
}

// 4.6 Geopolitical Atlas / Encyclopedia Renderer
function renderGeopoliticalAtlas(container, backBtn, pathLabel) {
  if (selectedAtlasItem) {
    backBtn.style.display = "inline-block";
    pathLabel.innerText = `ROOT > ATLAS > ${selectedAtlasItem.name.toUpperCase()}`;
    renderAtlasItemDetailHTML(container, selectedAtlasItem);
    return;
  }
  
  if (currentPath.length === 1) {
    backBtn.style.display = "none";
    pathLabel.innerText = "ROOT > GEOPOLITICAL ATLAS";
    
    const grid = document.createElement('div');
    grid.className = 'directory-grid';
    
    const categories = [
      { name: "Strategic Straits & Chokepoints", key: "straits", icon: "🌊" },
      { name: "International Borders", key: "borders", icon: "🚧" },
      { name: "Mountain Passes", key: "passes", icon: "⛰️" },
      { name: "Major Rivers", key: "rivers", icon: "🏞️" }
    ];
    
    categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'folder-card';
      card.style.borderColor = 'var(--color-accent)';
      card.onclick = () => navigateInto(cat.key);
      card.innerHTML = `
        <div class="folder-icon">${cat.icon}</div>
        <div class="folder-title" style="font-size:10px;">${cat.name}</div>
        <div class="folder-count">EXPLORE</div>
      `;
      grid.appendChild(card);
    });
    container.appendChild(grid);
    
  } else if (currentPath.length === 2) {
    backBtn.style.display = "inline-block";
    const catKey = currentPath[1];
    pathLabel.innerText = `ROOT > ATLAS > ${catKey.toUpperCase()}`;
    
    const list = document.createElement('div');
    list.className = 'file-list';
    
    // Find all items belonging to this category
    const routes = MAP_ROUTES.filter(r => r.category === catKey);
    const regions = MAP_REGIONS.filter(r => r.category === catKey);
    const extras = EXTRA_ATLAS_ITEMS.filter(r => r.category === catKey);
    
    const allItems = [...routes, ...regions, ...extras].sort((a,b) => a.name.localeCompare(b.name));
    
    allItems.forEach(item => {
      const row = document.createElement('div');
      row.className = `file-row`;
      row.onclick = () => selectAtlasItemDetail(item);
      row.innerHTML = `
        <div class="file-name">📍 ${item.name}</div>
        <div class="file-meta">
          <span class="tag-badge" style="font-size: 9px; color: var(--color-success);">${item.type || 'region'}</span>
          <span>🟢</span>
        </div>
      `;
      list.appendChild(row);
    });
    
    container.appendChild(list);
  }
}

function selectAtlasItemDetail(item) {
  selectedAtlasItem = item;
  renderDirectory();
  
  if (!map) {
    initMap();
  }
  
  if (!map) return;
  
  // Highlight map shape
  orgOverlays.forEach(layer => map.removeLayer(layer));
  orgOverlays = [];
  regionOverlays.forEach(layer => map.removeLayer(layer));
  regionOverlays = [];
  
  const route = MAP_ROUTES.find(r => r.id === item.id);
  const region = MAP_REGIONS.find(r => r.id === item.id) || EXTRA_ATLAS_ITEMS.find(r => r.id === item.id);
  
  if (route) {
    highlightRouteOnMap(route.id);
  } else if (region) {
    highlightRegionOnMap(region.id);
  }
}

function renderAtlasItemDetailHTML(container, item) {
  const textToMatch = item.name.toLowerCase();
  
  // Find connected dossiers in database
  const connectedDossiers = db.filter(d => {
    const t = (d.dossier_name + " " + d.question + " " + d.connections.join(' ')).toLowerCase();
    return t.includes(textToMatch.split(' ')[0]) || (item.places && item.places.some(p => t.includes(p.toLowerCase())));
  });
  
  const detailSheet = document.createElement('div');
  detailSheet.className = 'dossier-sheet';
  detailSheet.style.marginTop = '10px';
  
  let connectedQuestionsHTML = '';
  if (connectedDossiers.length > 0) {
    connectedQuestionsHTML = `
      <div class="detail-block" style="margin-top: 20px;">
        <span class="detail-label">Connected PPSC Dossiers</span>
        <div class="file-list" style="margin-top:8px; gap:6px;">
          ${connectedDossiers.map(d => `
            <div class="file-row" style="padding: 8px 12px; font-size:12px; background-color: var(--bg-input);" onclick="selectDossierBypass('${d.id}')">
              <span>📄 ${d.dossier_name} (${d.id})</span>
              <span>➡️</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    connectedQuestionsHTML = `
      <div class="detail-block" style="margin-top: 20px;">
        <span class="detail-label">Connected PPSC Dossiers</span>
        <p class="detail-text" style="font-size:11px; color: var(--text-muted);">No matching dossiers in current local bank.</p>
      </div>
    `;
  }
  
  const storyText = item.id === "route-kkh" ? "Ah, the Karakoram. Flying down from Hunza with two cases of heavy water and a Chinese general who couldn't stop complaining about his altitude sickness. A road carved out of pure bedrock. It is a lifeline and a choke point all in one." :
    item.id === "route-indus" ? "The Indus is old, my friend. Older than kingdoms. I once spent a week on a cargo barge floating down near Sukkur. You can trade anything on that river if you know the local dock chiefs. It keeps the country alive." :
    item.id === "route-durand" ? "Durand. Sir Mortimer drew a line in 1893 that split the Pashtun heartland. Borders in those mountains are whispers. Nobody respects them, but everyone dies for them. I've crossed that border fifty times without a passport." :
    "This region is a chessboard, my friend. The treaties sign it away, the militaries fight for it, but the smuggling networks are the ones who actually run it. Know the layout, and you know who has the leverage.";

  detailSheet.innerHTML = `
    <div class="dossier-sec-header">
      <div>
        <span class="sec-code-stamp">GEOPOLITICAL ENCYCLOPEDIA // ${item.category.toUpperCase()}</span>
        <h3 class="sec-dossier-name" style="color: var(--color-warning);">${item.name}</h3>
      </div>
      <span class="tag-badge" style="color: var(--color-warning); border-color: var(--color-warning);">ATLAS MAP</span>
    </div>
    
    <div class="detail-block">
      <span class="detail-label">Specifications</span>
      <p class="detail-text"><strong>Metric/Length:</strong> ${item.length || 'Regional Boundary'}<br><strong>Entity Type:</strong> ${item.type || 'Disputed Geopolitical Region'}</p>
    </div>
    
    <div class="detail-block">
      <span class="detail-label">Strategic Overview</span>
      <p class="detail-text" style="font-size:13px; line-height:1.5; color: var(--text-secondary);">${item.description}</p>
    </div>
    
    ${item.places ? `
      <div class="detail-block">
        <span class="detail-label">Route connections</span>
        <p class="detail-text" style="font-family: var(--font-mono); font-size:11px; color: var(--color-accent);">${item.places.join(" ➔ ")}</p>
      </div>
    ` : ''}
    
    <div class="reddington-block">
      <span class="detail-label">Raymond's Field Notes</span>
      <p class="reddington-story-text" id="atlas-reddington-story"></p>
    </div>
    
    ${connectedQuestionsHTML}
    
    <div style="margin-top: 24px; text-align: center;">
      <button class="btn-terminal" style="background-color: var(--border); color: var(--text-primary); width: 100%; justify-content: center;" onclick="exitAtlasDetail()">⬅ BACK TO ATLAS LIST</button>
    </div>
  `;
  container.appendChild(detailSheet);
  typeWriterEffect('atlas-reddington-story', storyText, 15);
}

function selectDossierBypass(id) {
  const dossier = db.find(d => d.id === id);
  if (dossier) {
    selectedDossier = dossier;
    // Temporarily switch mode to folders so we can view the details correctly
    currentMode = 'folders';
    renderDirectory();
  }
}

function exitAtlasDetail() {
  selectedAtlasItem = null;
  renderDirectory();
}

function filterDatabase() {
  return db.filter(d => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      d.dossier_name.toLowerCase().includes(query) ||
      d.id.toLowerCase().includes(query) ||
      d.question.toLowerCase().includes(query) ||
      d.verified_answer.toLowerCase().includes(query) ||
      d.subject.toLowerCase().includes(query) ||
      d.sub_subject.toLowerCase().includes(query) ||
      (d.past_paper && d.past_paper.toLowerCase().includes(query)) ||
      d.connections.some(c => c.toLowerCase().includes(query))
    );
  });
}

function navigateInto(folderName) {
  currentPath.push(folderName);
  renderDirectory();
}

function navigateBack() {
  if (activeExam) {
    if (!activeExam.submitted && !confirm("Quit the Mock Exam? Your progress will be lost.")) {
      return;
    }
    clearInterval(activeExam.timerInterval);
    activeExam = null;
    renderDirectory();
    return;
  }
  
  if (selectedAtlasItem) {
    selectedAtlasItem = null;
    renderDirectory();
    return;
  }
  
  if (selectedDossier) {
    selectedDossier = null;
    renderDirectory();
    return;
  }
  
  if (currentPath.length > 1) {
    currentPath.pop();
    renderDirectory();
  }
}

function setMode(mode) {
  currentMode = mode;
  currentPath = ['Root'];
  selectedDossier = null;
  selectedAtlasItem = null;
  if (activeExam) {
    clearInterval(activeExam.timerInterval);
    activeExam = null;
  }
  
  document.getElementById('btn-mode-dashboard').classList.toggle('active', mode === 'dashboard');
  document.getElementById('btn-mode-folders').classList.toggle('active', mode === 'folders');
  document.getElementById('btn-mode-timeline').classList.toggle('active', mode === 'timeline');
  document.getElementById('btn-mode-papers').classList.toggle('active', mode === 'papers');
  document.getElementById('btn-mode-atlas').classList.toggle('active', mode === 'atlas');
  
  renderDirectory();
}

function handleSearch() {
  searchQuery = document.getElementById('console-search').value;
  selectedDossier = null;
  selectedAtlasItem = null;
  renderDirectory();
}

// Render search results
function renderSearchResults(container) {
  const filtered = filterDatabase();
  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state-small" style="text-align:center; padding: 30px; color: var(--text-muted); font-size: 12px;">No dossiers found matching query.</div>`;
    return;
  }
  
  const list = document.createElement('div');
  list.className = 'file-list';
  
  filtered.forEach(d => {
    const state = cardStates[d.id] || 'unvetted';
    let statusDot = '⚪';
    if (state === 'secured') statusDot = '🟢';
    else if (state === 'compromised') statusDot = '🔴';
    
    const row = document.createElement('div');
    row.className = `file-row`;
    row.onclick = () => selectFile(d);
    row.innerHTML = `
      <div class="file-name">📄 ${d.dossier_name}</div>
      <div class="file-meta">
        <span class="tag-badge" style="font-size: 9px; color: var(--color-accent);">${d.subject}</span>
        <span class="tag-badge" style="font-size: 9px;">${d.id}</span>
        <span>${statusDot}</span>
      </div>
    `;
    list.appendChild(row);
  });
  container.appendChild(list);
}

// 5. Select File (Triggering high-fidelity Map Focus, Routes, Orgs, and Regions highlights)
function selectFile(dossier) {
  selectedDossier = dossier;
  renderDirectory();
  
  if (!map) {
    initMap();
  }
  
  if (!map) return;
  
  // Clear any existing organisation & region overlays first
  orgOverlays.forEach(layer => map.removeLayer(layer));
  orgOverlays = [];
  regionOverlays.forEach(layer => map.removeLayer(layer));
  regionOverlays = [];
  
  // Compile texts to match
  const textToMatch = (dossier.dossier_name + " " + dossier.question + " " + dossier.context + " " + (dossier.overview || "") + " " + dossier.connections.join(' ')).toLowerCase();
  
  // 1. Check Route match
  let matchedRouteId = null;
  if (textToMatch.includes("karakoram") || /\bkkh\b/.test(textToMatch)) matchedRouteId = "route-kkh";
  else if (/\bindus\b/.test(textToMatch)) matchedRouteId = "route-indus";
  else if (/\bdurand\b/.test(textToMatch)) matchedRouteId = "route-durand";
  else if (textToMatch.includes("sino-pak") || textToMatch.includes("sino-pakistan")) matchedRouteId = "route-sinopak";
  else if (/\bkhyber\b/.test(textToMatch)) matchedRouteId = "route-khyber";
  else if (/\bbolan\b/.test(textToMatch)) matchedRouteId = "route-bolan";
  else if (/\bbabusar\b/.test(textToMatch)) matchedRouteId = "route-babusar";
  else if (/\blowari\b/.test(textToMatch)) matchedRouteId = "route-lowari";
  
  // 2. Check Organisation match
  let matchedOrgId = null;
  if (/\bsaarc\b/.test(textToMatch)) matchedOrgId = "org-saarc";
  else if (/\beco\b/.test(textToMatch) || textToMatch.includes("economic cooperation")) matchedOrgId = "org-eco";
  else if (/\bsco\b/.test(textToMatch) || textToMatch.includes("shanghai cooperation")) matchedOrgId = "org-sco";
  else if (/\boic\b/.test(textToMatch) || textToMatch.includes("islamic cooperation")) matchedOrgId = "org-oic";
  else if (/\bnato\b/.test(textToMatch) || textToMatch.includes("north atlantic")) matchedOrgId = "org-nato";
  else if (textToMatch.includes("united nations") || /\bun\b/.test(textToMatch)) matchedOrgId = "org-un";
  
  // 3. Check Region match
  let matchedRegionId = null;
  if (/\bkashmir\b/.test(textToMatch)) matchedRegionId = "region-kashmir";
  else if (/\bgaza\b/.test(textToMatch)) matchedRegionId = "region-gaza";
  else if (/\btaiwan\b/.test(textToMatch)) matchedRegionId = "region-taiwan";
  else if (/\bfalkland\b/.test(textToMatch)) matchedRegionId = "region-falkland";
  else if (/\bkuril\b/.test(textToMatch)) matchedRegionId = "region-kuril";
  else if (/\bgibraltar\b/.test(textToMatch)) matchedRegionId = "region-gibraltar";
  else if (/\bmalacca\b/.test(textToMatch)) matchedRegionId = "region-malacca";
  else if (/\bhormuz\b/.test(textToMatch)) matchedRegionId = "region-hormuz";
  else if (/\bbab-el-mandeb\b/.test(textToMatch) || /\bmandeb\b/.test(textToMatch)) matchedRegionId = "region-bab";

  // Trigger Map updates based on priorities
  if (matchedOrgId) {
    highlightOrganisationOnMap(matchedOrgId);
  } else if (matchedRegionId) {
    highlightRegionOnMap(matchedRegionId);
  } else if (matchedRouteId) {
    highlightRouteOnMap(matchedRouteId);
  } else if (dossier.coordinates) {
    // Normal single-point dossier marker focus
    map.flyTo(dossier.coordinates, 6, { animate: true, duration: 1.2 });
    if (mapMarkers[dossier.id]) {
      mapMarkers[dossier.id].openTooltip();
    }
  }
  
  // Auto panel switch on mobile so map lights up
  if (window.innerWidth <= 900 && (matchedOrgId || matchedRegionId || matchedRouteId || dossier.coordinates)) {
    switchMobilePanel('right');
  }
}

function highlightRouteOnMap(routeId) {
  mapPolylines.forEach(p => {
    const route = MAP_ROUTES.find(r => r.id === p.options.routeId);
    if (route) {
      p.setStyle({
        color: route.color,
        weight: 4,
        opacity: 0.8
      });
      const el = p.getElement();
      if (el) {
        el.classList.remove('marching-ants-active');
      }
    }
  });
  
  const targetPolyline = mapPolylines.find(p => p.options.routeId === routeId);
  const route = MAP_ROUTES.find(r => r.id === routeId);
  
  if (targetPolyline && route) {
    targetPolyline.setStyle({
      color: "#FF00FF", 
      weight: 7,
      opacity: 1.0
    });
    const el = targetPolyline.getElement();
    if (el) {
      el.classList.add('marching-ants-active');
    }
    
    map.fitBounds(targetPolyline.getBounds(), {
      padding: [60, 60],
      maxZoom: 7,
      animate: true,
      duration: 1.2
    });
    
    const midIdx = Math.floor(route.coords.length / 2);
    targetPolyline.openPopup(route.coords[midIdx]);
  }
}

function highlightOrganisationOnMap(orgId) {
  const org = ORGANISATIONS.find(o => o.id === orgId);
  if (!org || !map) return;
  
  const bounds = L.latLngBounds();
  
  const hqMarkerHtml = `
    <div class="tactical-marker hq-marker" style="background-color: ${org.color}; border-color: #FFFFFF; box-shadow: 0 0 12px ${org.color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #FFFFFF; position: relative;">
      <div style="position: absolute; top: -6px; left: -6px; width: 24px; height: 24px; border-radius: 50%; border: 2px dashed ${org.color}; animation: pulse-ring 2s infinite; pointer-events: none;"></div>
    </div>
  `;
  
  const hqIcon = L.divIcon({
    html: hqMarkerHtml,
    className: 'custom-leaflet-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  
  const hqMarker = L.marker(org.hqCoords, { icon: hqIcon }).addTo(map);
  hqMarker.bindTooltip(`<strong>HQ: ${org.name}</strong><br><span style="font-size:10px;">${org.hqName}</span>`, {
    permanent: true,
    direction: 'top',
    offset: [0, -8],
    className: 'tactical-tooltip'
  }).openTooltip();
  
  orgOverlays.push(hqMarker);
  bounds.extend(org.hqCoords);
  
  org.members.forEach(member => {
    const isHQ = member.coords[0] === org.hqCoords[0] && member.coords[1] === org.hqCoords[1];
    
    if (!isHQ) {
      const memberMarkerHtml = `
        <div class="tactical-marker member-marker" style="background-color: var(--text-muted); border-color: ${org.color}; box-shadow: 0 0 4px ${org.color}; width: 8px; height: 8px; border-radius: 50%; border: 1px solid ${org.color};"></div>
      `;
      
      const memberIcon = L.divIcon({
        html: memberMarkerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [8, 8],
        iconAnchor: [4, 4]
      });
      
      const memberMarker = L.marker(member.coords, { icon: memberIcon }).addTo(map);
      memberMarker.bindTooltip(`${member.name}`, {
        permanent: true,
        direction: 'right',
        className: 'tactical-tooltip'
      });
      
      orgOverlays.push(memberMarker);
      bounds.extend(member.coords);
    }
    
    const dottedLine = L.polyline([org.hqCoords, member.coords], {
      color: org.color,
      weight: 2,
      dashArray: "5, 7",
      opacity: 0.75
    }).addTo(map);
    
    orgOverlays.push(dottedLine);
  });
  
  map.fitBounds(bounds, {
    padding: [80, 80],
    maxZoom: 6,
    animate: true,
    duration: 1.5
  });
}

function highlightRegionOnMap(regionId) {
  const region = MAP_REGIONS.find(r => r.id === regionId) || EXTRA_ATLAS_ITEMS.find(r => r.id === regionId);
  if (!region || !map) return;
  
  let shapeLayer = null;
  if (region.type === "polygon") {
    shapeLayer = L.polygon(region.coords, {
      color: region.color,
      fillColor: region.color,
      fillOpacity: 0.15,
      weight: 3,
      dashArray: "4, 4"
    }).addTo(map);
  } else if (region.type === "polyline") {
    shapeLayer = L.polyline(region.coords, {
      color: region.color,
      weight: 5,
      className: 'marching-ants-route'
    }).addTo(map);
  } else if (region.type === "circle") {
    shapeLayer = L.circle(region.coords, {
      radius: region.radius,
      color: region.color,
      fillColor: region.color,
      fillOpacity: 0.15,
      weight: 3,
      dashArray: "4, 4"
    }).addTo(map);
  }
  
  if (shapeLayer) {
    shapeLayer.bindPopup(`
      <div style="font-family: var(--font-sans); color: var(--text-primary); padding: 5px; min-width: 180px;">
        <h4 style="margin: 0 0 6px 0; color: ${region.color}; font-family: var(--font-mono); border-bottom: 1px solid var(--border); padding-bottom: 4px;">${region.name.toUpperCase()}</h4>
        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">${region.description}</p>
      </div>
    `, {
      className: 'tactical-popup'
    }).openPopup();
    
    regionOverlays.push(shapeLayer);
    
    if (region.type === "polygon" || region.type === "polyline") {
      map.fitBounds(shapeLayer.getBounds(), { padding: [65, 65], animate: true, duration: 1.5 });
    } else {
      map.setView(region.coords, 8, { animate: true, duration: 1.5 });
    }
  }
}

function renderDossierInlineHTML(container, dossier) {
  const state = cardStates[dossier.id] || 'unvetted';
  let securityTag = '<span class="tag-badge" style="color: var(--text-muted);">UNVETTED</span>';
  if (state === 'secured') {
    securityTag = '<span class="tag-badge" style="color: var(--color-success); border-color: var(--color-success);">SECURED</span>';
  } else if (state === 'compromised') {
    securityTag = '<span class="tag-badge" style="color: var(--color-danger); border-color: var(--color-danger);">COMPROMISED</span>';
  }

  const connBadges = dossier.connections.map(c => `<span class="tag-badge" onclick="searchConnection('${c}')" style="cursor:pointer; margin-right: 4px; margin-bottom: 4px;">#${c}</span>`).join('');
  
  const detailSheet = document.createElement('div');
  detailSheet.className = 'dossier-sheet';
  detailSheet.style.marginTop = '10px';
  detailSheet.innerHTML = `
    <div class="dossier-sec-header">
      <div>
        <span class="sec-code-stamp">${dossier.id} // ${dossier.division.toUpperCase()}</span>
        <h3 class="sec-dossier-name">${dossier.dossier_name}</h3>
      </div>
      ${securityTag}
    </div>
    
    <div class="detail-block">
      <span class="detail-label">Syllabus Mapping</span>
      <p class="detail-text" style="font-weight: 600; color: var(--color-accent);">${dossier.subject} &mdash; ${dossier.sub_subject}</p>
    </div>
    
    <div class="detail-block">
      <span class="detail-label">Verified PPSC Question</span>
      <p class="detail-text" style="font-size: 14px; font-weight: 600; line-height: 1.5;">${dossier.question}</p>
    </div>
    
    <div class="detail-block">
      <span class="detail-label">Verified Answer</span>
      <p class="detail-text" style="font-family: var(--font-mono); font-size: 15px; color: var(--color-success); font-weight: bold; background-color: var(--bg-input); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--border);">${dossier.verified_answer}</p>
    </div>
    
    <div class="detail-block">
      <span class="detail-label">Academic Context</span>
      <p class="detail-text">${dossier.context}</p>
    </div>
    
    <div class="reddington-block">
      <span class="detail-label">Raymond's Intel Briefing</span>
      <p class="reddington-story-text" id="dossier-reddington-story"></p>
    </div>
    
    <div class="detail-block" style="margin-top: 20px;">
      <span class="detail-label">Connected Nodes</span>
      <div style="margin-top: 8px; display: flex; flex-wrap: wrap;">
        ${connBadges}
      </div>
    </div>
    
    <div style="margin-top: 24px; display: flex; gap: 10px;">
      <button class="btn-terminal" style="background-color: var(--color-success); border-color: var(--color-success); flex: 1; justify-content: center;" onclick="verifyQuestionChoice('${dossier.id}', true)">🟢 MARK SECURED</button>
      <button class="btn-terminal" style="background-color: var(--color-danger); border-color: var(--color-danger); flex: 1; justify-content: center;" onclick="verifyQuestionChoice('${dossier.id}', false)">🔴 MARK COMPROMISED</button>
    </div>
    
    <div style="margin-top: 14px; text-align: center;">
      <button class="btn-terminal" style="background-color: var(--border); color: var(--text-primary); width: 100%; justify-content: center;" onclick="navigateBack()">⬅ BACK</button>
    </div>
  `;
  container.appendChild(detailSheet);
  typeWriterEffect('dossier-reddington-story', dossier.reddington_story, 15);
}

function verifyQuestionChoice(id, isSecure) {
  cardStates[id] = isSecure ? 'secured' : 'compromised';
  userXP += isSecure ? 15 : 0;
  saveProgression();
  renderDirectory();
}

function searchConnection(keyword) {
  document.getElementById('console-search').value = keyword;
  searchQuery = keyword;
  selectedDossier = null;
  selectedAtlasItem = null;
  renderDirectory();
}

// 6. Mock Exam 100-MCQ Booklet Engine
function launchMockExam(paperName) {
  if (activeExam && activeExam.timerInterval) {
    clearInterval(activeExam.timerInterval);
  }
  
  const paperSpecific = db.filter(d => d.past_paper === paperName);
  const bookletQuestions = [...paperSpecific];
  const paperIds = new Set(paperSpecific.map(d => d.id));
  
  const pool = db.filter(d => !paperIds.has(d.id));
  const shuffledPool = pool.sort(() => 0.5 - Math.random());
  
  let padIndex = 0;
  while (bookletQuestions.length < 100 && padIndex < shuffledPool.length) {
    bookletQuestions.push(shuffledPool[padIndex]);
    padIndex++;
  }
  
  const finalBooklet = bookletQuestions.sort(() => 0.5 - Math.random());
  
  const processedQuestions = finalBooklet.map(dossier => {
    const correct = dossier.verified_answer;
    const distractors = db
      .filter(d => d.id !== dossier.id && d.subject === dossier.subject)
      .map(d => d.verified_answer);
    
    const pickedDistributors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    while (pickedDistributors.length < 3) {
      const filler = db
        .filter(d => d.id !== dossier.id && !pickedDistributors.includes(d.verified_answer))
        .map(d => d.verified_answer)
        .sort(() => 0.5 - Math.random())[0];
      if (filler) pickedDistributors.push(filler);
      else break;
    }
    
    const options = [correct, ...pickedDistributors].sort(() => 0.5 - Math.random());
    return {
      dossier: dossier,
      options: options,
      correctOption: correct
    };
  });
  
  activeExam = {
    paperName: paperName,
    questions: processedQuestions,
    choices: Array(100).fill(null),
    timer: 0,
    timerInterval: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
    netScore: 0
  };
  
  activeExam.timerInterval = setInterval(() => {
    activeExam.timer++;
    const minutes = String(Math.floor(activeExam.timer / 60)).padStart(2, '0');
    const seconds = String(activeExam.timer % 60).padStart(2, '0');
    const timerElem = document.getElementById('exam-timer');
    if (timerElem) {
      timerElem.innerText = `${minutes}:${seconds}`;
    }
  }, 1000);
  
  renderDirectory();
  document.getElementById('dossier-list').scrollTop = 0;
}

function renderExamBookletHTML(container) {
  const booklet = document.createElement('div');
  booklet.className = 'exam-booklet';
  
  const minutes = String(Math.floor(activeExam.timer / 60)).padStart(2, '0');
  const seconds = String(activeExam.timer % 60).padStart(2, '0');
  
  let scoreBannerHTML = '';
  if (activeExam.submitted) {
    scoreBannerHTML = `
      <div class="exam-score-banner" style="text-align: left; line-height: 1.4;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px;">🎉 MOCK EXAM COMPLETED!</div>
        <div style="font-family: var(--font-mono); font-size: 13px;">
          <strong>Correct answers:</strong> ${activeExam.correctCount} (Points: +${activeExam.correctCount})<br>
          <strong style="color: var(--color-danger);">Incorrect answers:</strong> ${activeExam.incorrectCount} (Penalty: -${(activeExam.incorrectCount * 0.25).toFixed(2)})<br>
          <strong>Skipped questions:</strong> ${activeExam.skippedCount} (0.00)<br>
          <hr style="border-color: var(--border); margin: 6px 0;">
          <span style="font-size: 16px; color: var(--color-warning);">NET PPSC SCORE: ${activeExam.netScore.toFixed(2)} / 100</span>
        </div>
        <span style="font-size: 11px; font-weight: normal; color: var(--text-secondary); display:block; margin-top:8px;">Integrity secured: +${Math.max(0, Math.round(activeExam.netScore * 10))} XP added to progression.</span>
      </div>
    `;
  }
  
  booklet.innerHTML = `
    ${scoreBannerHTML}
    <div class="exam-header">
      <div class="exam-meta-strip">
        <span>BOOKLET TYPE // PPSC-100-MOCK</span>
        <div class="exam-timer-box">⏱️ <span id="exam-timer">${minutes}:${seconds}</span></div>
      </div>
      <h3 class="exam-title">${activeExam.paperName}</h3>
      <span class="console-subtitle">// 100 MCQs Booklet &mdash; PPSC Negative Marking Mode (-0.25)</span>
    </div>
    
    <div class="exam-questions-sheet" id="exam-questions-sheet">
      ${activeExam.questions.map((q, idx) => {
        const selectedVal = activeExam.choices[idx];
        const isCorrect = selectedVal === q.correctOption;
        
        let reviewBoxHTML = '';
        if (activeExam.submitted) {
          reviewBoxHTML = `
            <div class="exam-review-box">
              <div class="review-label">Mnemonic explanation</div>
              <strong>Correct:</strong> ${q.correctOption}<br>
              <span style="font-style: italic; display:block; margin-top:4px;">${q.dossier.reddington_story}</span>
            </div>
          `;
        }
        
        return `
          <div class="exam-question-item">
            <div class="exam-q-num">QUESTION ${idx + 1} OF 100</div>
            <div class="exam-q-text">${q.dossier.question}</div>
            
            <div class="exam-options-grid">
              ${q.options.map(opt => {
                let statusClass = '';
                if (selectedVal === opt) statusClass = 'selected';
                
                if (activeExam.submitted) {
                  if (opt === q.correctOption) {
                    statusClass = 'correct';
                  } else if (selectedVal === opt && !isCorrect) {
                    statusClass = 'incorrect';
                  }
                }
                
                const disabledAttr = activeExam.submitted ? 'disabled' : '';
                const clickAction = activeExam.submitted ? '' : `onclick="selectExamOption(${idx}, '${opt.replace(/'/g, "\\'")}')"`;
                
                return `
                  <button class="exam-opt-btn ${statusClass}" ${disabledAttr} ${clickAction}>
                    ${opt}
                  </button>
                `;
              }).join('')}
            </div>
            ${reviewBoxHTML}
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="exam-actions">
      <button class="btn-terminal" style="background-color: var(--border); color: var(--text-primary); box-shadow:none;" onclick="navigateBack()">QUIT</button>
      ${!activeExam.submitted ? `
        <button class="btn-terminal" style="background-color: var(--color-success); border-color: var(--color-success);" onclick="submitMockExam()">SUBMIT MOCK EXAM</button>
      ` : `
        <button class="btn-terminal" style="background-color: var(--color-accent); border-color: var(--color-accent);" onclick="navigateBack()">FINISH REVIEW</button>
      `}
    </div>
  `;
  container.appendChild(booklet);
}

function selectExamOption(questionIdx, optionText) {
  if (activeExam.submitted) return;
  
  // Toggle choice if selected again to allow skipping/clearing selection
  if (activeExam.choices[questionIdx] === optionText) {
    activeExam.choices[questionIdx] = null;
  } else {
    activeExam.choices[questionIdx] = optionText;
  }
  
  const scrollPos = document.getElementById('exam-questions-sheet').scrollTop;
  const container = document.getElementById('dossier-list');
  container.innerHTML = "";
  renderExamBookletHTML(container);
  
  document.getElementById('exam-questions-sheet').scrollTop = scrollPos;
}

function submitMockExam() {
  if (activeExam.submitted) return;
  
  const unansweredCount = activeExam.choices.filter(c => c === null).length;
  if (unansweredCount > 0) {
    if (!confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
      return;
    }
  }
  
  clearInterval(activeExam.timerInterval);
  activeExam.submitted = true;
  
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  
  activeExam.questions.forEach((q, idx) => {
    const choice = activeExam.choices[idx];
    if (choice === null) {
      skipped++;
    } else if (choice === q.correctOption) {
      correct++;
      cardStates[q.dossier.id] = 'secured';
    } else {
      incorrect++;
      cardStates[q.dossier.id] = 'compromised';
    }
  });
  
  const net = (correct * 1.0) - (incorrect * 0.25);
  
  activeExam.correctCount = correct;
  activeExam.incorrectCount = incorrect;
  activeExam.skippedCount = skipped;
  activeExam.netScore = net;
  activeExam.score = correct;
  
  // Earn XP based on Net Score
  const xpEarned = Math.max(0, Math.round(net * 10));
  userXP += xpEarned;
  
  saveProgression();
  calculateRank();
  updateProgressUI();
  
  const container = document.getElementById('dossier-list');
  container.innerHTML = "";
  renderExamBookletHTML(container);
}

// 7. Tactical Geographical Map (Leaflet) Controller
function initMap() {
  if (map) return; 
  
  const mapContainer = document.getElementById('tactical-map');
  if (!mapContainer) return;
  
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  
  map = L.map('tactical-map', {
    zoomControl: false,
    attributionControl: true
  }).setView([30.0, 70.0], 5.5);
  
  const tileUrl = isLight 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
  L.tileLayer(tileUrl, {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);
  
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);
  
  // Plot Continental Blocks
  if (typeof MAP_CONTINENTS !== 'undefined') {
    MAP_CONTINENTS.forEach(cont => {
      L.polygon(cont.coords, {
        color: cont.color,
        weight: 1,
        dashArray: "4, 8",
        fillColor: cont.color,
        fillOpacity: 0.02,
        interactive: false
      }).addTo(map);
    });
  }
  
  plotMapMarkers();
}

function plotMapMarkers() {
  if (!map) return;
  
  for (let id in mapMarkers) {
    map.removeLayer(mapMarkers[id]);
  }
  mapMarkers = {};
  
  mapPolylines.forEach(p => map.removeLayer(p));
  mapPolylines = [];
  
  let itemsToPlot = [];
  
  if (activeExam) {
    itemsToPlot = activeExam.questions.map(q => q.dossier);
  } else if (selectedDossier) {
    itemsToPlot = [selectedDossier];
  } else if (selectedAtlasItem) {
    itemsToPlot = [];
  } else if (searchQuery.trim() !== "") {
    itemsToPlot = filterDatabase().slice(0, 100); // Limit search plots to 100 to avoid lag
  } else {
    if (currentMode === 'folders') {
      if (currentPath.length === 3) {
        const selectedSubject = currentPath[1];
        const selectedSubSubject = currentPath[2];
        itemsToPlot = db.filter(d => d.subject === selectedSubject && d.sub_subject === selectedSubSubject);
      }
    } else if (currentMode === 'timeline') {
      if (currentPath.length === 2) {
        const selectedYear = currentPath[1];
        itemsToPlot = db.filter(d => extractYear(d) === selectedYear);
      }
    }
  }
  
  itemsToPlot.forEach(dossier => {
    if (dossier.coordinates && Array.isArray(dossier.coordinates)) {
      const state = cardStates[dossier.id] || 'unvetted';
      let color = '#7C5CF5'; 
      if (state === 'secured') color = '#00FF88'; 
      else if (state === 'compromised') color = '#FF3D00'; 
      
      const markerHtml = `
        <div class="tactical-marker ${state}" style="background-color: ${color}; border-color: ${color}; box-shadow: 0 0 8px ${color}; width: 12px; height: 12px; border-radius: 50%; position: relative;">
          <div class="marker-pulse" style="position: absolute; top: -4px; left: -4px; width: 18px; height: 18px; border-radius: 50%; border: 1px solid ${color}; opacity: 0.8; animation: pulse-ring 1.5s infinite; pointer-events: none;"></div>
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      
      const marker = L.marker(dossier.coordinates, { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          selectFile(dossier);
        });
        
      const shortAnswer = (dossier.verified_answer && dossier.verified_answer.length < 20) ? `: ${dossier.verified_answer}` : '';
      marker.bindTooltip(`<strong>${dossier.dossier_name}${shortAnswer}</strong>`, {
        permanent: true,
        direction: 'top',
        offset: [0, -6],
        className: 'tactical-tooltip'
      });
      
      mapMarkers[dossier.id] = marker;
    }
  });
  
  // Plot Routed Polylines with hover buffers
  MAP_ROUTES.forEach(route => {
    // 1. Thin visible line
    const visiblePolyline = L.polyline(route.coords, {
      color: route.color,
      weight: 4,
      dashArray: route.dashArray || null,
      opacity: 0.8,
      routeId: route.id,
      className: 'marching-ants-route'
    }).addTo(map);
    
    // 2. Thick invisible hover buffer line
    const bufferPolyline = L.polyline(route.coords, {
      weight: 20,
      opacity: 0,
      interactive: true
    }).addTo(map);
    
    const popupContent = `
      <div style="font-family: var(--font-sans); color: var(--text-primary); padding: 5px; min-width: 200px;">
        <h4 style="margin: 0 0 6px 0; color: ${route.color}; font-family: var(--font-mono); border-bottom: 1px solid var(--border); padding-bottom:4px;">${route.name.toUpperCase()}</h4>
        <div style="font-size: 11px; margin-bottom: 4px;"><strong>Length:</strong> ${route.length}</div>
        <div style="font-size: 11px; margin-bottom: 4px;"><strong>Geography type:</strong> ${route.type.toUpperCase()}</div>
        <div style="font-size: 11px; margin-bottom: 6px; line-height: 1.4;"><strong>Connected places:</strong> ${route.places.join(" ➔ ")}</div>
        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">${route.description}</p>
      </div>
    `;
    
    bufferPolyline.bindPopup(popupContent, {
      className: 'tactical-popup'
    });
    
    bufferPolyline.on('mouseover', function() {
      visiblePolyline.setStyle({ weight: 6, opacity: 1.0 });
    });
    
    bufferPolyline.on('mouseout', function() {
      visiblePolyline.setStyle({ weight: 4, opacity: 0.8 });
    });
    
    bufferPolyline.on('click', function() {
      highlightRouteOnMap(route.id);
    });
    
    mapPolylines.push(visiblePolyline);
    mapPolylines.push(bufferPolyline);
  });
}

// 8. Fullscreen Header Drill (Popup Quick Quiz)
function launchDrillMode() {
  const currentList = filterDatabase();
  
  if (currentList.length === 0) {
    alert("No dossiers available to drill.");
    return;
  }
  
  const priorityList = [...currentList].sort((a, b) => {
    const valA = cardStates[a.id] === 'compromised' ? 0 : (cardStates[a.id] === 'unvetted' ? 1 : 2);
    const valB = cardStates[b.id] === 'compromised' ? 0 : (cardStates[b.id] === 'unvetted' ? 1 : 2);
    return valA - valB;
  });
  
  drillQueue = priorityList.slice(0, 5);
  currentDrillIndex = 0;
  
  document.getElementById('drill-overlay').style.display = 'flex';
  loadDrillQuestion();
}

function loadDrillQuestion() {
  selectedOption = null;
  const dossier = drillQueue[currentDrillIndex];
  const container = document.getElementById('drill-content');
  
  const distractors = db
    .filter(d => d.id !== dossier.id && d.subject === dossier.subject)
    .map(d => d.verified_answer);
    
  const pickedDistributors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  while (pickedDistributors.length < 3) {
    const filler = db
      .filter(d => d.id !== dossier.id && !pickedDistributors.includes(d.verified_answer))
      .map(d => d.verified_answer)
      .sort(() => 0.5 - Math.random())[0];
    if (filler) pickedDistributors.push(filler);
    else break;
  }
  
  const allOptions = [dossier.verified_answer, ...pickedDistributors].sort(() => 0.5 - Math.random());
  
  container.innerHTML = `
    <div class="drill-q-num">QUESTION ${currentDrillIndex + 1} OF ${drillQueue.length}</div>
    <div class="drill-q-text">${dossier.question}</div>
    
    <div class="drill-options-grid" id="drill-options">
      ${allOptions.map(opt => `
        <button class="btn-option" onclick="selectDrillOption(this, '${opt.replace(/'/g, "\\'")}')">
          ${opt}
        </button>
      `).join('')}
    </div>
    
    <div id="drill-result-panel"></div>
    
    <div class="drill-actions">
      <button class="btn-terminal" style="background-color: var(--border); color: var(--text-primary); box-shadow: none;" onclick="exitDrillMode()">QUIT</button>
      <button class="btn-terminal" id="btn-submit-drill" onclick="submitDrillAnswer()" disabled>SUBMIT ANSWER</button>
    </div>
  `;
}

function selectDrillOption(button, option) {
  selectedOption = option;
  
  const buttons = document.querySelectorAll('#drill-options .btn-option');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  button.classList.add('selected');
  document.getElementById('btn-submit-drill').removeAttribute('disabled');
}

function submitDrillAnswer() {
  const dossier = drillQueue[currentDrillIndex];
  const isCorrect = selectedOption === dossier.verified_answer;
  
  const resultPanel = document.getElementById('drill-result-panel');
  const submitBtn = document.getElementById('btn-submit-drill');
  
  const buttons = document.querySelectorAll('#drill-options .btn-option');
  buttons.forEach(btn => {
    btn.setAttribute('disabled', 'true');
    if (btn.innerText.trim() === dossier.verified_answer) {
      btn.classList.add('correct');
    } else if (btn.classList.contains('selected') && !isCorrect) {
      btn.classList.add('incorrect');
    }
    btn.classList.remove('selected');
  });
  
  if (isCorrect) {
    cardStates[dossier.id] = 'secured';
    userXP += 15;
    resultPanel.innerHTML = `
      <div class="drill-result-alert success">🟢 CORRECT! (+15 XP)</div>
      <div class="reveal-briefing-box">
        <div class="reddington-block">
          <span class="detail-label">Raymond's Field Notes</span>
          <p class="reddington-story-text" id="drill-reddington-story"></p>
        </div>
      </div>
    `;
  } else {
    cardStates[dossier.id] = 'compromised';
    resultPanel.innerHTML = `
      <div class="drill-result-alert danger">🔴 INCORRECT. RECORD COMPROMISED</div>
      <div class="reveal-briefing-box">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
          <strong>Correct Answer:</strong> ${dossier.verified_answer}
        </div>
        <div class="reddington-block">
          <span class="detail-label">Raymond's Field Notes</span>
          <p class="reddington-story-text" id="drill-reddington-story"></p>
        </div>
      </div>
    `;
  }
  
  typeWriterEffect('drill-reddington-story', dossier.reddington_story, 15);
  
  saveProgression();
  calculateRank();
  updateProgressUI();
  
  if (currentDrillIndex < drillQueue.length - 1) {
    submitBtn.outerHTML = `<button class="btn-terminal" onclick="nextDrillQuestion()">NEXT QUESTION</button>`;
  } else {
    submitBtn.outerHTML = `<button class="btn-terminal" style="background-color: var(--color-success);" onclick="finishDrillSession()">FINISH QUIZ</button>`;
  }
}

function nextDrillQuestion() {
  currentDrillIndex++;
  loadDrillQuestion();
}

function finishDrillSession() {
  exitDrillMode();
  if (drillQueue.length > 0) {
    selectFile(drillQueue[drillQueue.length - 1]);
  }
}

// 9. Load Intel Packs JSON Importer
function importIntelPack(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        const valid = imported.every(item => item.id && item.division && item.question && item.verified_answer);
        if (valid) {
          let addedCount = 0;
          imported.forEach(item => {
            const exists = db.some(d => d.id === item.id);
            if (!exists) {
              db.push(item);
              cardStates[item.id] = 'unvetted';
              addedCount++;
            }
          });
          
          alert(`Success: Loaded ${addedCount} new dossiers!`);
          saveProgression();
          renderDirectory();
        } else {
          alert("Error: Invalid JSON structure.");
        }
      } else {
        alert("Error: File must contain an array of dossiers.");
      }
    } catch (err) {
      alert("Error parsing JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// 10. Theme Toggling
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', next);
  
  const themeIcon = document.querySelector('.btn-theme-toggle .theme-icon');
  themeIcon.innerText = next === 'dark' ? '🌙' : '☀️';
  
  if (map) {
    map.remove();
    map = null;
    initMap();
  }
}

// Mobile responsive tabs switching
function switchMobilePanel(panelName) {
  const leftTab = document.getElementById('mobile-tab-left');
  const rightTab = document.getElementById('mobile-tab-right');
  
  if (leftTab) leftTab.classList.toggle('active', panelName === 'left');
  if (rightTab) rightTab.classList.toggle('active', panelName === 'right');
  
  const leftPanel = document.querySelector('.panel-left');
  const rightPanel = document.querySelector('.panel-right');
  
  if (leftPanel) leftPanel.classList.toggle('mobile-active', panelName === 'left');
  if (rightPanel) rightPanel.classList.toggle('mobile-active', panelName === 'right');
  
  if (panelName === 'right') {
    if (!map) {
      initMap();
    }
    if (map) {
      setTimeout(() => { map.invalidateSize(); }, 50);
      setTimeout(() => { map.invalidateSize(); }, 200);
      setTimeout(() => { map.invalidateSize(); }, 500);
    }
  }
}

function exitDrillMode() {
  document.getElementById('drill-overlay').style.display = 'none';
  renderDirectory();
}

function typeWriterEffect(elementId, text, speed = 15) {
  const elem = document.getElementById(elementId);
  if (!elem) return;
  elem.innerHTML = "";
  let i = 0;
  
  if (elem.typewriterInterval) {
    clearInterval(elem.typewriterInterval);
  }
  
  elem.typewriterInterval = setInterval(() => {
    if (i < text.length) {
      elem.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(elem.typewriterInterval);
      elem.typewriterInterval = null;
    }
  }, speed);
}
