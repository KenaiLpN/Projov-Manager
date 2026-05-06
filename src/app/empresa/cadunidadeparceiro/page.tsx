"use client";
import { useState, useEffect } from "react";
import { EmpSidebar } from "@/components/empsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaUnidadeParceiro, {
  UnidadeParceiro,
} from "@/components/tabelas/tabelaunidadeparceiro";
import Pagination from "@/components/pagination";
interface Empresa {
  ParCodigo: number;
  ParDescricao: string;
}
interface UnidadeFormData {
  ParUniCodigoParceiro: string;
  ParUniDescricao: string;
  ParUniCNPJ: string;
  ParUniEndereco: string;
  ParUniNumeroEndereco: string;
  ParUniComplemento: string;
  ParUniBairro: string;
  ParUniCidade: string;
  ParUniEstado: string;
  ParUniEmail: string;
  ParUniNomeContato: string;
}
export default function CadUnidadeParceiroPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<{
    codigo: number;
    parceiro: number;
  } | null>(null);
  const [lista, setLista] = useState<UnidadeParceiro[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    codigo: number;
    parceiroId: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<UnidadeFormData>({
    ParUniCodigoParceiro: "",
    ParUniDescricao: "",
    ParUniCNPJ: "",
    ParUniEndereco: "",
    ParUniNumeroEndereco: "",
    ParUniComplemento: "",
    ParUniBairro: "",
    ParUniCidade: "",
    ParUniEstado: "",
    ParUniEmail: "",
    ParUniNomeContato: "",
  });
  useEffect(() => {
    fetchEmpresas();
  }, []);
  async function fetchEmpresas() {
    try {
      const response = await api.get("/parceiros?limit=100");
      setEmpresas(response.data.data);
    } catch (err) {
      console.error("Erro ao carregar empresas:", err);
    }
  }
  async function fetchData(pagina: number, searchTerm: string = search) {
    setLoading(true);
    try {
      const response = await api.get(
        `/unidades-parceiro?page=${pagina}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
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
      ParUniCodigoParceiro: "",
      ParUniDescricao: "",
      ParUniCNPJ: "",
      ParUniEndereco: "",
      ParUniNumeroEndereco: "",
      ParUniComplemento: "",
      ParUniBairro: "",
      ParUniCidade: "",
      ParUniEstado: "",
      ParUniEmail: "",
      ParUniNomeContato: "",
    });
    setIsModalOpen(true);
  };
  const handleEdit = async (item: UnidadeParceiro) => {
    try {
      const response = await api.get(
        `/unidades-parceiro/${item.ParUniCodigo}/${item.ParUniCodigoParceiro}`,
      );
      const data = response.data;
      setEditingId({
        codigo: item.ParUniCodigo,
        parceiro: item.ParUniCodigoParceiro,
      });
      setFormData({
        ParUniCodigoParceiro: String(data.ParUniCodigoParceiro || ""),
        ParUniDescricao: data.ParUniDescricao || "",
        ParUniCNPJ: data.ParUniCNPJ || "",
        ParUniEndereco: data.ParUniEndereco || "",
        ParUniNumeroEndereco: data.ParUniNumeroEndereco || "",
        ParUniComplemento: data.ParUniComplemento || "",
        ParUniBairro: data.ParUniBairro || "",
        ParUniCidade: data.ParUniCidade || "",
        ParUniEstado: data.ParUniEstado || "",
        ParUniEmail: data.ParUniEmail || "",
        ParUniNomeContato: data.ParUniNomeContato || "",
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Erro ao carregar detalhes da unidade.");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDelete = (codigo: number, parceiroId: number) => {
    setItemToDelete({ codigo, parceiroId });
    setIsConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(
        `/unidades-parceiro/${itemToDelete.codigo}/${itemToDelete.parceiroId}`,
      );
      toast.success("Excluída com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch (err: any) {
      toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  };
  const handleSalvar = async () => {
    if (!formData.ParUniDescricao.trim() || !formData.ParUniCodigoParceiro) {
      toast.error("Descrição e Empresa (Parceiro) são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(
          `/unidades-parceiro/${editingId.codigo}/${editingId.parceiro}`,
          formData,
        );
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/unidades-parceiro", formData);
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
                placeholder="Buscar por descrição ou CNPJ..."
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
            Nova Unidade
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaUnidadeParceiro
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
            {editingId ? "Editar Unidade" : "Nova Unidade"}
          </h2>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Empresa (Parceiro) *
              </label>
              <select
                name="ParUniCodigoParceiro"
                value={formData.ParUniCodigoParceiro}
                onChange={handleChange}
                disabled={!!editingId}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none bg-white"
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((e) => (
                  <option key={e.ParCodigo} value={e.ParCodigo}>
                    {e.ParDescricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Descrição da Unidade *
              </label>
              <input
                name="ParUniDescricao"
                value={formData.ParUniDescricao}
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
                name="ParUniCNPJ"
                value={formData.ParUniCNPJ}
                onChange={handleChange}
                type="text"
                maxLength={14}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome Contato
              </label>
              <input
                name="ParUniNomeContato"
                value={formData.ParUniNomeContato}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                E-mail
              </label>
              <input
                name="ParUniEmail"
                value={formData.ParUniEmail}
                onChange={handleChange}
                type="email"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="col-span-2 border-t mt-2 pt-2">
              <h3 className="font-bold text-gray-700 mb-2">Endereço</h3>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Logradouro
              </label>
              <input
                name="ParUniEndereco"
                value={formData.ParUniEndereco}
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
                name="ParUniNumeroEndereco"
                value={formData.ParUniNumeroEndereco}
                onChange={handleChange}
                type="text"
                maxLength={6}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Complemento
              </label>
              <input
                name="ParUniComplemento"
                value={formData.ParUniComplemento}
                onChange={handleChange}
                type="text"
                maxLength={20}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Bairro
              </label>
              <input
                name="ParUniBairro"
                value={formData.ParUniBairro}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Cidade
              </label>
              <input
                name="ParUniCidade"
                value={formData.ParUniCidade}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Estado (UF)
              </label>
              <input
                name="ParUniEstado"
                value={formData.ParUniEstado}
                onChange={handleChange}
                type="text"
                maxLength={2}
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
              onClick={handleSalvar}
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
          message="Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}