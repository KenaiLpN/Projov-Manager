"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CircleCheckBig,
  Clock3,
  Inbox,
  LoaderCircle,
  LogOut,
  MessageCircleMore,
  Moon,
  Pencil,
  Plus,
  Sun,
  TicketCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import ChamadoConversationModal from "@/components/chamados/ChamadoConversationModal";
import ChamadoFormModal from "@/components/chamados/ChamadoFormModal";
import ChamadoNotificationMenu from "@/components/chamados/ChamadoNotificationMenu";
import portalStyles from "./portal.module.css";
import {
  Chamado,
  ChamadoFormData,
  ChamadoStatus,
  ChamadoUrgencia,
  chamadoErrorMessage,
  createChamado,
  listChamados,
  updateChamado,
} from "@/services/chamadoService";
import { getRoleLabel, getSessionUserRole } from "@/utils/roles";
import { useChamadoNotifications } from "@/hooks/useChamadoNotifications";

type SessionUser = {
  UsuCodigo?: string | null;
  UsuNome?: string | null;
  UsuTipo?: string | null;
};

type ThemeMode = "light" | "dark";
type PortalView = "ativos" | "resolvidos";

const CHAMADOS_THEME_STORAGE_KEY = "prosis-chamados-theme";
const GLOBAL_THEME_STORAGE_KEY = "prosis-theme";

function applyChamadosTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(CHAMADOS_THEME_STORAGE_KEY, theme);
  localStorage.setItem(GLOBAL_THEME_STORAGE_KEY, theme);
}

const themes = {
  light: {
    page: "bg-[#f4f4f1] text-[#1c201c]",
    header: "border-[#dcddd6] bg-white",
    brandIcon: "bg-[#f7c41f] text-[#241e08]",
    brandText: "text-[#1c201c]",
    muted: "text-[#6f756d]",
    button: "border-[#d9dbd4] bg-white text-[#4b514a] hover:bg-[#f0f1ed]",
    primaryButton: "bg-[#f7c41f] text-[#241e08] hover:bg-[#ffd54b]",
    eyebrow: "text-[#9a6a00]",
    title: "text-[#1c201c]",
    tabs: "border-[#dcddd6] bg-[#eceeea]",
    tabActive: "bg-[#f7c41f] text-[#241e08] shadow-sm",
    tabInactive: "text-[#5f665d] hover:bg-white hover:text-[#1c201c]",
    queue: "border-[#dcddd6] bg-white",
    queueToolbar: "border-[#dcddd6] bg-[#f7f7f4]",
    queueColumns: "border-[#e4e5df] bg-[#edeee9] text-[#697067]",
    queueRow: "border-[#e8e9e4] hover:bg-[#fafaf7]",
    queueTitle: "text-[#1c201c]",
    queueText: "text-[#555d54]",
    queueCell: "text-[#3f453e]",
    emptyIcon: "bg-[#fff8dc] text-[#9a6a00]",
  },
  dark: {
    page: "bg-[#11130f] text-[#f1f0e9]",
    header: "border-[#30342d] bg-[#191c17]",
    brandIcon: "bg-[#f7c41f] text-[#241e08]",
    brandText: "text-[#f1f0e9]",
    muted: "text-[#a4aaa0]",
    button: "border-[#363b33] bg-[#20231e] text-[#e8e7df] hover:bg-[#292d26]",
    primaryButton: "bg-[#f7c41f] text-[#241e08] hover:bg-[#ffd54b]",
    eyebrow: "text-[#f7c41f]",
    title: "text-[#f1f0e9]",
    tabs: "border-[#30342d] bg-[#1e211c]",
    tabActive: "bg-[#f7c41f] text-[#241e08] shadow-sm",
    tabInactive: "text-[#aeb4aa] hover:bg-[#292d26] hover:text-white",
    queue: "border-[#30342d] bg-[#191c17]",
    queueToolbar: "border-[#30342d] bg-[#1e211c]",
    queueColumns: "border-[#30342d] bg-[#232720] text-[#aeb4aa]",
    queueRow: "border-[#2c302a] hover:bg-[#1e211c]",
    queueTitle: "text-[#f1f0e9]",
    queueText: "text-[#b4bab0]",
    queueCell: "text-[#d5d8d1]",
    emptyIcon: "bg-[#302b19] text-[#f7c41f]",
  },
} as const;

