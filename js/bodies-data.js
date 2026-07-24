// ============================================================
// SOLAR SYSTEM — DAILY DATA FILE
// ============================================================
// Naya body add karne ke liye bas SOLAR_BODIES list mein ek
// naya object add karein.
//
// soundStyle options: "drone" (deep steady hum)
//                      "chirp" (rising-falling warble)
//
// bands: [color, color, ...]  -> gas giants ke liye striped look
//         (Jupiter/Saturn/Uranus/Neptune jaise, image download nahi hoti,
//          engine khud bands bana deta hai)
// ============================================================

const SOLAR_BODIES = [
  {
    id: "sun",
    name: "Sun",
    type: "star",
    special: "sun",
    radius: 7,
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
    orbitRadius: 22,
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
    orbitRadius: 27,
    orbitSpeed: 0.0162,
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
    orbitRadius: 38,
    orbitSpeed: 0.010,
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
    orbitRadius: 58,
    orbitSpeed: 0.0053,
    rotationSpeed: 0.018,
    soundFreq: 130,
    soundStyle: "drone"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "planet",
    radius: 7.0,
    bands: ["#d8ca9d", "#c2a67c", "#e8dcc0", "#b98b5e", "#d8ca9d", "#c9a876"],
    orbitRadius: 90,
    orbitSpeed: 0.00084,
    rotationSpeed: 0.04,
    soundFreq: 160,
    soundStyle: "chirp"
  }

  // ---- KAL SE YAHAN NAYE OBJECTS ADD HONGE ----
];

