"use client";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaFeriados, { Feriado } from "@/components/tabelas/tabelaferiados";
import Pagination from "@/components/pagination";
import { useCrud } from "@/hooks/useCrud";
import { useForm } from "react-hook-form";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
interface FeriadoFormData {
  FerDescricao: string;
  FerData: string; 
  FerUnidade: string;
}
export default function FeriadosPage() {
  const {
    lista,
    loading,
    error,
    page,
    totalPages,
    search,
    isModalOpen,
    saving,
    isConfirmOpen,
    deleting,
    setPage,
    setSearch,
    setIsModalOpen,
    setIsConfirmOpen,
    setItemToDelete,
    confirmDelete,
    handleSalvar,
    resetFormAndLoad,
  } = useCrud<Feriado>({ endpoint: "/feriado" });
  const [editingUnidadeData, setEditingUnidadeData] = useState<string | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeriadoFormData>({
    defaultValues: { FerDescricao: "", FerData: "", FerUnidade: "" },
  });
  const openModalNew = () => {
    reset();
    setEditingUnidadeData(null);
    resetFormAndLoad();
  };
  const handleEdit = (item: Feriado) => {
    const dataFormatada = item.FerData
      ? new Date(item.FerData).toISOString().split("T")[0]
      : "";
    setValue("FerDescricao", item.FerDescricao);
    setValue("FerData", dataFormatada);
    setValue("FerUnidade", String(item.FerUnidade));
    setEditingUnidadeData(`${item.FerUnidade}/${dataFormatada}`);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUnidadeData(null);
  };
  const onSubmit = async (data: FeriadoFormData) => {
    const success = await handleSalvar(editingUnidadeData, {
      ...data,
      FerUnidade: Number(data.FerUnidade), 
    });
    if (success) {
      reset();
      setEditingUnidadeData(null);
    }
  };
  const handleDelete = (item: Feriado) => {
    const dataFormatada = new Date(item.FerData).toISOString().split("T")[0];
    setItemToDelete(`${item.FerUnidade}/${dataFormatada}`);
    setIsConfirmOpen(true);
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
              placeholder="Buscar por descrição, unidade..."
            />
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Novo Feriado
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaFeriados
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
            {editingUnidadeData ? "Editar Feriado" : "Novo Feriado"}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="p-4 grid grid-cols-1 gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Descrição do Feriado
                </label>
                <input
                  {...register("FerDescricao", {
                    required: true,
                    maxLength: 50,
                  })}
                  type="text"
                  placeholder="Ex: Confraternização Universal"
                  className={`p-2 w-full rounded border ${
                    errors.FerDescricao ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.FerDescricao && (
                  <span className="text-red-500 text-xs">
                    Descrição do feriado é obrigatória!
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Data
                  </label>
                  <input
                    {...register("FerData", { required: true })}
                    type="date"
                    className={`p-2 w-full rounded border ${
                      errors.FerData ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.FerData && (
                    <span className="text-red-500 text-xs">
                      A data é obrigatória!
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Unidade
                  </label>
                  <input
                    {...register("FerUnidade", { required: true })}
                    type="number"
                    placeholder="Ex: 1"
                    className={`p-2 w-full rounded border ${
                      errors.FerUnidade ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.FerUnidade && (
                    <span className="text-red-500 text-xs">
                      A unidade é obrigatória!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 m-4 pt-4 border-t mt-auto">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors cursor-pointer"
              >
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </Modal>
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          message="Tem certeza que deseja excluir este feriado? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}