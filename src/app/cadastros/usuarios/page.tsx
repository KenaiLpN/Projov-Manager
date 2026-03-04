"use client";

import { useState, useEffect } from "react";
import { CadSidebar } from "@/components/cadsidebar";
import Modal from "../../../components/modal";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import TabelaUsuarios from "@/components/tabelas/tabelausuarios";
import api from "@/services/api";
import { Usuario } from "@/types";
import { ROLE_OPTIONS } from "@/utils/roles";
import Pagination from "@/components/pagination";
import { toast } from "react-hot-toast";

export default function CadCliPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    UsuCodigo: "",
    UsuNome: "",
    UsuEmail: "",
    UsuTipo: "",
    UsuSenha: "",
    confirmacao_senha: "",
  });

  const [saving, setSaving] = useState<boolean>(false);

  const openModalNew = () => {
    setEditingId(null);
    setFormData({
      UsuCodigo: "",
      UsuNome: "",
      UsuEmail: "",
      UsuTipo: "",
      UsuSenha: "",
      confirmacao_senha: "",
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (usuario: Usuario) => {
    setEditingId(usuario.UsuCodigo);
    setFormData({
      UsuCodigo: usuario.UsuCodigo,
      UsuNome: usuario.UsuNome || "",
      UsuEmail: usuario.UsuEmail || "",
      UsuTipo: usuario.UsuTipo || "",
      UsuSenha: "",
      confirmacao_senha: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  async function fetchUsuarios(
    paginaParaBuscar: number,
    searchTerm: string = "",
  ) {
    setLoading(true);
    try {
      const response = await api.get(
        `/users?page=${paginaParaBuscar}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
      );

      setUsuarios(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsuarios(page, search);
  }, [page]);

  const handleSearch = () => {
    setPage(1); // Volta para primeira página ao pesquisar
    fetchUsuarios(1, search);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchUsuarios(1, "");
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

  // --- NOVA FUNÇÃO DE DELETE ---
  const handleDeleteUser = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${itemToDelete}`);
      toast.success("Usuário excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchUsuarios(page);
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      const msg = err.response?.data?.message || "Erro ao excluir usuário.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // --- FUNÇÃO CORRIGIDA ---
  const handleSalvar = async () => {
    // 1. Validações Iniciais
    if (formData.UsuSenha !== formData.confirmacao_senha) {
      toast.error("As senhas não coincidem. Por favor, verifique.");
      return;
    }

    if (!editingId && formData.UsuSenha.length < 8) {
      toast.error(
        "Para novos usuários, a senha deve ter pelo menos 8 caracteres.",
      );
      return;
    }

    if (!formData.UsuCodigo) {
      toast.error("Preencha o Código do Usuário.");
      return;
    }

    setSaving(true);

    try {
      // 2. Preparação dos dados (Sanitização)
      const { confirmacao_senha, UsuSenha, ...restOfData } = formData;
      const payload: any = {
        ...restOfData,
      };

      // Se a senha estiver preenchida, inclui no payload
      if (UsuSenha && UsuSenha.trim() !== "") {
        payload.UsuSenha = UsuSenha;
      }

      // 3. Envio para API
      if (editingId) {
        // --- MODO EDIÇÃO (PUT) ---
        await api.put(`/users/${editingId}`, payload);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // --- MODO CRIAÇÃO (POST) ---
        await api.post("/users", payload);
        toast.success("Usuário cadastrado com sucesso!");
      }

      closeModal();
      fetchUsuarios(page); // Atualiza a tabela
    } catch (err: any) {
      // 4. Tratamento de Erro
      console.error("Erro completo:", err);

      if (err.response?.data) {
        console.log("Detalhes do erro Zod:", err.response.data);
        toast.error(`Erro de validação: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error("Erro ao salvar usuário.");
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
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, email, código..."
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
            Novo
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <TabelaUsuarios
            usuarios={usuarios}
            loading={loading}
            error={error}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
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
            {editingId ? "Editar Usuário" : "Cadastro de Usuários"}
          </h2>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Código do Usuário
              </label>
              <input
                name="UsuCodigo"
                value={formData.UsuCodigo}
                onChange={handleChange}
                type="text"
                disabled={!!editingId} // Não pode editar PK
                placeholder="Código Único (ex: USR001)"
                className="p-2 w-full rounded border border-gray-300 disabled:bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Nome
              </label>
              <input
                name="UsuNome"
                value={formData.UsuNome}
                onChange={handleChange}
                type="text"
                placeholder="Nome Completo"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                name="UsuEmail"
                value={formData.UsuEmail}
                onChange={handleChange}
                type="email"
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Função
              </label>
              <select
                name="UsuTipo"
                value={formData.UsuTipo}
                onChange={handleChange}
                className="p-2 w-full rounded border border-gray-300 cursor-pointer"
              >
                <option value="">Selecione a função</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Senha{" "}
                {editingId && (
                  <span className="text-xs font-normal text-gray-500">
                    (Deixe em branco para manter)
                  </span>
                )}
              </label>
              <input
                name="UsuSenha"
                value={formData.UsuSenha}
                onChange={handleChange}
                type="password"
                placeholder={editingId ? "Nova senha (opcional)" : "Senha"}
                className="p-2 w-full rounded border border-gray-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">
                Confirme sua Senha
              </label>
              <input
                name="confirmacao_senha"
                value={formData.confirmacao_senha}
                onChange={handleChange}
                type="password"
                placeholder="Confirme sua Senha"
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
          message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
}
