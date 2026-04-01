"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import api from "@/services/api";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/modal";

// --- Tipos de domínio ---
interface Unidade {
  UniCodigo: number;
  UniNome: string | null;
}
interface Aprendiz {
  IdAluno: number;
  NomeJovem: string;
  NomeSocial?: string | null;
  CPF?: string | null;
  StatusJovem?: string | null;
  Gestante?: boolean | null;
  unidade?: Unidade | null;
}
interface InstituicaoParceira {
  IpaCodigo: number;
  IpaDescricao: string;
}
interface Escola {
  id: number;
  nome: string;
}
interface Curso {
  IdCurso: number;
  CurNome: string;
}
interface Turma {
  IdTurma: number;
  TurNome: string;
}
interface GrauEscolaridade {
  id: number;
  GrauDescricao: string;
}
type AdvancedFilter = typeof INITIAL_FILTER_STATE;

const INITIAL_FILTER_STATE = {
  Nome: "",
  Empresa: "",
  Instituicao: "",
  DataAniversario: "",
  Curso: "",
  Status: "",
  Ocorrencias: "",
  Situacao: "",
  EstudaAtualmente: "",
  Sexo: "",
  Turno: "",
  AlistamentoMilitar: "",
  Escolaridade: "",
  Municipio: "",
  Bairro: "",
  TurmaCapacitacao: "",
  IdadeDe: "",
  IdadeAte: "",
  Deficiente: "",
  SistemasOperacionais: "",
  Excel: "",
  Outlook: "",
  Word: "",
  PowerPoint: "",
  Comunicacao: "",
  Linguagem: "",
  Diccao: "",
  Escrita: "",
  Matematica: "",
  RaciocinioLogico: "",
  Idiomas: "",
  Sescon: "",
  Estilo: "",
  Interesse: "",
  Organizacao: "",
  Atencao: "",
  Colaborador: "",
  Extroversao: "",
  Comprometimento: "",
  Proatividade: "",
  Criatividade: "",
  Relacionamento: "",
  TrabalhoEquipe: "",
  Lideranca: "",
  Aproveitamento: "",
  Piercing: "",
  Tatuagem: "",
};

function AprendizesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const [aprendizes, setAprendizes] = useState<Aprendiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilterForm, setAdvancedFilterForm] = useState<AdvancedFilter>(INITIAL_FILTER_STATE);
  const [empresas, setEmpresas] = useState<InstituicaoParceira[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [grausEscolaridade, setGrausEscolaridade] = useState<GrauEscolaridade[]>([]);
  const [auxDataLoaded, setAuxDataLoaded] = useState(false);
  const [activeAdvancedFilter, setActiveAdvancedFilter] = useState<AdvancedFilter | null>(null);
  const loadAuxData = async () => {
    if (auxDataLoaded) return;
    try {
      const [resParceiros, resEscolas, resCursos, resTurmas, resGraus] = await Promise.all([
        api.get("/instituicoes-parceiras?limit=1000"),
        api.get("/instituicao?limit=1000"),
        api.get("/cursos?limit=1000"),
        api.get("/turmas?limit=1000"),
        api.get("/grau-escolaridade?limit=1000"),
      ]);
      setEmpresas(resParceiros.data?.data || []);
      setEscolas(resEscolas.data?.data || []);
      setCursos(resCursos.data?.data || []);
      setTurmas(resTurmas.data?.data || []);
      setGrausEscolaridade(resGraus.data?.data || []);
      setAuxDataLoaded(true);
    } catch (err) {
      console.error("Erro ao carregar dados do filtro", err);
    }
  };
  const fetchAprendizes = useCallback(async (
    p: number,
    s: string,
    f: string,
    adv: AdvancedFilter | null
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (s) params.set("search", s);
      if (f) params.set("filter", f);
      if (adv) params.set("advancedFilter", JSON.stringify(adv));
      const response = await api.get(`/aprendiz?${params.toString()}`);
      setAprendizes(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reativo: reage a mudanças de page, filter, activeAdvancedFilter e search (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAprendizes(page, search, filter, activeAdvancedFilter);
    }, search ? 400 : 0); // debounce apenas quando está digitando
    return () => clearTimeout(timer);
  }, [page, search, filter, activeAdvancedFilter, fetchAprendizes]);

  const handleSearch = () => {
    setPage(1);
    fetchAprendizes(1, search, filter, activeAdvancedFilter);
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchAprendizes(1, "", filter, activeAdvancedFilter);
  };
  const handleApplyAdvancedFilter = () => {
    setActiveAdvancedFilter({ ...advancedFilterForm });
    setIsFilterModalOpen(false);
    setPage(1);
  };
  const handleClearAdvancedFilter = () => {
    setAdvancedFilterForm(INITIAL_FILTER_STATE);
    setActiveAdvancedFilter(null);
    setIsFilterModalOpen(false);
    setPage(1);
  };
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <main className="flex-1 flex flex-col p-6 overflow-auto bg-gray-100">
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#133c86]">
              Cadastro de Aprendizes
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie os jovens aprendizes do programa
            </p>
          </div>
          <button
            onClick={() => router.push("/aprendizes/cadaprendizes")}
            className="px-6 py-3 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Novo Aprendiz
          </button>
        </div>
        {}
        <div className="flex bg-[#bacce6] p-2 h-20 mb-6 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Buscar por nome, CPF ou email..."
              inputWidth="w-96"
            />
            <button
              onClick={() => {
                setIsFilterModalOpen(true);
                loadAuxData();
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Filter size={18} />
              Filtro
            </button>
          </div>
          {(filter || activeAdvancedFilter) && (
            <div className="mr-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#133c86] uppercase">
                Filtros Ativos:
              </span>
              {filter && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-2">
                  {filter === "working"
                    ? "Trabalhando"
                    : filter === "available"
                      ? "Disponíveis"
                      : "Férias/Licença"}
                  <button
                    onClick={() => router.push("/aprendizes")}
                    className="hover:text-blue-200 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeAdvancedFilter && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-2">
                  Filtro Avançado
                  <button
                    onClick={handleClearAdvancedFilter}
                    className="hover:text-blue-200 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
        {}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Nome
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  CPF
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Unidade
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Calendário
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    Carregando dados...
                  </td>
                </tr>
              ) : aprendizes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    Nenhum aprendiz encontrado.
                  </td>
                </tr>
              ) : (
                aprendizes.map((a) => {
                  let rowBg = "hover:bg-blue-50 transition-colors bg-white";
                  if (a.StatusJovem === "Férias") {
                    rowBg = "hover:bg-green-100 transition-colors bg-green-50/50";
                  } else if (a.StatusJovem === "Licença Maternidade") {
                    rowBg = "hover:bg-pink-100 transition-colors bg-pink-50/50";
                  } else if (a.Gestante) {
                    rowBg = "hover:bg-pink-50 transition-colors bg-pink-400/30";
                  }
                  return (
                    <tr
                      key={a.IdAluno}
                      className={rowBg}
                    >
                    <td className="p-4 font-medium text-gray-800">
                      {a.NomeJovem}
                    </td>
                    <td className="p-4 text-gray-600">
                      {a.CPF || "Não informado"}
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm underline decoration-blue-200">
                        {a.unidade?.UniNome || "Não vinculada"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          a.StatusJovem === "Ativo"
                            ? "bg-green-100 text-green-700"
                            : a.StatusJovem === "Inativo"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.StatusJovem}
                      </span>
                    </td>
                    <td className=" text-gray-600">
                      <button
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm"
                        onClick={() =>
                          router.push(`/aprendizes/cadaprendizes?id=${a.IdAluno}&tab=calendario`)
                        }
                      >
                        Calendário
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          router.push(
                            `/aprendizes/cadaprendizes?id=${a.IdAluno}`,
                          )
                        }
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {}
        <div className="mt-4 flex justify-between items-center text-gray-500 text-sm italic">
          <span>
            Mostrando página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Página anterior"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              aria-label="Próxima página"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
        {}
        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <h2 className="text-2xl font-bold text-[#133c86] mb-6 border-b pb-2">
            Filtro Avançado de Aprendizes
          </h2>

              <div className="space-y-8">
                {/* Seção 1: Geral e Demográficos */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-l-4 border-[#133c86] pl-2">
                    Dados Gerais e Demográficos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Status do Jovem</label>
                      <select
                        value={advancedFilterForm.Status}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Status: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Férias">Férias</option>
                        <option value="Afastado">Afastado</option>
                        <option value="Licença Maternidade">Licença Maternidade</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Estuda Atualmente</label>
                      <select
                        value={advancedFilterForm.EstudaAtualmente}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, EstudaAtualmente: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Sexo</label>
                      <select
                        value={advancedFilterForm.Sexo}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Sexo: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Turno</label>
                      <select
                        value={advancedFilterForm.Turno}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Turno: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="Manhã">Manhã</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noite">Noite</option>
                        <option value="Integral">Integral</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Alistamento Militar</label>
                      <select
                        value={advancedFilterForm.AlistamentoMilitar}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, AlistamentoMilitar: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                        <option value="Dispensado">Dispensado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Escolaridade</label>
                      <select
                        value={advancedFilterForm.Escolaridade}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Escolaridade: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        {grausEscolaridade.map(g => (
                          <option key={g.id} value={g.GrauDescricao}>{g.GrauDescricao}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Município</label>
                      <input
                        type="text"
                        value={advancedFilterForm.Municipio}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Municipio: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                        placeholder="Nome do município"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={advancedFilterForm.Bairro}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Bairro: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                        placeholder="Nome do bairro"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Turma Capacitação</label>
                      <select
                        value={advancedFilterForm.TurmaCapacitacao}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, TurmaCapacitacao: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        {turmas.map(t => (
                          <option key={t.IdTurma} value={t.IdTurma}>{t.TurNome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Idade Entre</label>
                        <input
                          type="number"
                          value={advancedFilterForm.IdadeDe}
                          onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, IdadeDe: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                          placeholder="0"
                        />
                      </div>
                      <span className="mb-2">a</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={advancedFilterForm.IdadeAte}
                          onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, IdadeAte: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Deficiente</label>
                      <select
                        value={advancedFilterForm.Deficiente}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Deficiente: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={advancedFilterForm.Nome}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Nome: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                        placeholder="Filtrar por nome"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Instituição Parceira</label>
                      <select
                        value={advancedFilterForm.Empresa}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Empresa: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Selecione</option>
                        {empresas.map((emp) => (
                          <option key={emp.IpaCodigo} value={emp.IpaCodigo}>{emp.IpaDescricao}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ocorrências</label>
                      <select
                        value={advancedFilterForm.Ocorrencias}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Ocorrencias: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Todas</option>
                        <option value="com">Com Ocorrência</option>
                        <option value="sem">Sem Ocorrência</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Situação de Atividade</label>
                      <select
                        value={advancedFilterForm.Situacao}
                        onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Situacao: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="ativo">Ativos</option>
                        <option value="desativado">Desativados</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Seção 2: Avaliação de Informática */}
                <section className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-[#133c86] uppercase tracking-wider mb-4 border-l-4 border-[#133c86] pl-2">
                    Avaliação de Informática
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[
                      { id: "SistemasOperacionais", label: "Sistema Operacional" },
                      { id: "Excel", label: "Excel" },
                      { id: "Outlook", label: "Outlook" },
                      { id: "Word", label: "Word" },
                      { id: "PowerPoint", label: "PowerPoint" },
                      { id: "Comunicacao", label: "Comunicação" },
                      { id: "Linguagem", label: "Linguagem" },
                      { id: "Diccao", label: "Dicção" },
                      { id: "Escrita", label: "Escrita" },
                      { id: "Matematica", label: "Matemática" },
                      { id: "RaciocinioLogico", label: "Raciocínio Lógico" },
                      { id: "Idiomas", label: "Idiomas" },
                      { id: "Sescon", label: "SESCON" }
                    ].map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                        <select
                          value={(advancedFilterForm as any)[field.id]}
                          onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, [field.id]: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-xs"
                        >
                          <option value="">Selecione</option>
                          <option value="P">Péssimo</option>
                          <option value="R">Regular</option>
                          <option value="B">Bom</option>
                          <option value="O">Ótimo</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Seção 3: Competências Comportamentais */}
                <section className="bg-blue-50/30 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-l-4 border-blue-600 pl-2">
                    Competências Comportamentais
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { id: "Estilo", label: "Estilo" },
                      { id: "Interesse", label: "Interesse" },
                      { id: "Organizacao", label: "Organização" },
                      { id: "Atencao", label: "Atenção/Conc." },
                      { id: "Colaborador", label: "Colaborador" },
                      { id: "Extroversao", label: "Extroversão" },
                      { id: "Comprometimento", label: "Comprometimento" },
                      { id: "Proatividade", label: "Proatividade" },
                      { id: "Criatividade", label: "Criatividade" },
                      { id: "Relacionamento", label: "Rel. Interpessoal" },
                      { id: "TrabalhoEquipe", label: "Trab. em Equipe" },
                      { id: "Lideranca", label: "Liderança" },
                      { id: "Aproveitamento", label: "Aproveitamento" },
                      { id: "Piercing", label: "Piercing?" },
                      { id: "Tatuagem", label: "Tatuagem?" }
                    ].map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                        <select
                          value={(advancedFilterForm as any)[field.id]}
                          onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, [field.id]: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-xs"
                        >
                          <option value="">Selecione</option>
                          {field.id === "Piercing" || field.id === "Tatuagem" ? (
                            <>
                              <option value="S">Sim</option>
                              <option value="N">Não</option>
                            </>
                          ) : (
                            <>
                              <option value="P">Péssimo</option>
                              <option value="R">Regular</option>
                              <option value="B">Bom</option>
                              <option value="O">Ótimo</option>
                            </>
                          )}
                        </select>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClearAdvancedFilter}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Limpar Filtros
                </button>
                <button
                  type="button"
                  onClick={handleApplyAdvancedFilter}
                  className="px-8 py-2 bg-[#133c86] text-white rounded-lg font-bold hover:bg-[#0f2e6b] shadow-lg cursor-pointer"
                >
                  Pesquisar
                </button>
              </div>
            </Modal>
      </main>
    </div>
  );
}
export default function Aprendizes() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Carregando...
        </div>
      }
    >
      <AprendizesContent />
    </Suspense>
  );
}
