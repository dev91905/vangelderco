// Singleton audio engine — one context shared across all components
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }
  // Fire-and-forget resume — don't block
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

function playHoverGlitch() {
  const c = getCtx();
  const dest = getMaster();
  const duration = 0.08;
  const now = c.currentTime + 0.005; // tiny offset to survive context startup

  const osc1 = c.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 220;

  const gain1 = c.createGain();
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.03, now + 0.01);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(gain1).connect(dest);
  osc1.start(now);
  osc1.stop(now + duration);

  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 330;

  const gain2 = c.createGain();
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(0.015, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc2.connect(gain2).connect(dest);
  osc2.start(now);
  osc2.stop(now + duration);
}

function playClickGlitch() {
  const c = getCtx();
  const dest = getMaster();
  const duration = 0.15;
  const now = c.currentTime + 0.005;

  const osc1 = c.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(110, now);
  osc1.frequency.exponentialRampToValueAtTime(90, now + duration);

  const gain1 = c.createGain();
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.04, now + 0.01);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(gain1).connect(dest);
  osc1.start(now);
  osc1.stop(now + duration);

  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(165, now);
  osc2.frequency.exponentialRampToValueAtTime(135, now + duration);

  const gain2 = c.createGain();
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(0.02, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc2.connect(gain2).connect(dest);
  osc2.start(now);
  osc2.stop(now + duration);
}

function playChitter() {
  const c = getCtx();
  const dest = getMaster();
  const baseTime = c.currentTime + 0.005;
  const pitches = [300, 320, 280, 340];
  const pipDuration = 0.04;
  const interval = 0.05;

  pitches.forEach((freq, i) => {
    const t = baseTime + i * interval;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + pipDuration);

    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + pipDuration);
  });
}

function playUnlockSuccess() {
  const c = getCtx();
  const dest = getMaster();
  const now = c.currentTime + 0.005;

  // Tone 1 — low "click"
  const osc1 = c.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 220;
  const gain1 = c.createGain();
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.04, now + 0.01);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc1.connect(gain1).connect(dest);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Tone 2 — higher "resolve", overlaps slightly
  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 440;
  const gain2 = c.createGain();
  const t2 = now + 0.08;
  gain2.gain.setValueAtTime(0.001, t2);
  gain2.gain.linearRampToValueAtTime(0.05, t2 + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.15);
  osc2.connect(gain2).connect(dest);
  osc2.start(t2);
  osc2.stop(t2 + 0.15);
}

// Hook is now just a stable reference wrapper
const useGlitchSFX = () => {
  return { playHoverGlitch, playClickGlitch, playChitter, playUnlockSuccess };
};

export default useGlitchSFX;
