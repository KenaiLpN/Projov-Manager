"use client";
import { useState, useEffect } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import api from "@/services/api";
import TabelaCursos, { Curso } from "@/components/tabelas/tabelacursos";
import Pagination from "@/components/pagination";
import { toast } from "react-hot-toast";
export default function CursosPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lista, setLista] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<Curso>>({
    CurCodigo: "",
    CurDescricao: "",
    CurCargaHoraria: 0,
    CurAbreviatura: "",
    EnsNumeroPeriodos: 0,
  });
  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      CurCodigo: "",
      CurDescricao: "",
      CurCargaHoraria: 0,
      CurAbreviatura: "",
      EnsNumeroPeriodos: 0,
    });
    setIsModalOpen(true);
  };
  const handleEdit = (item: Curso) => {
    setEditingId(item.CurCodigo);
    setFormData(item);
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
        `/cursos?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
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
    if (e.key === "Enter") handleSearch();
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };
  useEffect(() => {
    fetchData(page);
  }, [page]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "CurCargaHoraria" || name === "EnsNumeroPeriodos"
          ? Number(value)
          : value,
    }));
  };
  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/cursos/${itemToDelete}`);
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
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/cursos/${editingId}`, formData);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/cursos", formData);
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
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <div className="flex flex-col w-full h-full overflow-y-auto">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por descrição ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-80 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
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
            className="px-6 py-3 bg-[#123A83] text-white font-semibold rounded-lg shadow-md hover:bg-[#0f2e6b] mr-4 cursor-pointer"
          >
            Novo Curso
          </button>
        </div>
        <div className="flex-1">
          <TabelaCursos
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
          <h2 className="text-2xl font-bold m-4 text-gray-800">
            {editingId ? "Editar Curso" : "Novo Curso"}
          </h2>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Código
              </label>
              <input
                name="CurCodigo"
                value={formData.CurCodigo}
                onChange={handleChange}
                disabled={!!editingId}
                type="text"
                maxLength={6}
                className="p-2 w-full rounded border border-gray-300 disabled:bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Descrição
              </label>
              <input
                name="CurDescricao"
                value={formData.CurDescricao}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Carga Horária
              </label>
              <input
                name="CurCargaHoraria"
                value={formData.CurCargaHoraria || ""}
                onChange={handleChange}
                type="number"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Abreviatura
              </label>
              <input
                name="CurAbreviatura"
                value={formData.CurAbreviatura || ""}
                onChange={handleChange}
                type="text"
                maxLength={12}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Número de Períodos
              </label>
              <input
                name="EnsNumeroPeriodos"
                value={formData.EnsNumeroPeriodos || ""}
                onChange={handleChange}
                type="number"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 m-4 pt-4 border-t">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-[gray-800] rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={requestSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors cursor-pointer"
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
          message="Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita."
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
