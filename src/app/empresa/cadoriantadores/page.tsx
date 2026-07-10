"use client";
/* eslint-disable react-hooks/exhaustive-deps -- buscas paginadas legadas usam botao/Enter para search */
import { useState, useEffect } from "react";
import { EmpSidebar } from "@/components/empsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaOrientadores, {
  Orientador,
} from "@/components/tabelas/tabelaorientadores";
import Pagination from "@/components/pagination";
interface Unidade {
  ParUniCodigo: number;
  ParUniDescricao: string;
  EmpresaNome?: string;
}
interface OrientadorFormData {
  OriUnidadeParceiro: string;
  OriNome: string;
  OriTelefone: string;
  OriEmail: string;
}
export default function CadOrientadoresPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<Orientador[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<OrientadorFormData>({
    OriUnidadeParceiro: "",
    OriNome: "",
    OriTelefone: "",
    OriEmail: "",
  });
  useEffect(() => {
    fetchUnidades();
  }, []);
  async function fetchUnidades() {
    try {
      const response = await api.get("/unidades-parceiro?limit=100");
      setUnidades(response.data.data);
    } catch (err) {
      console.error("Erro ao carregar unidades:", err);
    }
  }
  async function fetchData(pagina: number, searchTerm: string = search) {
    setLoading(true);
    try {
      const response = await api.get(
        `/orientadores?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
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
      OriUnidadeParceiro: "",
      OriNome: "",
      OriTelefone: "",
      OriEmail: "",
    });
    setIsModalOpen(true);
  };
  const handleEdit = (item: Orientador) => {
    setEditingId(item.OriCodigo);
    setFormData({
      OriUnidadeParceiro: String(item.OriUnidadeParceiro),
      OriNome: item.OriNome,
      OriTelefone: item.OriTelefone || "",
      OriEmail: item.OriEmail || "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  const handleSearch = () => {
    setPage(1);
    fetchData(1, search);
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      await api.delete(`/orientadores/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch {
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
    if (!formData.OriNome.trim() || !formData.OriUnidadeParceiro) {
      toast.error("Nome e Unidade são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/orientadores/${editingId}`, formData);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/orientadores", formData);
        toast.success("Cadastrado com sucesso!");
      }
      closeModal();
      fetchData(page);
    } catch (err: unknown) {
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
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
            Novo Orientador
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaOrientadores
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
            {editingId ? "Editar Orientador" : "Novo Orientador"}
          </h2>
          <div className="p-4 grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Unidade de Parceiro *
              </label>
              <select
                name="OriUnidadeParceiro"
                value={formData.OriUnidadeParceiro}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none bg-white"
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((u) => (
                  <option key={u.ParUniCodigo} value={u.ParUniCodigo}>
                    {u.EmpresaNome} - {u.ParUniDescricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome do Orientador *
              </label>
              <input
                name="OriNome"
                value={formData.OriNome}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                E-mail
              </label>
              <input
                name="OriEmail"
                value={formData.OriEmail}
                onChange={handleChange}
                type="email"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Telefone
              </label>
              <input
                name="OriTelefone"
                value={formData.OriTelefone}
                onChange={handleChange}
                type="text"
                maxLength={10}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
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
          message="Tem certeza que deseja excluir este orientador? Esta ação não pode ser desfeita."
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
