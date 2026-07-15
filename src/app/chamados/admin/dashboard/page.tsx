"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  CircleCheckBig,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sun,
  TicketCheck,
  Tickets,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ChamadoFormModal from "@/components/chamados/ChamadoFormModal";
import ChamadoResolveModal from "@/components/chamados/ChamadoResolveModal";
import {
  Chamado,
  CHAMADO_DEPARTAMENTOS,
  ChamadoFormData,
  ChamadoStatus,
  ChamadoUrgencia,
  chamadoErrorMessage,
  createChamado,
  listChamados,
  resolveChamado,
  updateChamado,
  updateChamadoUrgencia,
} from "@/services/chamadoService";
import { getRoleLabel, getSessionUserRole } from "@/utils/roles";
import pageStyles from "./dashboard.module.css";

type SessionUser = {
  UsuCodigo?: string | null;
  UsuNome?: string | null;
  UsuTipo?: string | null;
};

type ThemeMode = "light" | "dark";
type SortDirection = "asc" | "desc" | null;
type StatusFilter = ChamadoStatus | "all";
type UrgencyFilter = ChamadoUrgencia | "all";
type DepartmentFilter = ChamadoFormData["departamento"] | "all";
const CHAMADOS_THEME_STORAGE_KEY = "prosis-chamados-theme";
const GLOBAL_THEME_STORAGE_KEY = "prosis-theme";

function applyChamadosTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(CHAMADOS_THEME_STORAGE_KEY, theme);
  localStorage.setItem(GLOBAL_THEME_STORAGE_KEY, theme);
}

type QueueView =
  | "Dashboard"
  | "Todos os chamados"
  | "Não atribuídos"
  | "Meus chamados"
  | "Resolvidos";

const ticketMenuItems: Array<{
  label: Exclude<QueueView, "Dashboard">;
  icon: typeof Inbox;
}> = [
  { label: "Todos os chamados", icon: Inbox },
  { label: "Não atribuídos", icon: UserRound },
  { label: "Meus chamados", icon: Tickets },
  { label: "Resolvidos", icon: CircleCheckBig },
];

const statusLabels: Record<ChamadoStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  em_atendimento: "Em atendimento",
  pendente: "Pendente",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

const urgencyLabels: Record<ChamadoUrgencia, string> = {
  nao_classificada: "Sem definir",
  minima: "Mínima",
  media: "Média",
  maxima: "Máxima",
};

