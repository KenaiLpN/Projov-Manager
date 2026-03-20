"use client";
import { useState, useEffect } from "react";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import TabelaInstituicoes, {
  Instituicao,
} from "@/components/tabelas/tabelainstituicoes";
import Pagination from "@/components/pagination";
interface InstituicaoFormData {
  EscNome: string;
  EscEmail: string;
  EscTelefone: string;
  EscCEP: string;
  EscEndereco: string;
  EscNumeroEndereco: string;
  EscBairro: string;
  EscCidade: string;
  EscEstado: string;
  EscComplemento: string;
  EscDiretor: string;
}
export default function Instituicoes() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const initialFormState: InstituicaoFormData = {
    EscNome: "",
    EscEmail: "",
    EscTelefone: "",
    EscCEP: "",
    EscEndereco: "",
    EscNumeroEndereco: "",
    EscBairro: "",
    EscCidade: "",
    EscEstado: "",
    EscComplemento: "",
    EscDiretor: "",
  };
  const [formData, setFormData] =
    useState<InstituicaoFormData>(initialFormState);
  const [saving, setSaving] = useState<boolean>(false);
  const roles = ["Diretor", "Coordenador", "Secretaria", "TI", "Outro"];
  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];
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
            EscEndereco: data.logradouro,
            EscBairro: data.bairro,
            EscCidade: data.localidade,
            EscEstado: data.uf,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };
  const openModalNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };
  const handleEdit = (item: Instituicao) => {
    setEditingId(item.EscCodigo);
    setFormData({
      EscNome: item.EscNome || "",
      EscEmail: item.EscEmail || "",
      EscTelefone: item.EscTelefone || "",
      EscCEP: item.EscCEP || "",
      EscEndereco: item.EscEndereco || "",
      EscNumeroEndereco: item.EscNumeroEndereco || "",
      EscBairro: item.EscBairro || "",
      EscCidade: item.EscCidade || "",
      EscEstado: item.EscEstado || "",
      EscComplemento: item.EscComplemento || "",
      EscDiretor: item.EscDiretor || "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  async function fetchInstituicoes(
    paginaParaBuscar: number,
    searchTerm: string = "",
  ) {
    setLoading(true);
    try {
      const response = await api.get(
        `/instituicao?page=${paginaParaBuscar}&limit=10&search=${searchTerm}`,
      );
      setInstituicoes(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchInstituicoes(page, search);
  }, [page]);
  const handleSearch = () => {
    setPage(1);
    fetchInstituicoes(1, search);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchInstituicoes(1, "");
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
      await api.delete(`/instituicao/${itemToDelete}`);
      toast.success("Instituição excluída com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchInstituicoes(page, search);
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      const msg = err.response?.data?.message || "Erro ao excluir.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };
  const handleSalvar = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/instituicao/${editingId}`, formData);
        toast.success("Instituição atualizada com sucesso!");
      } else {
        await api.post("/instituicao", formData);
        toast.success("Instituição cadastrada com sucesso!");
      }
      closeModal();
      fetchInstituicoes(page, search);
    } catch (err: any) {
      console.error("Erro completo:", err);
      if (err.response?.data) {
        toast.error(`Erro: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error("Erro ao salvar instituição.");
      }
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
                placeholder="Buscar instituições..."
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
            Nova Instituição
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <TabelaInstituicoes
            instituicoes={instituicoes}
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
            {editingId ? "Editar Instituição" : "Nova Instituição"}
          </h2>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome da Instituição <span className="text-red-500">*</span>
              </label>
              <input
                name="EscNome"
                value={formData.EscNome}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Diretor / Responsável
              </label>
              <input
                name="EscDiretor"
                value={formData.EscDiretor}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="EscEmail"
                value={formData.EscEmail}
                onChange={handleChange}
                type="email"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Telefone da Instituição
              </label>
              <input
                name="EscTelefone"
                value={formData.EscTelefone}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <hr className="md:col-span-2 my-2" />
            <p className="md:col-span-2 text-sm font-bold text-gray-500">
              Endereço
            </p>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">CEP</label>
              <input
                name="EscCEP"
                value={formData.EscCEP}
                onChange={handleChange}
                onBlur={(e) => buscaCEP(e.target.value)}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Estado
              </label>
              <select
                name="EscEstado"
                value={formData.EscEstado}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300 cursor-pointer"
              >
                <option value="">UF</option>
                {estados.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Cidade
              </label>
              <input
                name="EscCidade"
                value={formData.EscCidade}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Bairro
              </label>
              <input
                name="EscBairro"
                value={formData.EscBairro}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Endereço
              </label>
              <input
                name="EscEndereco"
                value={formData.EscEndereco}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Número
              </label>
              <input
                name="EscNumeroEndereco"
                value={formData.EscNumeroEndereco}
                onChange={handleChange}
                type="text"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">
                Complemento
              </label>
              <input
                name="EscComplemento"
                value={formData.EscComplemento}
                onChange={handleChange}
                type="text"
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