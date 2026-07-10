"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import * as caAprendizService from "@/services/caAprendizService";
import SearchBar from "@/components/SearchBar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import {
  AprendizesTable,
  type AprendizTableRow,
} from "@/components/tabelas/AprendizesTable";
import api from "@/services/api";
import { canDeleteAprendiz, getSessionUserRole } from "@/utils/roles";

interface InstituicaoParceira { IpaCodigo: number; IpaDescricao: string; }
interface Turma { TurCodigo: number; TurNome: string; }
interface SituacaoParticipante { StaCodigo: number; StaDescricao: string; }
interface Unidade { UniCodigo: number; UniNome: string; }
interface AreaAtuacao { AreaCodigo: number; AreaDescricao: string; }
interface Plano { PlanCodigo: number; PlanDescricao: string; }
interface Motivo { MotCodigo: number; MotDescricao: string; }
interface Escola { EscCodigo: number; EscNome: string; }

type AdvancedFilter = typeof INITIAL_FILTER_STATE;
const INITIAL_FILTER_STATE = {
  // Identificação
  Codigo: "", Nome: "", CPF: "", NomeSocial: "", CBO: "", NumSistExterno: "",
  NomeMae: "", NomePai: "",
  // Dados pessoais
  Sexo: "", EstadoCivil: "", Exercito: "",
  IdadeDe: "", IdadeAte: "",
  // Vínculo institucional
  Unidade: "", InstParceira: "", StatusAprendiz: "",
  Turma: "", TurmaCCI: "", TurmaENC: "",
  AreaAtuacao: "", PlanoCurricular: "",
  MotivoDesligamento: "",
  // Escolaridade
  Estudante: "", TurnoEscolar: "", Escolaridade: "",
  TipoAprendizagem: "", Escola: "", NomeEscola: "",
  // Contrato / datas
  TipoContrato: "",
  DataContratoDe: "", DataContratoAte: "",
  DataInicioEmpresaDe: "", DataInicioEmpresaAte: "",
  InicioAprendizagemDe: "", InicioAprendizagemAte: "",
  FimAprendizagemDe: "", FimAprendizagemAte: "",
  PrevFimAprendizagemDe: "", PrevFimAprendizagemAte: "",
  // Localização
  Municipio: "", Bairro: "",
  // Saúde / outros
  Deficiencia: "", Piercing: "", Tatuagem: "",
};

function AprendizesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";

  const [aprendizes, setAprendizes] = useState<AprendizTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AprendizTableRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilterForm, setAdvancedFilterForm] = useState<AdvancedFilter>(INITIAL_FILTER_STATE);
  const [activeAdvancedFilter, setActiveAdvancedFilter] = useState<AdvancedFilter | null>(null);

  const [empresas, setEmpresas] = useState<InstituicaoParceira[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [situacoes, setSituacoes] = useState<SituacaoParticipante[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [areasAtuacao, setAreasAtuacao] = useState<AreaAtuacao[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [auxDataLoaded, setAuxDataLoaded] = useState(false);
  const [isEducadorAccess, setIsEducadorAccess] = useState(false);

  useEffect(() => {
    const sessionRaw = localStorage.getItem("projov_user");
    if (!sessionRaw) return;
    try {
      const userObj = JSON.parse(sessionRaw);
      const role = getSessionUserRole(userObj);
      setUserRole(role);
      setIsEducadorAccess(role === "EDUCADOR");
    } catch {
      setUserRole("");
      setIsEducadorAccess(false);
    }
  }, []);

  const loadAuxData = async () => {
    if (auxDataLoaded) return;
    try {
      const [resIP, resTurmas, resSituacoes, resUnidades, resAreas, resPlanos, resMotivos, resEscolas] =
        await Promise.allSettled([
          api.get("/instituicoes-parceiras?limit=1000"),
          api.get("/turmas?limit=1000"),
          api.get("/situacao-participante?limit=200"),
          api.get("/unidade?limit=1000"),
          api.get("/areas?limit=1000"),
          api.get("/planos?limit=1000"),
          api.get("/motivo-desligamento?limit=1000"),
          api.get("/escolas"),
        ]);
      if (resIP.status === "fulfilled")        setEmpresas(resIP.value.data?.data ?? []);
      if (resTurmas.status === "fulfilled")    setTurmas(resTurmas.value.data?.data ?? []);
      if (resSituacoes.status === "fulfilled") setSituacoes(resSituacoes.value.data?.data ?? []);
      if (resUnidades.status === "fulfilled")  setUnidades(resUnidades.value.data?.data ?? []);
      if (resAreas.status === "fulfilled")     setAreasAtuacao(resAreas.value.data?.data ?? []);
      if (resPlanos.status === "fulfilled")    setPlanos(resPlanos.value.data?.data ?? []);
      if (resMotivos.status === "fulfilled")   setMotivos(resMotivos.value.data?.data ?? []);
      if (resEscolas.status === "fulfilled")   setEscolas(resEscolas.value.data?.data ?? []);
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
      setAprendizes(result.data as AprendizTableRow[]);
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

  const canEditAprendiz = !isEducadorAccess;
  const canRemoveAprendiz = canDeleteAprendiz(userRole);

  const handleOpenAprendiz = useCallback((id: number) => {
    router.push(`/aprendizes/cadaprendizes?id=${id}`);
  }, [router]);

  const handleOpenAprendizTab = useCallback((id: number, tab: string) => {
    router.push(`/aprendizes/cadaprendizes?id=${id}&tab=${tab}`);
  }, [router]);

  const handleRequestDelete = (aprendiz: AprendizTableRow) => {
    if (!canRemoveAprendiz) return;
    setItemToDelete(aprendiz);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.Apr_Codigo) return;
    setDeleting(true);
    try {
      await caAprendizService.remove(itemToDelete.Apr_Codigo);
      toast.success("Aprendiz excluido com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchAprendizes(page, search, filter, activeAdvancedFilter);
    } catch (err: unknown) {
      console.error("Erro ao excluir aprendiz:", err);
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Erro ao excluir aprendiz.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <main className="flex-1 flex flex-col p-6 overflow-auto bg-gray-100">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#133c86]">Cadastro de Aprendizes</h1>
            <p className="text-gray-500 mt-1">Gerencie os jovens aprendizes do programa</p>
          </div>
          {!isEducadorAccess && (
            <button
              onClick={() => router.push("/aprendizes/cadaprendizes")}
              className="px-6 py-3 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Novo Aprendiz
            </button>
          )}
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AprendizesTable
            aprendizes={aprendizes}
            loading={loading}
            canEdit={canEditAprendiz}
            canDelete={canRemoveAprendiz}
            isEducadorAccess={isEducadorAccess}
            onOpenTab={handleOpenAprendizTab}
            onEdit={handleOpenAprendiz}
            onDelete={handleRequestDelete}
          />
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

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusao"
          message={`Tem certeza que deseja excluir ${itemToDelete?.Apr_Nome || "este aprendiz"}? Esta acao nao pode ser desfeita.`}
          loading={deleting}
        />

        {/* Modal de filtro avançado */}
        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <h2 className="text-2xl font-bold text-[#133c86] mb-6 border-b pb-2">
            Filtro Avançado de Aprendizes
          </h2>

          <div className="space-y-6">

            {/* ── Identificação ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Identificação</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código</label>
                  <input type="number" value={advancedFilterForm.Codigo} onChange={e => setField("Codigo", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nº do código" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome</label>
                  <input type="text" value={advancedFilterForm.Nome} onChange={e => setField("Nome", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Filtrar por nome" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">CPF</label>
                  <input type="text" value={advancedFilterForm.CPF} onChange={e => setField("CPF", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="000.000.000-00" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome Social</label>
                  <input type="text" value={advancedFilterForm.NomeSocial} onChange={e => setField("NomeSocial", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nome social" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">CBO</label>
                  <input type="text" value={advancedFilterForm.CBO} onChange={e => setField("CBO", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="CBO" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nº Sistema Externo</label>
                  <input type="text" value={advancedFilterForm.NumSistExterno} onChange={e => setField("NumSistExterno", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nº externo" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Mãe</label>
                  <input type="text" value={advancedFilterForm.NomeMae} onChange={e => setField("NomeMae", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nome da mãe" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Pai</label>
                  <input type="text" value={advancedFilterForm.NomePai} onChange={e => setField("NomePai", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nome do pai" />
                </div>
              </div>
            </section>

            {/* ── Dados Pessoais ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Dados Pessoais</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sexo</label>
                  <select value={advancedFilterForm.Sexo} onChange={e => setField("Sexo", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estado Civil</label>
                  <select value={advancedFilterForm.EstadoCivil} onChange={e => setField("EstadoCivil", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="Solteiro">Solteiro(a)</option>
                    <option value="Casado">Casado(a)</option>
                    <option value="Divorciado">Divorciado(a)</option>
                    <option value="Viúvo">Viúvo(a)</option>
                    <option value="União Estável">União Estável</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alistamento Militar</label>
                  <select value={advancedFilterForm.Exercito} onChange={e => setField("Exercito", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="S">Sim</option>
                    <option value="N">Não</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Idade de</label>
                    <input type="number" value={advancedFilterForm.IdadeDe} onChange={e => setField("IdadeDe", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="0" />
                  </div>
                  <span className="mb-2 text-gray-400">até</span>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">&nbsp;</label>
                    <input type="number" value={advancedFilterForm.IdadeAte} onChange={e => setField("IdadeAte", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="0" />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Vínculo Institucional ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Vínculo Institucional</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unidade</label>
                  <select value={advancedFilterForm.Unidade} onChange={e => setField("Unidade", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todas</option>
                    {unidades.map(u => <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instituição Parceira</label>
                  <select value={advancedFilterForm.InstParceira} onChange={e => setField("InstParceira", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todas</option>
                    {empresas.map(e => <option key={e.IpaCodigo} value={e.IpaCodigo}>{e.IpaDescricao}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status do Jovem</label>
                  <select value={advancedFilterForm.StatusAprendiz} onChange={e => setField("StatusAprendiz", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    {situacoes.map(s => <option key={s.StaCodigo} value={s.StaCodigo}>{s.StaDescricao}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Turma Simultaneidade</label>
                  <select value={advancedFilterForm.Turma} onChange={e => setField("Turma", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todas</option>
                    {turmas.map(t => <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Área de Atuação</label>
                  <select value={advancedFilterForm.AreaAtuacao} onChange={e => setField("AreaAtuacao", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todas</option>
                    {areasAtuacao.map(a => <option key={a.AreaCodigo} value={a.AreaCodigo}>{a.AreaDescricao}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Plano Curricular</label>
                  <select value={advancedFilterForm.PlanoCurricular} onChange={e => setField("PlanoCurricular", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    {planos.map(p => <option key={p.PlanCodigo} value={p.PlanCodigo}>{p.PlanDescricao}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Motivo de Desligamento</label>
                  <select value={advancedFilterForm.MotivoDesligamento} onChange={e => setField("MotivoDesligamento", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    {motivos.map(m => <option key={m.MotCodigo} value={m.MotCodigo}>{m.MotDescricao}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* ── Escolaridade ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Escolaridade</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">É Estudante?</label>
                  <select value={advancedFilterForm.Estudante} onChange={e => setField("Estudante", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Turno Escolar</label>
                  <select value={advancedFilterForm.TurnoEscolar} onChange={e => setField("TurnoEscolar", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Escolaridade</label>
                  <select value={advancedFilterForm.Escolaridade} onChange={e => setField("Escolaridade", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todas</option>
                    <option value="1">Fund. Incompleto</option>
                    <option value="2">Fund. Completo</option>
                    <option value="3">Médio Incompleto</option>
                    <option value="4">Médio Completo</option>
                    <option value="5">Superior Incompleto</option>
                    <option value="6">Superior Completo</option>
                    <option value="7">Pós-Graduação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Aprendizagem</label>
                  <select value={advancedFilterForm.TipoAprendizagem} onChange={e => setField("TipoAprendizagem", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="Escola Municipal">Escola Municipal</option>
                    <option value="Escola Estadual">Escola Estadual</option>
                    <option value="Escola Particular">Escola Particular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Escola</label>
                  <select value={advancedFilterForm.Escola} onChange={e => setField("Escola", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todas</option>
                    {escolas.map(e => <option key={e.EscCodigo} value={e.EscCodigo}>{e.EscNome}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Escola</label>
                  <input type="text" value={advancedFilterForm.NomeEscola} onChange={e => setField("NomeEscola", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nome da escola" />
                </div>
              </div>
            </section>

            {/* ── Contrato e Datas ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Contrato e Datas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Pagamento</label>
                  <select value={advancedFilterForm.TipoContrato} onChange={e => setField("TipoContrato", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="C">Projov</option>
                    <option value="E">Empresa</option>
                  </select>
                </div>
                {([
                  ["DataContratoDe",       "DataContratoAte",       "Data do Contrato"],
                  ["DataInicioEmpresaDe",  "DataInicioEmpresaAte",  "Início na Empresa"],
                  ["InicioAprendizagemDe", "InicioAprendizagemAte", "Início Aprendizagem"],
                  ["FimAprendizagemDe",    "FimAprendizagemAte",    "Fim Aprendizagem"],
                  ["PrevFimAprendizagemDe","PrevFimAprendizagemAte","Prev. Término"],
                ] as [keyof AdvancedFilter, keyof AdvancedFilter, string][]).map(([de, ate, label]) => (
                  <div key={de} className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                    <div className="flex gap-2">
                      <input type="date" value={advancedFilterForm[de]} onChange={e => setField(de, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" />
                      <span className="self-center text-gray-400 text-xs">até</span>
                      <input type="date" value={advancedFilterForm[ate]} onChange={e => setField(ate, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Localização ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Localização</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Município</label>
                  <input type="text" value={advancedFilterForm.Municipio} onChange={e => setField("Municipio", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nome do município" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                  <input type="text" value={advancedFilterForm.Bairro} onChange={e => setField("Bairro", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none" placeholder="Nome do bairro" />
                </div>
              </div>
            </section>

            {/* ── Saúde e Outros ── */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-l-4 border-[#133c86] pl-2">Saúde e Outros</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Deficiência</label>
                  <select value={advancedFilterForm.Deficiencia} onChange={e => setField("Deficiencia", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="sim">Com deficiência</option>
                    <option value="nao">Sem deficiência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Piercing</label>
                  <select value={advancedFilterForm.Piercing} onChange={e => setField("Piercing", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tatuagem</label>
                  <select value={advancedFilterForm.Tatuagem} onChange={e => setField("Tatuagem", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#133c86] focus:outline-none bg-white">
                    <option value="">Todos</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
              </div>
            </section>

          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
