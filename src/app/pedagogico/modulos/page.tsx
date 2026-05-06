"use client";

import { useState, useEffect } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import api from "@/services/api";
import TabelaModulos, { Modulo } from "@/components/tabelas/tabelamodulos";
import Pagination from "@/components/pagination";
import { toast } from "react-hot-toast";

export default function ModulosAprendizagemPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<Partial<Modulo>>({
    PlanCurso: "",
    PlanDescricao: "",
  });

  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      PlanCurso: "",
      PlanDescricao: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Modulo) => {
    setEditingId(item.PlanCodigo);
    setFormData({
      PlanCurso: item.PlanCurso,
      PlanDescricao: item.PlanDescricao,
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
        `/planos?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`
      );
      setLista(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar módulos de aprendizagem.");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await api.delete(`/planos/${itemToDelete}`);
      toast.success("Módulo excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch (err: any) {
      toast.error("Erro ao excluir o módulo.");
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
    if (!formData.PlanCurso) {
      toast.error("O código do curso é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/planos/${editingId}`, formData);
        toast.success("Módulo atualizado com sucesso!");
      } else {
        await api.post("/planos", formData);
        toast.success("Módulo cadastrado com sucesso!");
      }
      closeModal();
      fetchData(page);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar o módulo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      <PedagogicoSidebar />
      <div className="flex flex-col w-full h-full overflow-y-auto bg-gray-50">
        <div className="flex bg-white p-4 h-24 m-5 rounded-xl justify-between items-center shadow-md border border-gray-100">
          <div className="flex flex-col ml-4">
             <h1 className="text-xl font-bold text-[#133c86] uppercase tracking-tight">Módulos de Aprendizagem</h1>
             <p className="text-xs text-gray-400">Gerenciamento de módulos e planos base de curso</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2.5 pr-10 w-80 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#133c86]/20 focus:border-[#133c86] transition-all text-sm"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-[#133c86] text-white font-medium rounded-lg hover:bg-[#0f2e6b] transition-all shadow-sm active:scale-95 text-sm"
            >
              Pesquisar
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <button
              onClick={openModalNew}
              className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Módulo
            </button>
          </div>
        </div>

        <div className="flex-1">
          <TabelaModulos
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
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">
              {editingId ? "Editar Módulo" : "Novo Módulo de Aprendizagem"}
            </h2>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Código do Curso <span className="text-red-500">*</span>
                </label>
                <input
                  name="PlanCurso"
                  value={formData.PlanCurso || ""}
                  onChange={handleChange}
                  type="text"
                  maxLength={6}
                  placeholder="Ex: 001"
                  className="p-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#133c86]/20 focus:border-[#133c86] outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 font-medium">Máximo 6 caracteres</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Descrição do Módulo
                </label>
                <input
                  name="PlanDescricao"
                  value={formData.PlanDescricao || ""}
                  onChange={handleChange}
                  type="text"
                  maxLength={80}
                  placeholder="Ex: Módulo de Informática Básica"
                  className="p-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#133c86]/20 focus:border-[#133c86] outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 font-medium">Máximo 80 caracteres</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
              <button
                onClick={closeModal}
                className="px-5 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={requestSave}
                disabled={saving}
                className="px-6 py-2 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] disabled:bg-gray-300 transition-all shadow-md flex items-center justify-center min-w-[120px]"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Salvar Módulo"
                )}
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          message="Tem certeza que deseja excluir este módulo de aprendizagem? Esta ação não pode ser desfeita."
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
