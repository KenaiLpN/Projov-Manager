"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Bell, Check, CheckCircle2, CircleHelp, Keyboard, Laptop, Monitor, Moon, PanelLeft, Play, RotateCcw, Settings2, Sparkles, Sun, Volume2 } from "lucide-react";
import toast from "react-hot-toast";
import { useInterfacePreferences } from "@/hooks/useInterfacePreferences";
import { useChamadoNotificationPreferences } from "@/hooks/useChamadoNotificationPreferences";
import { CHAMADO_NOTIFICATION_SOUNDS, playChamadoNotificationSound } from "@/utils/chamadoNotificationSounds";
import type { ChamadoNotificationSound } from "@/utils/chamadoNotificationSounds";
import { getSessionUserRole } from "@/utils/roles";
import styles from "./settings.module.css";

type Tab = "appearance" | "navigation" | "notifications";
const themeOptions = [
  { value: "light", label: "Claro", description: "Leve e luminoso para o dia a dia.", icon: Sun },
  { value: "dark", label: "Escuro", description: "Uma interface com menos luminosidade.", icon: Moon },
  { value: "system", label: "Automático", description: "Acompanha o tema do seu dispositivo.", icon: Laptop },
] as const;
const channels = [
  { id: "abertura", label: "Abertura de chamado", description: "Um novo chamado disponível para você." },
  { id: "mensagem", label: "Novas mensagens", description: "Uma resposta recebida na conversa." },
  { id: "resolucao", label: "Resolução do chamado", description: "Uma solução aceita ou um chamado concluído." },
] as const;

function InterfacePreview({ theme = "light", collapsed = false }: { theme?: string; collapsed?: boolean }) {
  return <div className={styles.themePreview} data-theme={theme} data-mode={collapsed ? "collapsed" : "expanded"} aria-hidden="true">
    <div className={styles.previewSidebar}><i /><span /><span /><span /></div>
    <div className={styles.previewMain}><div /><span /><section><i /><i /><i /></section><footer /></div>
  </div>;
}

