"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ChamadoNotificationEvent,
  listChamadoNotifications,
} from "@/services/chamadoService";
import {
  ChamadoNotificationSound,
  isChamadoNotificationSound,
  playChamadoNotificationSound,
  prepareChamadoNotificationAudio,
} from "@/utils/chamadoNotificationSounds";

export type ChamadoNotificationChannelSettings = {
  sound: ChamadoNotificationSound;
  volume: number;
};

export type ChamadoNotificationSettings = {
  enabled: boolean;
  abertura: ChamadoNotificationChannelSettings;
  mensagem: ChamadoNotificationChannelSettings;
  resolucao: ChamadoNotificationChannelSettings;
};

const STORAGE_KEY = "prosis-chamados-notifications";
const POLL_INTERVAL = 5_000;

export const DEFAULT_CHAMADO_NOTIFICATION_SETTINGS: ChamadoNotificationSettings = {
  enabled: false,
  abertura: { sound: "sino", volume: 0.7 },
  mensagem: { sound: "digital", volume: 0.6 },
  resolucao: { sound: "suave", volume: 0.7 },
};

function normalizedVolume(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
}

function normalizedChannel(
  value: unknown,
  fallback: ChamadoNotificationChannelSettings,
) {
  if (!value || typeof value !== "object") return fallback;
  const channel = value as Partial<ChamadoNotificationChannelSettings>;
  return {
    sound: isChamadoNotificationSound(channel.sound)
      ? channel.sound
      : fallback.sound,
    volume: normalizedVolume(channel.volume, fallback.volume),
  };
}

function loadStoredSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_CHAMADO_NOTIFICATION_SETTINGS;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_CHAMADO_NOTIFICATION_SETTINGS;

  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    const legacySound = isChamadoNotificationSound(parsed.sound)
      ? parsed.sound
      : undefined;
    const legacyChannel = legacySound
      ? { sound: legacySound, volume: 0.7 }
      : undefined;

    return {
      enabled: parsed.enabled === true,
      abertura: normalizedChannel(
        parsed.abertura ?? legacyChannel,
        DEFAULT_CHAMADO_NOTIFICATION_SETTINGS.abertura,
      ),
      mensagem: normalizedChannel(
        parsed.mensagem ?? legacyChannel,
        DEFAULT_CHAMADO_NOTIFICATION_SETTINGS.mensagem,
      ),
      resolucao: normalizedChannel(
        parsed.resolucao ?? legacyChannel,
        DEFAULT_CHAMADO_NOTIFICATION_SETTINGS.resolucao,
      ),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_CHAMADO_NOTIFICATION_SETTINGS;
  }
}

function notificationText(event: ChamadoNotificationEvent) {
  const identifier = event.chamado.protocolo || `Chamado #${event.chamado.id}`;
  if (event.categoria === "abertura") {
    return `Novo chamado de ${event.chamado.solicitante_nome}: ${identifier}`;
  }
  if (event.categoria === "resolucao") {
    return event.comentario || `${identifier} foi resolvido.`;
  }
  return `Nova mensagem em ${identifier}: ${event.usuario_nome || "Usuário"}`;
}

export function useChamadoNotifications({
  userId,
  onExternalEvent,
}: {
  userId?: string | null;
  onExternalEvent?: () => void;
}) {
  const [settings, setSettingsState] = useState(
    DEFAULT_CHAMADO_NOTIFICATION_SETTINGS,
  );
  const settingsRef = useRef(settings);
  const cursorRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const onExternalEventRef = useRef(onExternalEvent);

  useEffect(() => {
    const stored = loadStoredSettings();
    settingsRef.current = stored;
    setSettingsState(stored);
  }, []);

  useEffect(() => {
    onExternalEventRef.current = onExternalEvent;
  }, [onExternalEvent]);

  const setSettings = useCallback((next: ChamadoNotificationSettings) => {
    settingsRef.current = next;
    setSettingsState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    function unlockAudio() {
      if (settingsRef.current.enabled) {
        void prepareChamadoNotificationAudio();
      }
    }

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    cursorRef.current = null;

    async function poll() {
      if (!active || inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const feed = await listChamadoNotifications(
          cursorRef.current === null ? undefined : cursorRef.current,
        );
        if (!active) return;
        cursorRef.current = feed.cursor;

        const externalEvents = feed.data.filter(
          (event) =>
            String(event.usuario_id ?? "") !== String(userId) &&
            (event.categoria === "abertura" ||
              String(event.chamado.solicitante_id ?? "") === String(userId) ||
              !event.chamado.tecnico_responsavel_id ||
              String(event.chamado.tecnico_responsavel_id) === String(userId)),
        );
        if (externalEvents.length === 0) return;

        const newestEvent = externalEvents.at(-1)!;
        const currentSettings = settingsRef.current;
        if (currentSettings.enabled) {
          const channel = currentSettings[newestEvent.categoria];
          void playChamadoNotificationSound(channel.sound, channel.volume);
        }

        toast.success(
          externalEvents.length === 1
            ? notificationText(newestEvent)
            : `${externalEvents.length} novas atualizações em chamados.`,
          { duration: 5_000, icon: "🔔" },
        );
        onExternalEventRef.current?.();
      } catch {
        // O polling é silencioso para não repetir erros temporários de conexão.
      } finally {
        inFlightRef.current = false;
      }
    }

    void poll();
    const intervalId = window.setInterval(() => void poll(), POLL_INTERVAL);
    function pollWhenVisible() {
      if (document.visibilityState === "visible") void poll();
    }
    document.addEventListener("visibilitychange", pollWhenVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", pollWhenVisible);
    };
  }, [userId]);

  return { settings, setSettings };
}
