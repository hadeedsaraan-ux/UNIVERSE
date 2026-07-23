// ============================================================
// NARRATION — "scientist" voice using the browser's built-in
// Speech Synthesis. No audio files needed, no downloads.
// ============================================================

let narrationEnabled = true;
let preferredVoice = null;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
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
  window.speechSynthesis.onvoiceschanged = () => { preferredVoice = pickVoice(); };
  preferredVoice = pickVoice();
}

function narrate(text) {
  if (!narrationEnabled) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
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
  factsArray.forEach((line) => {
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

// ============================================================
// AMBIENT "SUN SOUND" — inspired by real helioseismology
// (scientists convert the Sun's internal vibrations to audible
// sound). This is a synthesized low rumble + soft solar-wind
// texture, not a real recording — space itself has no sound.
// ============================================================
let audioCtx = null;
let droneNodes = null;
let ambientOn = false;
let introSpoken = false;

function makeNoiseBuffer(ctx, seconds) {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // cheap brown-noise smoothing
    data[i] = last * 3.5;
  }
  return buffer;
}

function startAmbientHum() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (droneNodes) return;

  // two detuned low oscillators = the "solar rumble"
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  osc1.type = "sine"; osc2.type = "sine";
  osc1.frequency.value = 52;
  osc2.frequency.value = 55.5;

  // filtered noise = the "solar wind" texture
  const noise = audioCtx.createBufferSource();
  noise.buffer = makeNoiseBuffer(audioCtx, 4);
  noise.loop = true;
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 220;

  // slow LFO to make the filter "breathe" like a living star
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 60;
  lfo.connect(lfoGain).connect(noiseFilter.frequency);

  const oscGain = audioCtx.createGain();
  const noiseGain = audioCtx.createGain();
  oscGain.gain.value = 0.0001;
  noiseGain.gain.value = 0.0001;
  oscGain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 3);
  noiseGain.gain.exponentialRampToValueAtTime(0.025, audioCtx.currentTime + 3);

  osc1.connect(oscGain);
  osc2.connect(oscGain);
  noise.connect(noiseFilter).connect(noiseGain);
  oscGain.connect(audioCtx.destination);
  noiseGain.connect(audioCtx.destination);

  osc1.start(); osc2.start(); noise.start(); lfo.start();

  droneNodes = { osc1, osc2, noise, lfo, oscGain, noiseGain };

  if (!introSpoken) {
    introSpoken = true;
    setTimeout(() => narrate("Scientists convert the Sun's internal vibrations into sound. This hum is inspired by that idea."), 400);
  }
}

function stopAmbientHum() {
  if (!droneNodes) return;
  const { osc1, osc2, noise, lfo, oscGain, noiseGain } = droneNodes;
  oscGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
  setTimeout(() => {
    osc1.stop(); osc2.stop(); noise.stop(); lfo.stop();
  }, 1100);
  droneNodes = null;
}

function toggleAmbient(value) {
  ambientOn = value;
  if (value) startAmbientHum();
  else stopAmbientHum();
}
