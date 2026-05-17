"use client";
import { useState, useEffect, useCallback } from "react";
import { EmpSidebar } from "@/components/empsidebar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import Pagination from "@/components/pagination";
import TabelaRegistroGI, {
  RegistroGI,
} from "@/components/tabelas/tabelaregistrogi";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface RegistroGIFormData {
  GIRazaoSocial: string;
  GINomeFantasia: string;
  GICNPJ: string;
  GICNAE: string;
  GIInscricaoEstadual: string;
  GIInscricaoMunicipal: string;
  GIUF: string;
  GIEndereco: string;
  GIBairro: string;
  GICidade: string;
  GIComplemento: string;
  GINumeroEnd: string;
  GICep: string;
  GITelefone: string;
  GIEmail: string;
  GIContato: string;
  GIEmailCobranca: string;
  GIResponsavelCobranca: string;
  GIResponsavelLegal: string;
  GIRamoAtividade: string;
  GIObservacao: string;
  GIDataLimiteFaturamento: string;
  GIValeRefeicaoIntro: string;
  GIValeTransporteIntro: string;
  GIValeRefeicaoContrato: string;
  GIValeTransporteContrato: string;
  GIConvenioMedicoContrato: string;
  GIConvenioOdontoContrato: string;
  GICestaBasicaContrato: string;
  GIRestauranteEmpresa: string;
  GIRefeicao: string;
  GIUniforme: string;
  GIContatoProjov: string;
  GIDialogo: string;
}

const emptyForm: RegistroGIFormData = {
  GIRazaoSocial: "",
  GINomeFantasia: "",
  GICNPJ: "",
  GICNAE: "",
  GIInscricaoEstadual: "",
  GIInscricaoMunicipal: "",
  GIUF: "",
  GIEndereco: "",
  GIBairro: "",
  GICidade: "",
  GIComplemento: "",
  GINumeroEnd: "",
  GICep: "",
  GITelefone: "",
  GIEmail: "",
  GIContato: "",
  GIEmailCobranca: "",
  GIResponsavelCobranca: "",
  GIResponsavelLegal: "",
  GIRamoAtividade: "",
  GIObservacao: "",
  GIDataLimiteFaturamento: "",
  GIValeRefeicaoIntro: "0",
  GIValeTransporteIntro: "0",
  GIValeRefeicaoContrato: "0",
  GIValeTransporteContrato: "0",
  GIConvenioMedicoContrato: "0",
  GIConvenioOdontoContrato: "0",
  GICestaBasicaContrato: "0",
  GIRestauranteEmpresa: "N",
  GIRefeicao: "",
  GIUniforme: "N",
  GIContatoProjov: "",
  GIDialogo: "",
};

const DRAFT_KEY = "registrogi_new_draft";

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

