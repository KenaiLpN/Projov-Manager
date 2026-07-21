"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  LoaderCircle,
  MessageCircleMore,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Chamado,
  ChamadoConversationMessage,
  chamadoErrorMessage,
  confirmChamadoSolution,
  listChamadoConversation,
  sendChamadoMessage,
} from "@/services/chamadoService";
import styles from "./chamadoModal.module.css";

type Props = {
  ticket: Chamado | null;
  theme?: "light" | "dark";
  currentUserId?: string | null;
  canManage: boolean;
  onClose: () => void;
  onTicketUpdated: (ticket: Chamado) => void;
};

const REFRESH_INTERVAL = 4_000;

function formatMessageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function messageBadge(message: ChamadoConversationMessage) {
  if (message.tipo_evento === "resolucao") return "Chamado resolvido";
  if (message.status_novo === "pendente") return "Solução enviada para teste";
  if (message.status_novo === "em_atendimento") {
    return "Problema ainda não resolvido";
  }
  return null;
}

export default function ChamadoConversationModal({
  ticket,
  theme = "light",
  currentUserId,
  canManage,
  onClose,
  onTicketUpdated,
}: Props) {
  const [messages, setMessages] = useState<ChamadoConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sendForTest, setSendForTest] = useState(false);
  const [problemPersists, setProblemPersists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const requestInFlightRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === "dark";
  const isClosed = ticket?.status === "resolvido" || ticket?.status === "cancelado";
  const awaitingRequester = ticket?.status === "pendente" && !canManage;

  const loadMessages = useCallback(
    async (showLoading = false) => {
      if (!ticket || requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      if (showLoading) setLoading(true);
      try {
        setMessages(await listChamadoConversation(ticket.id));
      } catch (error) {
        if (showLoading) {
          toast.error(
            chamadoErrorMessage(error, "Não foi possível carregar a conversa."),
          );
        }
      } finally {
        requestInFlightRef.current = false;
        if (showLoading) setLoading(false);
      }
    },
    [ticket],
  );

  useEffect(() => {
    if (!ticket) return;
    setMessages([]);
    setDraft("");
    setSendForTest(false);
    setProblemPersists(false);
    void loadMessages(true);
    const intervalId = window.setInterval(
      () => void loadMessages(false),
      REFRESH_INTERVAL,
    );
    return () => window.clearInterval(intervalId);
  }, [loadMessages, ticket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    if (!ticket) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting, ticket]);

  if (!ticket) return null;

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket || !draft.trim()) return;
    setSubmitting(true);
    try {
      const result = await sendChamadoMessage(ticket.id, {
        mensagem: draft.trim(),
        enviar_solucao_teste: canManage && sendForTest,
        problema_persiste: !canManage && problemPersists,
      });
      setMessages((current) =>
        current.some((message) => message.id === result.message.id)
          ? current
          : [...current, result.message],
      );
      onTicketUpdated(result.ticket);
      setDraft("");
      setSendForTest(false);
      setProblemPersists(false);
      toast.success(
        canManage && sendForTest
          ? "Solução enviada para teste do solicitante."
          : "Mensagem enviada.",
      );
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível enviar a mensagem."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmSolution() {
    if (!ticket) return;
    setSubmitting(true);
    try {
      const updated = await confirmChamadoSolution(ticket.id);
      onTicketUpdated(updated);
      await loadMessages(false);
      toast.success("Solução confirmada. O chamado foi resolvido.");
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível confirmar a solução."));
    } finally {
      setSubmitting(false);
    }
  }

  function startProblemFeedback() {
    setProblemPersists(true);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }

  const panelClass = isDark
    ? "border-[#343930] bg-[#191c17] text-[#f1f0e9]"
    : "border-[#d4d7d0] bg-[#f3f4f0] text-[#1c201c]";
  const muted = isDark ? "text-[#aeb4aa]" : "text-[#6f756d]";
  const divider = isDark ? "border-[#30342d]" : "border-[#e4e5df]";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] ${isDark ? "bg-black/65" : "bg-[#1b211b]/35"}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chamado-conversa-title"
        className={`flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${panelClass}`}
      >
        <header className={`flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${divider}`}>
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7c41f] text-[#241e08]">
              <MessageCircleMore size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b38200]">
                {ticket.protocolo || `Chamado #${ticket.id}`}
              </p>
              <h2 id="chamado-conversa-title" className="mt-1 truncate text-xl font-bold">
                Conversa do chamado
              </h2>
              <p className={`mt-1 truncate text-sm ${muted}`}>
                {ticket.solicitante_nome} · {ticket.departamento_nome || "Sem departamento"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fechar conversa"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark ? "hover:bg-[#292d26]" : "hover:bg-[#e8eae5]"}`}
          >
            <X size={19} />
          </button>
        </header>

        <div className={`min-h-52 flex-1 overflow-y-auto px-4 py-5 sm:px-6 ${isDark ? "bg-[#11130f]" : "bg-[#eceeea]"}`}>
          {loading ? (
            <div className={`flex min-h-52 items-center justify-center gap-2 text-sm ${muted}`}>
              <LoaderCircle size={18} className="animate-spin" />
              Carregando conversa...
            </div>
          ) : messages.length === 0 ? (
            <div className={`flex min-h-52 flex-col items-center justify-center text-center ${muted}`}>
              <MessageCircleMore size={30} strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold">Ainda não há mensagens.</p>
              <p className="mt-1 max-w-sm text-xs leading-5">
                Use o campo abaixo para iniciar a conversa sobre este chamado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const own = String(message.usuario_id ?? "") === String(currentUserId ?? "");
                const badge = messageBadge(message);
                return (
                  <article key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                      message.tipo_evento === "resolucao"
                        ? isDark
                          ? "border border-emerald-800 bg-emerald-950/50"
                          : "border border-emerald-200 bg-emerald-50"
                        : own
                          ? "rounded-br-md bg-[#f7c41f] text-[#241e08]"
                          : isDark
                            ? "rounded-bl-md border border-[#343930] bg-[#20231e]"
                            : "rounded-bl-md border border-[#d9dbd4] bg-white"
                    }`}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <strong className="text-xs">{message.usuario_nome || "Usuário"}</strong>
                        <span className={`text-[0.68rem] ${message.tipo_evento === "resolucao" || !own ? muted : "text-[#6e5608]"}`}>
                          {formatMessageDate(message.criado_em)}
                        </span>
                      </div>
                      {message.comentario && (
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                          {message.comentario}
                        </p>
                      )}
                      {badge && (
                        <span className="mt-2 inline-flex rounded-full bg-black/10 px-2 py-1 text-[0.68rem] font-bold">
                          {badge}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {!isClosed && (
          <div className={`border-t px-4 py-4 sm:px-6 ${divider}`}>
            {awaitingRequester && !problemPersists && (
              <div className={`mb-4 rounded-xl border p-4 ${isDark ? "border-amber-800/60 bg-amber-950/30" : "border-amber-200 bg-amber-50"}`}>
                <p className="text-sm font-semibold">A solução funcionou?</p>
                <p className={`mt-1 text-xs leading-5 ${muted}`}>
                  Confirme a resolução ou informe o que ainda está acontecendo.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void confirmSolution()}
                    disabled={submitting}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 size={17} /> Problema resolvido
                  </button>
                  <button
                    type="button"
                    onClick={startProblemFeedback}
                    disabled={submitting}
                    className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold ${isDark ? "border-[#4a5046] hover:bg-[#252922]" : "border-[#d0d4cc] hover:bg-[#f0f1ed]"}`}
                  >
                    <RotateCcw size={16} /> Ainda não resolveu
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={submitMessage}>
              {problemPersists && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-300">
                  <span>Descreva o que ainda não funcionou.</span>
                  <button type="button" onClick={() => setProblemPersists(false)} className="underline">
                    Cancelar
                  </button>
                </div>
              )}
              <textarea
                ref={textareaRef}
                required
                rows={3}
                maxLength={3000}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={canManage ? "Escreva uma resposta para o solicitante..." : "Escreva uma mensagem para a equipe técnica..."}
                className={`${styles.field} ${styles[theme]} w-full resize-y rounded-lg px-3 py-3 text-sm leading-6`}
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {canManage ? (
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={sendForTest}
                      onChange={(event) => setSendForTest(event.target.checked)}
                      className="h-4 w-4 accent-[#d2a300]"
                    />
                    Enviar como solução para teste
                  </label>
                ) : (
                  <span className={`text-xs ${muted}`}>{draft.length}/3000</span>
                )}
                <button
                  type="submit"
                  disabled={submitting || !draft.trim()}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#f7c41f] px-5 text-sm font-bold text-[#241e08] hover:bg-[#ffd54b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
                  {problemPersists
                    ? "Enviar retorno"
                    : sendForTest
                      ? "Enviar para teste"
                      : "Enviar mensagem"}
                </button>
              </div>
            </form>
          </div>
        )}

        {isClosed && (
          <footer className={`border-t px-5 py-3 text-center text-xs ${divider} ${muted}`}>
            Este chamado está encerrado. A conversa permanece disponível para consulta.
          </footer>
        )}
      </section>
    </div>
  );
}
