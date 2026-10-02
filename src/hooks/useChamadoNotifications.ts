"use client";

import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  ChamadoNotificationEvent,
  listChamadoNotifications,
} from "@/services/chamadoService";
import {
  playChamadoNotificationSound,
  prepareChamadoNotificationAudio,
} from "@/utils/chamadoNotificationSounds";
import { useChamadoNotificationPreferences } from "@/hooks/useChamadoNotificationPreferences";
import type { ChamadoNotificationSettings } from "@/utils/chamadoNotificationPreferences";

export type {
  ChamadoNotificationChannelSettings,
  ChamadoNotificationSettings,
} from "@/utils/chamadoNotificationPreferences";
export { DEFAULT_CHAMADO_NOTIFICATION_SETTINGS } from "@/utils/chamadoNotificationPreferences";

const POLL_INTERVAL = 5_000;

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
  const { settings, updateSettings } = useChamadoNotificationPreferences();
  const settingsRef = useRef(settings);
  const cursorRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const onExternalEventRef = useRef(onExternalEvent);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    onExternalEventRef.current = onExternalEvent;
  }, [onExternalEvent]);

  const setSettings = useCallback((next: ChamadoNotificationSettings) => {
    settingsRef.current = next;
    return updateSettings(next);
  }, [updateSettings]);

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
