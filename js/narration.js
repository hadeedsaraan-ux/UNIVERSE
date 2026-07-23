// ============================================================
// NARRATION — "scientist" robotic voice using the browser's
// built-in Speech Synthesis. No audio files, no ambient sound —
// it only speaks when you click a body.
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

function narrateFacts(factsArray) {
  if (!narrationEnabled) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  factsArray.forEach((line) => {
    const utter = new SpeechSynthesisUtterance(line);
    utter.rate = 0.95;
    utter.pitch = 0.8;
    if (preferredVoice) utter.voice = preferredVoice;
    window.speechSynthesis.speak(utter);
  });
}

function stopNarration() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