const statusLabels: Record<ChamadoStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  em_atendimento: "Em atendimento",
  pendente: "Aguardando seu teste",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

const urgencyLabels: Record<ChamadoUrgencia, string> = {
  nao_classificada: "Sem definir",
  minima: "Mínima",
  media: "Média",
  maxima: "Máxima",
};

function urgencyClass(urgency: ChamadoUrgencia, isDark: boolean) {
  if (urgency === "minima") {
    return isDark
      ? "bg-emerald-950/60 text-emerald-300"
      : "bg-emerald-100 text-emerald-700";
  }
  if (urgency === "media") {
    return isDark
      ? "bg-amber-950/60 text-amber-300"
      : "bg-amber-100 text-amber-800";
  }
  if (urgency === "maxima") {
    return isDark ? "bg-red-950/60 text-red-300" : "bg-red-100 text-red-700";
  }
  return isDark ? "bg-[#2b2f29] text-[#c2c6bd]" : "bg-slate-100 text-slate-600";
}

function statusClass(status: ChamadoStatus, isDark: boolean) {
  if (status === "resolvido") {
    return isDark
      ? "bg-emerald-950/60 text-emerald-300"
      : "bg-emerald-100 text-emerald-700";
  }
  if (status === "cancelado") {
    return isDark ? "bg-red-950/50 text-red-300" : "bg-red-100 text-red-700";
  }
  return isDark ? "bg-[#302b19] text-[#f7c41f]" : "bg-[#fff4c2] text-[#765500]";
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function isClosed(ticket: Chamado) {
  return ticket.status === "resolvido" || ticket.status === "cancelado";
}

export default function ChamadosPortalPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tickets, setTickets] = useState<Chamado[]>([]);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeView, setActiveView] = useState<PortalView>("ativos");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(new Date());
  const [editingTicket, setEditingTicket] = useState<Chamado | null>(null);
  const [conversationTicket, setConversationTicket] = useState<Chamado | null>(null);
  const ticketRequestInFlightRef = useRef(false);

  const styles = themes[theme];
  const isDark = theme === "dark";
  const roleCode = getSessionUserRole(user as Record<string, unknown> | null);
  const roleLabel = getRoleLabel(roleCode);

  const activeTickets = useMemo(
    () => tickets.filter((ticket) => !isClosed(ticket)),
    [tickets],
  );
  const resolvedTickets = useMemo(
    () => tickets.filter((ticket) => isClosed(ticket)),
    [tickets],
  );
  const visibleTickets = activeView === "ativos" ? activeTickets : resolvedTickets;

  const loadTickets = useCallback(async (showLoading = true) => {
    if (ticketRequestInFlightRef.current) return;
    ticketRequestInFlightRef.current = true;
    if (showLoading) setLoadingTickets(true);
    try {
      setTickets(await listChamados());
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível carregar seus chamados."));
    } finally {
      ticketRequestInFlightRef.current = false;
      if (showLoading) setLoadingTickets(false);
    }
  }, []);

  const { settings: notificationSettings, setSettings: setNotificationSettings } =
    useChamadoNotifications({
      userId: user?.UsuCodigo,
      onExternalEvent: () => void loadTickets(false),
    });

  useEffect(() => {
    const sessionRaw = localStorage.getItem("projov_user");
    const chamadosTheme = localStorage.getItem(CHAMADOS_THEME_STORAGE_KEY);
    const globalTheme = localStorage.getItem(GLOBAL_THEME_STORAGE_KEY);
    const preferredTheme =
      chamadosTheme === "light" || chamadosTheme === "dark"
        ? chamadosTheme
        : globalTheme === "light" || globalTheme === "dark"
          ? globalTheme
          : document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";

    setTheme(preferredTheme);
    applyChamadosTheme(preferredTheme);

    if (sessionRaw) {
      try {
        setUser(JSON.parse(sessionRaw));
      } catch {
        localStorage.removeItem("projov_user");
      }
    }
    void loadTickets();
  }, [loadTickets]);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      applyChamadosTheme(nextTheme);
      return nextTheme;
    });
  }

  function openCreateModal() {
    setOpenedAt(new Date());
    setCreateModalOpen(true);
  }

  async function handleCreate(data: ChamadoFormData) {
    setSubmitting(true);
    try {
      const created = await createChamado(data);
      setTickets((current) => [created, ...current]);
      setActiveView("ativos");
      setCreateModalOpen(false);
      toast.success(`${created.protocolo || "Chamado"} aberto com sucesso.`);
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível abrir o chamado."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(data: ChamadoFormData) {
    if (!editingTicket) return;
    setSubmitting(true);
    try {
      const updated = await updateChamado(editingTicket.id, data);
      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );
      setEditingTicket(null);
      toast.success("Chamado atualizado com sucesso.");
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível editar o chamado."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleTicketUpdated(updated: Chamado) {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
    );
    setConversationTicket((current) =>
      current?.id === updated.id ? updated : current,
    );
  }

  async function handleLogout() {
    localStorage.removeItem("projov_user");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className={`min-h-screen transition-colors ${styles.page}`}>
      <header className={`border-b transition-colors ${styles.header}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.brandIcon}`}
            >
              <TicketCheck size={21} />
            </div>
            <div className="min-w-0">
              <h1 className={`truncate text-lg font-bold ${styles.brandText}`}>Chamados TI</h1>
              <p className={`truncate text-sm ${styles.muted}`}>
                {user?.UsuNome || "Portal do solicitante"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ChamadoNotificationMenu
              settings={notificationSettings}
              isDark={isDark}
              buttonClassName={styles.button}
              onSettingsChange={setNotificationSettings}
            />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              title={isDark ? "Modo claro" : "Modo escuro"}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${styles.button}`}
            >
              {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${styles.button}`}
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className={`text-sm font-bold uppercase tracking-[0.18em] ${styles.eyebrow}`}>
              Central de suporte
            </p>
            <h2 className={`mt-2 text-3xl font-bold ${styles.title}`}>Meus chamados</h2>
            <p className={`mt-2 text-sm ${styles.muted}`}>
              Acompanhe seus atendimentos ou registre um novo problema.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold shadow-sm transition-colors ${styles.primaryButton}`}
          >
            <Plus size={18} />
            Abrir chamado
          </button>
        </div>

        <div
          className={`mb-4 inline-flex w-full rounded-xl border p-1 sm:w-auto ${styles.tabs}`}
          role="tablist"
          aria-label="Visualização dos chamados"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "ativos"}
            onClick={() => setActiveView("ativos")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
              activeView === "ativos" ? styles.tabActive : styles.tabInactive
            }`}
          >
            <Clock3 size={16} />
            Em andamento
            <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{activeTickets.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "resolvidos"}
            onClick={() => setActiveView("resolvidos")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
              activeView === "resolvidos" ? styles.tabActive : styles.tabInactive
            }`}
          >
            <CircleCheckBig size={16} />
            Resolvidos
            <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{resolvedTickets.length}</span>
          </button>
        </div>

        <div className={`overflow-hidden rounded-xl border transition-colors ${styles.queue}`}>
          <div
            className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${styles.queueToolbar}`}
          >
            <div>
              <h3 className={`font-semibold ${styles.queueTitle}`}>
                {activeView === "ativos" ? "Chamados em andamento" : "Chamados resolvidos"}
              </h3>
              <p className={`mt-1 text-xs ${styles.muted}`}>
                {visibleTickets.length} chamado(s) nesta visualização
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadTickets(true)}
              disabled={loadingTickets}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${styles.button}`}
            >
              {loadingTickets && <LoaderCircle size={14} className="animate-spin" />}
              Atualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead
                className={`${portalStyles.tableHead} ${
                  isDark ? portalStyles.tableHeadDark : portalStyles.tableHeadLight
                } border-b text-[0.68rem] font-bold uppercase tracking-[0.1em] ${
                  styles.queueColumns
                }`}
              >
                <tr>
                  <th className="px-5 py-3">Número</th>
                  <th className="px-5 py-3">Problema</th>
                  <th className="px-5 py-3">Departamento</th>
                  <th className="px-5 py-3">Urgência</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">
                    {activeView === "ativos" ? "Abertura" : "Encerramento"}
                  </th>
                  <th className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td colSpan={7} className={`px-5 py-14 text-center ${styles.muted}`}>
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle size={18} className="animate-spin" />
                        Carregando chamados...
                      </span>
                    </td>
                  </tr>
                ) : visibleTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-5 py-14 text-center ${styles.muted}`}>
                      <div className="flex flex-col items-center">
                        <span
                          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${styles.emptyIcon}`}
                        >
                          {activeView === "ativos" ? (
                            <Inbox size={20} />
                          ) : (
                            <CircleCheckBig size={20} />
                          )}
                        </span>
                        <strong className={styles.queueTitle}>
                          {activeView === "ativos"
                            ? "Nenhum chamado em andamento"
                            : "Nenhum chamado resolvido"}
                        </strong>
                        <span className="mt-1 text-sm">
                          {activeView === "ativos"
                            ? "Use o botão “Abrir chamado” para registrar um atendimento."
                            : "Os chamados concluídos pela equipe aparecerão aqui."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className={`border-b transition-colors last:border-b-0 ${styles.queueRow}`}
                    >
                      <td className={`px-5 py-4 font-bold ${styles.queueTitle}`}>
                        {ticket.protocolo || `#${ticket.id}`}
                      </td>
                      <td className="max-w-sm px-5 py-4">
                        <p
                          className={`line-clamp-2 text-xs leading-5 ${styles.queueText}`}
                          title={ticket.descricao}
                        >
                          {ticket.descricao}
                        </p>
                      </td>
                      <td className={`px-5 py-4 ${styles.queueCell}`}>
                        {ticket.departamento_nome || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${urgencyClass(
                            ticket.prioridade_interna,
                            isDark,
                          )}`}
                        >
                          {urgencyLabels[ticket.prioridade_interna]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                            ticket.status,
                            isDark,
                          )}`}
                        >
                          {statusLabels[ticket.status]}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-xs ${styles.muted}`}>
                        {formatDateTime(
                          activeView === "ativos"
                            ? ticket.aberto_em
                            : ticket.resolvido_em || ticket.atualizado_em,
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setConversationTicket(ticket)}
                            title="Abrir conversa"
                            aria-label={`Abrir conversa de ${ticket.protocolo || `chamado ${ticket.id}`}`}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${styles.button}`}
                          >
                            <MessageCircleMore size={16} />
                          </button>
                        {!isClosed(ticket) ? (
                          <button
                            type="button"
                            onClick={() => setEditingTicket(ticket)}
                            title="Editar chamado"
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${styles.button}`}
                          >
                            <Pencil size={16} />
                          </button>
                        ) : (
                          null
                        )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ChamadoFormModal
        open={createModalOpen}
        mode="create"
        theme={theme}
        userName={user?.UsuNome || "Usuário autenticado"}
        userRole={roleLabel}
        openedAt={formatDateTime(openedAt)}
        loading={submitting}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
      <ChamadoFormModal
        open={Boolean(editingTicket)}
        mode="edit"
        theme={theme}
        userName={editingTicket?.solicitante_nome || ""}
        userRole={editingTicket?.solicitante_funcao || "Não definido"}
        openedAt={editingTicket ? formatDateTime(editingTicket.aberto_em) : ""}
        initialValues={
          editingTicket
            ? {
                departamento: (editingTicket.departamento_nome ||
                  "Comercial") as ChamadoFormData["departamento"],
                patrimonio_codigo: editingTicket.patrimonio_codigo || "",
                descricao: editingTicket.descricao,
                observacao: editingTicket.observacao || "",
              }
            : undefined
        }
        loading={submitting}
        onClose={() => setEditingTicket(null)}
        onSubmit={handleEdit}
      />
      <ChamadoConversationModal
        ticket={conversationTicket}
        theme={theme}
        currentUserId={user?.UsuCodigo}
        canManage={false}
        onClose={() => setConversationTicket(null)}
        onTicketUpdated={handleTicketUpdated}
      />
    </main>
  );
}
