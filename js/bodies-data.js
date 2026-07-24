// ============================================================
// SOLAR SYSTEM — DAILY DATA FILE
// ============================================================
// Naya body add karne ke liye bas SOLAR_BODIES list mein ek
// naya object add karein. soundFreq/soundStyle us body ki
// "signature tone" set karte hain (real recorded frequency data
// se inspired synthesis — space mein sound travel nahi karta,
// ye ek sonification hai).
//
// soundStyle options: "drone" (deep steady hum, sitaron/gas giants ke liye)
//                      "chirp" (rising-falling warble, magnetosphere waali cheez, planets ke liye)
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
    color: 0x9c9186,
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
    color: 0xe8d9a0,
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
  }

  // ---- KAL SE YAHAN NAYE OBJECTS ADD HONGE ----
];
