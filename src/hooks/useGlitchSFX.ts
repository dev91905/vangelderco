import { useCallback, useRef } from "react";

const useGlitchSFX = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playHoverGlitch = useCallback(() => {
    const ctx = getCtx();
    const duration = 0.05;
    const now = ctx.currentTime;

    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 3000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  }, [getCtx]);

  const playClickGlitch = useCallback(() => {
    const ctx = getCtx();
    const duration = 0.1;
    const now = ctx.currentTime;

    // Saw wave sweep
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + duration);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.04, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // Noise burst layered on top
    const bufferSize = Math.ceil(ctx.sampleRate * duration * 0.6);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

    noiseSource.connect(filter).connect(noiseGain).connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + duration * 0.6);
  }, [getCtx]);

  const playChitter = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const popCount = 5;
    const interval = 0.03;
    const popDuration = 0.02;

    for (let i = 0; i < popCount; i++) {
      const t = now + i * interval;
      const bufferSize = Math.ceil(ctx.sampleRate * popDuration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 4000 + Math.random() * 2000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + popDuration);

      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(t);
      source.stop(t + popDuration);
    }
  }, [getCtx]);

  return { playHoverGlitch, playClickGlitch, playChitter };
};

export default useGlitchSFX;