export default function CadRegistroGIPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<RegistroGI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formData, setFormData] = useState<RegistroGIFormData>(emptyForm);

  async function fetchData(pagina: number, searchTerm: string = search) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagina),
        limit: "10",
      });
      if (searchTerm) params.append("search", searchTerm);
      const response = await api.get(`/registro-gi?${params.toString()}`);
      setLista(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const openModalNew = () => {
    setEditingId(null);
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
        toast("Rascunho recuperado. Continue de onde parou.", { icon: "📝" });
      } catch {
        setFormData(emptyForm);
      }
    } else {
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleEdit = async (item: RegistroGI) => {
    try {
      const response = await api.get(`/registro-gi/${item.GICodigo}`);
      const d = response.data;
      setEditingId(item.GICodigo);
      setFormData({
        GIRazaoSocial: d.GIRazaoSocial || "",
        GINomeFantasia: d.GINomeFantasia || "",
        GICNPJ: d.GICNPJ || "",
        GICNAE: d.GICNAE || "",
        GIInscricaoEstadual: d.GIInscricaoEstadual || "",
        GIInscricaoMunicipal: d.GIInscricaoMunicipal || "",
        GIUF: d.GIUF || "",
        GIEndereco: d.GIEndereco || "",
        GIBairro: d.GIBairro || "",
        GICidade: d.GICidade || "",
        GIComplemento: d.GIComplemento || "",
        GINumeroEnd: d.GINumeroEnd || "",
        GICep: d.GICep || "",
        GITelefone: d.GITelefone || "",
        GIEmail: d.GIEmail || "",
        GIContato: d.GIContato || "",
        GIEmailCobranca: d.GIEmailCobranca || "",
        GIResponsavelCobranca: d.GIResponsavelCobranca || "",
        GIResponsavelLegal: d.GIResponsavelLegal || "",
        GIRamoAtividade: d.GIRamoAtividade || "",
        GIObservacao: d.GIObservacao || "",
        GIDataLimiteFaturamento: d.GIDataLimiteFaturamento
          ? d.GIDataLimiteFaturamento.substring(0, 10)
          : "",
        GIValeRefeicaoIntro: String(d.GIValeRefeicaoIntro ?? 0),
        GIValeTransporteIntro: String(d.GIValeTransporteIntro ?? 0),
        GIValeRefeicaoContrato: String(d.GIValeRefeicaoContrato ?? 0),
        GIValeTransporteContrato: String(d.GIValeTransporteContrato ?? 0),
        GIConvenioMedicoContrato: String(d.GIConvenioMedicoContrato ?? 0),
        GIConvenioOdontoContrato: String(d.GIConvenioOdontoContrato ?? 0),
        GICestaBasicaContrato: String(d.GICestaBasicaContrato ?? 0),
        GIRestauranteEmpresa: d.GIRestauranteEmpresa || "N",
        GIRefeicao: d.GIRefeicao || "",
        GIUniforme: d.GIUniforme || "N",
        GIContatoProjov: d.GIContatoProjov || "",
        GIDialogo: d.GIDialogo || "",
      });
      setIsModalOpen(true);
    } catch {
      toast.error("Erro ao carregar registro.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSearch = () => {
    setPage(1);
    fetchData(1, search);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (!editingId) localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const buscaCEP = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`/api/cep/${clean}`);
      if (!res.ok) { toast.error("Erro ao consultar CEP."); return; }
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado."); return; }
      setFormData((prev) => {
        const next = {
          ...prev,
          GIEndereco: data.logradouro ?? prev.GIEndereco,
          GIBairro: data.bairro ?? prev.GIBairro,
          GICidade: data.localidade ?? prev.GICidade,
          GIUF: data.uf ?? prev.GIUF,
        };
        if (!editingId) localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        return next;
      });
    } catch {
      toast.error("Não foi possível consultar o CEP.");
    }
  }, []);

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/registro-gi/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  };

  const requestSave = () => {
    if (editingId) {
      setShowSaveConfirm(true);
    } else {
      handleSalvar();
    }
  };

  const handleSalvar = async () => {
    if (!formData.GIRazaoSocial.trim()) {
      toast.error("Razão Social é obrigatória.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        GIValeRefeicaoIntro: parseFloat(formData.GIValeRefeicaoIntro) || 0,
        GIValeTransporteIntro: parseFloat(formData.GIValeTransporteIntro) || 0,
        GIValeRefeicaoContrato: parseFloat(formData.GIValeRefeicaoContrato) || 0,
        GIValeTransporteContrato: parseFloat(formData.GIValeTransporteContrato) || 0,
        GIConvenioMedicoContrato: parseFloat(formData.GIConvenioMedicoContrato) || 0,
        GIConvenioOdontoContrato: parseFloat(formData.GIConvenioOdontoContrato) || 0,
        GICestaBasicaContrato: parseFloat(formData.GICestaBasicaContrato) || 0,
        GIDataLimiteFaturamento: formData.GIDataLimiteFaturamento || null,
      };
      if (editingId) {
        await api.put(`/registro-gi/${editingId}`, payload);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/registro-gi", payload);
        localStorage.removeItem(DRAFT_KEY);
        toast.success("Cadastrado com sucesso!");
      }
      closeModal();
      fetchData(page);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none";
  const labelClass = "text-sm font-semibold text-gray-600";

  return (
    <div className="flex flex-row h-full w-full">
      <aside>
        <EmpSidebar />
      </aside>
      <div className="flex flex-col w-full h-full">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por Razão Social, Fantasia ou CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-96 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Novo Registro GI
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <TabelaRegistroGI
            dados={lista}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="p-4">
            {!loading && !error && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-2xl font-bold m-4 text-gray-800 border-b pb-2">
            {editingId ? "Editar Registro GI" : "Novo Registro GI"}
          </h2>

          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Dados Principais */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelClass}>Razão Social *</label>
              <input
                name="GIRazaoSocial"
                value={formData.GIRazaoSocial}
                onChange={handleChange}
                type="text"
                maxLength={200}
                className={inputClass}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelClass}>Nome Fantasia</label>
              <input
                name="GINomeFantasia"
                value={formData.GINomeFantasia}
                onChange={handleChange}
                type="text"
                maxLength={200}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>CNPJ</label>
              <input
                name="GICNPJ"
                value={formData.GICNPJ}
                onChange={handleChange}
                type="text"
                maxLength={14}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>CNAE</label>
              <input
                name="GICNAE"
                value={formData.GICNAE}
                onChange={handleChange}
                type="text"
                maxLength={20}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Inscrição Estadual</label>
              <input
                name="GIInscricaoEstadual"
                value={formData.GIInscricaoEstadual}
                onChange={handleChange}
                type="text"
                maxLength={20}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Inscrição Municipal</label>
              <input
                name="GIInscricaoMunicipal"
                value={formData.GIInscricaoMunicipal}
                onChange={handleChange}
                type="text"
                maxLength={20}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Ramo de Atividade</label>
              <input
                name="GIRamoAtividade"
                value={formData.GIRamoAtividade}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Data Limite Faturamento</label>
              <input
                name="GIDataLimiteFaturamento"
                value={formData.GIDataLimiteFaturamento}
                onChange={handleChange}
                type="date"
                className={inputClass}
              />
            </div>

            {/* Contatos */}
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Contato</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Telefone</label>
              <input
                name="GITelefone"
                value={formData.GITelefone}
                onChange={handleChange}
                type="text"
                maxLength={10}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>E-mail</label>
              <input
                name="GIEmail"
                value={formData.GIEmail}
                onChange={handleChange}
                type="email"
                maxLength={80}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Contato</label>
              <input
                name="GIContato"
                value={formData.GIContato}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Contato Projov</label>
              <input
                name="GIContatoProjov"
                value={formData.GIContatoProjov}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>E-mail Cobrança</label>
              <input
                name="GIEmailCobranca"
                value={formData.GIEmailCobranca}
                onChange={handleChange}
                type="email"
                maxLength={80}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Responsável Cobrança</label>
              <input
                name="GIResponsavelCobranca"
                value={formData.GIResponsavelCobranca}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Responsável Legal</label>
              <input
                name="GIResponsavelLegal"
                value={formData.GIResponsavelLegal}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className={inputClass}
              />
            </div>

            {/* Endereço */}
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Endereço</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>CEP</label>
              <input
                name="GICep"
                value={formData.GICep}
                onChange={handleChange}
                onBlur={(e) => buscaCEP(e.target.value)}
                type="text"
                maxLength={9}
                placeholder="00000-000"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>UF</label>
              <select
                name="GIUF"
                value={formData.GIUF}
                onChange={handleChange}
                className={`${inputClass} bg-white`}
              >
                <option value="">Selecione</option>
                {UF_OPTIONS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelClass}>Logradouro</label>
              <input
                name="GIEndereco"
                value={formData.GIEndereco}
                onChange={handleChange}
                type="text"
                maxLength={200}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Número</label>
              <input
                name="GINumeroEnd"
                value={formData.GINumeroEnd}
                onChange={handleChange}
                type="text"
                maxLength={10}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Complemento</label>
              <input
                name="GIComplemento"
                value={formData.GIComplemento}
                onChange={handleChange}
                type="text"
                maxLength={100}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Bairro</label>
              <input
                name="GIBairro"
                value={formData.GIBairro}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Cidade</label>
              <input
                name="GICidade"
                value={formData.GICidade}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className={inputClass}
              />
            </div>

            {/* Benefícios Introdutórios */}
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Benefícios — Período Introdutório</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Vale Refeição (Intro)</label>
              <input
                name="GIValeRefeicaoIntro"
                value={formData.GIValeRefeicaoIntro}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Vale Transporte (Intro)</label>
              <input
                name="GIValeTransporteIntro"
                value={formData.GIValeTransporteIntro}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            {/* Benefícios Contratuais */}
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Benefícios — Período Contratual</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Vale Refeição (Contrato)</label>
              <input
                name="GIValeRefeicaoContrato"
                value={formData.GIValeRefeicaoContrato}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Vale Transporte (Contrato)</label>
              <input
                name="GIValeTransporteContrato"
                value={formData.GIValeTransporteContrato}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Convênio Médico (Contrato)</label>
              <input
                name="GIConvenioMedicoContrato"
                value={formData.GIConvenioMedicoContrato}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Convênio Odonto (Contrato)</label>
              <input
                name="GIConvenioOdontoContrato"
                value={formData.GIConvenioOdontoContrato}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Cesta Básica (Contrato)</label>
              <input
                name="GICestaBasicaContrato"
                value={formData.GICestaBasicaContrato}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
              />
            </div>

            {/* Outros Benefícios */}
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Outros Benefícios</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Restaurante na Empresa</label>
              <select
                name="GIRestauranteEmpresa"
                value={formData.GIRestauranteEmpresa}
                onChange={handleChange}
                className={`${inputClass} bg-white`}
              >
                <option value="N">Não</option>
                <option value="S">Sim</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Refeição</label>
              <input
                name="GIRefeicao"
                value={formData.GIRefeicao}
                onChange={handleChange}
                type="text"
                maxLength={45}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Uniforme</label>
              <select
                name="GIUniforme"
                value={formData.GIUniforme}
                onChange={handleChange}
                className={`${inputClass} bg-white`}
              >
                <option value="N">Não</option>
                <option value="S">Sim</option>
              </select>
            </div>

            {/* Observações */}
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Informações Adicionais</h3>
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelClass}>Diálogo</label>
              <input
                name="GIDialogo"
                value={formData.GIDialogo}
                onChange={handleChange}
                type="text"
                maxLength={200}
                className={inputClass}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelClass}>Observação</label>
              <textarea
                name="GIObservacao"
                value={formData.GIObservacao}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center m-4 pt-4 border-t">
            {!editingId && (
              <button
                onClick={() => {
                  localStorage.removeItem(DRAFT_KEY);
                  setFormData(emptyForm);
                  toast("Rascunho descartado.", { icon: "🗑️" });
                }}
                className="px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer underline"
              >
                Descartar rascunho
              </button>
            )}
            <div className={`flex gap-4 ${editingId ? "ml-auto" : ""}`}>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={requestSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors cursor-pointer font-semibold"
              >
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        />

        <ConfirmModal
          isOpen={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          onConfirm={() => {
            setShowSaveConfirm(false);
            handleSalvar();
          }}
          title="Confirmar Alteração"
          message="Deseja salvar as alterações neste registro?"
          confirmText="Salvar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}