export default function ConfiguracoesPage() {
  const { preferences, updatePreferences, resetPreferences, ready, resolvedTheme, shouldReduceMotion } = useInterfacePreferences();
  const notifications = useChamadoNotificationPreferences();
  const [role, setRole] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("appearance");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "session">("idle");
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const canConfigureNotifications = ["A", "P", "T", "DEV"].includes(role);
  const selectedTab = activeTab === "notifications" && !canConfigureNotifications ? "appearance" : activeTab;
  const tabs = [
    { id: "appearance" as const, label: "Aparência", icon: Monitor },
    { id: "navigation" as const, label: "Navegação", icon: PanelLeft },
    ...(canConfigureNotifications ? [{ id: "notifications" as const, label: "Notificações", icon: Bell }] : []),
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("projov_user");
      setRole(raw ? getSessionUserRole(JSON.parse(raw)) : "");
    } catch { /* Preferências visuais continuam disponíveis sem o cache de perfil. */ }
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, []);

  function saved(persisted: boolean) { setSaveStatus(persisted ? "saved" : "session"); }
  function selectTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  }
  async function preview(id: typeof channels[number]["id"]) {
    const channel = notifications.settings[id];
    if (channel.volume === 0) { toast("Aumente o volume para ouvir a prévia."); return; }
    const played = await playChamadoNotificationSound(channel.sound, channel.volume);
    if (!played) { toast.error("Não foi possível reproduzir o som neste navegador."); return; }
    setPreviewing(id);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewing(null), 1000);
  }
  function restoreDefaults() {
    const interfaceSaved = resetPreferences();
    const soundSaved = canConfigureNotifications ? notifications.resetSettings() : true;
    saved(interfaceSaved && soundSaved);
    toast.success("Preferências padrão restauradas.");
  }

  return <div className={styles.page}>
    <div className={styles.header}>
      <div><p className={styles.eyebrow}><Settings2 size={13} /> SEU ESPAÇO, DO SEU JEITO</p><h1>Configurações</h1><p>Pequenos ajustes para uma rotina mais confortável.</p></div>
      <span role="status" className={`${styles.saveStatus} ${saveStatus === "session" ? styles.statusError : ""}`}>
        {saveStatus === "session" ? <CircleHelp size={15} /> : <CheckCircle2 size={15} />}
        {!ready ? "Carregando preferências…" : saveStatus === "session" ? "Aplicado nesta sessão" : saveStatus === "saved" ? "Alterações salvas" : "Salvamento automático"}
      </span>
    </div>

    <div className={styles.tabs} role="tablist" aria-label="Categorias de configurações">
      {tabs.map((tab, index) => <button key={tab.id} type="button" role="tab" id={`settings-tab-${tab.id}`} aria-controls={`settings-panel-${tab.id}`} aria-selected={selectedTab === tab.id} tabIndex={selectedTab === tab.id ? 0 : -1} data-active={selectedTab === tab.id} ref={(element) => { tabRefs.current[tab.id] = element; }} onClick={() => setActiveTab(tab.id)} onKeyDown={(event) => selectTab(event, index)}><tab.icon size={17} />{tab.label}</button>)}
    </div>

    <section className={styles.tabPanel} role="tabpanel" id={`settings-panel-${selectedTab}`} aria-labelledby={`settings-tab-${selectedTab}`} tabIndex={0}>
      {selectedTab === "appearance" && <>
        <div className={styles.sectionHeading}><span className={styles.iconTile}><Monitor size={21} /></span><div><h2>Aparência</h2><p>Escolha como o ProSis aparece para você.</p></div></div>
        <div className={styles.card}>
          <div className={styles.cardHeading}><h3>Tema da interface</h3><p>Encontre o visual que combina com seu ambiente de trabalho.</p></div>
          <fieldset className={styles.themeOptions} disabled={!ready}><legend className={styles.srOnly}>Tema da interface</legend>
            {themeOptions.map((option) => <label key={option.value} className={styles.choice} data-selected={preferences.theme === option.value}>
              <input type="radio" name="interface-theme" value={option.value} checked={preferences.theme === option.value} onChange={() => saved(updatePreferences({ theme: option.value }))} aria-label={option.label} />
              <InterfacePreview theme={option.value} />
              <span className={styles.choiceLabel}><option.icon size={16} /><strong>{option.label}</strong><span className={styles.checkCircle}>{preferences.theme === option.value && <Check size={11} />}</span></span>
              <span className={styles.choiceDescription}>{option.description}</span>
            </label>)}
          </fieldset>
          <p className={styles.infoNote}><CircleHelp size={14} />{preferences.theme === "system" ? `O tema atual do seu dispositivo é ${resolvedTheme === "dark" ? "escuro" : "claro"}. O ProSis acompanha as mudanças automaticamente.` : "O tema escolhido também se aplica ao módulo de chamados."}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.settingRow}><div className={styles.rowText}><h3><Sparkles size={17} />Reduzir animações</h3><p>Use transições mais discretas ao abrir menus e navegar pelo sistema.</p>{shouldReduceMotion && !preferences.reduceMotion && <small>A preferência de movimento reduzido do seu dispositivo já está sendo respeitada.</small>}</div><button type="button" role="switch" className={styles.switch} aria-label="Reduzir animações" aria-checked={preferences.reduceMotion} disabled={!ready} onClick={() => saved(updatePreferences({ reduceMotion: !preferences.reduceMotion }))}><span /></button></div>
        </div>
      </>}

      {selectedTab === "navigation" && <>
        <div className={styles.sectionHeading}><span className={styles.iconTile}><PanelLeft size={21} /></span><div><h2>Navegação</h2><p>Deixe seus caminhos mais fáceis de encontrar.</p></div></div>
        <div className={styles.card}>
          <div className={styles.cardHeading}><h3>Menu lateral</h3><p>Escolha o tamanho do menu no computador. A mudança aparece na hora.</p></div>
          <fieldset className={styles.navigationOptions} disabled={!ready}><legend className={styles.srOnly}>Exibição do menu lateral</legend>
            {[{ collapsed: false, label: "Expandido", text: "Ícones e nomes visíveis para encontrar cada área." }, { collapsed: true, label: "Recolhido", text: "Apenas ícones, com mais espaço para seu trabalho." }].map((option) => <label key={option.label} className={styles.choice} data-selected={preferences.sidebarCollapsed === option.collapsed}>
              <input type="radio" name="sidebar-mode" checked={preferences.sidebarCollapsed === option.collapsed} onChange={() => saved(updatePreferences({ sidebarCollapsed: option.collapsed }))} aria-label={option.label} />
              <InterfacePreview theme={resolvedTheme} collapsed={option.collapsed} />
              <span className={styles.choiceLabel}><PanelLeft size={16} /><strong>{option.label}</strong><span className={styles.checkCircle}>{preferences.sidebarCollapsed === option.collapsed && <Check size={11} />}</span></span><span className={styles.choiceDescription}>{option.text}</span>
            </label>)}
          </fieldset>
          <p className={styles.infoNote}><CircleHelp size={14} />O botão no topo do sistema também atualiza essa preferência. No celular, o menu abre como uma gaveta.</p>
        </div>
        <div className={`${styles.card} ${styles.keyboardCard}`}><div className={styles.cardHeading}><h3><Keyboard size={18} />Atalhos que poupam tempo</h3><p>Use o teclado para chegar mais rápido aonde precisa.</p></div><div className={styles.shortcutRows}><div className={styles.shortcut}><span>Buscar módulos e páginas</span><span><kbd>Ctrl</kbd><span> / </span><kbd>⌘</kbd><span> + </span><kbd>K</kbd></span></div><div className={styles.shortcut}><span>Fechar o menu aberto</span><kbd>Esc</kbd></div><div className={styles.shortcut}><span>Percorrer opções e controles</span><kbd>Tab</kbd></div></div></div>
      </>}

      {selectedTab === "notifications" && canConfigureNotifications && <>
        <div className={styles.sectionHeading}><span className={styles.iconTile}><Bell size={21} /></span><div><h2>Notificações de chamados</h2><p>Escolha como ouvir as atualizações do atendimento.</p></div></div>
        <div className={styles.card}><div className={styles.settingRow}><div className={styles.rowText}><h3>Sons dos chamados</h3><p>Reproduzir um alerta sonoro quando houver uma nova atualização para você.</p></div><button type="button" role="switch" className={styles.switch} aria-label="Sons dos chamados" aria-checked={notifications.settings.enabled} disabled={!notifications.ready} onClick={() => saved(notifications.updateSettings({ enabled: !notifications.settings.enabled }))}><span /></button></div><p className={styles.infoNote}><CircleHelp size={14} />Os sons são reproduzidos enquanto o módulo de chamados está aberto. As prévias abaixo funcionam mesmo com os alertas sonoros desativados.</p></div>
        <div className={styles.notificationCard}>
          {channels.map((channel) => {
            const value = notifications.settings[channel.id];
            return <section key={channel.id} className={styles.channelRow}>
              <div className={styles.channelHeader}><div className={styles.channelTitle}><span className={styles.channelIcon}><Volume2 size={18} /></span><div><h3>{channel.label}</h3><p>{channel.description}</p></div></div><button type="button" className={styles.previewButton} disabled={!notifications.ready || previewing !== null} onClick={() => void preview(channel.id)} aria-label={`Ouvir prévia: ${channel.label}`}><Play size={13} />{previewing === channel.id ? "Reproduzindo…" : "Ouvir prévia"}</button></div>
              <div className={styles.channelControls}>
                <label className={styles.field}><span>Efeito sonoro</span><select aria-label={`Som: ${channel.label}`} value={value.sound} disabled={!notifications.ready} onChange={(event) => saved(notifications.updateSettings({ [channel.id]: { sound: event.target.value as ChamadoNotificationSound } }))}>{CHAMADO_NOTIFICATION_SOUNDS.map((sound) => <option key={sound.id} value={sound.id}>{sound.label}</option>)}</select></label>
                <label className={styles.field}><span className={styles.volumeLabel}>Volume<output>{Math.round(value.volume * 100)}%</output></span><input aria-label={`Volume: ${channel.label}`} type="range" min={0} max={100} step={5} value={Math.round(value.volume * 100)} disabled={!notifications.ready} onChange={(event) => saved(notifications.updateSettings({ [channel.id]: { volume: Number(event.target.value) / 100 } }))} /></label>
              </div>
            </section>;
          })}
        </div>
        <p className={styles.infoNote}><CircleHelp size={14} />Estas são as mesmas preferências disponíveis no sino do módulo de chamados.</p>
      </>}
    </section>

    <footer className={styles.footer}><div><span><CheckCircle2 size={14} />{saveStatus === "session" ? "Preferências aplicadas, mas não salvas." : "Suas preferências ficam neste navegador."}</span><p>{saveStatus === "session" ? "O armazenamento do navegador está indisponível. As alterações podem se perder ao fechar esta página." : "As alterações são aplicadas automaticamente e podem ser ajustadas a qualquer momento."}</p></div><button type="button" onClick={restoreDefaults} disabled={!ready || (canConfigureNotifications && !notifications.ready)} className={styles.secondaryButton}><RotateCcw size={14} />Restaurar padrões</button></footer>
  </div>;
}
