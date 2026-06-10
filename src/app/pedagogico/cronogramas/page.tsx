"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";

type Aba = "cronogramas" | "intervalo" | "disciplina" | "cores" | "disciplinas-turma";

interface Turma {
  TurCodigo: number;
  TurNome: string | null;
}

interface Disciplina {
  DisCodigo: number;
  DisDescricao: string | null;
}

interface CronogramaDate {
  key: string;
  label: string;
  weekday: string;
  aulas: number;
}

interface CronogramaStudent {
  codigo: number;
  nome: string;
  cells: Array<{ date: string; value: string }>;
}

interface CronogramaResultado {
  turma: { codigo: number; nome: string } | null;
  dates: CronogramaDate[];
  students: CronogramaStudent[];
}

type FieldSize = "sm" | "md" | "lg";

const ABAS: { id: Aba; label: string }[] = [
  { id: "cronogramas", label: "Cronogramas" },
  { id: "intervalo", label: "Cronograma por Intervalo" },
  { id: "disciplina", label: "Cronograma por Disciplina" },
  { id: "cores", label: "Cores Disciplinas" },
  { id: "disciplinas-turma", label: "Cronograma Disciplinas/Turma" },
];

const EMPTY_RESULT: CronogramaResultado = {
  turma: null,
  dates: [],
  students: [],
};

const PAGE_SIZE = 10;

function getResponseArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];
  return [];
}

function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1);
}

