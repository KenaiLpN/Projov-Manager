"use client";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaGrauEscolaridade, {
  GrauEscolaridade,
} from "@/components/tabelas/tabelagrauescolaridade";
import Pagination from "@/components/pagination";
import { useCrud } from "@/hooks/useCrud";
import { useForm } from "react-hook-form";
import SearchBar from "@/components/SearchBar";
interface GrauFormData {
  GreDescricao: string;
}
export default function GrauEscolaridadePage() {
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
  } = useCrud<GrauEscolaridade>({ endpoint: "/grau-escolaridade" });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GrauFormData>({
    defaultValues: { GreDescricao: "" },
  });
  const openModalNew = () => {
    reset();
    resetFormAndLoad();
  };
  const handleEdit = (item: GrauEscolaridade) => {
    setValue("GreDescricao", item.GreDescricao);
    setEditingId(item.GreCodigo);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  const onSubmit = async (data: GrauFormData) => {
    const success = await handleSalvar(editingId as number, data);
    if (success) {
      reset();
    }
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
              placeholder="Buscar por descrição..."
            />
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Novo Grau
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaGrauEscolaridade
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
            {editingId ? "Editar Grau" : "Novo Grau"}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="p-4 grid grid-cols-1 gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Descrição do Grau (Máx 50)
                </label>
                <input
                  {...register("GreDescricao", {
                    required: true,
                    maxLength: 50,
                  })}
                  type="text"
                  placeholder="Ex: Ensino Médio Completo"
                  className={`p-2 w-full rounded border ${
                    errors.GreDescricao ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.GreDescricao && (
                  <span className="text-red-500 text-xs">
                    Descrição do grau é obrigatória!
                  </span>
                )}
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
          message="Tem certeza que deseja excluir este grau? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}