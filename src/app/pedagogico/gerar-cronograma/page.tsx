"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, Eye, Pencil, Printer, Search, Wand2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";

interface Turma {
  TurCodigo: number;
  TurNome: string | null;
}

interface Disciplina {
  DisCodigo: number;
  DisDescricao: string | null;
}

interface Educador {
  EducCodigo: number;
  EducNome: string | null;
}

interface CronogramaRow {
  codigo: number;
  dataAula: string;
  dataAulaIso: string;
  sequencia: number;
  disciplinaId: number;
  disciplina: string;
  educadorId: number;
  professor: string;
  turmaId: number;
  turma: string;
  quantidade: number;
}

const PAGE_SIZE = 10;
const SEQUENCIAS = [1, 2, 3];

function getResponseArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];
  return [];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export default function GerarCronogramaPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [educadores, setEducadores] = useState<Educador[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [turmaId, setTurmaId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [educadorId, setEducadorId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [sequencia, setSequencia] = useState("1");

  const [showList, setShowList] = useState(false);
  const [generatedModalOpen, setGeneratedModalOpen] = useState(false);
  const [rows, setRows] = useState<CronogramaRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingRow, setEditingRow] = useState<CronogramaRow | null>(null);
  const [editingEducadorId, setEditingEducadorId] = useState("");
  const [savingEducador, setSavingEducador] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get("/turmas?limit=1000"),
      api.get("/disciplinas?limit=1000"),
      api.get("/educadores?limit=1000"),
    ])
      .then(([resTurmas, resDisciplinas, resEducadores]) => {
        if (resTurmas.status === "fulfilled") setTurmas(getResponseArray<Turma>(resTurmas.value.data));
        if (resDisciplinas.status === "fulfilled") setDisciplinas(getResponseArray<Disciplina>(resDisciplinas.value.data));
        if (resEducadores.status === "fulfilled") setEducadores(getResponseArray<Educador>(resEducadores.value.data));
      })
      .catch(() => toast.error("Erro ao carregar turmas, disciplinas e professores."))
      .finally(() => setLoadingFiltros(false));
  }, []);

  const visibleStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const visibleEnd = Math.min(page * PAGE_SIZE, total);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const buildQueryParams = (targetPage: number) => ({
    ...(turmaId ? { turmaId } : {}),
    ...(disciplinaId ? { disciplinaId } : {}),
    ...(educadorId ? { educadorId } : {}),
    ...(sequencia ? { sequencia } : {}),
    ...(dataInicio ? { startDate: dataInicio } : {}),
    page: targetPage,
    limit: PAGE_SIZE,
  });

  const handlePesquisar = async (targetPage = 1) => {
    setListLoading(true);
    try {
      const response = await api.get("/geracao-cronogramas", {
        params: buildQueryParams(targetPage),
      });
      setRows(getResponseArray<CronogramaRow>(response.data));
      setPage(response.data?.meta?.page ?? targetPage);
      setTotalPages(response.data?.meta?.totalPages ?? 1);
      setTotal(response.data?.meta?.total ?? 0);
      setShowList(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao pesquisar cronograma."));
    } finally {
      setListLoading(false);
    }
  };

  const handleGerar = async () => {
    if (!turmaId || !disciplinaId || !educadorId || !quantidade || !dataInicio || !sequencia) {
      toast.error("Preencha turma, disciplina, professor, quantidade, data inicio e sequencia.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/geracao-cronogramas", {
        turmaId,
        disciplinaId,
        educadorId,
        quantidade,
        dataInicio,
        sequencia,
      });
      setGeneratedModalOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao gerar cronograma."));
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (row: CronogramaRow) => {
    setEditingRow(row);
    setEditingEducadorId(String(row.educadorId));
  };

  const handleSaveEducador = async () => {
    if (!editingRow || !editingEducadorId) return;

    setSavingEducador(true);
    try {
      await api.put(`/geracao-cronogramas/${editingRow.codigo}/educador`, {
        educadorId: editingEducadorId,
      });
      toast.success("Professor alterado.");
      setEditingRow(null);
      await handlePesquisar(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao alterar professor."));
    } finally {
      setSavingEducador(false);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => handlePesquisar(Math.max(1, page - 1))}
          disabled={page === 1 || listLoading}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
        >
          Anterior
        </button>
        {visiblePages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => handlePesquisar(1)}
              className="h-9 min-w-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className="px-1 text-xs text-slate-400">...</span>}
          </>
        )}
        {visiblePages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handlePesquisar(item)}
            disabled={listLoading}
            className={`h-9 min-w-9 rounded-md border px-3 text-xs font-semibold transition ${
              item === page
                ? "border-[#133c86] bg-[#133c86] text-white dark:border-blue-500 dark:bg-blue-600"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
            }`}
          >
            {item}
          </button>
        ))}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="px-1 text-xs text-slate-400">...</span>}
            <button
              type="button"
              onClick={() => handlePesquisar(totalPages)}
              className="h-9 min-w-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => handlePesquisar(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || listLoading}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
        >
          Proxima
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-[#07111f] sm:p-6">
        <header className="mb-5 flex items-center gap-2 text-[#133c86] dark:text-blue-300">
          <CalendarClock size={28} />
          <h1 className="text-2xl font-bold sm:text-3xl">Geracao de Cronograma da Turma/Disciplina</h1>
        </header>

        {!showList ? (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b]">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700/80 dark:bg-[#13223a]">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Geracao de Cronograma da Turma/Disciplina</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(240px,410px)_minmax(240px,300px)_minmax(240px,300px)_190px]">
              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Turma
                <select value={turmaId} onChange={(event) => setTurmaId(event.target.value)} disabled={loadingFiltros} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100">
                  <option value="">{loadingFiltros ? "Carregando..." : "Selecione.."}</option>
                  {turmas.map((turma) => <option key={turma.TurCodigo} value={turma.TurCodigo}>{turma.TurNome || `Turma ${turma.TurCodigo}`}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Disciplina
                <select value={disciplinaId} onChange={(event) => setDisciplinaId(event.target.value)} disabled={loadingFiltros} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100">
                  <option value="">{loadingFiltros ? "Carregando..." : "Selecione.."}</option>
                  {disciplinas.map((disciplina) => <option key={disciplina.DisCodigo} value={disciplina.DisCodigo}>{disciplina.DisDescricao || `Disciplina ${disciplina.DisCodigo}`}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Professores
                <select value={educadorId} onChange={(event) => setEducadorId(event.target.value)} disabled={loadingFiltros} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100">
                  <option value="">{loadingFiltros ? "Carregando..." : "Selecione.."}</option>
                  {educadores.map((educador) => <option key={educador.EducCodigo} value={educador.EducCodigo}>{educador.EducNome || `Professor ${educador.EducCodigo}`}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Quantidade
                <input type="number" min="1" max="300" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100" />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Data Inicio
                <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100" />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Sequencia
                <select value={sequencia} onChange={(event) => setSequencia(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100">
                  {SEQUENCIAS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2 lg:self-end">
                <button type="button" onClick={handleGerar} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0096da] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]">
                  <Wand2 size={16} />
                  {loading ? "Gerando..." : "Gerar Cronograma"}
                </button>
                <button type="button" onClick={() => handlePesquisar(1)} disabled={listLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0096da] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]">
                  <Search size={16} />
                  {listLoading ? "Pesquisando..." : "Pesquisar"}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b]">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/80 dark:bg-[#13223a]">
              <button type="button" onClick={() => setShowList(false)} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#0096da] px-4 text-sm font-semibold text-white transition hover:bg-[#007cb5] dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]">
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#0096da] px-4 text-sm font-semibold text-white transition hover:bg-[#007cb5] dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]">
                <Printer size={16} />
                Imprimir
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead className="bg-white dark:bg-[#172944]">
                  <tr className="border-b border-slate-200 dark:border-slate-600">
                    {["Data Aula", "Sequencia", "Disciplina", "Professor", "Turma", "Alterar Prof.", "Qtd."].map((label) => (
                      <th key={label} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-blue-100">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                  {listLoading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Carregando cronograma...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Nenhum cronograma encontrado.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.codigo} className="bg-white transition-colors even:bg-slate-50/70 hover:bg-blue-50 dark:bg-[#0d192b] dark:even:bg-[#111f34] dark:hover:bg-[#182f4e]">
                      <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">{row.dataAula}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.sequencia}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.disciplina}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.professor}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.turma}</td>
                      <td className="px-3 py-2.5">
                        <button type="button" onClick={() => openEdit(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#133c86] transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40" title="Alterar professor">
                          <Pencil size={16} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/80 dark:bg-[#0b1728] md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">Mostrando de {visibleStart} ate {visibleEnd} de {total} registros</p>
              {renderPagination()}
            </div>
          </section>
        )}

        {generatedModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-[#0d192b]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cronograma gerado</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">O cronograma foi gerado com sucesso. Deseja visualizar a lista agora?</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setGeneratedModalOpen(false)} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-[#14243a]">
                  Continuar
                </button>
                <button type="button" onClick={() => { setGeneratedModalOpen(false); handlePesquisar(1); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0096da] px-4 text-sm font-semibold text-white transition hover:bg-[#007cb5] dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]">
                  <Eye size={16} />
                  Ver cronograma
                </button>
              </div>
            </div>
          </div>
        )}

        {editingRow && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl dark:bg-[#0d192b]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Alterar professor</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{editingRow.dataAula} | {editingRow.disciplina}</p>
              <label className="mt-5 flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
                Professor
                <select value={editingEducadorId} onChange={(event) => setEditingEducadorId(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100">
                  {educadores.map((educador) => <option key={educador.EducCodigo} value={educador.EducCodigo}>{educador.EducNome || `Professor ${educador.EducCodigo}`}</option>)}
                </select>
              </label>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setEditingRow(null)} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-[#14243a]">
                  Cancelar
                </button>
                <button type="button" onClick={handleSaveEducador} disabled={savingEducador} className="h-10 rounded-md bg-[#0096da] px-4 text-sm font-semibold text-white transition hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]">
                  {savingEducador ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
