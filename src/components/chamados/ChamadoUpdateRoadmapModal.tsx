"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  FlaskConical,
  MessageCircleMore,
  PackageSearch,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type Props = {
  audience: "tecnico" | "solicitante";
  theme?: "light" | "dark";
  buttonClassName: string;
};

const UPDATE_VERSION = "2026-07-conversa-patrimonio";

export default function ChamadoUpdateRoadmapModal({
  audience,
  theme = "light",
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";
  const storageKey = `prosis-chamados-roadmap-${UPDATE_VERSION}-${audience}`;

  const closeModal = useCallback(() => {
    localStorage.setItem(storageKey, "seen");
    setOpen(false);
  }, [storageKey]);

  useEffect(() => {
    if (localStorage.getItem(storageKey) !== "seen") {
      setOpen(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, open]);

  const panelClass = isDark
    ? "border-[#3a3f37] bg-[#191c17] text-[#f1f0e9]"
    : "border-[#d8dbd3] bg-white text-[#20251f]";
  const mutedClass = isDark ? "text-[#aeb4aa]" : "text-[#687067]";
  const cardClass = isDark
    ? "border-[#343930] bg-[#22261f]"
    : "border-[#e2e4de] bg-[#f8f9f5]";
  const stepClass = isDark ? "bg-[#302b19]" : "bg-[#fff4c2]";

  const conversationSteps =
    audience === "tecnico"
      ? [
          "Abra a conversa pelo botão de balão na linha do chamado.",
          "Responda ao colaborador ou marque Enviar solução para teste.",
          "O chamado ficará Aguardando teste até o colaborador confirmar ou informar que o problema continua.",
        ]
      : [
          "Abra a conversa pelo botão de balão ao lado do chamado.",
          "Responda ao técnico diretamente, sem precisar abrir outro chamado.",
          "Quando receber uma solução, escolha Problema resolvido ou Ainda não resolveu.",
        ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver novidades dos chamados"
        title="Novidades da última atualização"
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${buttonClassName}`}
      >
        <Sparkles size={18} />
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f7c41f] ring-2 ring-current"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chamado-roadmap-title"
            className={`max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl ${panelClass}`}
          >
            <header className="relative overflow-hidden border-b border-[#f7c41f]/25 bg-gradient-to-br from-[#f7c41f]/20 via-transparent to-emerald-500/10 px-5 py-6 sm:px-7">
              <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#f7c41f]/15 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f7c41f] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#241e08]">
                    <Sparkles size={14} />
                    Última atualização
                  </span>
                  <h2 id="chamado-roadmap-title" className="mt-4 text-2xl font-bold sm:text-3xl">
                    Novidades na Central de Chamados
                  </h2>
                  <p className={`mt-2 max-w-2xl text-sm leading-6 sm:text-base ${mutedClass}`}>
                    Agora você pode conversar dentro do chamado e relacionar atendimentos ao patrimônio de um equipamento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Fechar novidades"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${buttonClassName}`}
                >
                  <X size={19} />
                </button>
              </div>
            </header>

            <div className="space-y-5 px-5 py-6 sm:px-7">
              <div className="grid gap-5 lg:grid-cols-2">
                <article className={`rounded-xl border p-5 ${cardClass}`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7c41f] text-[#241e08]">
                      <MessageCircleMore size={22} />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b38200]">
                        Novidade 1
                      </p>
                      <h3 className="mt-1 text-lg font-bold">Conversa por chamado</h3>
                    </div>
                  </div>

                  <ol className="mt-5 space-y-4">
                    {conversationSteps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-6">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#b38200] ${stepClass}`}>
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className={`mt-5 flex gap-3 rounded-lg border p-3 text-sm leading-5 ${cardClass}`}>
                    <BellRing size={18} className="mt-0.5 shrink-0 text-[#d2a300]" />
                    <p className={mutedClass}>
                      No sino de notificações, escolha o som e o volume para abertura, mensagem e resolução.
                    </p>
                  </div>
                </article>

                <article className={`rounded-xl border p-5 ${cardClass}`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <PackageSearch size={22} />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                        Novidade 2
                      </p>
                      <h3 className="mt-1 text-lg font-bold">Patrimônio do equipamento</h3>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 text-sm leading-6">
                    <div className="flex gap-3">
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
                      <p>
                        Ao abrir ou editar um chamado, informe o campo opcional <strong>Número do patrimônio</strong>.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <FlaskConical size={20} className="mt-0.5 shrink-0 text-emerald-500" />
                      <p>
                        Use códigos como <strong>0002</strong>, <strong>NOTE-002</strong> ou <strong>PAT-2026-15</strong>. Espaços são removidos e letras ficam maiúsculas automaticamente.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Search size={20} className="mt-0.5 shrink-0 text-emerald-500" />
                      <p>
                        {audience === "tecnico"
                          ? "Use o filtro Patrimônio exato ou clique no código da tabela para ver todos os chamados abertos e resolvidos daquele equipamento."
                          : "Use sempre o mesmo código nos próximos chamados do equipamento. Assim, a equipe técnica consegue consultar todo o histórico dele."}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-5 rounded-lg border border-dashed p-3 ${isDark ? "border-emerald-700 bg-emerald-950/25" : "border-emerald-300 bg-emerald-50"}`}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
                      Exemplo prático
                    </p>
                    <p className={`mt-1 text-sm leading-5 ${mutedClass}`}>
                      Notebook <strong>NOTE-002</strong> sem internet hoje e com tela azul no futuro: os dois atendimentos ficam ligados pelo patrimônio.
                    </p>
                  </div>
                </article>
              </div>

              <footer className="flex flex-col gap-3 border-t border-current/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-xs leading-5 ${mutedClass}`}>
                  Este aviso aparece automaticamente uma vez e pode ser reaberto pelo ícone de novidades no cabeçalho.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f7c41f] px-5 text-sm font-bold text-[#241e08] transition-colors hover:bg-[#ffd54b]"
                >
                  <CheckCircle2 size={18} />
                  Entendi, vamos usar
                </button>
              </footer>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
