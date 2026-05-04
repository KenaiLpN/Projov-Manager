"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Pencil, MapPin, BookOpen, Star, Calendar, LayoutGrid, FileText } from "lucide-react";
import * as caAprendizService from "@/services/caAprendizService";
import { CA_Aprendiz } from "@/types";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/modal";
import api from "@/services/api";

interface InstituicaoParceira {
  IpaCodigo: number;
  IpaDescricao: string;
}
interface Turma {
  TurCodigo: number;
  TurNome: string;
}
interface GrauEscolaridade {
  GreCodigo: number;
  GreDescricao: string;
}
interface SituacaoParticipante {
  StaCodigo: number;
  StaDescricao: string;
}

type AdvancedFilter = typeof INITIAL_FILTER_STATE;
const INITIAL_FILTER_STATE = {
  Codigo: "",
  Nome: "",
  Empresa: "",
  Turma: "",
  Unidade: "",
  InstParceira: "",
  Sexo: "",
  Estudante: "",
  TurnoEscolar: "",
  Municipio: "",
  Bairro: "",
  IdadeDe: "",
  IdadeAte: "",
  Deficiencia: "",
  StatusAprendiz: "",
};

function AprendizesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";

  const [aprendizes, setAprendizes] = useState<(CA_Aprendiz & { unidadeNome?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilterForm, setAdvancedFilterForm] = useState<AdvancedFilter>(INITIAL_FILTER_STATE);
  const [activeAdvancedFilter, setActiveAdvancedFilter] = useState<AdvancedFilter | null>(null);

  const [empresas, setEmpresas] = useState<InstituicaoParceira[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [grausEscolaridade, setGrausEscolaridade] = useState<GrauEscolaridade[]>([]);
  const [situacoes, setSituacoes] = useState<SituacaoParticipante[]>([]);
  const [auxDataLoaded, setAuxDataLoaded] = useState(false);

  const loadAuxData = async () => {
    if (auxDataLoaded) return;
    try {
      const [resParceiros, resTurmas, resGraus, resSituacoes] = await Promise.all([
        api.get("/instituicoes-parceiras?limit=1000"),
        api.get("/turmas?limit=1000"),
        api.get("/grau-escolaridade?limit=1000"),
        api.get("/situacao-participante?limit=200"),
      ]);
      setEmpresas(Array.isArray(resParceiros.data?.data) ? resParceiros.data.data : []);
      setTurmas(Array.isArray(resTurmas.data?.data) ? resTurmas.data.data : []);
      setGrausEscolaridade(Array.isArray(resGraus.data?.data) ? resGraus.data.data : []);
      setSituacoes(Array.isArray(resSituacoes.data?.data) ? resSituacoes.data.data : []);
      setAuxDataLoaded(true);
    } catch (err) {
      console.error("Erro ao carregar dados do filtro", err);
    }
  };

  const fetchAprendizes = useCallback(async (
    p: number,
    s: string,
    f: string,
    adv: AdvancedFilter | null,
  ) => {
    setLoading(true);
    try {
      const result = await caAprendizService.getAll(
        p, 10, s, f, adv ? JSON.stringify(adv) : "",
      );
      setAprendizes(result.data as (CA_Aprendiz & { unidadeNome?: string | null })[]);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => fetchAprendizes(page, search, filter, activeAdvancedFilter),
      search ? 400 : 0,
    );
    return () => clearTimeout(timer);
  }, [page, search, filter, activeAdvancedFilter, fetchAprendizes]);

  const handleSearch = () => { setPage(1); fetchAprendizes(1, search, filter, activeAdvancedFilter); };
  const handleClearSearch = () => { setSearch(""); setPage(1); fetchAprendizes(1, "", filter, activeAdvancedFilter); };

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

  const setField = (key: keyof AdvancedFilter, value: string) =>
    setAdvancedFilterForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <main className="flex-1 flex flex-col p-6 overflow-auto bg-gray-100">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#133c86]">Cadastro de Aprendizes</h1>
            <p className="text-gray-500 mt-1">Gerencie os jovens aprendizes do programa</p>
          </div>
          <button
            onClick={() => router.push("/aprendizes/cadaprendizes")}
            className="px-6 py-3 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Novo Aprendiz
          </button>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex bg-[#bacce6] p-2 h-20 mb-6 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Buscar por nome, CPF ou e-mail..."
              inputWidth="w-96"
            />
            <button
              onClick={() => { setIsFilterModalOpen(true); loadAuxData(); }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Filter size={18} />
              Filtro
            </button>
          </div>
          {(filter || activeAdvancedFilter) && (
            <div className="mr-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#133c86] uppercase">Filtros Ativos:</span>
              {filter && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-2">
                  {({
                    active: "Alunos",
                    inscritos: "Inscritos",
                    habilitados: "Habilitados",
                    desligados: "Desligados",
                    aprendizagem: "Aprendizagem",
                    inscritosinternet: "Inscritos Internet",
                    aprovados: "Aprovados",
                    naohabilitados: "Não Habilitados",
                    "1": "Trabalhando",
                    "2": "Disponíveis",
                  } as Record<string, string>)[filter] ?? filter}
                  <button onClick={() => router.push("/aprendizes")} className="hover:text-blue-200 cursor-pointer">×</button>
                </span>
              )}
              {activeAdvancedFilter && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-2">
                  Filtro Avançado
                  <button onClick={handleClearAdvancedFilter} className="hover:text-blue-200 cursor-pointer">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Código", "Nome", "Telefone", "Sexo", "Situação", "E-mail", "Alocações", "Capacitações", "Avaliação", "Calendário", "Cal. Turma", "Emitir Cal.", "Ações"].map(h => (
                  <th key={h} className="px-3 py-3 font-bold text-gray-700 uppercase text-xs tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={13} className="p-10 text-center text-gray-400">Carregando dados...</td>
                </tr>
              ) : aprendizes.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-10 text-center text-gray-400">Nenhum aprendiz encontrado.</td>
                </tr>
              ) : (
                aprendizes.map((a) => {
                  const id = a.Apr_Codigo;
                  const row = a as any;
                  return (
                    <tr key={id} className="hover:bg-blue-50 transition-colors bg-white">
                      <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{id}</td>
                      <td className="px-3 py-2 text-gray-800 max-w-[180px]">
                        <span className="block truncate font-medium">{a.Apr_Nome}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {row.Apr_Telefone || a.Apr_Celular || "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {a.Apr_Sexo || "—"}
                      </td>
                      <td className="px-3 py-2 max-w-[160px]">
                        {row.situacaoDescricao ? (
                          <span className="block truncate text-xs text-gray-700">{row.situacaoDescricao}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600 max-w-[160px]">
                        <span className="block truncate text-xs">{a.Apr_Email || "Não Informado"}</span>
                      </td>

                      {/* Botões de ação iconográficos */}
                      <td className="px-3 py-2 text-center">
                        <button title="Alocações" onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}&tab=alocacoes`)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors">
                          <MapPin size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button title="Capacitações" onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}&tab=capacitacoes`)} className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors">
                          <BookOpen size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button title="Avaliação" onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}&tab=avaliacao`)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600 transition-colors">
                          <Star size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button title="Calendário" onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}&tab=calendario`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                          <Calendar size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button title="Calcular Calendário Turma" onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}&tab=calendario-turma`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                          <LayoutGrid size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button title="Emitir Calendário" onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}&tab=emitir-calendario`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                          <FileText size={15} />
                        </button>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/aprendizes/cadaprendizes?id=${id}`)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all font-semibold text-xs flex items-center gap-1"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex justify-between items-center text-gray-500 text-sm italic">
          <span>Mostrando página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Primeira página"
            >
              «
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Última página"
            >
              »
            </button>
          </div>
        </div>

        {/* Modal de filtro avançado */}
        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <h2 className="text-2xl font-bold text-[#133c86] mb-6 border-b pb-2">
            Filtro Avançado de Aprendizes
          </h2>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-l-4 border-[#133c86] pl-2">
                Dados Gerais e Demográficos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código</label>
                  <input
                    type="number"
                    value={advancedFilterForm.Codigo}
                    onChange={e => setField("Codigo", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                    placeholder="Nº do código"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={advancedFilterForm.Nome}
                    onChange={e => setField("Nome", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                    placeholder="Filtrar por nome"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sexo</label>
                  <select value={advancedFilterForm.Sexo} onChange={e => setField("Sexo", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="L">LGBTQIA+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estuda Atualmente</label>
                  <select value={advancedFilterForm.Estudante} onChange={e => setField("Estudante", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Turno Escolar</label>
                  <select value={advancedFilterForm.TurnoEscolar} onChange={e => setField("TurnoEscolar", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    <option value="M">Manhã</option>
                    <option value="T">Tarde</option>
                    <option value="N">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Deficiência</label>
                  <select value={advancedFilterForm.Deficiencia} onChange={e => setField("Deficiencia", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    <option value="sim">Com deficiência</option>
                    <option value="nao">Sem deficiência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Município</label>
                  <input type="text" value={advancedFilterForm.Municipio} onChange={e => setField("Municipio", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                    placeholder="Nome do município" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                  <input type="text" value={advancedFilterForm.Bairro} onChange={e => setField("Bairro", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm"
                    placeholder="Nome do bairro" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status do Aprendiz</label>
                  <select value={advancedFilterForm.StatusAprendiz} onChange={e => setField("StatusAprendiz", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    {situacoes.map(s => (
                      <option key={s.StaCodigo} value={s.StaCodigo}>{s.StaDescricao}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instituição Parceira (Empresa)</label>
                  <select value={advancedFilterForm.InstParceira} onChange={e => setField("InstParceira", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    {empresas.map(e => (
                      <option key={e.IpaCodigo} value={e.IpaCodigo}>{e.IpaDescricao}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Turma Capacitação</label>
                  <select value={advancedFilterForm.Turma} onChange={e => setField("Turma", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white text-sm">
                    <option value="">Selecione</option>
                    {turmas.map(t => (
                      <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Idade entre</label>
                    <input type="number" value={advancedFilterForm.IdadeDe} onChange={e => setField("IdadeDe", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm" placeholder="0" />
                  </div>
                  <span className="mb-2 text-gray-500">e</span>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">&nbsp;</label>
                    <input type="number" value={advancedFilterForm.IdadeAte} onChange={e => setField("IdadeAte", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none text-sm" placeholder="0" />
                  </div>
                </div>

              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <button type="button" onClick={handleClearAdvancedFilter}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 cursor-pointer">
              Limpar Filtros
            </button>
            <button type="button" onClick={handleApplyAdvancedFilter}
              className="px-8 py-2 bg-[#133c86] text-white rounded-lg font-bold hover:bg-[#0f2e6b] shadow-lg cursor-pointer">
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
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <AprendizesContent />
    </Suspense>
  );
}
