// ============================================================
// SOLAR SYSTEM — DAILY DATA FILE
// ============================================================
// orbitSpeed values Mercury ko "standard/fastest" maan kar
// real orbital periods ke ratio se calculate kiye gaye hain.
//
// bands: [color, color, ...]  -> gas giants ke liye striped look
// rings: true                  -> Saturn/Uranus jaisi rings
// axialTilt: degrees           -> planet apni spin-axis par kitna "leta" hua hai
//                                  (negative rotationSpeed = ulta/retrograde ghoomta hai)
// ============================================================

const SOLAR_BODIES = [
  {
    id: "sun",
    name: "Sun",
    type: "star",
    special: "sun",
    radius: 16,
    color: 0xffcc33,
    orbitRadius: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.0008,
    soundFreq: 60,
    soundStyle: "drone"
  },
  {
    id: "mercury",
    name: "Mercury",
    type: "planet",
    radius: 0.55,
    color: 0x8c8378,
    orbitRadius: 26,
    orbitSpeed: 0.042,
    rotationSpeed: 0.001,
    soundFreq: 95,
    soundStyle: "drone"
  },
  {
    id: "venus",
    name: "Venus",
    type: "planet",
    radius: 1.33,
    color: 0xd9b46a,
    orbitRadius: 34,
    orbitSpeed: 0.016427,
    rotationSpeed: -0.0005,
    soundFreq: 110,
    soundStyle: "drone"
  },
  {
    id: "earth",
    name: "Earth",
    type: "planet",
    radius: 1.4,
    color: 0x2277ff,
    texture: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg",
    clouds: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png",
    atmosphere: true,
    orbitRadius: 46,
    orbitSpeed: 0.010126,
    rotationSpeed: 0.02,
    soundFreq: 220,
    soundStyle: "chirp"
  },
  {
    id: "mars",
    name: "Mars",
    type: "planet",
    radius: 0.75,
    color: 0xb5502f,
    orbitRadius: 66,
    orbitSpeed: 0.005382,
    rotationSpeed: 0.018,
    soundFreq: 130,
    soundStyle: "drone"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    radius: 5.2,
    bands: ["#d8ca9d", "#c2a67c", "#e8dcc0", "#b98b5e", "#d8ca9d", "#c9a876"],
    orbitRadius: 105,
    orbitSpeed: 0.0008533,
    rotationSpeed: 0.04,
    soundFreq: 160,
    soundStyle: "chirp"
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "planet",
    radius: 3.6,
    bands: ["#e8dcb0", "#d8c68f", "#f0e6c0", "#c9b57a"],
    rings: true,
    axialTilt: 27,
    orbitRadius: 150,
    orbitSpeed: 0.0003437,
    rotationSpeed: 0.038,
    soundFreq: 140,
    soundStyle: "chirp"
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "planet",
    radius: 2.3,
    color: 0xa8dee0,
    rings: true,
    axialTilt: 98,
    orbitRadius: 210,
    orbitSpeed: 0.0001204,
    rotationSpeed: -0.03,
    soundFreq: 100,
    soundStyle: "chirp"
  }

  // ---- KAL SE YAHAN NAYE OBJECTS ADD HONGE ----
];
