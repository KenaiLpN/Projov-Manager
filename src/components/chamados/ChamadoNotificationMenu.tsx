"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Bell, BellOff, Play, Volume2 } from "lucide-react";
import {
  ChamadoNotificationCategory,
} from "@/services/chamadoService";
import {
  CHAMADO_NOTIFICATION_SOUNDS,
  ChamadoNotificationSound,
  playChamadoNotificationSound,
  prepareChamadoNotificationAudio,
} from "@/utils/chamadoNotificationSounds";
import {
  ChamadoNotificationSettings,
} from "@/hooks/useChamadoNotifications";
import sliderStyles from "./chamadoNotificationMenu.module.css";

type Props = {
  settings: ChamadoNotificationSettings;
  isDark: boolean;
  buttonClassName: string;
  onSettingsChange: (settings: ChamadoNotificationSettings) => void;
};

const channels: Array<{
  id: ChamadoNotificationCategory;
  label: string;
  description: string;
}> = [
  {
    id: "abertura",
    label: "Abertura de chamado",
    description: "Quando um novo chamado visível for aberto.",
  },
  {
    id: "mensagem",
    label: "Mensagem da conversa",
    description: "Quando a outra pessoa responder no chamado.",
  },
  {
    id: "resolucao",
    label: "Resolução do chamado",
    description: "Quando uma solução for aceita ou o chamado for concluído.",
  },
];

export default function ChamadoNotificationMenu({
  settings,
  isDark,
  buttonClassName,
  onSettingsChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function preview(
    sound: ChamadoNotificationSound,
    volume: number,
  ) {
    await prepareChamadoNotificationAudio();
    await playChamadoNotificationSound(sound, volume);
  }

  function updateChannel(
    channel: ChamadoNotificationCategory,
    update: Partial<ChamadoNotificationSettings[ChamadoNotificationCategory]>,
  ) {
    onSettingsChange({
      ...settings,
      [channel]: { ...settings[channel], ...update },
    });
  }

  const panelClass = isDark
    ? "border-[#3a3f37] bg-[#1e211c] text-[#f1f0e9] shadow-black/35"
    : "border-[#d9dbd4] bg-white text-[#252a24] shadow-black/15";
  const mutedClass = isDark ? "text-[#a4aaa0]" : "text-[#6f756d]";
  const itemClass = isDark
    ? "border-[#363b33] bg-[#232720]"
    : "border-[#e2e4de] bg-[#fafaf7]";
  const fieldClass = isDark
    ? "border-[#4a5046] bg-[#191c17] text-[#f1f0e9]"
    : "border-[#d0d4cc] bg-white text-[#252a24]";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Configurar notificações sonoras"
        aria-expanded={open}
        title={settings.enabled ? "Notificações sonoras ativadas" : "Notificações sonoras desativadas"}
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${buttonClassName}`}
      >
        {settings.enabled ? <Bell size={18} /> : <BellOff size={18} />}
        {settings.enabled && (
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-current bg-emerald-500" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Preferências de notificações"
          className={`absolute right-0 z-50 mt-2 max-h-[min(42rem,calc(100vh-6rem))] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border p-4 shadow-2xl ${panelClass}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Notificações de chamados</p>
              <p className={`mt-1 text-xs leading-5 ${mutedClass}`}>
                Configure o efeito e o volume de cada atualização.
              </p>
            </div>
            <Volume2 size={18} className="mt-0.5 shrink-0 text-[#b38200]" />
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            onClick={() => {
              const enabled = !settings.enabled;
              onSettingsChange({ ...settings, enabled });
              if (enabled) {
                void preview(settings.abertura.sound, settings.abertura.volume);
              }
            }}
            className={`mt-4 flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left ${itemClass}`}
          >
            <span>
              <span className="block text-sm font-semibold">Ativar sons</span>
              <span className={`mt-0.5 block text-xs ${mutedClass}`}>
                {settings.enabled ? "Ativado" : "Desativado"}
              </span>
            </span>
            <span className={`relative h-6 w-11 rounded-full ${settings.enabled ? "bg-emerald-500" : isDark ? "bg-[#4a5046]" : "bg-[#c8ccc4]"}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings.enabled ? "translate-x-6" : "translate-x-1"}`} />
            </span>
          </button>

          <div className="mt-4 space-y-3">
            {channels.map((channel) => {
              const selected = settings[channel.id];
              return (
                <section key={channel.id} className={`rounded-lg border p-3 ${itemClass}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{channel.label}</h3>
                      <p className={`mt-0.5 text-xs leading-5 ${mutedClass}`}>
                        {channel.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void preview(selected.sound, selected.volume)}
                      aria-label={`Ouvir prévia de ${channel.label}`}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${fieldClass}`}
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>

                  <label className="mt-3 block">
                    <span className={`text-[0.68rem] font-bold uppercase tracking-[0.12em] ${mutedClass}`}>
                      Efeito sonoro
                    </span>
                    <select
                      value={selected.sound}
                      onChange={(event) =>
                        updateChannel(channel.id, {
                          sound: event.target.value as ChamadoNotificationSound,
                        })
                      }
                      className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm ${fieldClass}`}
                    >
                      {CHAMADO_NOTIFICATION_SOUNDS.map((sound) => (
                        <option key={sound.id} value={sound.id}>{sound.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-3 block">
                    <span className="flex items-center justify-between gap-3">
                      <span className={`text-[0.68rem] font-bold uppercase tracking-[0.12em] ${mutedClass}`}>
                        Volume
                      </span>
                      <span className={`text-xs font-semibold ${mutedClass}`}>
                        {Math.round(selected.volume * 100)}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round(selected.volume * 100)}
                      onChange={(event) =>
                        updateChannel(channel.id, {
                          volume: Number(event.target.value) / 100,
                        })
                      }
                      style={
                        {
                          "--slider-progress": `${Math.round(selected.volume * 100)}%`,
                          "--slider-track": isDark ? "#343930" : "#d7d9d2",
                        } as CSSProperties
                      }
                      className={`mt-2 ${sliderStyles.volumeSlider}`}
                    />
                  </label>
                </section>
              );
            })}
          </div>

          <p className={`mt-4 border-t pt-3 text-xs leading-5 ${isDark ? "border-[#363b33]" : "border-[#e2e4de]"} ${mutedClass}`}>
            Eventos feitos pelo próprio usuário não emitem som. As preferências ficam salvas neste navegador.
          </p>
        </div>
      )}
    </div>
  );
}
