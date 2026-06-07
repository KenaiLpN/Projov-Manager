"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Pagination from "@/components/pagination";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";

interface Curso {
  CurCodigo: string;
  CurDescricao: string;
}

interface Turma {
  TurCodigo: number;
  TurNome: string | null;
  TurCurso: string | null;
}

interface AprendizTurma {
  codigo: number;
  nome: string;
  sexo: string;
  parceiro: string;
  unidade: string;
  areaAtuacao: string;
  telefone: string;
  situacao: string;
  email: string;
}

type SortKey = keyof AprendizTurma;
type SortDirection = "asc" | "desc" | null;

const PAGE_SIZES = [10, 25, 50, 100];

const columns: Array<{ key: SortKey; label: string }> = [
  { key: "codigo", label: "Código" },
  { key: "nome", label: "Nome" },
  { key: "sexo", label: "Sexo" },
  { key: "parceiro", label: "Parceiro" },
  { key: "unidade", label: "Unidade" },
  { key: "areaAtuacao", label: "Área de Atuação" },
  { key: "telefone", label: "Telefone" },
  { key: "situacao", label: "Sit." },
  { key: "email", label: "E-mail" },
];

export default function AprendizesTurmaPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [curso, setCurso] = useState("");
  const [turma, setTurma] = useState("");
  const [aprendizes, setAprendizes] = useState<AprendizTurma[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pesquisado, setPesquisado] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    api.get("/alocacoes/filtros-ativos")
      .then(response => {
        setCursos(Array.isArray(response.data?.cursos) ? response.data.cursos : []);
        setTurmas(Array.isArray(response.data?.turmas) ? response.data.turmas : []);
      })
      .catch(() => toast.error("Erro ao carregar os cadastros de cursos e turmas."))
      .finally(() => setLoadingFiltros(false));
  }, []);

  const turmasDoCurso = useMemo(
    () => turmas.filter(item => item.TurCurso === curso),
    [curso, turmas],
  );

  const resultados = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase("pt-BR");
    const filtrados = termo
      ? aprendizes.filter(item => Object.values(item).some(value =>
          String(value ?? "").toLocaleLowerCase("pt-BR").includes(termo),
        ))
      : aprendizes;

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
  }, [aprendizes, search, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(resultados.length / pageSize));
  const paginaAtual = Math.min(page, totalPages);
  const resultadosPagina = resultados.slice((paginaAtual - 1) * pageSize, paginaAtual * pageSize);

  const handleCursoChange = (value: string) => {
    setCurso(value);
    setTurma("");
    setAprendizes([]);
    setPesquisado(false);
    setPage(1);
    setSearch("");
  };

  const handleTurmaChange = (value: string) => {
    setTurma(value);
    setAprendizes([]);
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
      const response = await api.get(`/alocacoes/aprendizes-por-turma/${turma}`);
      setAprendizes(Array.isArray(response.data) ? response.data : []);
      setPesquisado(true);
      setPage(1);
      setSearch("");
      setSortKey(null);
      setSortDirection(null);
    } catch {
      toast.error("Erro ao carregar aprendizes da turma.");
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

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortDirection) return <ArrowUpDown size={13} className="text-slate-400 dark:text-slate-500" />;
    return sortDirection === "asc"
      ? <ArrowUp size={13} className="text-[#133c86] dark:text-blue-300" />
      : <ArrowDown size={13} className="text-[#133c86] dark:text-blue-300" />;
  };

  const primeiroRegistro = resultados.length === 0 ? 0 : (paginaAtual - 1) * pageSize + 1;
  const ultimoRegistro = Math.min(paginaAtual * pageSize, resultados.length);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <main className="flex-1 overflow-auto bg-slate-100 p-6 dark:bg-[#07111f]">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[#133c86] dark:text-blue-300">Aprendizes por Turma</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consulte aprendizes com alocação ativa por curso e turma.
          </p>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b] dark:shadow-black/20">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700/80 dark:bg-[#13223a]">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Pesquisa de Aprendizes por Curso e Turma</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[minmax(240px,1fr)_minmax(240px,1fr)_auto] md:items-end">
            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-blue-200">
              Curso
              <select
                value={curso}
                onChange={event => handleCursoChange(event.target.value)}
                disabled={loadingFiltros}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case text-slate-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/15 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
              >
                <option value="">{loadingFiltros ? "Carregando..." : "Selecione"}</option>
                {cursos.map(item => (
                  <option key={item.CurCodigo} value={item.CurCodigo}>
                    {item.CurCodigo} - {item.CurDescricao}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-blue-200">
              Turma
              <select
                value={turma}
                onChange={event => handleTurmaChange(event.target.value)}
                disabled={!curso}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case text-slate-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/15 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
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
              className="flex items-center justify-center gap-2 rounded-lg bg-[#133c86] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e6b] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#244b7d] dark:hover:bg-[#2d5d98] dark:disabled:bg-slate-700"
            >
              <Search size={16} />
              {loading ? "Pesquisando..." : "Pesquisar"}
            </button>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#0d192b] dark:shadow-black/20">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/80 dark:bg-[#13223a]">
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

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200">
              Procurar:
              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                disabled={!pesquisado}
                placeholder="Buscar na lista"
                className="w-64 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/15 disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0a1627] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-800"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-sm">
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
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-blue-100">Relatórios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {loading ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">Carregando aprendizes...</td></tr>
                ) : !pesquisado ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">Selecione o curso e a turma para realizar a pesquisa.</td></tr>
                ) : resultadosPagina.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">Nenhum aprendiz com alocação ativa encontrado.</td></tr>
                ) : resultadosPagina.map(item => (
                  <tr key={item.codigo} className="bg-white transition-colors even:bg-slate-50/70 hover:bg-blue-50 dark:bg-[#0d192b] dark:even:bg-[#111f34] dark:hover:bg-[#182f4e]">
                    <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-blue-200">{item.codigo}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{item.nome}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.sexo}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.parceiro || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.unidade || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.areaAtuacao || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.telefone || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.situacao || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{item.email || "—"}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        title="Abrir cadastro do aprendiz"
                        onClick={() => router.push(`/aprendizes/cadaprendizes?id=${item.codigo}`)}
                        className="rounded-md p-2 text-[#133c86] transition-colors hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-400/15"
                      >
                        <FileText size={17} />
                      </button>
                    </td>
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
      </main>
    </div>
  );
}
