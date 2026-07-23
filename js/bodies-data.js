// ============================================================
// SOLAR SYSTEM — DAILY DATA FILE
// ============================================================
// Har naya planet/moon add karne ke liye, bas neeche wali
// SOLAR_BODIES list mein ek naya object { } add kar dein.
// Engine (js/engine.js) khud-ba-khud usko render, orbit,
// aur click-to-narrate de dega. Is file ke alawa kuch
// change karne ki zaroorat nahi.
// ============================================================

const SOLAR_BODIES = [
  {
    id: "sun",
    name: "Sun",
    type: "star",           // "star" | "planet" | "moon"
    radius: 6,               // visual size
    color: 0xffcc33,
    emissive: 0xffaa00,      // sun glows
    orbitRadius: 0,          // sun sits at center
    orbitSpeed: 0,
    rotationSpeed: 0.001,
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
    radius: 1.2,
    color: 0x2277ff,
    orbitRadius: 40,
    orbitSpeed: 0.010,
    rotationSpeed: 0.02,
    facts: [
      "Earth is the only known planet with liquid water on its surface.",
      "One full orbit around the Sun takes Earth three hundred sixty five days.",
      "Earth's atmosphere is mostly nitrogen, with only about twenty one percent oxygen."
    ]
  }

  // ---- KAL SE YAHAN NAYE OBJECTS ADD HONGE, JAISE: ----
  // {
  //   id: "moon",
  //   name: "Moon",
  //   type: "moon",
  //   radius: 0.35,
  //   color: 0xaaaaaa,
  //   orbitsAround: "earth",   // moon ke liye parent body ka id
  //   orbitRadius: 3.5,
  //   orbitSpeed: 0.04,
  //   rotationSpeed: 0.005,
  //   facts: [
  //     "The Moon is slowly drifting away from Earth every year.",
  //     "The same side of the Moon always faces Earth."
  //   ]
  // },
];
