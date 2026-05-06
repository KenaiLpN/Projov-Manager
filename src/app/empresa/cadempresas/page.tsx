"use client";
import { useState, useEffect } from "react";
import { EmpSidebar } from "@/components/empsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaParceiros, {
  Parceiro,
} from "@/components/tabelas/tabelaparceiros";
import Pagination from "@/components/pagination";
interface Ramo {
  IdRamo: number;
  Descricao: string;
}
interface ParceiroFormData {
  ParDescricao: string;
  ParNomeFantasia: string;
  ParAtividadeId: string;
  ParCNPJ: string;
  ParEndereco: string;
  ParNumeroEndereco: string;
  ParComplemento: string;
  ParBairro: string;
  ParCidade: string;
  ParEstado: string;
  ParCEP: string;
  ParEmail: string;
  ParTelefone: string;
  ParCelular: string;
  ParSituacao: string;
  ParObservacoes: string;
  ParInscricao: string;
  ParInscricaoMunicipal: string;
}
export default function CadEmpresasPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<Parceiro[]>([]);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<ParceiroFormData>({
    ParDescricao: "",
    ParNomeFantasia: "",
    ParAtividadeId: "",
    ParCNPJ: "",
    ParEndereco: "",
    ParNumeroEndereco: "",
    ParComplemento: "",
    ParBairro: "",
    ParCidade: "",
    ParEstado: "",
    ParCEP: "",
    ParEmail: "",
    ParTelefone: "",
    ParCelular: "",
    ParSituacao: "A",
    ParObservacoes: "",
    ParInscricao: "",
    ParInscricaoMunicipal: "",
  });
  useEffect(() => {
    fetchRamos();
  }, []);
  async function fetchRamos() {
    try {
      const response = await api.get("/ramos-atividade?limit=100");
      setRamos(response.data.data);
    } catch (err) {
      console.error("Erro ao carregar ramos:", err);
    }
  }
  async function fetchData(pagina: number, searchTerm: string = search) {
    setLoading(true);
    try {
      const response = await api.get(
        `/parceiros?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
      );
      setLista(response.data.data);
      setTotalPages(response.data.meta.totalPages);
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
    setFormData({
      ParDescricao: "",
      ParNomeFantasia: "",
      ParAtividadeId: "",
      ParCNPJ: "",
      ParEndereco: "",
      ParNumeroEndereco: "",
      ParComplemento: "",
      ParBairro: "",
      ParCidade: "",
      ParEstado: "",
      ParCEP: "",
      ParEmail: "",
      ParTelefone: "",
      ParCelular: "",
      ParSituacao: "A",
      ParObservacoes: "",
      ParInscricao: "",
      ParInscricaoMunicipal: "",
    });
    setIsModalOpen(true);
  };
  const handleEdit = async (item: Parceiro) => {
    try {
      const response = await api.get(`/parceiros/${item.ParCodigo}`);
      const data = response.data;
      setEditingId(item.ParCodigo);
      setFormData({
        ParDescricao: data.ParDescricao || "",
        ParNomeFantasia: data.ParNomeFantasia || "",
        ParAtividadeId: String(data.ParAtividadeId || ""),
        ParCNPJ: data.ParCNPJ || "",
        ParEndereco: data.ParEndereco || "",
        ParNumeroEndereco: data.ParNumeroEndereco || "",
        ParComplemento: data.ParComplemento || "",
        ParBairro: data.ParBairro || "",
        ParCidade: data.ParCidade || "",
        ParEstado: data.ParEstado || "",
        ParCEP: data.ParCEP || "",
        ParEmail: data.ParEmail || "",
        ParTelefone: data.ParTelefone || "",
        ParCelular: data.ParCelular || "",
        ParSituacao: data.ParSituacao || "A",
        ParObservacoes: data.ParObservacoes || "",
        ParInscricao: data.ParInscricao || "",
        ParInscricaoMunicipal: data.ParInscricaoMunicipal || "",
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Erro ao carregar detalhes da empresa.");
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
  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/parceiros/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch (err: any) {
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
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
    if (!formData.ParDescricao.trim() || !formData.ParAtividadeId) {
      toast.error("Razão Social e Ramo de Atividade são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/parceiros/${editingId}`, formData);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/parceiros", formData);
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
                placeholder="Buscar por Razão, Fantasia ou CNPJ..."
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
            Nova Empresa
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaParceiros
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
            {editingId ? "Editar Empresa" : "Nova Empresa"}
          </h2>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Razão Social *
              </label>
              <input
                name="ParDescricao"
                value={formData.ParDescricao}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome Fantasia
              </label>
              <input
                name="ParNomeFantasia"
                value={formData.ParNomeFantasia}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                CNPJ
              </label>
              <input
                name="ParCNPJ"
                value={formData.ParCNPJ}
                onChange={handleChange}
                type="text"
                maxLength={14}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Inscrição Estadual
              </label>
              <input
                name="ParInscricao"
                value={formData.ParInscricao}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Inscrição Municipal
              </label>
              <input
                name="ParInscricaoMunicipal"
                value={formData.ParInscricaoMunicipal}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Ramo de Atividade *
              </label>
              <select
                name="ParAtividadeId"
                value={formData.ParAtividadeId}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none bg-white"
              >
                <option value="">Selecione um ramo</option>
                {ramos.map((r) => (
                  <option key={r.IdRamo} value={r.IdRamo}>
                    {r.Descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Telefone
              </label>
              <input
                name="ParTelefone"
                value={formData.ParTelefone}
                onChange={handleChange}
                type="text"
                maxLength={10}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Celular
              </label>
              <input
                name="ParCelular"
                value={formData.ParCelular}
                onChange={handleChange}
                type="text"
                maxLength={11}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                E-mail
              </label>
              <input
                name="ParEmail"
                value={formData.ParEmail}
                onChange={handleChange}
                type="email"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Status
              </label>
              <select
                name="ParSituacao"
                value={formData.ParSituacao}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none bg-white"
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Endereço</h3>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">CEP</label>
              <input
                name="ParCEP"
                value={formData.ParCEP}
                onChange={handleChange}
                type="text"
                maxLength={8}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Estado (UF)
              </label>
              <input
                name="ParEstado"
                value={formData.ParEstado}
                onChange={handleChange}
                type="text"
                maxLength={2}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Logradouro
              </label>
              <input
                name="ParEndereco"
                value={formData.ParEndereco}
                onChange={handleChange}
                type="text"
                maxLength={100}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Número
              </label>
              <input
                name="ParNumeroEndereco"
                value={formData.ParNumeroEndereco}
                onChange={handleChange}
                type="text"
                maxLength={6}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Cidade
              </label>
              <input
                name="ParCidade"
                value={formData.ParCidade}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Bairro
              </label>
              <input
                name="ParBairro"
                value={formData.ParBairro}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Observações
              </label>
              <textarea
                name="ParObservacoes"
                value={formData.ParObservacoes}
                onChange={handleChange}
                rows={3}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 m-4 pt-4 border-t">
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
        </Modal>
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          message="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita."
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
      </div>
    </div>
  );
}