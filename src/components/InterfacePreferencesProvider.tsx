"use client";

import { createContext, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DEFAULT_INTERFACE_PREFERENCES,
  INTERFACE_PREFERENCE_KEYS,
  normalizeInterfacePreferences,
  readInterfacePreferences,
  resolveInterfaceTheme,
  writeInterfacePreferences,
  type InterfacePreferences,
} from "@/utils/interfacePreferences";

export interface InterfacePreferencesContextValue {
  preferences: InterfacePreferences;
  updatePreferences: (patch: Partial<InterfacePreferences>) => boolean;
  resetPreferences: () => boolean;
  ready: boolean;
  resolvedTheme: "light" | "dark";
  shouldReduceMotion: boolean;
}

export const InterfacePreferencesContext = createContext<InterfacePreferencesContextValue | null>(null);

export default function InterfacePreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<InterfacePreferences>(DEFAULT_INTERFACE_PREFERENCES);
  const preferencesRef = useRef(preferences);
  const [ready, setReady] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  const replacePreferences = useCallback((next: InterfacePreferences) => {
    preferencesRef.current = next;
    setPreferences(next);
  }, []);

  useEffect(() => {
    replacePreferences(readInterfacePreferences());
    const colorQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateColor = () => setSystemDark(colorQuery.matches);
    const updateMotion = () => setSystemReduceMotion(motionQuery.matches);
    updateColor();
    updateMotion();
    setReady(true);

    function syncStorage(event: StorageEvent) {
      // Ignore sessionStorage and unrelated entries without rereading storage: a
      // preference that could not be persisted must remain usable this session.
      try { if (event.storageArea !== window.localStorage) return; } catch { return; }
      const current = preferencesRef.current;
      if (event.key === null) replacePreferences({ ...DEFAULT_INTERFACE_PREFERENCES });
      else if (event.key === INTERFACE_PREFERENCE_KEYS.theme) {
        replacePreferences(normalizeInterfacePreferences({ ...current, theme: event.newValue }));
      } else if (event.key === INTERFACE_PREFERENCE_KEYS.sidebarCollapsed) {
        replacePreferences({ ...current, sidebarCollapsed: event.newValue === "true" });
      } else if (event.key === INTERFACE_PREFERENCE_KEYS.reduceMotion) {
        replacePreferences({ ...current, reduceMotion: event.newValue === "true" });
      }
    }

    colorQuery.addEventListener("change", updateColor);
    motionQuery.addEventListener("change", updateMotion);
    window.addEventListener("storage", syncStorage);
    return () => {
      colorQuery.removeEventListener("change", updateColor);
      motionQuery.removeEventListener("change", updateMotion);
      window.removeEventListener("storage", syncStorage);
    };
  }, [replacePreferences]);

  const updatePreferences = useCallback((patch: Partial<InterfacePreferences>) => {
    const next = normalizeInterfacePreferences({ ...preferencesRef.current, ...patch });
    replacePreferences(next);
    return writeInterfacePreferences(next);
  }, [replacePreferences]);

  const resetPreferences = useCallback(() => {
    const next = { ...DEFAULT_INTERFACE_PREFERENCES };
    replacePreferences(next);
    return writeInterfacePreferences(next);
  }, [replacePreferences]);

  const resolvedTheme = resolveInterfaceTheme(preferences.theme, systemDark);
  const shouldReduceMotion = preferences.reduceMotion || systemReduceMotion;

  useLayoutEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    root.dataset.reduceMotion = String(shouldReduceMotion);
  }, [ready, resolvedTheme, shouldReduceMotion]);

  const value = useMemo(() => ({
    preferences, updatePreferences, resetPreferences, ready, resolvedTheme, shouldReduceMotion,
  }), [preferences, updatePreferences, resetPreferences, ready, resolvedTheme, shouldReduceMotion]);

  return <InterfacePreferencesContext.Provider value={value}>{children}</InterfacePreferencesContext.Provider>;
}
