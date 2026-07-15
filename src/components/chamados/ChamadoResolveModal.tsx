"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import { Chamado } from "@/services/chamadoService";
import styles from "./chamadoModal.module.css";

type Props = {
  ticket: Chamado | null;
  theme?: "light" | "dark";
  loading?: boolean;
  onClose: () => void;
  onConfirm: (observation: string) => void | Promise<void>;
};

export default function ChamadoResolveModal({
  ticket,
  theme = "light",
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const [observation, setObservation] = useState("");
  const isDark = theme === "dark";
  const overlayTheme = isDark ? "bg-black/65" : "bg-[#1b211b]/35";

  useEffect(() => {
    if (ticket) setObservation("");
  }, [ticket]);

  if (!ticket) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onConfirm(observation);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] ${overlayTheme}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolver-chamado-title"
        className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl sm:p-6 ${
          isDark
            ? "border-[#343930] bg-[#191c17] text-[#f1f0e9]"
            : "border-[#d4d7d0] bg-[#f3f4f0] text-[#1c201c]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2 id="resolver-chamado-title" className="text-xl font-bold">
                Resolver chamado
              </h2>
              <p className={`mt-1 text-sm ${isDark ? "text-[#aeb4aa]" : "text-[#6f756d]"}`}>
                {ticket.protocolo || `Chamado #${ticket.id}`} será marcado como resolvido.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar modal"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark ? "hover:bg-[#292d26]" : "hover:bg-[#f0f1ed]"}`}
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">
              Observação da resolução <span className="font-normal opacity-65">(opcional)</span>
            </span>
            <textarea
              rows={4}
              maxLength={3000}
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Informe o que foi feito para resolver o chamado."
              className={`${styles.field} ${styles[theme]} resize-y rounded-lg px-3 py-3 text-sm leading-6`}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`min-h-11 rounded-lg border px-5 text-sm font-semibold ${isDark ? "border-[#3a3f37] hover:bg-[#252922]" : "border-[#d9dbd4] hover:bg-[#f0f1ed]"}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
            >
              {loading && <LoaderCircle size={17} className="animate-spin" />}
              Confirmar resolução
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
