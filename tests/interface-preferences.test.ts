import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import {
  DEFAULT_INTERFACE_PREFERENCES,
  INTERFACE_PREFERENCES_BOOTSTRAP,
  normalizeInterfacePreferences,
  readInterfacePreferences,
  resolveInterfaceTheme,
  writeInterfacePreferences,
} from "../src/utils/interfacePreferences";

test("Interface: preserva preferências legadas sem transformar automático em tema fixo", () => {
  const values = new Map([["prosis-theme", "dark"], ["prosis-sidebar-collapsed", "true"]]);
  const storage = { getItem: (key: string) => values.get(key) ?? null };
  assert.deepEqual(readInterfacePreferences(storage), { theme: "dark", sidebarCollapsed: true, reduceMotion: false });
  values.set("prosis-theme", "system");
  assert.equal(readInterfacePreferences(storage).theme, "system");
  assert.equal(resolveInterfaceTheme("system", true), "dark");
  assert.equal(resolveInterfaceTheme("system", false), "light");
  assert.equal(resolveInterfaceTheme("light", true), "light");
});

test("Interface: armazenamento ausente, bloqueado ou corrompido usa defaults", () => {
  for (const value of [null, undefined, [], 23, "dark", {theme: "sepia", sidebarCollapsed: "true", reduceMotion: 1}]) {
    assert.deepEqual(normalizeInterfacePreferences(value), DEFAULT_INTERFACE_PREFERENCES);
  }
  assert.deepEqual(readInterfacePreferences(null), DEFAULT_INTERFACE_PREFERENCES);
  assert.deepEqual(readInterfacePreferences({ getItem: () => { throw new Error("blocked"); } }), DEFAULT_INTERFACE_PREFERENCES);
  assert.equal(writeInterfacePreferences(DEFAULT_INTERFACE_PREFERENCES, null), false);
  assert.equal(writeInterfacePreferences(DEFAULT_INTERFACE_PREFERENCES, { setItem: () => { throw new Error("quota"); } }), false);
});

test("Interface: restaurar padrões grava apenas preferências e mantém sessão/outros dados", () => {
  const values = new Map([["projov_user", "session"], ["prosis-theme", "dark"], ["unrelated-key", "keep"]]);
  const stored = writeInterfacePreferences(DEFAULT_INTERFACE_PREFERENCES, {setItem: (key, value) => { values.set(key, value); }});
  assert.equal(stored, true);
  assert.equal(values.get("projov_user"), "session");
  assert.equal(values.get("unrelated-key"), "keep");
  assert.equal(values.get("prosis-theme"), "system");
  assert.equal(values.get("prosis-sidebar-collapsed"), "false");
  assert.equal(values.get("prosis-reduce-motion"), "false");
});

test("Interface: bootstrap antes de hidratar segue SO e respeita redução de movimento", () => {
  for (const blocked of [false, true]) {
    const dataset: Record<string, string> = {};
    const style: Record<string, string> = {};
    const classes = new Set<string>();
    runInNewContext(INTERFACE_PREFERENCES_BOOTSTRAP, {
      localStorage: { getItem: () => { if (blocked) throw new Error("blocked"); return "system"; } },
      window: { matchMedia: () => ({ matches: true }) },
      document: { documentElement: { dataset, style, classList: { toggle: (name: string, enabled: boolean) => { if (enabled) classes.add(name); } } } },
    });
    assert.ok(classes.has("dark"));
    assert.equal(style.colorScheme, "dark");
    assert.equal(dataset.reduceMotion, "true");
  }
});
