"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarClock, LoaderCircle, TicketCheck, X } from "lucide-react";
import {
  CHAMADO_DEPARTAMENTOS,
  ChamadoDepartamento,
  ChamadoFormData,
} from "@/services/chamadoService";
import styles from "./chamadoModal.module.css";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  theme?: "light" | "dark";
  userName: string;
  userRole: string;
  openedAt: string;
  initialValues?: ChamadoFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: ChamadoFormData) => void | Promise<void>;
};

const emptyForm: ChamadoFormData = {
  departamento: "Relações Empresariais",
  descricao: "",
  observacao: "",
};

export default function ChamadoFormModal({
  open,
  mode,
  theme = "light",
  userName,
  userRole,
  openedAt,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ChamadoFormData>(emptyForm);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!open) return;
    setForm(initialValues ?? emptyForm);
  }, [initialValues, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose, open]);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit(form);
  }

  const modalTheme = isDark
    ? "border-[#343930] bg-[#191c17] text-[#f1f0e9]"
    : "border-[#d4d7d0] bg-[#f3f4f0] text-[#1c201c]";
  const overlayTheme = isDark ? "bg-black/65" : "bg-[#1b211b]/35";
  const muted = isDark ? "text-[#aeb4aa]" : "text-[#6f756d]";
  const label = isDark ? "text-[#d8dbd3]" : "text-[#3f453e]";

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
        aria-labelledby="chamado-modal-title"
        className={`max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl ${modalTheme}`}
      >
        <div className={`flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6 ${isDark ? "border-[#30342d]" : "border-[#e4e5df]"}`}>
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7c41f] text-[#241e08]">
              <TicketCheck size={21} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b38200]">
                Central de suporte
              </p>
              <h2 id="chamado-modal-title" className="mt-1 text-xl font-bold">
                {mode === "create" ? "Novo chamado" : "Editar chamado"}
              </h2>
              <p className={`mt-1 text-sm ${muted}`}>
                {mode === "create"
                  ? "Informe os dados do problema para registrar o atendimento."
                  : "Atualize os dados informados na abertura do chamado."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar modal"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-[#292d26]" : "hover:bg-[#f0f1ed]"}`}
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={`text-sm font-semibold ${label}`}>Solicitante</span>
              <input
                readOnly
                value={userName}
                className={`${styles.field} ${styles[theme]} h-11 rounded-lg px-3 text-sm`}
              />
            </label>
            <label className="space-y-2">
              <span className={`text-sm font-semibold ${label}`}>Função no sistema</span>
              <input
                readOnly
                value={userRole}
                className={`${styles.field} ${styles[theme]} h-11 rounded-lg px-3 text-sm`}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={`text-sm font-semibold ${label}`}>Departamento</span>
              <select
                required
                value={form.departamento}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    departamento: event.target.value as ChamadoDepartamento,
                  }))
                }
                className={`${styles.field} ${styles[theme]} h-11 cursor-pointer rounded-lg px-3 text-sm`}
              >
                {CHAMADO_DEPARTAMENTOS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className={`text-sm font-semibold ${label}`}>Data e hora da abertura</span>
              <div className="relative">
                <CalendarClock
                  size={17}
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${muted}`}
                />
                <input
                  readOnly
                  value={openedAt}
                  className={`${styles.field} ${styles[theme]} h-11 rounded-lg py-2 pl-10 pr-3 text-sm`}
                />
              </div>
            </label>
          </div>

          <label className="block space-y-2">
            <span className={`text-sm font-semibold ${label}`}>Descrição do problema</span>
            <textarea
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              value={form.descricao}
              onChange={(event) =>
                setForm((current) => ({ ...current, descricao: event.target.value }))
              }
              placeholder="Descreva o que está acontecendo, onde ocorre e desde quando."
              className={`${styles.field} ${styles[theme]} resize-y rounded-lg px-3 py-3 text-sm leading-6`}
            />
            <span className={`block text-right text-xs ${muted}`}>
              {form.descricao.length}/5000
            </span>
          </label>

          <label className="block space-y-2">
            <span className={`text-sm font-semibold ${label}`}>
              Observação <span className={`font-normal ${muted}`}>(opcional)</span>
            </span>
            <textarea
              maxLength={3000}
              rows={3}
              value={form.observacao ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, observacao: event.target.value }))
              }
              placeholder="Acrescente algum detalhe complementar, se necessário."
              className={`${styles.field} ${styles[theme]} resize-y rounded-lg px-3 py-3 text-sm leading-6`}
            />
          </label>

          <div className={`flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end ${isDark ? "border-[#30342d]" : "border-[#e4e5df]"}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`min-h-11 rounded-lg border px-5 text-sm font-semibold transition-colors ${isDark ? "border-[#3a3f37] hover:bg-[#252922]" : "border-[#d9dbd4] hover:bg-[#f0f1ed]"}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f7c41f] px-5 text-sm font-bold text-[#241e08] shadow-sm transition-colors hover:bg-[#ffd54b] disabled:cursor-wait disabled:opacity-70"
            >
              {loading && <LoaderCircle size={17} className="animate-spin" />}
              {mode === "create" ? "Abrir chamado" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
