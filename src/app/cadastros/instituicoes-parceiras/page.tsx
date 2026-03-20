"use client";
import { useState, useEffect } from "react";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaInstituicoesParceiras, {
  InstituicaoParceira,
} from "@/components/tabelas/tabelainstituicoesparceiras";
import Pagination from "@/components/pagination";
interface ParceiroFormData {
  IpaDescricao: string;
  IpaNomeContato: string;
  IpaCEP: string;
  IpaEndereco: string;
  IpaNumeroEndereco: string;
  IpaBairro: string;
  IpaCidade: string;
  IpaEstado: string;
  IpaComplemento: string;
  IpaEmail: string;
  IpaTelefone: string;
  IpaCelular: string;
}
export default function InstituicoesParceirasPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<InstituicaoParceira[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<ParceiroFormData>({
    IpaDescricao: "",
    IpaNomeContato: "",
    IpaCEP: "",
    IpaEndereco: "",
    IpaNumeroEndereco: "",
    IpaBairro: "",
    IpaCidade: "",
    IpaEstado: "",
    IpaComplemento: "",
    IpaEmail: "",
    IpaTelefone: "",
    IpaCelular: "",
  });
  const buscaCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            IpaEndereco: data.logradouro,
            IpaBairro: data.bairro,
            IpaCidade: data.localidade,
            IpaEstado: data.uf,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };
  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      IpaDescricao: "",
      IpaNomeContato: "",
      IpaCEP: "",
      IpaEndereco: "",
      IpaNumeroEndereco: "",
      IpaBairro: "",
      IpaCidade: "",
      IpaEstado: "",
      IpaComplemento: "",
      IpaEmail: "",
      IpaTelefone: "",
      IpaCelular: "",
    });
    setIsModalOpen(true);
  };
  const handleEdit = (item: InstituicaoParceira) => {
    setEditingId(item.IpaCodigo);
    setFormData({
      IpaDescricao: item.IpaDescricao || "",
      IpaNomeContato: item.IpaNomeContato || "",
      IpaCEP: item.IpaCEP || "",
      IpaEndereco: item.IpaEndereco || "",
      IpaNumeroEndereco: item.IpaNumeroEndereco || "",
      IpaBairro: item.IpaBairro || "",
      IpaCidade: item.IpaCidade || "",
      IpaEstado: item.IpaEstado || "",
      IpaComplemento: item.IpaComplemento || "",
      IpaEmail: item.IpaEmail || "",
      IpaTelefone: item.IpaTelefone || "",
      IpaCelular: item.IpaCelular || "",
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
        `/instituicoes-parceiras?page=${pagina}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`,
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
    const delayDebounceFn = setTimeout(() => {
      fetchData(page, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);
  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await api.delete(`/instituicoes-parceiras/${itemToDelete}`);
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
  const handleSalvar = async () => {
    setSaving(true);
    try {
      if (!formData.IpaDescricao) {
        toast.error("A descrição é obrigatória.");
        setSaving(false);
        return;
      }
      const payload = {
        IpaDescricao: formData.IpaDescricao,
        IpaEndereco: formData.IpaEndereco,
        IpaNumeroEndereco: formData.IpaNumeroEndereco,
        IpaComplemento: formData.IpaComplemento,
        IpaBairro: formData.IpaBairro,
        IpaCidade: formData.IpaCidade,
        IpaEstado: formData.IpaEstado,
        IpaCEP: formData.IpaCEP,
        IpaEmail: formData.IpaEmail,
        IpaTelefone: formData.IpaTelefone,
        IpaCelular: formData.IpaCelular,
        IpaNomeContato: formData.IpaNomeContato,
      };
      if (editingId) {
        await api.put(`/instituicoes-parceiras/${editingId}`, payload);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/instituicoes-parceiras", payload);
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
        <CadSidebar />
      </aside>
      <div className="flex flex-col w-full h-full">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, cidade..."
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
            Nova Instituição Parceira
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaInstituicoesParceiras
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
            {editingId ? "Editar Parceiro" : "Novo Parceiro"}
          </h2>
          <div className="p-4 grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome do Parceiro <span className="text-red-500">*</span>
              </label>
              <input
                name="IpaDescricao"
                value={formData.IpaDescricao}
                onChange={handleChange}
                type="text"
                maxLength={80}
                placeholder="Nome da Instituição"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <hr className="my-2" />
            <p className="text-sm font-bold text-gray-500">Endereço</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  CEP
                </label>
                <input
                  name="IpaCEP"
                  value={formData.IpaCEP}
                  onChange={handleChange}
                  onBlur={(e) => buscaCEP(e.target.value)}
                  type="text"
                  placeholder="00000-000"
                  className="p-2 w-full rounded border border-gray-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Estado (UF)
                </label>
                <input
                  name="IpaEstado"
                  value={formData.IpaEstado}
                  onChange={handleChange}
                  type="text"
                  maxLength={2}
                  className="p-2 w-full rounded border border-gray-300"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Cidade
              </label>
              <input
                name="IpaCidade"
                value={formData.IpaCidade}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Logradouro
                </label>
                <input
                  name="IpaEndereco"
                  value={formData.IpaEndereco}
                  onChange={handleChange}
                  type="text"
                  maxLength={100}
                  className="p-2 w-full rounded border border-gray-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Número
                </label>
                <input
                  name="IpaNumeroEndereco"
                  value={formData.IpaNumeroEndereco}
                  onChange={handleChange}
                  type="text"
                  maxLength={6}
                  className="p-2 w-full rounded border border-gray-300"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Bairro
              </label>
              <input
                name="IpaBairro"
                value={formData.IpaBairro}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Complemento
              </label>
              <input
                name="IpaComplemento"
                value={formData.IpaComplemento}
                onChange={handleChange}
                type="text"
                maxLength={20}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <hr className="my-2" />
            <p className="text-sm font-bold text-gray-500">Contato</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome do Contato
              </label>
              <input
                name="IpaNomeContato"
                value={formData.IpaNomeContato}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                E-mail
              </label>
              <input
                name="IpaEmail"
                value={formData.IpaEmail}
                onChange={handleChange}
                type="email"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Telefone
                </label>
                <input
                  name="IpaTelefone"
                  value={formData.IpaTelefone}
                  onChange={handleChange}
                  type="text"
                  maxLength={10}
                  placeholder="(00) 0000-0000"
                  className="p-2 w-full rounded border border-gray-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">
                  Celular
                </label>
                <input
                  name="IpaCelular"
                  value={formData.IpaCelular}
                  onChange={handleChange}
                  type="text"
                  maxLength={11}
                  placeholder="(00) 00000-0000"
                  className="p-2 w-full rounded border border-gray-300"
                />
              </div>
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
          message="Tem certeza que deseja excluir esta instituição? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}