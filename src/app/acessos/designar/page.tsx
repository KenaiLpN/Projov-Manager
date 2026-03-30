"use client";
import { useState, useEffect } from "react";
import { AcessoSidebar } from "@/components/acessosidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import Pagination from "@/components/pagination";

interface Usuario {
  UsuCodigo: string;
  UsuNome: string;
  UsuEmail: string;
  UsuTipo: string;
  chk_ativo: boolean;
}

export default function DesignarFuncoesPage() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const commonRoles = [
    "Administrador",
    "Coordenador",
    "Monitor",
    "Orientador",
    "Secretaria",
    "Financeiro",
    "Pedagógico",
    "Empresa",
    "Aprendiz"
  ];

  const fetchData = async (p: number, s: string = search) => {
    setLoading(true);
    try {
      const resp = await api.get(`/users?page=${p}&limit=10&search=${s}`);
      setLista(resp.data.data);
      setTotalPages(resp.data.meta.totalPages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar usuários.");
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

  const handleRoleChange = async (usuCodigo: string, nextRole: string) => {
    setUpdating(usuCodigo);
    try {
      await api.put(`/users/${usuCodigo}`, { UsuTipo: nextRole });
      toast.success("Cargo atualizado com sucesso!");
      setLista(prev => prev.map(u => u.UsuCodigo === usuCodigo ? { ...u, UsuTipo: nextRole } : u));
    } catch (err) {
      toast.error("Erro ao atualizar o cargo.");
    } finally {
      setUpdating(null);
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
                placeholder="Buscar usuário por nome, e-mail ou código..."
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
          <div className="flex items-center gap-2 mr-6 text-[#133c86] font-bold">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
             <span>Designar Funções</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-5">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-[#133c86] text-white text-left">
                <tr>
                  <th className="px-6 py-3 font-semibold text-sm uppercase">Cód. / Nome</th>
                  <th className="px-6 py-3 font-semibold text-sm uppercase">E-mail</th>
                  <th className="px-6 py-3 font-semibold text-sm uppercase">Status</th>
                  <th className="px-6 py-3 font-semibold text-sm uppercase text-center w-64">Designação de Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center">Carregando...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-red-500">{error}</td></tr>
                ) : lista.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center">Nenhum usuário encontrado.</td></tr>
                ) : (
                  lista.map((u) => (
                    <tr key={u.UsuCodigo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 uppercase">{u.UsuNome}</span>
                          <span className="text-[10px] text-blue-800 font-mono">#{u.UsuCodigo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.UsuEmail || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.chk_ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.chk_ativo ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.UsuTipo || ""}
                            onChange={(e) => handleRoleChange(u.UsuCodigo, e.target.value)}
                            disabled={updating === u.UsuCodigo}
                            className="p-2 w-full rounded border border-gray-300 focus:ring-2 focus:ring-[#133c86] outline-none text-sm font-semibold uppercase disabled:opacity-50"
                          >
                            <option value="" disabled>Selecione um Cargo</option>
                            {commonRoles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          {updating === u.UsuCodigo && (
                            <div className="w-5 h-5 border-2 border-[#133c86]/20 border-t-[#133c86] rounded-full animate-spin shrink-0" />
                          )}
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
      </div>
    </div>
  );
}
