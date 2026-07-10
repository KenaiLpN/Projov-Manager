"use client";
/* eslint-disable react-hooks/exhaustive-deps -- buscas paginadas legadas usam botao/Enter para search */
import { useState, useEffect } from "react";
import { AcessoSidebar } from "@/components/acessosidebar";
import Modal from "@/components/modal";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/modal/ConfirmModal";
import Pagination from "@/components/pagination";

interface FuncaoSistema {
  FunSCodigo: number;
  FunSDescricao: string;
  FunSNomeForm: string;
}

export default function FuncoesSistemaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lista, setLista] = useState<FuncaoSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    FunSDescricao: "",
    FunSNomeForm: "",
  });

  const fetchData = async (p: number, s: string = search) => {
    setLoading(true);
    try {
      const resp = await api.get(`/funcoes-sistema?page=${p}&limit=10&search=${s}`);
      setLista(resp.data.data);
      setTotalPages(resp.data.pages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, search);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchData(1, "");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
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
    if (!formData.FunSDescricao.trim() || !formData.FunSNomeForm.trim()) {
      toast.error("Todos os campos são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/funcoes-sistema/${editingId}`, formData);
        toast.success("Atualizado com sucesso!");
      } else {
        await api.post("/funcoes-sistema", formData);
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

  const handleEdit = (f: FuncaoSistema) => {
    setEditingId(f.FunSCodigo);
    setFormData({
      FunSDescricao: f.FunSDescricao,
      FunSNomeForm: f.FunSNomeForm,
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/funcoes-sistema/${itemToDelete}`);
      toast.success("Excluído com sucesso!");
      setIsConfirmOpen(false);
      setItemToDelete(null);
      fetchData(page);
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  return (
    <div className="flex flex-row h-full w-full">
      <aside>
        <AcessoSidebar />
      </aside>

      <div className="flex flex-col w-full h-full">
        <div className="flex bg-[#bacce6] p-2 h-20 m-5 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por descrição ou formulário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-80 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            onClick={() => {
              setEditingId(null);
              setFormData({ FunSDescricao: "", FunSNomeForm: "" });
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-[#123A83] text-white font-semibold rounded-lg shadow-md hover:bg-[#0f2e6b] mr-4 cursor-pointer"
          >
            Nova Função
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-5">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-[#133c86] text-white text-left">
                <tr>
                  <th className="px-6 py-3 font-semibold text-sm uppercase">Código</th>
                  <th className="px-6 py-3 font-semibold text-sm uppercase">Descrição</th>
                  <th className="px-6 py-3 font-semibold text-sm uppercase">Formulário</th>
                  <th className="px-6 py-3 font-semibold text-sm uppercase text-center w-32">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center">Carregando...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-red-500">{error}</td></tr>
                ) : lista.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center">Nenhum registro encontrado.</td></tr>
                ) : (
                  lista.map((f) => (
                    <tr key={f.FunSCodigo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{f.FunSCodigo}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{f.FunSDescricao}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono italic">{f.FunSNomeForm}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(f)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 20 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(f.FunSCodigo);
                              setIsConfirmOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Excluir"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4">
            {!loading && !error && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            )}
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-2xl font-bold m-4 text-gray-800 border-b pb-2">
            {editingId ? "Editar Função do Sistema" : "Nova Função do Sistema"}
          </h2>
          <div className="p-4 grid grid-cols-1 gap-4 ">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Descrição da Função</label>
              <input
                value={formData.FunSDescricao}
                onChange={(e) => setFormData(p => ({ ...p, FunSDescricao: e.target.value }))}
                type="text"
                placeholder="Ex: Cadastro de Alunos - Visualização"
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Identificador do Form</label>
              <input
                value={formData.FunSNomeForm}
                onChange={(e) => setFormData(p => ({ ...p, FunSNomeForm: e.target.value }))}
                type="text"
                placeholder="Ex: frmCadAlunos"
                className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none font-mono"
              />
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
               <p className="text-xs text-yellow-800 leading-tight">
                 <strong>Nota:</strong> O identificador do formulário deve corresponder exatamente ao nome utilizado no sistema legado para controle de acesso.
               </p>
            </div>
          </div>
          <div className="flex justify-end gap-4 m-4 pt-4 border-t">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button
              onClick={requestSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold shadow-sm"
            >
              {saving ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          message="Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita."
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
