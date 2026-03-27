"use client";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaSituacoes, {
  SituacaoParticipante,
} from "@/components/tabelas/tabelasituacoes";
import Pagination from "@/components/pagination";
import { useCrud } from "@/hooks/useCrud";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";

interface SituacaoFormData {
  StaAbreviatura: string;
  StaDescricao: string;
  StaArea: string;
}

const INITIAL_FORM: SituacaoFormData = {
  StaAbreviatura: "",
  StaDescricao: "",
  StaArea: "",
};

export default function SituacoesParticipantePage() {
  const {
    lista,
    loading,
    error,
    page,
    totalPages,
    search,
    isModalOpen,
    editingId,
    saving,
    isConfirmOpen,
    deleting,
    setPage,
    setSearch,
    setIsModalOpen,
    setEditingId,
    setIsConfirmOpen,
    setItemToDelete,
    confirmDelete,
    handleSalvar,
    resetFormAndLoad,
  } = useCrud<SituacaoParticipante>({ endpoint: "/situacao-participante" });

  const [formData, setFormData] = useState<SituacaoFormData>(INITIAL_FORM);

  const openModalNew = () => {
    setFormData(INITIAL_FORM);
    resetFormAndLoad();
  };

  const handleEdit = (item: SituacaoParticipante) => {
    setEditingId(item.StaCodigo);
    setFormData({
      StaAbreviatura: item.StaAbreviatura || "",
      StaDescricao: item.StaDescricao || "",
      StaArea: item.StaArea || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    await handleSalvar(editingId, formData);
    setFormData(INITIAL_FORM);
  };

  return (
    <div className="flex flex-row h-full w-full">
      <aside>
        <CadSidebar />
      </aside>
      <div className="flex flex-col w-full h-full">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center">
          <div className="ml-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={() => {}}
              onClear={() => setSearch("")}
              placeholder="Buscar por descrição, abreviação..."
            />
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Nova Situação
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaSituacoes
            dados={lista}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={(id) => {
              setItemToDelete(id);
              setIsConfirmOpen(true);
            }}
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
            {editingId ? "Editar Situação" : "Nova Situação"}
          </h2>
          <div className="p-4 grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Abreviação (Máx 2) <span className="text-red-500">*</span>
              </label>
              <input
                name="StaAbreviatura"
                value={formData.StaAbreviatura}
                onChange={handleChange}
                maxLength={2}
                type="text"
                placeholder="Ex: AT"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Descrição (Máx 50) <span className="text-red-500">*</span>
              </label>
              <input
                name="StaDescricao"
                value={formData.StaDescricao}
                onChange={handleChange}
                maxLength={50}
                type="text"
                placeholder="Ex: Ativo"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Área (Máx 1) <span className="text-red-500">*</span>
              </label>
              <input
                name="StaArea"
                value={formData.StaArea}
                onChange={handleChange}
                maxLength={1}
                type="text"
                placeholder="Ex: A"
                className="p-2 w-full rounded border border-gray-300"
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
              onClick={onSave}
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
          message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}