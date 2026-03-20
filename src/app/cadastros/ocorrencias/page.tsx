"use client";
import { useState, useEffect } from "react";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaOcorrencias, {
  Ocorrencia,
} from "@/components/tabelas/tabelaocorrencias";
import Pagination from "@/components/pagination";
interface OcorrenciaFormData {
  OcoCodigo: string;
  OcoDescricao: string;
  OcoTipo: string;
}
export default function OcorrenciasPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const initialFormState: OcorrenciaFormData = {
    OcoCodigo: "",
    OcoDescricao: "",
    OcoTipo: "",
  };
  const [formData, setFormData] =
    useState<OcorrenciaFormData>(initialFormState);
  const [saving, setSaving] = useState<boolean>(false);
  async function fetchOcorrencias(pagina: number, searchTerm: string = search) {
    setLoading(true);
    try {
      const response = await api.get(
        `/ocorrencia?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
      );
      setOcorrencias(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }
  const handleSearch = () => {
    setPage(1);
    fetchOcorrencias(1, search);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchOcorrencias(1, "");
  };
  useEffect(() => {
    fetchOcorrencias(page);
  }, [page]);
  const openModalNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };
  const handleEdit = (item: Ocorrencia) => {
    setEditingId(item.OcoCodigo);
    setFormData({
      OcoCodigo: String(item.OcoCodigo),
      OcoDescricao: item.OcoDescricao || "",
      OcoTipo: item.OcoTipo || "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/ocorrencia/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchOcorrencias(page);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  };
  const handleSalvar = async () => {
    setSaving(true);
    try {
      if (!formData.OcoDescricao) {
        toast.error("A descrição é obrigatória.");
        setSaving(false);
        return;
      }
      const payload: any = {
        OcoDescricao: formData.OcoDescricao,
        OcoTipo: formData.OcoTipo || null,
      };
      if (formData.OcoCodigo) {
        payload.OcoCodigo = Number(formData.OcoCodigo);
      }
      if (editingId) {
        await api.put(`/ocorrencia/${editingId}`, payload);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/ocorrencia", payload);
        toast.success("Cadastrado com sucesso!");
      }
      closeModal();
      fetchOcorrencias(page);
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      const msg = data?.detail
        ? `${data.message}: ${data.detail}`
        : data?.message || "Erro ao salvar.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  return (
    <div className="flex flex-row h-full w-full">
      <aside>
        <CadSidebar />
      </aside>
      <div className="flex flex-col w-full h-full">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-72 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
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
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Nova Ocorrência
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaOcorrencias
            dados={ocorrencias}
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
          <h2 className="text-2xl font-bold m-4 text-gray-800">
            {editingId ? "Editar Ocorrência" : "Nova Ocorrência"}
          </h2>
          <div className="p-4 grid grid-cols-1 gap-4">
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Código da Ocorrência
              </label>
              <input
                name="OcoCodigo"
                value={formData.OcoCodigo}
                onChange={handleChange}
                type="number"
                placeholder="Gerado automaticamente se vazio"
                disabled={!!editingId}
                className="p-2 w-full rounded border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                name="OcoDescricao"
                value={formData.OcoDescricao}
                onChange={handleChange}
                placeholder="Ex: Falta não justificada..."
                className="p-2 w-full rounded border border-gray-300 min-h-[80px]"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Tipo (1 caractere)
              </label>
              <input
                name="OcoTipo"
                value={formData.OcoTipo}
                onChange={handleChange}
                maxLength={1}
                placeholder="Ex: F, A, E..."
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 m-4 pt-4 border-t">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 cursor-pointer"
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
          message="Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}