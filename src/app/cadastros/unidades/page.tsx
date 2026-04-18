"use client";
import { useState, useEffect } from "react";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "@/components/modal";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import TabelaUnidades from "@/components/tabelas/tabelaunidades";
import Pagination from "@/components/pagination";
import SearchBar from "@/components/SearchBar";
interface UnidadeFormData {
  UniNome: string;
  UniCGC: string;
  UniTelefone: string;
  UniRepresentanteLegal: string;
  UniRepresentanteCargo: string;
  UniEmailPadraoEnvio: string;
  UniCEP: string;
  UniEndereco: string;
  UniNumeroEndereco: string;
  UniComplemento: string;
  UniBairro: string;
  UniCidade: string;
  UniEstado: string;
  UniEnderecoWeb: string;
  UniTipo: string;
  UniDataRefPesquisa: Date;
}
export default function Unidades() {
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<UnidadeFormData>({
    UniNome: "",
    UniCGC: "",
    UniTelefone: "",
    UniRepresentanteLegal: "",
    UniRepresentanteCargo: "",
    UniEmailPadraoEnvio: "",
    UniCEP: "",
    UniEndereco: "",
    UniNumeroEndereco: "",
    UniComplemento: "",
    UniBairro: "",
    UniCidade: "",
    UniEstado: "",
    UniEnderecoWeb: "",
    UniTipo: "",
    UniDataRefPesquisa: new Date(),
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
            UniEndereco: data.logradouro,
            UniBairro: data.bairro,
            UniCidade: data.localidade,
            UniEstado: data.uf,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };
  const [saving, setSaving] = useState<boolean>(false);
  const roles = ["Matriz", "Filial", "Parceiro", "Outro"];
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
  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      UniNome: "",
      UniCGC: "",
      UniTelefone: "",
      UniRepresentanteLegal: "",
      UniRepresentanteCargo: "",
      UniEmailPadraoEnvio: "",
      UniCEP: "",
      UniEndereco: "",
      UniNumeroEndereco: "",
      UniComplemento: "",
      UniBairro: "",
      UniCidade: "",
      UniEstado: "",
      UniEnderecoWeb: "",
      UniTipo: "",
      UniDataRefPesquisa: new Date(),
    });
    setIsModalOpen(true);
  };
  const handleEditUnity = (item: any) => {
    setEditingId(item.UniCodigo);
    setFormData({
      UniNome: item.UniNome || "",
      UniCGC: item.UniCGC || "",
      UniTelefone: item.UniTelefone || "",
      UniRepresentanteLegal: item.UniRepresentanteLegal || "",
      UniRepresentanteCargo: item.UniRepresentanteCargo || "",
      UniEmailPadraoEnvio: item.UniEmailPadraoEnvio || "",
      UniCEP: item.UniCEP || "",
      UniEndereco: item.UniEndereco || "",
      UniNumeroEndereco: item.UniNumeroEndereco || "",
      UniComplemento: item.UniComplemento || "",
      UniBairro: item.UniBairro || "",
      UniCidade: item.UniCidade || "",
      UniEstado: item.UniEstado || "",
      UniEnderecoWeb: item.UniEnderecoWeb || "",
      UniTipo: item.UniTipo || "",
      UniDataRefPesquisa: item.UniDataRefPesquisa || new Date(),
    });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };
  async function fetchUnidades(
    paginaParaBuscar: number,
    searchTerm: string = search,
  ) {
    setLoading(true);
    try {
      const response = await api.get(
        `/unidade?page=${paginaParaBuscar}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
      );
      setUnidades(response.data.data);
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
    fetchUnidades(1, search);
  };
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchUnidades(1, "");
  };
  useEffect(() => {
    fetchUnidades(page);
  }, [page]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleDeleteUnity = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/unidade/${itemToDelete}`);
      toast.success("Unidade excluída com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchUnidades(page);
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      const msg = err.response?.data?.message || "Erro ao excluir unidade.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };
  const handleSalvar = async () => {
    setSaving(true);
    try {
      const payload: any = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof UnidadeFormData];
        if (typeof value === "string" && value.trim() === "") return;
        payload[key] = value;
      });
      if (editingId) {
        await api.put(`/unidade/${editingId}`, payload);
        toast.success("Unidade atualizada com sucesso!");
      } else {
        await api.post("/unidade", payload);
        toast.success("Unidade cadastrada com sucesso!");
      }
      closeModal();
      fetchUnidades(page);
    } catch (err: any) {
      console.error("Erro completo:", err);
      if (err.response?.data) {
        toast.error(`Erro de validação: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error("Erro ao salvar unidade.");
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
      <div className="flex flex-col w-full h-full ">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center">
          <div className="ml-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Buscar unidades..."
            />
          </div>
          <button
            onClick={openModalNew}
            className="px-6 py-3 bg-[#34495E] text-white font-semibold rounded-lg shadow-md hover:bg-[#253341a4] mr-4 cursor-pointer"
          >
            Nova Unidade
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {}
          <TabelaUnidades
            unidades={unidades}
            loading={loading}
            error={error}
            onEdit={handleEditUnity}
            onDelete={handleDeleteUnity}
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
            {editingId ? "Editar Unidade" : "Cadastro de Unidades"}
          </h2>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome da Unidade
              </label>
              <input
                name="UniNome"
                value={formData.UniNome}
                onChange={handleChange}
                type="text"
                maxLength={60}
                placeholder="Nome da Unidade"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                CGC / CNPJ
              </label>
              <input
                name="UniCGC"
                value={formData.UniCGC}
                onChange={handleChange}
                type="text"
                maxLength={18}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Telefone da Unidade
              </label>
              <input
                name="UniTelefone"
                value={formData.UniTelefone}
                onChange={handleChange}
                type="text"
                maxLength={10}
                placeholder="Ex: 1140028922"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Representante Legal
              </label>
              <input
                name="UniRepresentanteLegal"
                value={formData.UniRepresentanteLegal}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Cargo do Representante
              </label>
              <input
                name="UniRepresentanteCargo"
                value={formData.UniRepresentanteCargo}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Email Padrão de Envio
              </label>
              <input
                name="UniEmailPadraoEnvio"
                value={formData.UniEmailPadraoEnvio}
                onChange={handleChange}
                type="text"
                maxLength={80}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Tipo
              </label>
              <select
                name="UniTipo"
                value={formData.UniTipo}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300 cursor-pointer"
              >
                <option value="">Selecione...</option>
                <option value="M">Matriz</option>
                <option value="F">Filial</option>
                <option value="P">Parceiro</option>
                <option value="O">Outro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">CEP</label>
              <input
                name="UniCEP"
                value={formData.UniCEP}
                onChange={handleChange}
                onBlur={(e) => buscaCEP(e.target.value)}
                type="text"
                maxLength={8}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Estado
              </label>
              <select
                name="UniEstado"
                value={formData.UniEstado}
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Cidade
              </label>
              <input
                name="UniCidade"
                value={formData.UniCidade}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Bairro
              </label>
              <input
                name="UniBairro"
                value={formData.UniBairro}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Endereço (Logradouro)
              </label>
              <input
                name="UniEndereco"
                value={formData.UniEndereco}
                onChange={handleChange}
                type="text"
                maxLength={50}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Número
              </label>
              <input
                name="UniNumeroEndereco"
                value={formData.UniNumeroEndereco}
                onChange={handleChange}
                type="text"
                maxLength={6}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Complemento
              </label>
              <input
                name="UniComplemento"
                value={formData.UniComplemento}
                onChange={handleChange}
                type="text"
                maxLength={30}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            {}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-600">
                Endereço Web (Site)
              </label>
              <input
                name="UniEnderecoWeb"
                value={formData.UniEnderecoWeb}
                onChange={handleChange}
                type="text"
                maxLength={80}
                placeholder="Ex: www.fundacaofat.org.br"
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
          message="Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}
