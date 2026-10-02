export type InterfaceTheme = "light" | "dark" | "system";

export interface InterfacePreferences {
  theme: InterfaceTheme;
  sidebarCollapsed: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_INTERFACE_PREFERENCES: InterfacePreferences = {
  theme: "system",
  sidebarCollapsed: false,
  reduceMotion: false,
};

export const INTERFACE_PREFERENCE_KEYS = {
  theme: "prosis-theme",
  sidebarCollapsed: "prosis-sidebar-collapsed",
  reduceMotion: "prosis-reduce-motion",
} as const;

export function normalizeInterfacePreferences(value: unknown): InterfacePreferences {
  const input = value && typeof value === "object" ? value as Partial<InterfacePreferences> : {};
  return {
    theme: input.theme === "dark" || input.theme === "light" ? input.theme : "system",
    sidebarCollapsed: input.sidebarCollapsed === true,
    reduceMotion: input.reduceMotion === true,
  };
}

export function resolveInterfaceTheme(theme: InterfaceTheme, systemDark: boolean): "light" | "dark" {
  return theme === "system" ? systemDark ? "dark" : "light" : theme;
}

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readInterfacePreferences(storage: Pick<Storage, "getItem"> | null = browserStorage()): InterfacePreferences {
  try {
    return normalizeInterfacePreferences({
      theme: storage?.getItem(INTERFACE_PREFERENCE_KEYS.theme),
      sidebarCollapsed: storage?.getItem(INTERFACE_PREFERENCE_KEYS.sidebarCollapsed) === "true",
      reduceMotion: storage?.getItem(INTERFACE_PREFERENCE_KEYS.reduceMotion) === "true",
    });
  } catch {
    return { ...DEFAULT_INTERFACE_PREFERENCES };
  }
}

export function writeInterfacePreferences(preferences: InterfacePreferences, storage: Pick<Storage, "setItem"> | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    const normalized = normalizeInterfacePreferences(preferences);
    storage.setItem(INTERFACE_PREFERENCE_KEYS.theme, normalized.theme);
    storage.setItem(INTERFACE_PREFERENCE_KEYS.sidebarCollapsed, String(normalized.sidebarCollapsed));
    storage.setItem(INTERFACE_PREFERENCE_KEYS.reduceMotion, String(normalized.reduceMotion));
    return true;
  } catch {
    return false;
  }
}

// Runs before hydration with the request nonce, preventing a flash of the wrong theme.
export const INTERFACE_PREFERENCES_BOOTSTRAP = `(() => {
  let theme = "system";
  let reduceMotion = false;
  try {
    const stored = localStorage.getItem("${INTERFACE_PREFERENCE_KEYS.theme}");
    if (stored === "dark" || stored === "light") theme = stored;
    reduceMotion = localStorage.getItem("${INTERFACE_PREFERENCE_KEYS.reduceMotion}") === "true";
  } catch {}
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const systemReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.dataset.reduceMotion = String(reduceMotion || systemReduceMotion);
})();`;
