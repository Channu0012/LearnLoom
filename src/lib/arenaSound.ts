// ---------------------------------------------------------------------------
// VeySkill Arena — Synthesized Audio FX & Haptic Engine
// Procedural audio generation using the Web Audio API (zero external assets).
// Provides instant, zero-latency feedback for countdown, clicks, correct,
// wrong, streak flares, and victory fanfares.
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// ── Sound Settings Persistence ───────────────────────────────────────────────

const SOUND_STORAGE_KEY = "veyskill_arena_sound_enabled";
let inMemorySoundEnabled = true;

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return inMemorySoundEnabled;
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== null ? val !== "false" : inMemorySoundEnabled;
  } catch {
    return inMemorySoundEnabled;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  inMemorySoundEnabled = enabled;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch {}
}

// ── Mobile Haptic Feedback ───────────────────────────────────────────────────

export function triggerHaptic(pattern: number | number[] = 15): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
}

// ── Procedural Sound Effects ─────────────────────────────────────────────────

/** Soft tick for countdown seconds (3... 2... 1...) */
export function playCountdownTick(pitch = 520): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, now);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/** Triumphant GO! tone when round commences */
export function playBattleStart(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [659.25, 880, 1108.73].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + idx * 0.04);

    gain.gain.setValueAtTime(0.12, now + idx * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.04);
    osc.stop(now + 0.35);
  });
  triggerHaptic([30, 20, 40]);
}

/** Subtle tap when selecting an option */
export function playOptionSelect(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
  triggerHaptic(12);
}

/** Uplifting major arpeggio for a correct answer */
export function playCorrectSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, i) => {
    const startTime = now + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.14, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.28);
  });
  triggerHaptic([20, 30, 40]);
}

/** Low muffled thud for incorrect answer */
export function playWrongSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
  triggerHaptic(70);
}

/** Ascending pitch flourish for consecutive streak combos (x2, x3, x4) */
export function playStreakSound(streak: number): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const baseFreq = 587.33 * Math.pow(1.08, Math.min(streak, 6)); // D5 scaled

  [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + i * 0.04);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.35);

    gain.gain.setValueAtTime(0.14, now + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.04);
    osc.stop(now + 0.35);
  });
  triggerHaptic([30, 40, 60]);
}

/** Celebratory Victory Fanfare */
export function playVictoryFanfare(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5, G5, C6 arpeggio with brass cadence
  const sequence = [
    { freq: 523.25, time: 0.0, dur: 0.12 },
    { freq: 659.25, time: 0.12, dur: 0.12 },
    { freq: 783.99, time: 0.24, dur: 0.15 },
    { freq: 1046.5, time: 0.4, dur: 0.45 },
    { freq: 1318.51, time: 0.55, dur: 0.6 },
  ];

  sequence.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.18, now + time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
  triggerHaptic([40, 50, 40, 50, 100]);
}