const themes = {
  light: {
    page: "bg-[#f4f4f1] text-[#1c201c]",
    header: "border-[#dcddd6] bg-white",
    brandIcon: "bg-[#f7c41f] text-[#241e08]",
    brandText: "text-[#1c201c]",
    muted: "text-[#6f756d]",
    button: "border-[#d9dbd4] bg-white text-[#4b514a] hover:bg-[#f0f1ed]",
    primaryButton: "bg-[#f7c41f] text-[#241e08] hover:bg-[#ffd54b]",
    sidebar: "border-[#dcddd6] bg-white",
    sidebarDivider: "border-[#e4e5df]",
    sidebarActive: "bg-[#f7c41f] text-[#241e08] shadow-sm",
    sidebarGroupActive: "bg-[#fff8dc] text-[#765500]",
    sidebarItem: "text-[#555d54] hover:bg-[#f0f1ed] hover:text-[#20251f]",
    sidebarSubItem: "text-[#697067] hover:bg-[#f3f4f0] hover:text-[#20251f]",
    eyebrow: "text-[#9a6a00]",
    title: "text-[#1c201c]",
    searchWrap:
      "border-[#d7d9d2] bg-[#eceeea] text-[#737970] focus-within:border-[#c99700] focus-within:ring-2 focus-within:ring-[#f7c41f]/20",
    searchInput: "text-[#252a24] placeholder:text-[#858b83]",
    metric: "border-[#dcddd6] bg-white",
    metricLabel: "text-[#565d55]",
    metricValue: "text-[#1c201c]",
    metricDetail: "text-[#8c6818]",
    queue: "border-[#dcddd6] bg-white",
    queueToolbar: "border-[#dcddd6] bg-[#f7f7f4]",
    queueColumns: "border-[#e4e5df] bg-[#edeee9] text-[#697067]",
    queueTitle: "text-[#1c201c]",
    queueRow: "border-[#e8e9e4] hover:bg-[#fafaf7]",
    filterPanel: "border-[#dcddd6] bg-[#f7f7f4]",
    filterLabel: "text-[#565d55]",
    emptyIcon: "bg-[#fff8dc] text-[#9a6a00]",
    empty: "text-[#6f756d]",
  },
  dark: {
    page: "bg-[#11130f] text-[#f1f0e9]",
    header: "border-[#30342d] bg-[#191c17]",
    brandIcon: "bg-[#f7c41f] text-[#241e08]",
    brandText: "text-[#f1f0e9]",
    muted: "text-[#a4aaa0]",
    button: "border-[#363b33] bg-[#20231e] text-[#e8e7df] hover:bg-[#292d26]",
    primaryButton: "bg-[#f7c41f] text-[#241e08] hover:bg-[#ffd54b]",
    sidebar: "border-[#30342d] bg-[#191c17]",
    sidebarDivider: "border-[#30342d]",
    sidebarActive: "bg-[#f7c41f] text-[#241e08] shadow-sm",
    sidebarGroupActive: "bg-[#302b19] text-[#f7c41f]",
    sidebarItem: "text-[#c2c6bd] hover:bg-[#252922] hover:text-white",
    sidebarSubItem: "text-[#aeb4aa] hover:bg-[#252922] hover:text-white",
    eyebrow: "text-[#f7c41f]",
    title: "text-[#f1f0e9]",
    searchWrap:
      "border-[#383d35] bg-[#232720] text-[#969d92] focus-within:border-[#f7c41f] focus-within:ring-2 focus-within:ring-[#f7c41f]/15",
    searchInput: "text-[#f1f0e9] placeholder:text-[#8f968b]",
    metric: "border-[#30342d] bg-[#191c17]",
    metricLabel: "text-[#c2c6bd]",
    metricValue: "text-[#f1f0e9]",
    metricDetail: "text-[#d4ad43]",
    queue: "border-[#30342d] bg-[#191c17]",
    queueToolbar: "border-[#30342d] bg-[#1e211c]",
    queueColumns: "border-[#30342d] bg-[#232720] text-[#aeb4aa]",
    queueTitle: "text-[#f1f0e9]",
    queueRow: "border-[#2c302a] hover:bg-[#1e211c]",
    filterPanel: "border-[#30342d] bg-[#1e211c]",
    filterLabel: "text-[#c2c6bd]",
    emptyIcon: "bg-[#302b19] text-[#f7c41f]",
    empty: "text-[#a4aaa0]",
  },
};

