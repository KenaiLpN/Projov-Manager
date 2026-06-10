"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FileDown, List, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/pagination";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";
import { downloadElementAsPdf } from "@/utils/downloadElementAsPdf";

interface Curso {
  CurCodigo: string;
  CurDescricao: string | null;
}

interface Turma {
  TurCodigo: number;
  TurNome: string | null;
  TurCurso: string | null;
}

interface AlunoTurma {
  codigo: number;
  nome: string;
  situacao: string;
  nascimento: string;
  sexo: string;
  celular: string;
  email: string;
  cidade: string;
}

type SortKey = keyof AlunoTurma;
type SortDirection = "asc" | "desc" | null;

const PAGE_SIZES = [10, 25, 50, 100];

const columns: Array<{ key: SortKey; label: string }> = [
  { key: "codigo", label: "Código" },
  { key: "nome", label: "Nome" },
  { key: "situacao", label: "Situação" },
  { key: "nascimento", label: "Data de Nascimento" },
  { key: "sexo", label: "Sexo" },
  { key: "celular", label: "Celular" },
  { key: "email", label: "E-mail" },
  { key: "cidade", label: "Cidade" },
];

function getResponseArray<T>(payload: unknown, directKey?: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (directKey && Array.isArray(record[directKey])) return record[directKey] as T[];
  if (Array.isArray(record.data)) return record.data as T[];
  return [];
}

function normalizeAluno(item: Partial<AlunoTurma>): AlunoTurma {
  return {
    codigo: Number(item.codigo ?? 0),
    nome: item.nome ?? "",
    situacao: item.situacao ?? "",
    nascimento: item.nascimento ?? "",
    sexo: item.sexo ?? "",
    celular: item.celular ?? "",
    email: item.email || "Não Informado.",
    cidade: item.cidade ?? "",
  };
}

