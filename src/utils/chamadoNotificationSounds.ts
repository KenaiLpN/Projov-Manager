export const CHAMADO_NOTIFICATION_SOUNDS = [
  {
    id: "sino",
    label: "Sino",
    description: "Duas notas claras e objetivas.",
  },
  {
    id: "suave",
    label: "Alerta suave",
    description: "Sequência discreta de três notas.",
  },
  {
    id: "digital",
    label: "Digital",
    description: "Bipes curtos com tom eletrônico.",
  },
  {
    id: "campainha",
    label: "Campainha",
    description: "Toque duplo mais destacado.",
  },
] as const;

export type ChamadoNotificationSound =
  (typeof CHAMADO_NOTIFICATION_SOUNDS)[number]["id"];

type Tone = {
  frequency: number;
  offset: number;
  duration: number;
  volume: number;
  wave: OscillatorType;
};

const soundTones: Record<ChamadoNotificationSound, Tone[]> = {
  sino: [
    { frequency: 880, offset: 0, duration: 0.2, volume: 0.08, wave: "sine" },
    { frequency: 1320, offset: 0.14, duration: 0.34, volume: 0.07, wave: "sine" },
  ],
  suave: [
    { frequency: 523.25, offset: 0, duration: 0.18, volume: 0.045, wave: "sine" },
    { frequency: 659.25, offset: 0.16, duration: 0.18, volume: 0.045, wave: "sine" },
    { frequency: 783.99, offset: 0.32, duration: 0.3, volume: 0.04, wave: "sine" },
  ],
  digital: [
    { frequency: 880, offset: 0, duration: 0.09, volume: 0.025, wave: "square" },
    { frequency: 1174.66, offset: 0.11, duration: 0.09, volume: 0.025, wave: "square" },
    { frequency: 1567.98, offset: 0.22, duration: 0.16, volume: 0.02, wave: "square" },
  ],
  campainha: [
    { frequency: 659.25, offset: 0, duration: 0.2, volume: 0.055, wave: "triangle" },
    { frequency: 987.77, offset: 0.05, duration: 0.32, volume: 0.05, wave: "triangle" },
    { frequency: 659.25, offset: 0.42, duration: 0.2, volume: 0.055, wave: "triangle" },
    { frequency: 987.77, offset: 0.47, duration: 0.32, volume: 0.05, wave: "triangle" },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) return null;
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

export function isChamadoNotificationSound(
  value: unknown,
): value is ChamadoNotificationSound {
  return CHAMADO_NOTIFICATION_SOUNDS.some((sound) => sound.id === value);
}

export async function prepareChamadoNotificationAudio() {
  const context = getAudioContext();
  if (!context) return false;

  if (context.state === "suspended") {
    await context.resume();
  }

  return context.state === "running";
}

export async function playChamadoNotificationSound(
  sound: ChamadoNotificationSound,
  volume = 1,
) {
  try {
    const context = getAudioContext();
    if (!context) return false;

    if (context.state === "suspended") {
      await context.resume();
    }
    if (context.state !== "running") return false;

    const startTime = context.currentTime + 0.02;
    let finishTime = startTime;

    const normalizedVolume = Math.min(1, Math.max(0, volume));
    if (normalizedVolume === 0) return false;

    soundTones[sound].forEach((tone) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const toneStart = startTime + tone.offset;
      const toneEnd = toneStart + tone.duration;

      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
      gain.gain.setValueAtTime(0.0001, toneStart);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, tone.volume * normalizedVolume),
        toneStart + 0.015,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(toneStart);
      oscillator.stop(toneEnd + 0.02);
      finishTime = Math.max(finishTime, toneEnd);
    });

    return finishTime > startTime;
  } catch {
    return false;
  }
}
