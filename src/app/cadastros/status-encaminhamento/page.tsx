"use client";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaStatus, {
  StatusEncaminhamento,
} from "@/components/tabelas/tabelastatusencaminhamento";
import Pagination from "@/components/pagination";
import { useCrud } from "@/hooks/useCrud";
import { useForm } from "react-hook-form";
interface SteFormData {
  Ste_Codigo: string;
  Ste_Descricao: string;
}
export default function StatusEncaminhamentoPage() {
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
  } = useCrud<StatusEncaminhamento>({ endpoint: "/status-encaminhamento" });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SteFormData>({
    defaultValues: { Ste_Codigo: "", Ste_Descricao: "" },
  });
  const openModalNew = () => {
    reset();
    resetFormAndLoad();
  };
  const handleEdit = (item: StatusEncaminhamento) => {
    setValue("Ste_Codigo", item.Ste_Codigo);
    setValue("Ste_Descricao", item.Ste_Descricao);
    setEditingId(item.Ste_Codigo);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  const onSubmit = async (data: SteFormData) => {
    const success = await handleSalvar(editingId as string, data);
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
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 pr-10 w-72 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
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
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Novo Status
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaStatus
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
            {editingId ? "Editar Status" : "Novo Status"}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="p-4 grid grid-cols-1 gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Código do Status (Máx 2){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("Ste_Codigo", { required: true, maxLength: 2 })}
                  type="text"
                  disabled={!!editingId} 
                  placeholder="Ex: AP"
                  className={`p-2 w-full rounded border disabled:bg-gray-100 ${
                    errors.Ste_Codigo ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.Ste_Codigo && (
                  <span className="text-red-500 text-xs">
                    Código (ex: AP) é obrigatório!
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Descrição do Status (Máx 50){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("Ste_Descricao", {
                    required: true,
                    maxLength: 50,
                  })}
                  type="text"
                  placeholder="Ex: Em Processo"
                  className={`p-2 w-full rounded border ${
                    errors.Ste_Descricao ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.Ste_Descricao && (
                  <span className="text-red-500 text-xs">
                    Descrição do status é obrigatória!
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
          message="Tem certeza que deseja excluir este status? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}