function fieldWidth(size: FieldSize) {
  if (size === "lg") return "md:min-w-[360px]";
  if (size === "md") return "md:min-w-[220px]";
  return "md:min-w-[170px]";
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function CronogramasPage() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("cronogramas");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loading, setLoading] = useState(false);

  const [turma, setTurma] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [resultado, setResultado] = useState<CronogramaResultado>(EMPTY_RESULT);
  const [pesquisado, setPesquisado] = useState(false);
  const [pagina, setPagina] = useState(1);

  const [intervaloInicial, setIntervaloInicial] = useState("");
  const [intervaloFinal, setIntervaloFinal] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [disciplinaInicial, setDisciplinaInicial] = useState("");
  const [disciplinaFinal, setDisciplinaFinal] = useState("");
  const [turmaDisciplina, setTurmaDisciplina] = useState("");
  const [disciplinaTurma, setDisciplinaTurma] = useState("");
  const [turmaDisciplinaInicial, setTurmaDisciplinaInicial] = useState("");
  const [turmaDisciplinaFinal, setTurmaDisciplinaFinal] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/turmas?limit=1000"),
      api.get("/disciplinas?limit=1000"),
    ])
      .then(([resTurmas, resDisciplinas]) => {
        if (resTurmas.status === "fulfilled") {
          setTurmas(getResponseArray<Turma>(resTurmas.value.data));
        }
        if (resDisciplinas.status === "fulfilled") {
          setDisciplinas(getResponseArray<Disciplina>(resDisciplinas.value.data));
        }
      })
      .catch(() => toast.error("Erro ao carregar turmas e disciplinas."))
      .finally(() => setLoadingFiltros(false));
  }, []);

  const turmaSelecionada = useMemo(
    () => turmas.find((item) => String(item.TurCodigo) === turma),
    [turma, turmas],
  );

  const totalPages = Math.max(1, Math.ceil(resultado.students.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPages);
  const estudantesPagina = useMemo(
    () => resultado.students.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE),
    [paginaAtual, resultado.students],
  );
  const primeiroRegistro = resultado.students.length === 0 ? 0 : (paginaAtual - 1) * PAGE_SIZE + 1;
  const ultimoRegistro = Math.min(paginaAtual * PAGE_SIZE, resultado.students.length);
  const paginasVisiveis = getVisiblePages(paginaAtual, totalPages);

  const limparResultado = () => {
    setResultado(EMPTY_RESULT);
    setPesquisado(false);
    setPagina(1);
  };

  const handlePesquisarCronograma = async () => {
    if (!turma || !dataInicial || !dataFinal) {
      toast.error("Selecione a turma, a data inicial e a data final.");
      return;
    }
    if (dataFinal < dataInicial) {
      toast.error("A data final deve ser maior ou igual a data inicial.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<CronogramaResultado>("/cronogramas/turma", {
        params: {
          turmaId: turma,
          startDate: dataInicial,
          endDate: dataFinal,
        },
      });
      setResultado(response.data ?? EMPTY_RESULT);
      setPesquisado(true);
      setPagina(1);
    } catch (error) {
      console.error("Erro ao gerar cronograma:", error);
      toast.error("Erro ao gerar cronograma da turma.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceholderSearch = () => {
    toast("A consulta desta aba sera definida na proxima etapa.");
  };

  const renderTurmaSelect = (
    value: string,
    onChange: (value: string) => void,
    size: FieldSize = "lg",
  ) => (
    <label className={`flex min-w-0 flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100 ${fieldWidth(size)}`}>
      Turma
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loadingFiltros}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
      >
        <option value="">{loadingFiltros ? "Carregando..." : "Selecione.."}</option>
        {turmas.map((item) => (
          <option key={item.TurCodigo} value={item.TurCodigo}>
            {item.TurNome || `Turma ${item.TurCodigo}`}
          </option>
        ))}
      </select>
    </label>
  );

  const renderDisciplinaSelect = (
    value: string,
    onChange: (value: string) => void,
    size: FieldSize = "lg",
  ) => (
    <label className={`flex min-w-0 flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100 ${fieldWidth(size)}`}>
      Disciplina
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loadingFiltros}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
      >
        <option value="">{loadingFiltros ? "Carregando..." : "Selecione.."}</option>
        {disciplinas.map((item) => (
          <option key={item.DisCodigo} value={item.DisCodigo}>
            {item.DisDescricao || `Disciplina ${item.DisCodigo}`}
          </option>
        ))}
      </select>
    </label>
  );

  const renderDateField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
  ) => (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-100 md:min-w-[190px]">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0096da] focus:ring-2 focus:ring-[#0096da]/20 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
      />
    </label>
  );

  const renderSearchButton = (onClick: () => void, disabled = false, label = "Pesquisar") => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0096da] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98] dark:disabled:bg-slate-700 md:min-w-[150px]"
    >
      <Search size={16} />
      {label}
    </button>
  );

  const renderPanel = (title: string, children: React.ReactNode) => (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b] dark:shadow-black/20">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700/80 dark:bg-[#13223a]">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-[#07111f] sm:p-6">
        <header className="mb-5">
          <div className="flex items-center gap-2 text-[#133c86] dark:text-blue-300">
            <CalendarDays size={28} />
            <h1 className="text-2xl font-bold sm:text-3xl">Cronogramas</h1>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b]">
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 pt-4 dark:border-slate-700/80 dark:bg-[#13223a]">
            {ABAS.map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => setAbaAtiva(aba.id)}
                className={`shrink-0 rounded-t-md px-4 py-2 text-sm font-semibold transition ${
                  abaAtiva === aba.id
                    ? "bg-[#133c86] text-white dark:bg-blue-600"
                    : "bg-[#0096da] text-white hover:bg-[#007cb5] dark:bg-[#244b7d] dark:hover:bg-[#2d5d98]"
                }`}
              >
                {aba.label}
              </button>
            ))}
          </nav>

          <div className="p-4">
            {abaAtiva === "cronogramas" && (
              <div className="space-y-5">
                {renderPanel(
                  "Consulta de Cronograma Turma",
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,410px)_190px_190px_auto] lg:items-end">
                    {renderTurmaSelect(turma, (value) => {
                      setTurma(value);
                      limparResultado();
                    })}
                    {renderDateField("Data Inicial", dataInicial, (value) => {
                      setDataInicial(value);
                      limparResultado();
                    })}
                    {renderDateField("Data Final", dataFinal, (value) => {
                      setDataFinal(value);
                      limparResultado();
                    })}
                    {renderSearchButton(handlePesquisarCronograma, loading, loading ? "Pesquisando..." : "Pesquisar")}
                  </div>,
                )}

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b]">
                  <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/80 dark:bg-[#13223a] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                        {resultado.turma?.nome || turmaSelecionada?.TurNome || "Cronograma da turma"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {resultado.students.length} aprendizes | {resultado.dates.length} datas
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-sm">
                      <thead className="bg-white dark:bg-[#172944]">
                        <tr className="border-b border-slate-200 dark:border-slate-600">
                          <th className="sticky left-0 z-10 w-[320px] min-w-[260px] bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-[#172944] dark:text-blue-100">
                            Aprendiz
                          </th>
                          {resultado.dates.map((date) => (
                            <th key={date.key} className="min-w-[112px] border-l border-slate-200 px-3 py-3 text-center dark:border-slate-700">
                              <span className="block text-xs font-bold text-slate-700 dark:text-blue-100">{capitalize(date.weekday)}</span>
                              <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-slate-300">{date.label}</span>
                              <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#133c86] dark:bg-blue-950/50 dark:text-blue-200">
                                {date.aulas} aulas
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                        {loading ? (
                          <tr>
                            <td colSpan={Math.max(1, resultado.dates.length + 1)} className="px-4 py-12 text-center text-slate-400">
                              Carregando cronograma...
                            </td>
                          </tr>
                        ) : !pesquisado ? (
                          <tr>
                            <td colSpan={Math.max(1, resultado.dates.length + 1)} className="px-4 py-12 text-center text-slate-400">
                              Nenhum resultado carregado.
                            </td>
                          </tr>
                        ) : resultado.dates.length === 0 ? (
                          <tr>
                            <td colSpan={1} className="px-4 py-12 text-center text-slate-400">
                              Nenhuma data encontrada para a turma no periodo selecionado.
                            </td>
                          </tr>
                        ) : resultado.students.length === 0 ? (
                          <tr>
                            <td colSpan={resultado.dates.length + 1} className="px-4 py-12 text-center text-slate-400">
                              Nenhum aprendiz encontrado para a turma selecionada.
                            </td>
                          </tr>
                        ) : (
                          estudantesPagina.map((student) => (
                            <tr key={student.codigo} className="bg-white transition-colors even:bg-slate-50/70 hover:bg-blue-50 dark:bg-[#0d192b] dark:even:bg-[#111f34] dark:hover:bg-[#182f4e]">
                              <td className="sticky left-0 z-10 border-r border-slate-200 bg-inherit px-4 py-3 font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                                <span className="block truncate">{student.nome || "-"}</span>
                                <span className="mt-0.5 block text-[11px] font-medium text-slate-400 dark:text-slate-500">{student.codigo}</span>
                              </td>
                              {resultado.dates.map((date) => (
                                <td key={`${student.codigo}-${date.key}`} className="border-l border-slate-100 px-3 py-3 text-center dark:border-slate-700/80">
                                  <span className="mx-auto block h-8 w-8 rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-[#07111f]" title={student.cells.find((cell) => cell.date === date.key)?.value || undefined} />
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {pesquisado && resultado.students.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/80 dark:bg-[#0b1728] md:flex-row md:items-center md:justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mostrando de {primeiroRegistro} ate {ultimoRegistro} de {resultado.students.length} registros
                      </p>
                      {totalPages > 1 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPagina((current) => Math.max(1, current - 1))}
                            disabled={paginaAtual === 1}
                            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
                          >
                            Anterior
                          </button>
                          {paginasVisiveis[0] > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPagina(1)}
                                className="h-9 min-w-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
                              >
                                1
                              </button>
                              {paginasVisiveis[0] > 2 && <span className="px-1 text-xs text-slate-400">...</span>}
                            </>
                          )}
                          {paginasVisiveis.map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setPagina(page)}
                              className={`h-9 min-w-9 rounded-md border px-3 text-xs font-semibold transition ${
                                page === paginaAtual
                                  ? "border-[#133c86] bg-[#133c86] text-white dark:border-blue-500 dark:bg-blue-600"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          {paginasVisiveis[paginasVisiveis.length - 1] < totalPages && (
                            <>
                              {paginasVisiveis[paginasVisiveis.length - 1] < totalPages - 1 && <span className="px-1 text-xs text-slate-400">...</span>}
                              <button
                                type="button"
                                onClick={() => setPagina(totalPages)}
                                className="h-9 min-w-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setPagina((current) => Math.min(totalPages, current + 1))}
                            disabled={paginaAtual === totalPages}
                            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-200 dark:hover:bg-[#14243a]"
                          >
                            Proxima
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            {abaAtiva === "intervalo" && renderPanel(
              "Consulta de Cronograma Turma Periodo",
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[190px_190px_auto] md:items-end">
                {renderDateField("Data Inicial", intervaloInicial, setIntervaloInicial)}
                {renderDateField("Data Final", intervaloFinal, setIntervaloFinal)}
                {renderSearchButton(handlePlaceholderSearch)}
              </div>,
            )}

            {abaAtiva === "disciplina" && renderPanel(
              "Consulta de Cronograma Disciplina",
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,410px)_190px_190px_auto] lg:items-end">
                {renderDisciplinaSelect(disciplina, setDisciplina)}
                {renderDateField("Data Inicial", disciplinaInicial, setDisciplinaInicial)}
                {renderDateField("Data Final", disciplinaFinal, setDisciplinaFinal)}
                {renderSearchButton(handlePlaceholderSearch)}
              </div>,
            )}

            {abaAtiva === "cores" && renderPanel(
              "Consulta Cores Disciplinas",
              <div className="flex justify-center">
                {renderSearchButton(handlePlaceholderSearch)}
              </div>,
            )}

            {abaAtiva === "disciplinas-turma" && renderPanel(
              "Consulta de Cronograma Turma Disciplina",
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,410px)_minmax(220px,410px)]">
                {renderTurmaSelect(turmaDisciplina, setTurmaDisciplina)}
                {renderDisciplinaSelect(disciplinaTurma, setDisciplinaTurma)}
                {renderDateField("Data Inicial", turmaDisciplinaInicial, setTurmaDisciplinaInicial)}
                {renderDateField("Data Final", turmaDisciplinaFinal, setTurmaDisciplinaFinal)}
                <div className="lg:self-end">{renderSearchButton(handlePlaceholderSearch)}</div>
              </div>,
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
