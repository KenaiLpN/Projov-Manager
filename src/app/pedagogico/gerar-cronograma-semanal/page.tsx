"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Search, Wand2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";

interface Turma {
  TurCodigo: number;
  TurNome: string | null;
}

interface CronogramaSemestreRow {
  codigo: number;
  nome: string;
  turmaId: number;
  turma: string;
  parceiro: string;
  dataInicio: string;
  dataPrevTermino: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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

export default function GerarCronogramaSemestrePage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);

  const [turmaId, setTurmaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<CronogramaSemestreRow[]>([]);
  const [pesquisado, setPesquisado] = useState(false);

  useEffect(() => {
    api.get("/turmas?limit=1000")
      .then((response) => setTurmas(getResponseArray<Turma>(response.data)))
      .catch(() => toast.error("Erro ao carregar turmas."))
      .finally(() => setLoadingFiltros(false));
  }, []);

  const visibleStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleEnd = Math.min(page * pageSize, total);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const pesquisar = async (targetPage = 1, targetPageSize = pageSize) => {
    if (!turmaId || !dataInicio) {
      toast.error("Selecione a turma e a data inicio.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/geracao-cronogramas-semestre", {
        params: {
          turmaId,
          dataInicio,
          search: search.trim() || undefined,
          page: targetPage,
          limit: targetPageSize,
        },
      });

      setRows(getResponseArray<CronogramaSemestreRow>(response.data));
      setPage(response.data?.meta?.page ?? targetPage);
      setTotalPages(response.data?.meta?.totalPages ?? 1);
      setTotal(response.data?.meta?.total ?? 0);
      setPesquisado(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao pesquisar cronograma turma/semestre."));
    } finally {
      setLoading(false);
    }
  };

  const gerarCronograma = async () => {
    if (!turmaId || !dataInicio) {
      toast.error("Selecione a turma e a data inicio.");
      return;
    }

    setGerando(true);
    try {
      const response = await api.post("/geracao-cronogramas-semestre", {
        turmaId,
        dataInicio,
      });
      toast.success(response.data?.message || "Cronograma turma/semestre gerado.");
      await pesquisar(1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao gerar cronograma turma/semestre."));
    } finally {
      setGerando(false);
    }
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    if (pesquisado) void pesquisar(1, value);
  };

  const renderPagination = () => {
    if (!pesquisado || totalPages <= 1) return null;

    return (
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => pesquisar(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
        >
          Anterior
        </button>
        {visiblePages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => pesquisar(item)}
            disabled={loading}
            className={`h-9 min-w-9 rounded-md border px-3 text-xs font-semibold transition ${
              item === page
                ? "border-[#133c86] bg-[#133c86] text-white dark:border-blue-500 dark:bg-blue-600"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
            }`}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => pesquisar(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || loading}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
        >
          Seguinte
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
          <h1 className="text-2xl font-bold sm:text-3xl">Gerar Cronograma Turma/Semestre</h1>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b]">
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(260px,480px)_minmax(180px,240px)_auto] lg:items-end">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
              Turma
              <select
                value={turmaId}
                onChange={(event) => {
                  setTurmaId(event.target.value);
                  setPesquisado(false);
                  setRows([]);
                  setTotal(0);
                  setPage(1);
                }}
                disabled={loadingFiltros}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              >
                <option value="">{loadingFiltros ? "Carregando..." : "Selecione"}</option>
                {turmas.map((turma) => (
                  <option key={turma.TurCodigo} value={turma.TurCodigo}>
                    {turma.TurNome || `Turma ${turma.TurCodigo}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100">
              Data Inicio
              <input
                type="date"
                value={dataInicio}
                onChange={(event) => {
                  setDataInicio(event.target.value);
                  setPesquisado(false);
                  setRows([]);
                  setTotal(0);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
              />
            </label>

            <button
              type="button"
              onClick={() => pesquisar(1)}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0096da] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]"
            >
              <Search size={16} />
              {loading ? "Pesquisando..." : "Pesquisar"}
            </button>
          </div>

          {pesquisado && (
            <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-700/80">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                  Mostrar
                  <select
                    value={pageSize}
                    onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  registros
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                  Procurar:
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") pesquisar(1);
                    }}
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 md:w-64"
                    placeholder="Search"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead className="bg-white dark:bg-[#172944]">
                    <tr className="border-b border-slate-200 dark:border-slate-600">
                      {["Codigo", "Nome", "Turma", "Parceiro", "Data Inicio", "Data Prev Termino"].map((label) => (
                        <th key={label} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-blue-100">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">Carregando cronograma...</td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhum aprendiz encontrado.</td>
                      </tr>
                    ) : rows.map((row) => (
                      <tr key={row.codigo} className="bg-white transition-colors even:bg-slate-50/70 hover:bg-blue-50 dark:bg-[#0d192b] dark:even:bg-[#111f34] dark:hover:bg-[#182f4e]">
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{row.codigo}</td>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.nome}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.turma}</td>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.parceiro}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.dataInicio}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.dataPrevTermino}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mostrando de {visibleStart} ate {visibleEnd} de {total} registros
                </p>
                {renderPagination()}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 p-5 dark:border-slate-700/80">
            <button
              type="button"
              onClick={gerarCronograma}
              disabled={gerando}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0096da] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]"
            >
              <Wand2 size={16} />
              {gerando ? "Gerando..." : "Gerar Cronograma Turma/Semestre"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
