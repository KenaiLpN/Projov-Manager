import {
  type ChamadoNotificationSound,
  isChamadoNotificationSound,
} from "./chamadoNotificationSounds";

export type ChamadoNotificationChannel = "abertura" | "mensagem" | "resolucao";

export type ChamadoNotificationChannelSettings = {
  sound: ChamadoNotificationSound;
  volume: number;
};

export type ChamadoNotificationSettings = {
  enabled: boolean;
} & Record<ChamadoNotificationChannel, ChamadoNotificationChannelSettings>;

export type ChamadoNotificationSettingsPatch = {
  enabled?: boolean;
} & Partial<Record<ChamadoNotificationChannel, Partial<ChamadoNotificationChannelSettings>>>;

export const CHAMADO_NOTIFICATION_STORAGE_KEY = "prosis-chamados-notifications";
export const CHAMADO_NOTIFICATION_PREFERENCES_EVENT = "prosis-chamados-notifications-change";

export const DEFAULT_CHAMADO_NOTIFICATION_SETTINGS: ChamadoNotificationSettings = {
  enabled: false,
  abertura: { sound: "sino", volume: 0.7 },
  mensagem: { sound: "digital", volume: 0.6 },
  resolucao: { sound: "suave", volume: 0.7 },
};

function normalizedChannel(
  value: unknown,
  fallback: ChamadoNotificationChannelSettings,
): ChamadoNotificationChannelSettings {
  const channel = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    sound: isChamadoNotificationSound(channel.sound) ? channel.sound : fallback.sound,
    volume: typeof channel.volume === "number" && Number.isFinite(channel.volume)
      ? Math.min(1, Math.max(0, channel.volume))
      : fallback.volume,
  };
}

export function normalizeChamadoNotificationSettings(value: unknown): ChamadoNotificationSettings {
  const parsed = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  // Older versions stored a single sound shared by all three channels.
  const legacyChannel = isChamadoNotificationSound(parsed.sound)
    ? { sound: parsed.sound, volume: 0.7 }
    : undefined;

  return {
    enabled: parsed.enabled === true,
    abertura: normalizedChannel(parsed.abertura ?? legacyChannel, DEFAULT_CHAMADO_NOTIFICATION_SETTINGS.abertura),
    mensagem: normalizedChannel(parsed.mensagem ?? legacyChannel, DEFAULT_CHAMADO_NOTIFICATION_SETTINGS.mensagem),
    resolucao: normalizedChannel(parsed.resolucao ?? legacyChannel, DEFAULT_CHAMADO_NOTIFICATION_SETTINGS.resolucao),
  };
}

export function parseChamadoNotificationSettings(stored: string | null): ChamadoNotificationSettings {
  try {
    return normalizeChamadoNotificationSettings(stored ? JSON.parse(stored) : undefined);
  } catch {
    return normalizeChamadoNotificationSettings(undefined);
  }
}

export function mergeChamadoNotificationSettings(
  current: ChamadoNotificationSettings,
  patch: ChamadoNotificationSettingsPatch,
): ChamadoNotificationSettings {
  return normalizeChamadoNotificationSettings({
    ...current,
    ...patch,
    abertura: { ...current.abertura, ...patch.abertura },
    mensagem: { ...current.mensagem, ...patch.mensagem },
    resolucao: { ...current.resolucao, ...patch.resolucao },
  });
}

let memorySettings = normalizeChamadoNotificationSettings(undefined);
let hasUnsavedSettings = false;

export function readChamadoNotificationSettings(): ChamadoNotificationSettings {
  if (typeof window === "undefined") return normalizeChamadoNotificationSettings(undefined);
  if (hasUnsavedSettings) return memorySettings;
  try {
    memorySettings = parseChamadoNotificationSettings(window.localStorage.getItem(CHAMADO_NOTIFICATION_STORAGE_KEY));
  } catch {
    // A blocked browser store must not prevent changing preferences this session.
  }
  return memorySettings;
}

function saveChamadoNotificationSettings(next: ChamadoNotificationSettings): boolean {
  if (typeof window === "undefined") return false;
  memorySettings = next;
  let persisted = false;
  try {
    window.localStorage.setItem(CHAMADO_NOTIFICATION_STORAGE_KEY, JSON.stringify(next));
    persisted = true;
  } catch {
    // Keep changes in memory when storage is unavailable or its quota is exceeded.
  }
  hasUnsavedSettings = !persisted;
  window.dispatchEvent(new Event(CHAMADO_NOTIFICATION_PREFERENCES_EVENT));
  return persisted;
}

export function updateChamadoNotificationSettings(patch: ChamadoNotificationSettingsPatch): boolean {
  return saveChamadoNotificationSettings(mergeChamadoNotificationSettings(readChamadoNotificationSettings(), patch));
}

export function resetChamadoNotificationSettings(): boolean {
  return saveChamadoNotificationSettings(normalizeChamadoNotificationSettings(undefined));
}

export function receiveChamadoNotificationStorageChange(stored: string | null): ChamadoNotificationSettings {
  memorySettings = parseChamadoNotificationSettings(stored);
  hasUnsavedSettings = false;
  return memorySettings;
}
