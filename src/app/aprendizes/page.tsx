"use client";
import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AprendizSidebar } from "@/components/aprendizsidebar";
import { Filter, X } from "lucide-react";
import api from "@/services/api";
interface AprendizFormData {
  NomeJovem: string;
  NomeSocial?: string;
  CPF?: string;
  RG?: string;
  IdUnidade?: number;
  IdInstituicaoParceira?: number;
  IdEscola?: number;
  IdMonitorResponsavel?: number;
  DataNascimento?: string;
  Sexo?: string;
  Email?: string;
  Celular?: string;
  CEP?: string;
  Logradouro?: string;
  Numero?: string;
  Bairro?: string;
  Municipio?: string;
  UF_Endereco?: string;
  StatusJovem?: string;
}
function AprendizesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const [aprendizes, setAprendizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilterForm, setAdvancedFilterForm] = useState({
    Nome: "",
    Empresa: "",
    Instituicao: "",
    DataAniversario: "",
    Curso: "",
    Status: "",
    Ocorrencias: "",
    Situacao: ""
  });
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [auxDataLoaded, setAuxDataLoaded] = useState(false);
  const [activeAdvancedFilter, setActiveAdvancedFilter] = useState<any>(null);
  const loadAuxData = async () => {
    if (auxDataLoaded) return;
    try {
      const [resParceiros, resEscolas, resCursos] = await Promise.all([
        api.get("/instituicoes-parceiras?limit=1000"),
        api.get("/instituicao?limit=1000"),
        api.get("/cursos?limit=1000"),
      ]);
      setEmpresas(resParceiros.data?.data || []);
      setEscolas(resEscolas.data?.data || []);
      setCursos(resCursos.data?.data || []);
      setAuxDataLoaded(true);
    } catch (err) {
      console.error("Erro ao carregar dados do filtro", err);
    }
  };
  useEffect(() => {
    fetchAprendizes(page, search, filter, activeAdvancedFilter);
  }, [page, filter, activeAdvancedFilter]);
  const fetchAprendizes = async (
    p: number,
    s: string = search,
    f: string = filter,
    adv: any = activeAdvancedFilter
  ) => {
    setLoading(true);
    try {
      let url = `/aprendiz?page=${p}&limit=10`;
      if (s) url += `&search=${s}`;
      if (f) url += `&filter=${f}`;
      if (adv) url += `&advancedFilter=${encodeURIComponent(JSON.stringify(adv))}`;
      const response = await api.get(url);
      setAprendizes(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    setPage(1);
    fetchAprendizes(1, search, filter, activeAdvancedFilter);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
    setAdvancedFilterForm({
      Nome: "",
      Empresa: "",
      Instituicao: "",
      DataAniversario: "",
      Curso: "",
      Status: "",
      Ocorrencias: "",
      Situacao: ""
    });
    setActiveAdvancedFilter(null);
    setIsFilterModalOpen(false);
    setPage(1);
  };
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AprendizSidebar />
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
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-96 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#133c86] text-white font-semibold rounded hover:bg-[#0f2e6b] transition-colors cursor-pointer"
            >
              Pesquisar
            </button>
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
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Carregando dados...
                  </td>
                </tr>
              ) : aprendizes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
        {}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm backdrop-saturate-150">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-[#133c86] mb-6 border-b pb-2">
                Filtro de Pesquisa
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={advancedFilterForm.Nome}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Nome: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none"
                    placeholder="Digite o nome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data de aniversário</label>
                  <input
                    type="date"
                    value={advancedFilterForm.DataAniversario}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, DataAniversario: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Empresa</label>
                  <select
                    value={advancedFilterForm.Empresa}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Empresa: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white"
                  >
                    <option value="">Todas</option>
                    {empresas.map((emp) => (
                      <option key={emp.IpaCodigo} value={emp.IpaCodigo}>{emp.IpaDescricao}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Instituição de ensino</label>
                  <select
                    value={advancedFilterForm.Instituicao}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Instituicao: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white"
                  >
                    <option value="">Todas</option>
                    {escolas.map((esc) => (
                      <option key={esc.EscCodigo} value={esc.EscCodigo}>{esc.EscNome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Curso</label>
                  <select
                    value={advancedFilterForm.Curso}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Curso: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white"
                  >
                    <option value="">Todos</option>
                    {cursos.map((cur) => (
                      <option key={cur.CurCodigo} value={cur.CurCodigo}>{cur.CurDescricao}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status do Jovem</label>
                  <select
                    value={advancedFilterForm.Status}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white"
                  >
                    <option value="">Todos</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Férias">Férias</option>
                    <option value="Afastado">Afastado</option>
                    <option value="Licença Maternidade">Licença Maternidade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ocorrências</label>
                  <select
                    value={advancedFilterForm.Ocorrencias}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Ocorrencias: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white"
                  >
                    <option value="">Todas</option>
                    <option value="com">Com Ocorrência</option>
                    <option value="sem">Sem Ocorrência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Situação de Atividade</label>
                  <select
                    value={advancedFilterForm.Situacao}
                    onChange={(e) => setAdvancedFilterForm({...advancedFilterForm, Situacao: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white"
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativos</option>
                    <option value="desativado">Desativados</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={handleClearAdvancedFilter}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 flex-1 cursor-pointer"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={handleApplyAdvancedFilter}
                  className="px-6 py-2 bg-[#133c86] text-white rounded-lg font-bold hover:bg-[#0f2e6b] shadow flex-1 cursor-pointer"
                >
                  Aplicar Filtro
                </button>
              </div>
            </div>
          </div>
        )}
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