export default function AlunosTurmaPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [curso, setCurso] = useState("");
  const [turma, setTurma] = useState("");
  const [alunos, setAlunos] = useState<AlunoTurma[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pesquisado, setPesquisado] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.allSettled([
      api.get("/cursos?limit=1000"),
      api.get("/turmas?limit=1000"),
    ])
      .then(([resCursos, resTurmas]) => {
        if (resCursos.status === "fulfilled") {
          setCursos(getResponseArray<Curso>(resCursos.value.data, "cursos"));
        }
        if (resTurmas.status === "fulfilled") {
          setTurmas(getResponseArray<Turma>(resTurmas.value.data, "turmas"));
        }
      })
      .catch(() => toast.error("Erro ao carregar os cadastros de cursos e turmas."))
      .finally(() => setLoadingFiltros(false));
  }, []);

  const turmasDoCurso = useMemo(
    () => turmas.filter(item => String(item.TurCurso ?? "") === curso),
    [curso, turmas],
  );

  const turmaSelecionada = useMemo(
    () => turmas.find(item => String(item.TurCodigo) === turma),
    [turma, turmas],
  );

  const cursoSelecionado = useMemo(
    () => cursos.find(item => String(item.CurCodigo) === curso),
    [curso, cursos],
  );

  const resultados = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase("pt-BR");
    const filtrados = termo
      ? alunos.filter(item => Object.values(item).some(value =>
          String(value ?? "").toLocaleLowerCase("pt-BR").includes(termo),
        ))
      : alunos;

    if (!sortKey || !sortDirection) return filtrados;

    return [...filtrados].sort((a, b) => {
      const resultado = sortKey === "codigo"
        ? a.codigo - b.codigo
        : String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), "pt-BR", {
            sensitivity: "base",
            numeric: true,
          });

      return sortDirection === "asc" ? resultado : -resultado;
    });
  }, [alunos, search, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(resultados.length / pageSize));
  const paginaAtual = Math.min(page, totalPages);
  const resultadosPagina = resultados.slice((paginaAtual - 1) * pageSize, paginaAtual * pageSize);
  const primeiroRegistro = resultados.length === 0 ? 0 : (paginaAtual - 1) * pageSize + 1;
  const ultimoRegistro = Math.min(paginaAtual * pageSize, resultados.length);

  const handleCursoChange = (value: string) => {
    setCurso(value);
    setTurma("");
    setAlunos([]);
    setPesquisado(false);
    setPage(1);
    setSearch("");
  };

  const handleTurmaChange = (value: string) => {
    setTurma(value);
    setAlunos([]);
    setPesquisado(false);
    setPage(1);
    setSearch("");
  };

  const handlePesquisar = async () => {
    if (!curso || !turma) {
      toast.error("Selecione o curso e a turma.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/alocacoes/alunos-por-turma/${turma}`);
      const todos = getResponseArray<Partial<AlunoTurma>>(response.data);
      setAlunos(todos.map(normalizeAluno));
      setPesquisado(true);
      setPage(1);
      setSearch("");
      setSortKey(null);
      setSortDirection(null);
    } catch (error) {
      console.error("Erro ao carregar alunos por turma:", error);
      toast.error("Erro ao carregar alunos da turma.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    setSortKey(null);
    setSortDirection(null);
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current || resultados.length === 0) {
      toast.error("Não há dados para imprimir.");
      return;
    }

    setPdfLoading(true);
    try {
      await downloadElementAsPdf(pdfRef.current, {
        filename: `alunos-por-turma-${turma || "resultado"}.pdf`,
        orientation: "landscape",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortDirection) {
      return <ArrowUpDown size={13} className="text-slate-400 dark:text-slate-500" />;
    }

    return sortDirection === "asc"
      ? <ArrowUp size={13} className="text-[#133c86] dark:text-blue-300" />
      : <ArrowDown size={13} className="text-[#133c86] dark:text-blue-300" />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-[#07111f] sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePesquisar}
            disabled={loading || !curso || !turma}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0096da] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98] dark:disabled:bg-slate-700"
          >
            <List size={16} />
            {loading ? "Listando..." : "Listar"}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading || resultados.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0096da] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98] dark:disabled:bg-slate-700"
          >
            <FileDown size={16} />
            {pdfLoading ? "Gerando..." : "Imprimir"}
          </button>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#133c86] dark:text-blue-300 sm:text-3xl">Alunos por Turma</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consulte todos os alunos vinculados a uma turma, incluindo situações encerradas.
          </p>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b] dark:shadow-black/20">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700/80 dark:bg-[#13223a]">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Pesquisa de Alunos por Curso e Turma</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[minmax(220px,300px)_minmax(220px,300px)_auto] md:items-end">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-200">
              Curso
              <select
                value={curso}
                onChange={event => handleCursoChange(event.target.value)}
                disabled={loadingFiltros}
                className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/15 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
              >
                <option value="">{loadingFiltros ? "Carregando..." : "Selecione"}</option>
                {cursos.map(item => (
                  <option key={item.CurCodigo} value={item.CurCodigo}>
                    {item.CurDescricao || item.CurCodigo}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700 dark:text-blue-200">
              Turma
              <select
                value={turma}
                onChange={event => handleTurmaChange(event.target.value)}
                disabled={!curso}
                className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/15 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
              >
                <option value="">{curso ? "Selecione" : "Selecione um curso primeiro"}</option>
                {turmasDoCurso.map(item => (
                  <option key={item.TurCodigo} value={item.TurCodigo}>
                    {item.TurNome || `Turma ${item.TurCodigo}`}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handlePesquisar}
              disabled={loading || !curso || !turma}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0096da] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007cb5] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98] dark:disabled:bg-slate-700"
            >
              <Search size={16} />
              {loading ? "Pesquisando..." : "Pesquisar"}
            </button>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b] dark:shadow-black/20">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/80 dark:bg-[#13223a] sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
              Mostrar
              <select
                value={pageSize}
                onChange={event => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100"
              >
                {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              registros
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-200 sm:flex-row sm:items-center sm:gap-2">
              Procurar:
              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                disabled={!pesquisado}
                placeholder="Buscar"
                className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/15 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800 sm:w-64"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-sm">
              <thead className="bg-white dark:bg-[#172944]">
                <tr className="border-b border-slate-200 dark:border-slate-600">
                  {columns.map(column => (
                    <th key={column.key} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-blue-100">
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 whitespace-nowrap hover:text-[#133c86] dark:hover:text-blue-300"
                      >
                        {column.label}
                        {sortIcon(column.key)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {loading ? (
                  <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">Carregando alunos...</td></tr>
                ) : !pesquisado ? (
                  <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">Selecione o curso e a turma para realizar a pesquisa.</td></tr>
                ) : resultadosPagina.length === 0 ? (
                  <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">Nenhum aluno encontrado para a turma selecionada.</td></tr>
                ) : resultadosPagina.map(item => (
                  <tr key={item.codigo} className="bg-white transition-colors even:bg-slate-50/70 hover:bg-blue-50 dark:bg-[#0d192b] dark:even:bg-[#111f34] dark:hover:bg-[#182f4e]">
                    <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-blue-200">{item.codigo}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{item.nome || "-"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.situacao || "-"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">{item.nascimento || "-"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.sexo || "-"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">{item.celular || "-"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.email || "Não Informado."}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.cidade || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-700/80 dark:bg-[#0b1728]">
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Mostrando de {primeiroRegistro} até {ultimoRegistro} de {resultados.length} registros
            </p>
            <Pagination currentPage={paginaAtual} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </section>

        <div className="pointer-events-none absolute left-[-10000px] top-0 w-[1400px] bg-white p-8 text-slate-950" aria-hidden="true">
          <div ref={pdfRef}>
            <h1 className="mb-1 text-2xl font-bold">Alunos por Turma</h1>
            <p className="mb-5 text-sm">
              Curso: {cursoSelecionado?.CurDescricao || curso || "-"} | Turma: {turmaSelecionada?.TurNome || turma || "-"}
            </p>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column.key} className="border border-slate-300 bg-slate-100 px-2 py-2 text-left font-bold">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map(item => (
                  <tr key={`pdf-${item.codigo}`}>
                    <td className="border border-slate-300 px-2 py-1">{item.codigo}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.nome || "-"}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.situacao || "-"}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.nascimento || "-"}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.sexo || "-"}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.celular || "-"}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.email || "Não Informado."}</td>
                    <td className="border border-slate-300 px-2 py-1">{item.cidade || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
