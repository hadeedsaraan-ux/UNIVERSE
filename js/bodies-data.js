// ============================================================
// SOLAR SYSTEM — DAILY DATA FILE
// ============================================================
// Har naya planet/moon add karne ke liye, bas neeche wali
// SOLAR_BODIES list mein ek naya object { } add kar dein.
// Engine (js/engine.js) khud-ba-khud usko render, orbit,
// aur click-to-narrate de dega. Is file ke alawa kuch
// change karne ki zaroorat nahi.
//
// NAYE OPTIONAL FIELDS (agar realistic dikhana ho):
//   texture: "image ka URL"       -> planet ki asli surface
//   clouds: "image ka URL"        -> Earth jaisa clouds layer
//   atmosphere: true              -> halka glow around planet
//   special: "sun"                -> sirf Sun ke liye (glow+texture)
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
    facts: [
      "The Sun holds ninety nine point eight percent of all the mass in our solar system.",
      "Light from the Sun takes about eight minutes to reach Earth.",
      "The Sun's core burns at around fifteen million degrees Celsius."
    ]
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
    facts: [
      "Earth is the only known planet with liquid water on its surface.",
      "One full orbit around the Sun takes Earth three hundred sixty five days.",
      "Earth's atmosphere is mostly nitrogen, with only about twenty one percent oxygen."
    ]
  }

  // ---- KAL SE YAHAN NAYE OBJECTS ADD HONGE ----
];
