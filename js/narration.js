// ============================================================
// NARRATION — "scientist" voice using the browser's built-in
// Speech Synthesis. No audio files needed, no downloads.
// ============================================================

let narrationEnabled = true;
let preferredVoice = null;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  // Prefer a deeper/male-sounding English voice if available, to feel like a documentary narrator.
  const priorities = [
    v => /Daniel|Google UK English Male|Microsoft David|Alex/i.test(v.name),
    v => /Male/i.test(v.name) && /en/i.test(v.lang),
    v => /en/i.test(v.lang),
  ];
  for (const test of priorities) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0];
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickVoice();
  };
  preferredVoice = pickVoice();
}

function narrate(text) {
  if (!narrationEnabled) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // stop any previous line
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.85;
  utter.volume = 1;
  if (preferredVoice) utter.voice = preferredVoice;
  window.speechSynthesis.speak(utter);
}

function narrateFacts(factsArray) {
  if (!narrationEnabled) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  factsArray.forEach((line, i) => {
    const utter = new SpeechSynthesisUtterance(line);
    utter.rate = 0.95;
    utter.pitch = 0.85;
    if (preferredVoice) utter.voice = preferredVoice;
    window.speechSynthesis.speak(utter);
  });
}

function stopNarration() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function setNarrationEnabled(value) {
  narrationEnabled = value;
  if (!value) stopNarration();
}

// ============================================================
// AMBIENT SPACE HUM — generated with Web Audio, no files needed
// ============================================================
let audioCtx = null;
let droneNodes = null;
let ambientOn = false;

function startAmbientHum() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (droneNodes) return;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = 55;   // low drone
  osc2.frequency.value = 58.5; // slightly detuned for a wide, spacey feel

  gain.gain.value = 0.0001;
  gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start();
  osc2.start();

  droneNodes = { osc1, osc2, gain };
}

function stopAmbientHum() {
  if (!droneNodes) return;
  const { osc1, osc2, gain } = droneNodes;
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
  setTimeout(() => {
    osc1.stop(); osc2.stop();
  }, 1100);
  droneNodes = null;
}

function toggleAmbient(value) {
  ambientOn = value;
  if (value) startAmbientHum();
  else stopAmbientHum();
}
