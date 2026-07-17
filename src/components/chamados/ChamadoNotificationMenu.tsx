"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Check, Play, Volume2 } from "lucide-react";
import {
  CHAMADO_NOTIFICATION_SOUNDS,
  ChamadoNotificationSound,
  playChamadoNotificationSound,
  prepareChamadoNotificationAudio,
} from "@/utils/chamadoNotificationSounds";

type ChamadoNotificationMenuProps = {
  enabled: boolean;
  selectedSound: ChamadoNotificationSound;
  isDark: boolean;
  buttonClassName: string;
  onEnabledChange: (enabled: boolean) => void;
  onSoundChange: (sound: ChamadoNotificationSound) => void;
};

export default function ChamadoNotificationMenu({
  enabled,
  selectedSound,
  isDark,
  buttonClassName,
  onEnabledChange,
  onSoundChange,
}: ChamadoNotificationMenuProps) {
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

  async function previewSound(sound: ChamadoNotificationSound) {
    await prepareChamadoNotificationAudio();
    await playChamadoNotificationSound(sound);
  }

  async function toggleNotifications() {
    const nextEnabled = !enabled;
    onEnabledChange(nextEnabled);
    if (nextEnabled) await previewSound(selectedSound);
  }

  function selectSound(sound: ChamadoNotificationSound) {
    onSoundChange(sound);
    void previewSound(sound);
  }

  const panelClass = isDark
    ? "border-[#3a3f37] bg-[#1e211c] text-[#f1f0e9] shadow-black/35"
    : "border-[#d9dbd4] bg-white text-[#252a24] shadow-black/15";
  const mutedClass = isDark ? "text-[#a4aaa0]" : "text-[#6f756d]";
  const itemClass = isDark
    ? "border-[#363b33] bg-[#232720] hover:border-[#6e612d] hover:bg-[#292d26]"
    : "border-[#e2e4de] bg-[#fafaf7] hover:border-[#dec358] hover:bg-[#fffaf0]";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Configurar notificações sonoras"
        aria-expanded={open}
        title={enabled ? "Notificações sonoras ativadas" : "Notificações sonoras desativadas"}
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${buttonClassName}`}
      >
        {enabled ? <Bell size={18} strokeWidth={1.9} /> : <BellOff size={18} strokeWidth={1.8} />}
        {enabled && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-current bg-emerald-500"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Preferências de notificações"
          className={`absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border p-4 shadow-2xl ${panelClass}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Notificações de chamados</p>
              <p className={`mt-1 text-xs leading-5 ${mutedClass}`}>
                A fila procura novos chamados automaticamente a cada 10 segundos.
              </p>
            </div>
            <Volume2 size={18} className="mt-0.5 shrink-0 text-[#b38200]" />
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => void toggleNotifications()}
            className={`mt-4 flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${itemClass}`}
          >
            <span>
              <span className="block text-sm font-semibold">Tocar ao receber chamado</span>
              <span className={`mt-0.5 block text-xs ${mutedClass}`}>
                {enabled ? "Ativado" : "Desativado"}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-emerald-500" : isDark ? "bg-[#4a5046]" : "bg-[#c8ccc4]"}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
            </span>
          </button>

          <fieldset className="mt-4">
            <legend className={`mb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${mutedClass}`}>
              Escolha o som
            </legend>
            <div className="space-y-2">
              {CHAMADO_NOTIFICATION_SOUNDS.map((sound) => {
                const selected = selectedSound === sound.id;
                return (
                  <div
                    key={sound.id}
                    className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${itemClass} ${selected ? "ring-2 ring-[#f7c41f]/45" : ""}`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectSound(sound.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left"
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#d2a300] bg-[#f7c41f] text-[#241e08]" : isDark ? "border-[#687064]" : "border-[#aeb4aa]"}`}>
                        {selected && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{sound.label}</span>
                        <span className={`mt-0.5 block text-xs ${mutedClass}`}>
                          {sound.description}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void previewSound(sound.id)}
                      aria-label={`Ouvir prévia: ${sound.label}`}
                      title={`Ouvir ${sound.label}`}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${itemClass}`}
                    >
                      <Play size={15} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <p className={`mt-4 border-t pt-3 text-xs leading-5 ${isDark ? "border-[#363b33]" : "border-[#e2e4de]"} ${mutedClass}`}>
            Chamados abertos por você não emitem som. A preferência fica salva neste navegador.
          </p>
        </div>
      )}
    </div>
  );
}
