let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isAudioMuted = muted;
  try {
    localStorage.setItem('spellbee_sound_muted', muted ? 'true' : 'false');
  } catch {
    // ignore storage error
  }
}

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('spellbee_sound_muted') === 'true';
  } catch {
    return false;
  }
}

/**
 * Play a sparkling ascending chord for correct answers
 */
export function playCorrectSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.4);
  });
}

/**
 * Play a gentle, encouraging boop when child misses an option
 */
export function playWrongSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

/**
 * Play soft woodblock tick for countdown timer
 */
export function playTickSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.07);
}

/**
 * Play cheerful victory fanfare for round completion or high streak
 */
export function playFanfareSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 440, delay: 0, duration: 0.12 },
    { freq: 554.37, delay: 0.12, duration: 0.12 },
    { freq: 659.25, delay: 0.24, duration: 0.12 },
    { freq: 880, delay: 0.36, duration: 0.45 },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, now + n.delay);

    gain.gain.setValueAtTime(0, now + n.delay);
    gain.gain.linearRampToValueAtTime(0.2, now + n.delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + n.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + n.delay);
    osc.stop(now + n.delay + n.duration + 0.05);
  });
}

/**
 * Web Speech API for Pronouncer Bee
 */
export function speakStatement(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean up statement: replace blank indicators like "_____" with the word "blank"
    const cleaned = text.replace(/_{2,}/g, 'blank');

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.9; // Slightly deliberate for clear children pronunciation
    utterance.pitch = 1.05; // Slightly warm/friendly pitch
    utterance.lang = 'en-US';

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakWordSlowly(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.75; // Slower for spelling bee pronunciation
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech word error:', err);
  }
}