function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function isToday(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isClosed(ticket: Chamado) {
  return ticket.status === "resolvido" || ticket.status === "cancelado";
}

function urgencyClass(urgency: ChamadoUrgencia) {
  return {
    nao_classificada: pageStyles.urgencyUndefined,
    minima: pageStyles.urgencyMinima,
    media: pageStyles.urgencyMedia,
    maxima: pageStyles.urgencyMaxima,
  }[urgency];
}

function urgencyBarClass(urgency: ChamadoUrgencia) {
  return {
    nao_classificada: "bg-[#9ca39a]",
    minima: "bg-emerald-500",
    media: "bg-[#f7c41f]",
    maxima: "bg-red-500",
  }[urgency];
}

export default function ChamadosAdminDashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [ticketsExpanded, setTicketsExpanded] = useState(true);
  const [activeView, setActiveView] = useState<QueueView>("Dashboard");
  const [tickets, setTickets] = useState<Chamado[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [search, setSearch] = useState("");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>("all");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createOpenedAt, setCreateOpenedAt] = useState(new Date());
  const [editingTicket, setEditingTicket] = useState<Chamado | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<Chamado | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [urgencySavingId, setUrgencySavingId] = useState<number | null>(null);
  const styles = themes[theme];
  const isDark = theme === "dark";
  const isTicketView = activeView !== "Dashboard";
  const roleCode = getSessionUserRole(user as Record<string, unknown> | null);
  const roleLabel = getRoleLabel(roleCode);
  const canManage = roleCode === "T" || roleCode === "DEV";
  const filterSelectTheme = isDark
    ? pageStyles.filterSelectDark
    : pageStyles.filterSelectLight;
  const activeAdvancedFilterCount = [statusFilter, urgencyFilter, departmentFilter]
    .filter((value) => value !== "all").length;

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      setTickets(await listChamados());
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível carregar os chamados."));
    } finally {
      setLoadingTickets(false);
    }
  }, []);

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

  const visibleTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const filteredTickets = tickets.filter((ticket) => {
      if (activeView === "Não atribuídos" && ticket.tecnico_responsavel_id) return false;
      if (
        activeView === "Meus chamados" &&
        String(ticket.tecnico_responsavel_id ?? "") !== String(user?.UsuCodigo ?? "")
      ) return false;
      if (activeView === "Resolvidos" && ticket.status !== "resolvido") return false;
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (urgencyFilter !== "all" && ticket.prioridade_interna !== urgencyFilter) return false;
      if (departmentFilter !== "all" && ticket.departamento_nome !== departmentFilter) return false;
      if (!normalizedSearch) return true;
      return [ticket.protocolo, ticket.solicitante_nome, ticket.departamento_nome, ticket.descricao]
        .some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedSearch));
    });

    if (!sortDirection) return filteredTickets;

    return filteredTickets.sort((firstTicket, secondTicket) =>
      sortDirection === "asc"
        ? firstTicket.id - secondTicket.id
        : secondTicket.id - firstTicket.id,
    );
  }, [
    activeView,
    departmentFilter,
    search,
    sortDirection,
    statusFilter,
    tickets,
    urgencyFilter,
    user?.UsuCodigo,
  ]);

  const metrics = useMemo(() => [
    {
      label: "Abertos",
      value: tickets.filter((ticket) => ticket.status === "aberto").length,
      detail: "Aguardando primeira análise",
    },
    {
      label: "Não classificados",
      value: tickets.filter((ticket) => ticket.prioridade_interna === "nao_classificada" && !isClosed(ticket)).length,
      detail: "Sem urgência definida",
    },
    {
      label: "Sem técnico",
      value: tickets.filter((ticket) => !ticket.tecnico_responsavel_id && !isClosed(ticket)).length,
      detail: "Disponíveis para assumir",
    },
    {
      label: "Resolvidos hoje",
      value: tickets.filter((ticket) => ticket.status === "resolvido" && isToday(ticket.resolvido_em)).length,
      detail: "Finalizados no dia",
    },
  ], [tickets]);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      applyChamadosTheme(nextTheme);
      return nextTheme;
    });
  }

  function toggleTicketSort() {
    setSortDirection((currentDirection) =>
      currentDirection === "asc" ? "desc" : "asc",
    );
  }

  function clearAdvancedFilters() {
    setStatusFilter("all");
    setUrgencyFilter("all");
    setDepartmentFilter("all");
  }

  function toggleTicketMenu() {
    if (!sidebarExpanded) {
      setSidebarExpanded(true);
      setTicketsExpanded(true);
      return;
    }
    setTicketsExpanded((current) => !current);
  }

  function openCreateModal() {
    setCreateOpenedAt(new Date());
    setCreateModalOpen(true);
  }

  async function handleCreate(data: ChamadoFormData) {
    setSubmitting(true);
    try {
      const created = await createChamado(data);
      setTickets((current) => [created, ...current]);
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
      setTickets((current) => current.map((ticket) => ticket.id === updated.id ? updated : ticket));
      setEditingTicket(null);
      toast.success("Chamado atualizado com sucesso.");
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível editar o chamado."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUrgency(ticket: Chamado, urgency: Exclude<ChamadoUrgencia, "nao_classificada">) {
    setUrgencySavingId(ticket.id);
    try {
      const updated = await updateChamadoUrgencia(ticket.id, urgency);
      setTickets((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast.success("Urgência atualizada.");
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível alterar a urgência."));
    } finally {
      setUrgencySavingId(null);
    }
  }

  async function handleResolve(observation: string) {
    if (!resolvingTicket) return;
    setSubmitting(true);
    try {
      const updated = await resolveChamado(resolvingTicket.id, observation);
      setTickets((current) => current.map((ticket) => ticket.id === updated.id ? updated : ticket));
      setResolvingTicket(null);
      toast.success("Chamado resolvido e registrado no histórico.");
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível resolver o chamado."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    localStorage.removeItem("projov_user");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className={`min-h-screen transition-colors ${styles.page}`}>
      <header className={`border-b transition-colors ${styles.header}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.brandIcon}`}>
              <TicketCheck size={21} />
            </div>
            <div className="min-w-0">
              <h1 className={`truncate text-lg font-bold ${styles.brandText}`}>Chamados TI</h1>
              <p className={`truncate text-sm ${styles.muted}`}>{user?.UsuNome || "Painel técnico"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"} title={isDark ? "Modo claro" : "Modo escuro"} className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${styles.button}`}>
              {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            </button>
            <button type="button" onClick={handleLogout} className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${styles.button}`}>
              <LogOut size={17} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        <aside aria-label="Menu de chamados" className={`${pageStyles.sidebarMotion} w-full shrink-0 rounded-xl border p-3 transition-colors lg:min-h-[calc(100vh-7.5rem)] ${sidebarExpanded ? "lg:w-[252px]" : "lg:w-[76px]"} ${styles.sidebar}`}>
          <div className={`mb-3 hidden items-center border-b pb-3 lg:flex ${sidebarExpanded ? "justify-between" : "justify-center"} ${styles.sidebarDivider}`}>
            {sidebarExpanded && <span className={`text-[0.68rem] font-bold uppercase tracking-[0.2em] ${styles.muted}`}>Atendimento</span>}
            <button type="button" onClick={() => setSidebarExpanded((current) => !current)} aria-label={sidebarExpanded ? "Recolher menu" : "Expandir menu"} title={sidebarExpanded ? "Recolher menu" : "Expandir menu"} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${styles.sidebarItem}`}>
              {sidebarExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          </div>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            <button type="button" onClick={() => setActiveView("Dashboard")} title={!sidebarExpanded ? "Dashboard" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${sidebarExpanded ? "justify-start" : "lg:justify-center"} ${activeView === "Dashboard" ? styles.sidebarActive : styles.sidebarItem}`}>
              <LayoutDashboard size={18} className="shrink-0" />
              {sidebarExpanded && <span>Dashboard</span>}
            </button>
            <div className="shrink-0">
              <button type="button" onClick={toggleTicketMenu} aria-expanded={ticketsExpanded && sidebarExpanded} title={!sidebarExpanded ? "Chamados" : undefined} className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${sidebarExpanded ? "justify-start" : "lg:justify-center"} ${isTicketView ? styles.sidebarGroupActive : styles.sidebarItem}`}>
                <Tickets size={18} className="shrink-0" />
                {sidebarExpanded && <><span className="flex-1 text-left">Chamados</span><ChevronDown size={16} className={`transition-transform ${ticketsExpanded ? "rotate-180" : ""}`} /></>}
              </button>
              {sidebarExpanded && ticketsExpanded && (
                <div className="mt-1 space-y-1 pl-3">
                  <button type="button" onClick={openCreateModal} className={`flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${styles.sidebarSubItem}`}>
                    <Plus size={16} />Novo chamado
                  </button>
                  {ticketMenuItems.map((item) => {
                    const Icon = item.icon;
                    const selected = activeView === item.label;
                    return <button key={item.label} type="button" onClick={() => setActiveView(item.label)} className={`flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium transition-colors ${selected ? styles.sidebarActive : styles.sidebarSubItem}`}><Icon size={16} className="shrink-0" />{item.label}</button>;
                  })}
                </div>
              )}
            </div>
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${styles.eyebrow}`}>Área técnica</p>
              <h2 className={`mt-2 text-3xl font-bold ${styles.title}`}>{activeView === "Dashboard" ? "Painel de chamados" : activeView}</h2>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-2xl xl:justify-end">
              <label className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 transition-all xl:max-w-md ${styles.searchWrap}`}>
                <Search size={18} className="shrink-0" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar chamados" className={`${pageStyles.searchInput} w-full min-w-0 text-sm font-medium ${styles.searchInput}`} />
              </label>
              <button type="button" onClick={openCreateModal} className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition-colors ${styles.primaryButton}`}>
                <Plus size={18} />Novo chamado
              </button>
            </div>
          </div>

          {activeView === "Dashboard" && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => <div key={metric.label} className={`rounded-xl border p-5 transition-colors ${styles.metric}`}><p className={`text-sm font-semibold ${styles.metricLabel}`}>{metric.label}</p><p className={`mt-3 text-3xl font-bold ${styles.metricValue}`}>{metric.value}</p><p className={`mt-2 text-xs font-medium ${styles.metricDetail}`}>{metric.detail}</p></div>)}
            </div>
          )}

          <div className={`overflow-hidden rounded-xl border transition-colors ${styles.queue}`}>
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${styles.queueToolbar}`}>
              <div>
                <h3 className={`font-semibold ${styles.queueTitle}`}>
                  {activeView === "Dashboard" ? "Fila de chamados" : activeView}
                </h3>
                <p className={`mt-1 text-xs ${styles.muted}`}>
                  {visibleTickets.length} chamado(s), {sortDirection
                    ? `ordenados pelo número em ordem ${sortDirection === "asc" ? "crescente" : "decrescente"}`
                    : "ordenados pela atualização mais recente"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdvancedFiltersOpen((current) => !current)}
                  aria-expanded={advancedFiltersOpen}
                  className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${styles.button}`}
                >
                  <SlidersHorizontal size={15} />
                  Filtros avançados
                  {activeAdvancedFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f7c41f] px-1 text-[0.65rem] font-bold text-[#241e08]">
                      {activeAdvancedFilterCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void loadTickets()}
                  disabled={loadingTickets}
                  className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${styles.button}`}
                >
                  {loadingTickets && <LoaderCircle size={15} className="animate-spin" />}
                  Atualizar
                </button>
              </div>
            </div>

            {advancedFiltersOpen && (
              <div className={`border-b px-5 py-4 ${styles.filterPanel}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={`text-xs font-bold uppercase tracking-[0.12em] ${styles.filterLabel}`}>
                    Refinar fila
                  </p>
                  {activeAdvancedFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAdvancedFilters}
                      className={`flex items-center gap-1 text-xs font-semibold transition-colors ${styles.muted}`}
                    >
                      <X size={14} />
                      Limpar filtros
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1.5">
                    <span className={`text-xs font-semibold ${styles.filterLabel}`}>Status</span>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                      className={`${pageStyles.filterSelect} ${filterSelectTheme} w-full rounded-lg px-3 text-sm`}
                    >
                      <option value="all">Todos os status</option>
                      <option value="aberto">Aberto</option>
                      <option value="em_analise">Em análise</option>
                      <option value="em_atendimento">Em atendimento</option>
                      <option value="pendente">Pendente</option>
                      <option value="resolvido">Resolvido</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className={`text-xs font-semibold ${styles.filterLabel}`}>Urgência</span>
                    <select
                      value={urgencyFilter}
                      onChange={(event) => setUrgencyFilter(event.target.value as UrgencyFilter)}
                      className={`${pageStyles.filterSelect} ${filterSelectTheme} w-full rounded-lg px-3 text-sm`}
                    >
                      <option value="all">Todas as urgências</option>
                      <option value="nao_classificada">Sem definir</option>
                      <option value="minima">Mínima</option>
                      <option value="media">Média</option>
                      <option value="maxima">Máxima</option>
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className={`text-xs font-semibold ${styles.filterLabel}`}>Departamento</span>
                    <select
                      value={departmentFilter}
                      onChange={(event) => setDepartmentFilter(event.target.value as DepartmentFilter)}
                      className={`${pageStyles.filterSelect} ${filterSelectTheme} w-full rounded-lg px-3 text-sm`}
                    >
                      <option value="all">Todos os departamentos</option>
                      {CHAMADO_DEPARTAMENTOS.map((department) => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <div role="table" aria-label="Lista de chamados" className="min-w-[1050px]">
                <div role="row" className={`grid grid-cols-[130px_minmax(280px,1.7fr)_150px_175px_150px_105px] border-b px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] ${styles.queueColumns}`}>
                  <div
                    role="columnheader"
                    aria-sort={sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : "none"}
                  >
                    <button
                      type="button"
                      onClick={toggleTicketSort}
                      className="flex items-center gap-1.5 transition-colors hover:text-[#b38200]"
                      title="Ordenar pelo número do chamado"
                    >
                      Chamado
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : sortDirection === "desc" ? (
                        <ArrowDown size={14} />
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </button>
                  </div>
                  <span role="columnheader" className="pl-5">Solicitante e problema</span>
                  <span role="columnheader">Departamento</span>
                  <span role="columnheader">Abertura</span>
                  <span role="columnheader">Urgência</span>
                  <span role="columnheader" className="text-right">Ações</span>
                </div>
                {loadingTickets ? (
                  <div className={`flex min-h-52 items-center justify-center gap-2 text-sm ${styles.empty}`}><LoaderCircle size={20} className="animate-spin" />Carregando chamados...</div>
                ) : visibleTickets.length === 0 ? (
                  <div role="row" className="flex min-h-52 items-center justify-center px-5 py-12"><div role="cell" className={`flex flex-col items-center text-center ${styles.empty}`}><div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${styles.emptyIcon}`}><Inbox size={20} /></div><p className={`font-semibold ${styles.queueTitle}`}>Nenhum chamado para exibir</p><p className="mt-1 max-w-sm text-sm">Abra um novo chamado ou altere o filtro da fila para visualizar outros registros.</p></div></div>
                ) : visibleTickets.map((ticket) => (
                  <div key={ticket.id} role="row" className={`relative grid grid-cols-[130px_minmax(280px,1.7fr)_150px_175px_150px_105px] items-center border-b px-5 py-4 text-sm transition-colors last:border-b-0 ${styles.queueRow}`}>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 w-[3px] ${urgencyBarClass(ticket.prioridade_interna)}`}
                    />
                    <div role="cell"><p className={`font-bold ${styles.queueTitle}`}>{ticket.protocolo || `#${ticket.id}`}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${ticket.status === "resolvido" ? "bg-emerald-100 text-emerald-700" : isDark ? "bg-[#302b19] text-[#f7c41f]" : "bg-[#fff4c2] text-[#765500]"}`}>{statusLabels[ticket.status]}</span></div>
                    <div role="cell" className="min-w-0 pl-5 pr-5"><p className={`truncate font-semibold ${styles.queueTitle}`}>{ticket.solicitante_nome}{ticket.solicitante_funcao && <span className={`ml-2 text-xs font-normal ${styles.muted}`}>{ticket.solicitante_funcao}</span>}</p><p className={`mt-1 line-clamp-2 text-xs leading-5 ${styles.muted}`} title={ticket.descricao}>{ticket.descricao}</p></div>
                    <span role="cell" className={styles.queueTitle}>{ticket.departamento_nome || "—"}</span>
                    <span role="cell" className={`text-xs ${styles.muted}`}>{formatDateTime(ticket.aberto_em)}</span>
                    <div role="cell">
                      {canManage && !isClosed(ticket) ? (
                        <div className="relative"><select aria-label={`Urgência do chamado ${ticket.protocolo || ticket.id}`} value={ticket.prioridade_interna} disabled={urgencySavingId === ticket.id} onChange={(event) => { if (event.target.value !== "nao_classificada") void handleUrgency(ticket, event.target.value as Exclude<ChamadoUrgencia, "nao_classificada">); }} className={`${pageStyles.urgencySelect} ${urgencyClass(ticket.prioridade_interna)} h-9 w-[132px] rounded-lg px-2 pr-7 text-xs font-bold`}><option value="nao_classificada" disabled>Sem definir</option><option value="minima">Mínima</option><option value="media">Média</option><option value="maxima">Máxima</option></select>{urgencySavingId === ticket.id && <LoaderCircle size={14} className="pointer-events-none absolute right-2 top-2.5 animate-spin" />}</div>
                      ) : <span className={`${pageStyles.urgencyBadge} ${urgencyClass(ticket.prioridade_interna)}`}>{urgencyLabels[ticket.prioridade_interna]}</span>}
                    </div>
                    <div role="cell" className="flex justify-end gap-2">
                      {!isClosed(ticket) && <button type="button" onClick={() => setEditingTicket(ticket)} title="Editar chamado" aria-label={`Editar ${ticket.protocolo || `chamado ${ticket.id}`}`} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${styles.button}`}><Pencil size={16} /></button>}
                      {canManage && !isClosed(ticket) && <button type="button" onClick={() => setResolvingTicket(ticket)} title="Resolver chamado" aria-label={`Resolver ${ticket.protocolo || `chamado ${ticket.id}`}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 text-white transition-colors hover:bg-emerald-700"><Check size={17} strokeWidth={2.5} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <ChamadoFormModal open={createModalOpen} mode="create" theme={theme} userName={user?.UsuNome || "Usuário autenticado"} userRole={roleLabel} openedAt={formatDateTime(createOpenedAt)} loading={submitting} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreate} />
      <ChamadoFormModal open={Boolean(editingTicket)} mode="edit" theme={theme} userName={editingTicket?.solicitante_nome || ""} userRole={editingTicket?.solicitante_funcao || "Não definido"} openedAt={editingTicket ? formatDateTime(editingTicket.aberto_em) : ""} initialValues={editingTicket ? { departamento: (editingTicket.departamento_nome || "Comercial") as ChamadoFormData["departamento"], descricao: editingTicket.descricao, observacao: editingTicket.observacao || "" } : undefined} loading={submitting} onClose={() => setEditingTicket(null)} onSubmit={handleEdit} />
      <ChamadoResolveModal ticket={resolvingTicket} theme={theme} loading={submitting} onClose={() => setResolvingTicket(null)} onConfirm={handleResolve} />
    </main>
  );
}
