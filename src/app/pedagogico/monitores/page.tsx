"use client";
import { useState, useEffect } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import Modal from "@/components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import Pagination from "@/components/pagination";
import {
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  X,
  Save,
  MapPin,
  Calendar,
  FileText,
  Briefcase,
} from "lucide-react";

interface Educador {
  EducCodigo: number;
  EducNome: string | null;
  EducSexo: string | null;
  EducEndereco: string | null;
  EducNumeroEndereco: string | null;
  EducComplemento: string | null;
  EducBairro: string | null;
  EducCidade: string | null;
  EducUF: string | null;
  EducCEP: string | null;
  EducTelefone: string | null;
  EducTelefoneCelular: string | null;
  EducEMail: string | null;
  EducDataNascimento: string | null;
  EducNaturalidade: string | null;
  EducUFNaturalidade: string | null;
  EducEstadoCivil: string | null;
  EducNomedoPai: string | null;
  EducNomedaMae: string | null;
  EducSituacao: string | null;
  EducDataEntrada: string | null;
  EducDataSaida: string | null;
  EducTipoAdmissao: string | null;
  EducIdentidade: string | null;
  EducExpedIdentidade: string | null;
  EducCPF: string | null;
  EducTitulodeEleitor: string | null;
  EducZonaEleitoral: string | null;
  EducSecaoEleitoral: string | null;
  EducMunEleitoral: string | null;
  EducSenha: string | null;
  EducCartprofissional: string | null;
  EducSerieCartProfissional: string | null;
  EducObservacoes: string | null;
  EducGrauInstrucao: number | null;
  EducNumSistInterno: string | null;
  EducTipo: string | null;
}

