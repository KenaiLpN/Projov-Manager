"use client";
import { useState, useEffect } from "react";
import { EmpSidebar } from "@/components/empsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaRamosAtividade, {
  RamoAtividade,
} from "@/components/tabelas/tabelaramosatividade";
import Pagination from "@/components/pagination";
interface RamoFormData {
  Descricao: string;
  CodigoCNAE: string;
  Observacao: string;
  Ativo: boolean;
}
export default function CadRamosAtividadePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<RamoAtividade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<RamoFormData>({
    Descricao: "",
    CodigoCNAE: "",
    Observacao: "",
    Ativo: true,
  });
  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      Descricao: "",
      CodigoCNAE: "",
      Observacao: "",
      Ativo: true,
    });
    setIsModalOpen(true);
  };
  const handleEdit = (item: RamoAtividade) => {
    setEditingId(item.IdRamo);
    setFormData({
      Descricao: item.Descricao,
      CodigoCNAE: item.CodigoCNAE || "",
      Observacao: item.Observacao || "",
      Ativo: item.Ativo ?? true,
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  async function fetchData(pagina: number, searchTerm: string = search) {
    setLoading(true);
    try {
      const response = await api.get(
        `/ramos-atividade?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
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
  const handleSearch = () => {
    setPage(1);
    fetchData(1, search);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };
  useEffect(() => {
    fetchData(page);
  }, [page]);
  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as any;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };
  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/ramos-atividade/${itemToDelete}`);
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
    if (!formData.Descricao.trim()) {
      toast.error("A descrição é obrigatória.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/ramos-atividade/${editingId}`, formData);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/ramos-atividade", formData);
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
                placeholder="Buscar por descrição ou CNAE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-80 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
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
            className="px-6 py-3 bg-[#123A83] text-white font-semibold rounded-lg shadow-md hover:bg-[#0f2e6b] mr-4 cursor-pointer"
          >
            Novo Ramo
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaRamosAtividade
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
            {editingId ? "Editar Ramo de Atividade" : "Novo Ramo de Atividade"}
          </h2>
          <div className="p-4 grid grid-cols-1 gap-4 ">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Descrição (Máx 150)
              </label>
              <input
                name="Descricao"
                value={formData.Descricao}
                onChange={handleChange}
                type="text"
                maxLength={150}
                placeholder="Ex: Indústria de Alimentos"
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Código CNAE (Máx 20)
              </label>
              <input
                name="CodigoCNAE"
                value={formData.CodigoCNAE}
                onChange={handleChange}
                type="text"
                maxLength={20}
                placeholder="Ex: 10.12-1-01"
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Observação
              </label>
              <textarea
                name="Observacao"
                value={formData.Observacao}
                onChange={handleChange}
                rows={4}
                placeholder="Observações adicionais..."
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="Ativo"
                name="Ativo"
                type="checkbox"
                checked={formData.Ativo}
                onChange={handleChange}
                className="w-4 h-4 text-[#133c86] border-gray-300 rounded focus:ring-[#133c86] cursor-pointer"
              />
              <label
                htmlFor="Ativo"
                className="text-sm font-semibold text-gray-600 cursor-pointer"
              >
                Ramo Ativo
              </label>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors cursor-pointer font-semibold shadow-sm"
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
          message="Tem certeza que deseja excluir este ramo de atividade? Esta ação não pode ser desfeita."
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