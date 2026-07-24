// ============================================================
// BODY SOUND — synthesized "signature tone" per object.
// No spoken narration, no facts — just sound, based on each
// body's soundFreq/soundStyle from bodies-data.js.
// ============================================================

let audioCtx = null;
let activeSound = null;

function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function makeNoiseBuffer(seconds) {
  const bufferSize = audioCtx.sampleRate * seconds;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

function playBodySound(data) {
  try {
    stopBodySound();
    ensureAudioCtx();
    const freq = data.soundFreq || 150;
    const now = audioCtx.currentTime;
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.connect(audioCtx.destination);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 1.2);

    const nodes = { masterGain };

    if (data.soundStyle === "chirp") {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 0.18;
      lfoGain.gain.value = freq * 0.5;
      lfo.connect(lfoGain).connect(osc.frequency);

      const noise = audioCtx.createBufferSource();
      noise.buffer = makeNoiseBuffer(4);
      noise.loop = true;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = freq;
      noiseFilter.Q.value = 0.7;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.5;

      osc.connect(masterGain);
      noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);

      osc.start(); lfo.start(); noise.start();
      Object.assign(nodes, { osc, lfo, noise });
    } else {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      osc1.type = "sine"; osc2.type = "sine";
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 1.045;

      const noise = audioCtx.createBufferSource();
      noise.buffer = makeNoiseBuffer(4);
      noise.loop = true;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = freq * 3;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.3;

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 0.06;
      lfoGain.gain.value = freq * 0.8;
      lfo.connect(lfoGain).connect(noiseFilter.frequency);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);

      osc1.start(); osc2.start(); noise.start(); lfo.start();
      Object.assign(nodes, { osc1, osc2, noise, lfo });
    }

    activeSound = nodes;
  } catch (err) {
    console.error("Sound could not start:", err);
  }
}

function stopBodySound() {
  if (!activeSound) return;
  const { masterGain } = activeSound;
  try {
    const now = audioCtx.currentTime;
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    const nodesToStop = activeSound;
    setTimeout(() => {
      Object.values(nodesToStop).forEach(n => { if (n && n.stop) { try { n.stop(); } catch(e){} } });
    }, 700);
  } catch (err) {
    console.error("Sound stop error:", err);
  }
  activeSound = null;
}
