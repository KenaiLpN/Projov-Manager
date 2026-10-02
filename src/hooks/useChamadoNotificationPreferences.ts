"use client";

import { useEffect, useState } from "react";
import {
  CHAMADO_NOTIFICATION_PREFERENCES_EVENT,
  CHAMADO_NOTIFICATION_STORAGE_KEY,
  DEFAULT_CHAMADO_NOTIFICATION_SETTINGS,
  readChamadoNotificationSettings,
  receiveChamadoNotificationStorageChange,
  resetChamadoNotificationSettings,
  updateChamadoNotificationSettings,
} from "@/utils/chamadoNotificationPreferences";

// This hook only manages browser preferences: it never polls or emits alerts.
export function useChamadoNotificationPreferences() {
  const [settings, setSettings] = useState(DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function syncSettings() {
      setSettings(readChamadoNotificationSettings());
    }

    function syncStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== CHAMADO_NOTIFICATION_STORAGE_KEY) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
      } catch {
        return;
      }
      setSettings(receiveChamadoNotificationStorageChange(event.newValue));
    }

    window.addEventListener(CHAMADO_NOTIFICATION_PREFERENCES_EVENT, syncSettings);
    window.addEventListener("storage", syncStorage);
    syncSettings();
    setReady(true);
    return () => {
      window.removeEventListener(CHAMADO_NOTIFICATION_PREFERENCES_EVENT, syncSettings);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  return {
    settings,
    updateSettings: updateChamadoNotificationSettings,
    resetSettings: resetChamadoNotificationSettings,
    ready,
  };
}
