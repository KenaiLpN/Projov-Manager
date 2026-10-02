import test from "node:test";
import assert from "node:assert/strict";
import {
  CHAMADO_NOTIFICATION_PREFERENCES_EVENT,
  CHAMADO_NOTIFICATION_STORAGE_KEY,
  DEFAULT_CHAMADO_NOTIFICATION_SETTINGS,
  mergeChamadoNotificationSettings,
  normalizeChamadoNotificationSettings,
  parseChamadoNotificationSettings,
  readChamadoNotificationSettings,
  receiveChamadoNotificationStorageChange,
  resetChamadoNotificationSettings,
  updateChamadoNotificationSettings,
} from "../src/utils/chamadoNotificationPreferences";

test("Notificações: migra o som legado sem substituir canais já personalizados", () => {
  assert.deepEqual(normalizeChamadoNotificationSettings({
    enabled: true,
    sound: "campainha",
    mensagem: { sound: "digital", volume: 0.25 },
  }), {
    enabled: true,
    abertura: { sound: "campainha", volume: 0.7 },
    mensagem: { sound: "digital", volume: 0.25 },
    resolucao: { sound: "campainha", volume: 0.7 },
  });
});

test("Notificações: dados inválidos e JSON corrompido usam preferências padrão", () => {
  for (const raw of [null, "", "{", "null", "[]", "true", '"texto"', "42"]) {
    assert.deepEqual(parseChamadoNotificationSettings(raw), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
  }
  assert.deepEqual(normalizeChamadoNotificationSettings({
    enabled: "true",
    sound: "inexistente",
    abertura: { sound: "inexistente", volume: NaN },
    mensagem: { volume: Infinity },
    resolucao: { volume: "0.8" },
  }), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
});

test("Notificações: limita volumes ao intervalo de zero a um", () => {
  const settings = normalizeChamadoNotificationSettings({
    abertura: { volume: -1 },
    mensagem: { volume: 2 },
    resolucao: { volume: 0 },
  });
  assert.equal(settings.abertura.volume, 0);
  assert.equal(settings.mensagem.volume, 1);
  assert.equal(settings.resolucao.volume, 0);
});

test("Notificações: atualiza um campo sem perder os outros canais ou alterar o original", () => {
  const original = normalizeChamadoNotificationSettings({
    enabled: true,
    abertura: { sound: "campainha", volume: 0.5 },
    mensagem: { sound: "sino", volume: 0.15 },
    resolucao: { sound: "digital", volume: 0.9 },
  });
  const updated = mergeChamadoNotificationSettings(original, { mensagem: { volume: 0.35 } });
  assert.equal(updated.enabled, true);
  assert.deepEqual(updated.abertura, original.abertura);
  assert.deepEqual(updated.resolucao, original.resolucao);
  assert.deepEqual(updated.mensagem, { sound: "sino", volume: 0.35 });
  assert.equal(original.mensagem.volume, 0.15);
});

class BrowserWindow extends EventTarget {
  values = new Map<string, string>();
  blockWrites = false;
  localStorage = {
    getItem: (key: string) => this.values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (this.blockWrites) throw new Error("Storage blocked");
      this.values.set(key, value);
    },
  };
}

function withBrowser(run: (browser: BrowserWindow) => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const browser = new BrowserWindow();
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  receiveChamadoNotificationStorageChange(null);
  try {
    run(browser);
  } finally {
    receiveChamadoNotificationStorageChange(null);
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

test("Notificações: persiste na chave existente e avisa consumidores da mesma aba", () => {
  withBrowser((browser) => {
    let signals = 0;
    browser.addEventListener(CHAMADO_NOTIFICATION_PREFERENCES_EVENT, () => { signals += 1; });
    browser.values.set(CHAMADO_NOTIFICATION_STORAGE_KEY, JSON.stringify({ enabled: true, sound: "suave" }));

    assert.equal(updateChamadoNotificationSettings({ mensagem: { volume: 0.4 } }), true);
    const stored = JSON.parse(browser.values.get(CHAMADO_NOTIFICATION_STORAGE_KEY)!);
    assert.equal(stored.enabled, true);
    assert.deepEqual(stored.mensagem, { sound: "suave", volume: 0.4 });
    assert.deepEqual(stored.abertura, { sound: "suave", volume: 0.7 });
    assert.equal(signals, 1);
    assert.deepEqual(readChamadoNotificationSettings(), stored);

    assert.equal(resetChamadoNotificationSettings(), true);
    assert.deepEqual(readChamadoNotificationSettings(), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
    assert.equal(signals, 2);
  });
});

test("Notificações: falha de escrita mantém alterações em memória e preserva patches seguintes", () => {
  withBrowser((browser) => {
    browser.values.set(CHAMADO_NOTIFICATION_STORAGE_KEY, JSON.stringify(DEFAULT_CHAMADO_NOTIFICATION_SETTINGS));
    browser.blockWrites = true;
    assert.equal(updateChamadoNotificationSettings({ enabled: true, abertura: { sound: "campainha" } }), false);
    assert.equal(updateChamadoNotificationSettings({ mensagem: { volume: 0.1 } }), false);
    const session = readChamadoNotificationSettings();
    assert.equal(session.enabled, true);
    assert.equal(session.abertura.sound, "campainha");
    assert.equal(session.mensagem.volume, 0.1);
    assert.deepEqual(JSON.parse(browser.values.get(CHAMADO_NOTIFICATION_STORAGE_KEY)!), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);

    browser.blockWrites = false;
    assert.equal(updateChamadoNotificationSettings({ resolucao: { volume: 0.2 } }), true);
    assert.equal(readChamadoNotificationSettings().abertura.sound, "campainha");
  });
});

test("Notificações: acesso ao localStorage bloqueado ainda permite alterar e restaurar preferências", () => {
  withBrowser((browser) => {
    Object.defineProperty(browser, "localStorage", { get: () => { throw new Error("SecurityError"); } });
    assert.deepEqual(readChamadoNotificationSettings(), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
    assert.equal(updateChamadoNotificationSettings({ enabled: true }), false);
    assert.equal(readChamadoNotificationSettings().enabled, true);
    assert.equal(resetChamadoNotificationSettings(), false);
    assert.deepEqual(readChamadoNotificationSettings(), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
  });
});

test("Notificações: alteração externa ou limpeza do armazenamento atualiza a sessão", () => {
  withBrowser((browser) => {
    browser.blockWrites = true;
    updateChamadoNotificationSettings({ enabled: true });
    const external = JSON.stringify({ enabled: false, sound: "campainha" });
    browser.values.set(CHAMADO_NOTIFICATION_STORAGE_KEY, external);
    assert.equal(receiveChamadoNotificationStorageChange(external).abertura.sound, "campainha");
    assert.equal(readChamadoNotificationSettings().enabled, false);
    browser.values.clear();
    assert.deepEqual(receiveChamadoNotificationStorageChange(null), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
    assert.deepEqual(readChamadoNotificationSettings(), DEFAULT_CHAMADO_NOTIFICATION_SETTINGS);
  });
});
