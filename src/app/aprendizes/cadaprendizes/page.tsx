"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AprendizSidebar } from "@/components/aprendizsidebar";
import { DadosPessoaisForm } from "@/components/forms/aprendiz/DadosPessoaisForm";
import { VinculoContratoForm } from "@/components/forms/aprendiz/VinculoContratoForm";
import { EscolaridadeTurmasForm } from "@/components/forms/aprendiz/EscolaridadeTurmasForm";
import { DocumentacaoForm } from "@/components/forms/aprendiz/DocumentacaoForm";
import { EnderecoContatoForm } from "@/components/forms/aprendiz/EnderecoContatoForm";
import { SaudeDeficienciaForm } from "@/components/forms/aprendiz/SaudeDeficienciaForm";
import { CalendarioForm } from "@/components/forms/aprendiz/CalendarioForm";
import { AprendizFormData } from "@/components/forms/aprendiz/types";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  MapPin,
  HeartPulse,
  CalendarDays,
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const [unidades, setUnidades] = useState<any[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [orientadores, setOrientadores] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  const [formData, setFormData] = useState<AprendizFormData>({
    NomeJovem: "",
    NomeSocial: "",
    CodigoExterno: "",
    IdUnidade: undefined,
    IdInstituicaoParceira: undefined,
    IdEscola: undefined,
    IdMonitorResponsavel: undefined,
    IdTurmaCapacitacao: undefined,
    StatusJovem: "Ativo",
    EstudaAtualmente: "Sim",
    Sexo: "",
    EstadoCivil: "",
    Nacionalidade: "",
    Naturalidade: "",
    UF_Naturalidade: "",
    AlistamentoMilitar: "",
    EscolaridadeNivel: "",
    TipoAprendizagem: "",
    TurnoEscolar: "",
    TipoPagamento: "",
    CBO: "",
    AreaAtuacao: "",
    HorasDiarias: undefined,
    MesesContrato: undefined,
    DataNascimento: "",
    DataInicioEmpresa: "",
    DataInicioAprendizagem: "",
    DataPrevistaTermino: "",
    DataDesligamento: "",
    DataInicioFerias: "",
    DataTerminoFerias: "",
    TurmaSimultaneidade: "",
    TurmaCCI: "",
    RG: "",
    RG_DataEmissao: "",
    RG_OrgaoExpedidor: "",
    RG_UF: "",
    CPF: "",
    PIS: "",
    CTPS_Numero: "",
    CTPS_Serie: "",
    Reservista: "",
    TituloEleitor: "",
    TituloSecao: "",
    TituloZona: "",
    CEP: "",
    Logradouro: "",
    Numero: "",
    Complemento: "",
    Bairro: "",
    Municipio: "",
    UF_Endereco: "",
    TelefoneFixo: "",
    Celular: "",
    Email: "",
    OutrosTelefones: "",
    UsaMedicamentos: false,
    MedicamentosQual: "",
    MedicamentosFinalidade: "",
    TemAlergia: false,
    AlergiaQual: "",
    TemProblemaSaude: false,
    ProblemaSaudeQual: "",
    Deficiencia: "",
    Senha: "",
    // Calendário
    CalCurso: "",
    CalJornadaDiaria: "",
    CalDiasAprendizagemTeorica: "",
    CalDiasAprendizagemPratica: "",
    CalDataAdmissao: "",
    CalDataTerminoIntrodutorios: "",
    CalUnidadeIntrodutorio: undefined,
    CalDiaEncontroSemanal: "",
    CalDataInicioEncontroSemanal: "",
    CalDiaEncontroMensal: "",
    CalSemanaEncontroMensal: "",
    CalFolga: "",
    CalUnidadeFeriadoTeoria: undefined,
    CalUnidadeFeriadoPratica: undefined,
    CalEmpresa: undefined,
    CalPeriodoFeriasDe: "",
    CalPeriodoFeriasAte: "",
    CalPeriodoFerias2De: "",
    CalPeriodoFerias2Ate: "",
    CalPeriodoSuspensaoDe: "",
    CalPeriodoSuspensaoAte: "",
  });

  const tabs = [
    { id: "jovem", label: "Jovem", icon: <User size={18} /> },
    { id: "trabalho", label: "Trabalho", icon: <Briefcase size={18} /> },
    {
      id: "escolaridade",
      label: "Escolaridade",
      icon: <GraduationCap size={18} />,
    },
    { id: "documentacao", label: "Documentação", icon: <FileText size={18} /> },
    { id: "endereco", label: "Endereço", icon: <MapPin size={18} /> },
    { id: "saude", label: "Saúde", icon: <HeartPulse size={18} /> },
    { id: "calendario", label: "Calendário", icon: <CalendarDays size={18} /> },
  ];

  const [activeTab, setActiveTab] = useState("jovem");

  useEffect(() => {
    const userStr = localStorage.getItem("projov_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.UsuTipo === "APRENDIZ") {
        setIsAdmin(false);
      }
    }
    loadSelectData();
    if (editingId) {
      fetchAprendiz(editingId);
    }
  }, [editingId]);

  const loadSelectData = async () => {
    try {
      const [resUnidades, resParceiros, resEscolas, resUsuarios, resCursos] =
        await Promise.all([
          api.get("/unidade?limit=1000"),
          api.get("/instituicoes-parceiras?limit=1000"),
          api.get("/instituicao?limit=1000"),
          api.get("/users?limit=1000"),
          api.get("/cursos?limit=1000"),
        ]);
      setUnidades(resUnidades.data.data || []);
      setInstituicoes(resParceiros.data.data || []);
      setEscolas(resEscolas.data.data || []);
      setOrientadores(resUsuarios.data.data || []);
      setCursos(resCursos.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados auxiliares", err);
    }
  };

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const fetchAprendiz = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/aprendiz/${id}`);
      const data = response.data;

      const formattedData = { ...data };

      // Garantir que nenhum campo de texto seja null/undefined para o React
      Object.keys(formattedData).forEach((key) => {
        const val = formattedData[key];
        const isBooleanField =
          key === "UsaMedicamentos" ||
          key === "TemAlergia" ||
          key === "TemProblemaSaude";

        if (val === null || val === undefined) {
          if (isBooleanField) {
            formattedData[key] = false;
          } else if (
            key.startsWith("Id") ||
            typeof (formData as any)[key] === "number"
          ) {
            // Mantém undefined para Ids
          } else {
            formattedData[key] = "";
          }
        } else if (isBooleanField) {
          formattedData[key] = Boolean(val);
        }
      });

      // Formatar todas as datas para input date (YYYY-MM-DD)
      const dateFields = [
        "DataNascimento",
        "DataInicioEmpresa",
        "DataInicioAprendizagem",
        "DataPrevistaTermino",
        "DataDesligamento",
        "DataInicioFerias",
        "DataTerminoFerias",
        "RG_DataEmissao",
        "CalDataAdmissao",
        "CalDataTerminoIntrodutorios",
        "CalDataInicioEncontroSemanal",
        "CalPeriodoFeriasDe",
        "CalPeriodoFeriasAte",
        "CalPeriodoFerias2De",
        "CalPeriodoFerias2Ate",
        "CalPeriodoSuspensaoDe",
        "CalPeriodoSuspensaoAte",
      ];

      dateFields.forEach((field) => {
        if (formattedData[field]) {
          formattedData[field] = new Date(formattedData[field])
            .toISOString()
            .split("T")[0];
        } else {
          formattedData[field] = "";
        }
      });

      setFormData(formattedData);
    } catch (err) {
      console.error("Erro ao buscar aprendiz", err);
      toast.error("Erro ao carregar dados do aprendiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name.startsWith("Id") ||
        name === "HorasDiarias" ||
        name === "MesesContrato"
          ? value
            ? Number(value)
            : undefined
          : value || "", // Garante string vazia em vez de undefined
    }));
  };

  const handleSave = async () => {
    if (!formData.NomeJovem) {
      toast.error("O nome completo é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      // Limpar dados antes de enviar: remove campos do calendário que não existem no banco
      const dataToSend: any = {};
      Object.keys(formData).forEach((key) => {
        if (!key.startsWith("Cal") && key !== "IdAluno") {
          dataToSend[key] = (formData as any)[key];
        }
      });

      if (editingId) {
        await api.put(`/aprendiz/${editingId}`, dataToSend);
        toast.success("Aprendiz atualizado com sucesso!");
      } else {
        await api.post("/aprendiz", dataToSend);
        toast.success("Aprendiz cadastrado com sucesso!");
      }
      if (isAdmin) {
        router.push("/aprendizes");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao salvar aprendiz.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const buscaCEP = async (CEP: string) => {
    const cepLimpo = CEP.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            Logradouro: data.logradouro || "",
            Bairro: data.bairro || "",
            Municipio: data.localidade || "",
            UF_Endereco: data.uf || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      {isAdmin && <AprendizSidebar />}

      <main className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
                >
                  <ArrowLeft size={36} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#133c86]">
                  {editingId
                    ? "Formulário de Edição"
                    : "Formulário de Cadastro"}
                </h1>
                <p className="text-sm text-gray-500">
                  {formData.NomeJovem ||
                    (editingId ? "Carregando..." : "Novo Jovem Aprendiz")}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {isAdmin && (
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-[#133c86] text-white rounded-lg font-bold hover:bg-[#0f2e6b] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Processando..."
                ) : (
                  <>
                    <Save size={18} />
                    {editingId ? "Atualizar" : "Salvar Cadastro"}
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-1 flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#133c86] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#133c86]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full pb-20">
            {activeTab === "jovem" && (
              <DadosPessoaisForm
                formData={formData}
                handleChange={handleChange}
              />
            )}
            {activeTab === "trabalho" && (
              <VinculoContratoForm
                formData={formData}
                handleChange={handleChange}
                unidades={unidades}
                instituicoes={instituicoes}
                orientadores={orientadores}
              />
            )}
            {activeTab === "escolaridade" && (
              <EscolaridadeTurmasForm
                formData={formData}
                handleChange={handleChange}
                escolas={escolas}
              />
            )}
            {activeTab === "documentacao" && (
              <DocumentacaoForm
                formData={formData}
                handleChange={handleChange}
              />
            )}
            {activeTab === "endereco" && (
              <EnderecoContatoForm
                formData={formData}
                handleChange={handleChange}
                buscaCEP={buscaCEP}
              />
            )}
            {activeTab === "saude" && (
              <SaudeDeficienciaForm
                formData={formData}
                handleChange={handleChange}
              />
            )}
            {activeTab === "calendario" && (
              <CalendarioForm
                formData={formData}
                handleChange={handleChange}
                unidades={unidades}
                instituicoes={instituicoes}
                cursos={cursos}
              />
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-8">
              <button
                disabled={activeTab === "jovem"}
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (t) => t.id === activeTab,
                  );
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={18} />
                Anterior
              </button>

              {activeTab !== "calendario" ? (
                <button
                  onClick={() => {
                    const currentIndex = tabs.findIndex(
                      (t) => t.id === activeTab,
                    );
                    if (currentIndex < tabs.length - 1)
                      setActiveTab(tabs[currentIndex + 1].id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#133c86] text-white font-medium hover:bg-[#0f2e6b] transition-all"
                >
                  Próximo
                  <div className="rotate-180">
                    <ArrowLeft size={18} />
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
                >
                  <Save size={18} />
                  {editingId ? "Finalizar Atualização" : "Finalizar Cadastro"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CadAprendizes() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#133c86]"></div>
        </div>
      }
    >
      <CadastroForm />
    </Suspense>
  );
}
