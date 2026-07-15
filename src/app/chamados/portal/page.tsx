"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, LoaderCircle, LogOut, Pencil, Plus, TicketCheck } from "lucide-react";
import toast from "react-hot-toast";
import ChamadoFormModal from "@/components/chamados/ChamadoFormModal";
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

type SessionUser = {
  UsuNome?: string | null;
  UsuTipo?: string | null;
};

const statusLabels: Record<ChamadoStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  em_atendimento: "Em atendimento",
  pendente: "Pendente",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

const urgencyStyles: Record<ChamadoUrgencia, string> = {
  nao_classificada: "bg-slate-100 text-slate-600",
  minima: "bg-emerald-100 text-emerald-700",
  media: "bg-amber-100 text-amber-800",
  maxima: "bg-red-100 text-red-700",
};

const urgencyLabels: Record<ChamadoUrgencia, string> = {
  nao_classificada: "Sem definir",
  minima: "Mínima",
  media: "Média",
  maxima: "Máxima",
};

function formatDateTime(value: string | Date) {
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
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(new Date());
  const [editingTicket, setEditingTicket] = useState<Chamado | null>(null);
  const roleCode = getSessionUserRole(user as Record<string, unknown> | null);
  const roleLabel = getRoleLabel(roleCode);

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      setTickets(await listChamados());
    } catch (error) {
      toast.error(chamadoErrorMessage(error, "Não foi possível carregar seus chamados."));
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    const sessionRaw = localStorage.getItem("projov_user");
    if (sessionRaw) {
      try {
        setUser(JSON.parse(sessionRaw));
      } catch {
        localStorage.removeItem("projov_user");
      }
    }
    void loadTickets();
  }, [loadTickets]);

  function openCreateModal() {
    setOpenedAt(new Date());
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

  async function handleLogout() {
    localStorage.removeItem("projov_user");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#f4f4f1] text-[#1c201c]">
      <header className="border-b border-[#dcddd6] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7c41f] text-[#241e08]">
              <TicketCheck size={21} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1c201c]">Chamados TI</h1>
              <p className="text-sm text-[#6f756d]">{user?.UsuNome || "Portal do solicitante"}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-[#d9dbd4] px-3 py-2 text-sm font-semibold text-[#555d54] transition-colors hover:bg-[#f0f1ed]"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a6a00]">
              Central de suporte
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#1c201c]">Meus chamados</h2>
            <p className="mt-2 text-sm text-[#6f756d]">
              Acompanhe seus atendimentos ou registre um novo problema.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#f7c41f] px-4 py-3 text-sm font-bold text-[#241e08] shadow-sm transition-colors hover:bg-[#ffd54b]"
          >
            <Plus size={18} />
            Abrir chamado
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#dcddd6] bg-white">
          <div className="flex items-center justify-between border-b border-[#dcddd6] bg-[#f7f7f4] px-5 py-4">
            <div>
              <h3 className="font-semibold text-[#1c201c]">Lista de chamados</h3>
              <p className="mt-1 text-xs text-[#6f756d]">{tickets.length} chamado(s) registrado(s)</p>
            </div>
            <button
              type="button"
              onClick={() => void loadTickets()}
              disabled={loadingTickets}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#d9dbd4] px-3 text-xs font-semibold text-[#555d54] hover:bg-[#f0f1ed]"
            >
              {loadingTickets && <LoaderCircle size={14} className="animate-spin" />}
              Atualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="border-b border-[#e4e5df] bg-[#edeee9] text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#697067]">
                <tr>
                  <th className="px-5 py-3">Número</th>
                  <th className="px-5 py-3">Problema</th>
                  <th className="px-5 py-3">Departamento</th>
                  <th className="px-5 py-3">Urgência</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Data e hora</th>
                  <th className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e9e4]">
                {loadingTickets ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-[#6f756d]">
                      <span className="inline-flex items-center gap-2"><LoaderCircle size={18} className="animate-spin" />Carregando chamados...</span>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-[#6f756d]">
                      <div className="flex flex-col items-center"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#fff8dc] text-[#9a6a00]"><Inbox size={20} /></span><strong className="text-[#1c201c]">Nenhum chamado para exibir</strong><span className="mt-1 text-sm">Use o botão “Abrir chamado” para registrar o primeiro.</span></div>
                    </td>
                  </tr>
                ) : tickets.map((ticket) => (
                  <tr key={ticket.id} className="transition-colors hover:bg-[#fafaf7]">
                    <td className="px-5 py-4 font-bold text-[#1c201c]">{ticket.protocolo || `#${ticket.id}`}</td>
                    <td className="max-w-sm px-5 py-4"><p className="line-clamp-2 text-xs leading-5 text-[#555d54]" title={ticket.descricao}>{ticket.descricao}</p></td>
                    <td className="px-5 py-4 text-[#3f453e]">{ticket.departamento_nome || "—"}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${urgencyStyles[ticket.prioridade_interna]}`}>{urgencyLabels[ticket.prioridade_interna]}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${ticket.status === "resolvido" ? "bg-emerald-100 text-emerald-700" : "bg-[#fff4c2] text-[#765500]"}`}>{statusLabels[ticket.status]}</span></td>
                    <td className="px-5 py-4 text-xs text-[#6f756d]">{formatDateTime(ticket.aberto_em)}</td>
                    <td className="px-5 py-4 text-right">
                      {!isClosed(ticket) && <button type="button" onClick={() => setEditingTicket(ticket)} title="Editar chamado" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9dbd4] text-[#555d54] transition-colors hover:bg-[#f0f1ed]"><Pencil size={16} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ChamadoFormModal open={createModalOpen} mode="create" userName={user?.UsuNome || "Usuário autenticado"} userRole={roleLabel} openedAt={formatDateTime(openedAt)} loading={submitting} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreate} />
      <ChamadoFormModal open={Boolean(editingTicket)} mode="edit" userName={editingTicket?.solicitante_nome || ""} userRole={editingTicket?.solicitante_funcao || "Não definido"} openedAt={editingTicket ? formatDateTime(editingTicket.aberto_em) : ""} initialValues={editingTicket ? { departamento: (editingTicket.departamento_nome || "Comercial") as ChamadoFormData["departamento"], descricao: editingTicket.descricao, observacao: editingTicket.observacao || "" } : undefined} loading={submitting} onClose={() => setEditingTicket(null)} onSubmit={handleEdit} />
    </main>
  );
}