export default function MonitoresFuncionariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<Educador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("pessoais");

  const [formData, setFormData] = useState<Partial<Educador>>({
    EducNome: "",
    EducSexo: "",
    EducEMail: "",
    EducCPF: "",
    EducSituacao: "A",
    EducTipo: "M",
  });

  const fetchData = async (p: number, s: string = search) => {
    setLoading(true);
    try {
      const resp = await api.get(`/educadores?page=${p}&limit=10&search=${s}`);
      setLista(resp.data.data);
      setTotalPages(resp.data.meta.totalPages);
      setError(null);
    } catch (err: any) {
      console.error("Erro Axios:", err);
      const apiError = err.response?.data?.message || err.response?.data?.error || "Erro de conexão com o servidor.";
      const detailedError = err.response?.data?.message ? `${apiError} (Código: ${err.response?.data?.code || '500'})` : apiError;
      setError(detailedError);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setActiveTab("pessoais");
  };

  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      EducNome: "",
      EducSexo: "",
      EducEMail: "",
      EducCPF: "",
      EducSituacao: "A", 
      EducTipo: "M",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Educador) => {
    setEditingId(item.EducCodigo);
    // Format dates for input type="date"
    const formattedItem = { ...item };
    if (formattedItem.EducDataNascimento)
      formattedItem.EducDataNascimento = new Date(formattedItem.EducDataNascimento).toISOString().split("T")[0];
    if (formattedItem.EducDataEntrada)
      formattedItem.EducDataEntrada = new Date(formattedItem.EducDataEntrada).toISOString().split("T")[0];
    if (formattedItem.EducDataSaida)
      formattedItem.EducDataSaida = new Date(formattedItem.EducDataSaida).toISOString().split("T")[0];
    
    setFormData(formattedItem);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/educadores/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch (err: any) {
      toast.error("Erro ao excluir.");
    }
  };

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const requestSave = () => {
    if (editingId) {
      setShowSaveConfirm(true);
    } else {
      handleSalvar();
    }
  };

  const handleSalvar = async () => {
    if (!formData.EducNome) {
      toast.error("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/educadores/${editingId}`, formData);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/educadores", formData);
        toast.success("Cadastrado com sucesso!");
      }
      closeModal();
      fetchData(page);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      <aside className="h-full shrink-0">
        <PedagogicoSidebar />
      </aside>

      <main className="flex-1 flex flex-col overflow-auto min-w-0">
        {}
        <div className="bg-[#133c86] px-8 py-6 text-white shadow-lg shrink-0">
          <div className="flex justify-between items-center w-full px-4">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">Monitores e Funcionários</h1>
              <p className="text-blue-100/90 text-sm mt-1">Gestão de educadores e equipe administrativa do ProSis</p>
            </div>
            <button
              onClick={openModalNew}
              className="px-6 py-2.5 bg-white text-[#133c86] rounded-xl font-bold hover:shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer border-2 border-white"
            >
              <Plus size={20} strokeWidth={3} />
              NOVO REGISTRO
            </button>
          </div>
        </div>

        {}
        <div className="p-6 w-full flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
            <div className="relative w-full md:w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Busca avançada: Nome, CPF ou E-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
              />
              {search && (
                <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="flex gap-3">
               <button onClick={handleSearch} className="px-8 py-3 bg-gray-100 text-[#133c86] font-bold rounded-xl hover:bg-[#133c86] hover:text-white transition-all cursor-pointer border border-[#133c86]/10">
                 PESQUISAR
               </button>
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cód</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CPF</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Carregando dados...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-red-500">{error}</td></tr>
                  ) : lista.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhum registro encontrado.</td></tr>
                  ) : (
                    lista.map((item) => (
                      <tr key={item.EducCodigo} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">#{item.EducCodigo}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 uppercase">{item.EducNome}</span>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                              {item.EducTipo === 'M' ? 'Monitor' : item.EducTipo === 'F' ? 'Funcionário' : 'Outro'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.EducCPF || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                               <Mail size={12} className="text-gray-400" />
                               {item.EducEMail || '-'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                               <Phone size={12} className="text-gray-400" />
                               {item.EducTelefoneCelular || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.EducSituacao === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.EducSituacao === 'A' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                             <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Editar">
                               <Edit size={18} />
                             </button>
                             <button onClick={() => handleDelete(item.EducCodigo)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Excluir">
                               <Trash2 size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
               {!loading && !error && (
                 <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
               )}
            </div>
          </div>
        </div>

        {}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="bg-[#133c86] px-8 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Editar Registro" : "Novo Registro"}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {}
            <div className="flex border-b border-gray-100 px-8 bg-gray-50/50">
               {[
                 { id: "pessoais", label: "Dados Pessoais", icon: <User size={16} /> },
                 { id: "endereco", label: "Endereço", icon: <MapPin size={16} /> },
                 { id: "trabalho", label: "Contrato / Docs", icon: <Briefcase size={16} /> },
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all relative ${
                     activeTab === tab.id ? "text-[#133c86]" : "text-gray-400 hover:text-gray-600"
                   }`}
                 >
                   {tab.icon}
                   {tab.label}
                   {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#133c86] rounded-t-full" />}
                 </button>
               ))}
            </div>

            {}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {activeTab === "pessoais" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5 lg:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo *</label>
                    <input name="EducNome" value={formData.EducNome || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sexo</label>
                    <select name="EducSexo" value={formData.EducSexo || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                      <option value="">Selecione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CPF</label>
                    <input name="EducCPF" value={formData.EducCPF || ""} onChange={handleChange} maxLength={11} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">RG</label>
                    <input name="EducIdentidade" value={formData.EducIdentidade || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data Nascimento</label>
                    <input type="date" name="EducDataNascimento" value={formData.EducDataNascimento || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</label>
                    <input name="EducEMail" value={formData.EducEMail || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Celular</label>
                    <input name="EducTelefoneCelular" value={formData.EducTelefoneCelular || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone Fixo</label>
                    <input name="EducTelefone" value={formData.EducTelefone || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</label>
                    <select name="EducTipo" value={formData.EducTipo || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                      <option value="M">Monitor</option>
                      <option value="F">Funcionário</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Situação</label>
                    <select name="EducSituacao" value={formData.EducSituacao || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Civil</label>
                    <select name="EducEstadoCivil" value={formData.EducEstadoCivil || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                      <option value="">Selecione...</option>
                      <option value="S">Solteiro(a)</option>
                      <option value="C">Casado(a)</option>
                      <option value="D">Divorciado(a)</option>
                      <option value="V">Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "endereco" && (
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CEP</label>
                    <input name="EducCEP" value={formData.EducCEP || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-3 lg:col-span-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Endereço</label>
                    <input name="EducEndereco" value={formData.EducEndereco || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nº</label>
                    <input name="EducNumeroEndereco" value={formData.EducNumeroEndereco || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bairro</label>
                    <input name="EducBairro" value={formData.EducBairro || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade</label>
                    <input name="EducCidade" value={formData.EducCidade || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">UF</label>
                    <input name="EducUF" value={formData.EducUF || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-3 lg:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Complemento</label>
                    <input name="EducComplemento" value={formData.EducComplemento || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                </div>
              )}

              {activeTab === "trabalho" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data Entrada</label>
                    <input type="date" name="EducDataEntrada" value={formData.EducDataEntrada || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data Saída</label>
                    <input type="date" name="EducDataSaida" value={formData.EducDataSaida || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo Admissão</label>
                    <input name="EducTipoAdmissao" value={formData.EducTipoAdmissao || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cart. Profissional</label>
                    <input name="EducCartprofissional" value={formData.EducCartprofissional || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Série Cart. Prof.</label>
                    <input name="EducSerieCartProfissional" value={formData.EducSerieCartProfissional || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cód. Sistema Interno</label>
                    <input name="EducNumSistInterno" value={formData.EducNumSistInterno || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 lg:col-span-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Observações</label>
                    <textarea name="EducObservacoes" rows={3} value={formData.EducObservacoes || ""} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" />
                  </div>
                </div>
              )}
            </div>

            {}
            <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
               <button onClick={closeModal} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all cursor-pointer">
                 Cancelar
               </button>
               <button onClick={requestSave} disabled={saving} className="px-8 py-2.5 bg-[#133c86] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer">
                 {saving ? "Salvando..." : (
                   <>
                     <Save size={18} />
                     {editingId ? "Atualizar Registro" : "Salvar Registro"}
                   </>
                 )}
               </button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          message="Tem certeza que deseja excluir este monitor/funcionário? Esta ação não pode ser desfeita."
        />
        <ConfirmModal
          isOpen={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          onConfirm={() => { setShowSaveConfirm(false); handleSalvar(); }}
          title="Confirmar Alteração"
          message="Deseja salvar as alterações neste registro?"
          confirmText="Salvar"
          cancelText="Cancelar"
        />
      </main>
    </div>
  );
}
