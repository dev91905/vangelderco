import { useCallback, useRef } from "react";

const useGlitchSFX = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playHoverGlitch = useCallback(async () => {
    const ctx = await getCtx();
    const duration = 0.08;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 220;

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.03, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + duration);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 330;

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.015, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + duration);
  }, [getCtx]);

  const playClickGlitch = useCallback(async () => {
    const ctx = await getCtx();
    const duration = 0.15;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + duration);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.04, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + duration);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(165, now);
    osc2.frequency.exponentialRampToValueAtTime(135, now + duration);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.02, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + duration);
  }, [getCtx]);

  const playChitter = useCallback(async () => {
    const ctx = await getCtx();
    const now = ctx.currentTime;
    const pitches = [300, 320, 280, 340];
    const pipDuration = 0.04;
    const interval = 0.05;

    pitches.forEach((freq, i) => {
      const t = now + i * interval;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.02, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + pipDuration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + pipDuration);
    });
  }, [getCtx]);

  return { playHoverGlitch, playClickGlitch, playChitter };
};

export default useGlitchSFX;
