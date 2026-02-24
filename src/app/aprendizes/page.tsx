"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AprendizSidebar } from "@/components/aprendizsidebar";
import api from "@/services/api";

// Interface para o Aprendiz baseada no modelo do Prisma
interface AprendizFormData {
  NomeJovem: string;
  NomeSocial?: string;
  CPF?: string;
  RG?: string;
  IdUnidade?: number;
  IdInstituicaoParceira?: number;
  IdEscola?: number;
  IdMonitorResponsavel?: number;
  DataNascimento?: string;
  Sexo?: string;
  Email?: string;
  Celular?: string;
  CEP?: string;
  Logradouro?: string;
  Numero?: string;
  Bairro?: string;
  Municipio?: string;
  UF_Endereco?: string;
  StatusJovem?: string;
}

export default function Aprendizes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";

  const [aprendizes, setAprendizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    fetchAprendizes(page, search, filter);
  }, [page, filter]);

  const fetchAprendizes = async (
    p: number,
    s: string = search,
    f: string = filter,
  ) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/aprendiz?page=${p}&limit=10${s ? `&search=${s}` : ""}${f ? `&filter=${f}` : ""}`,
      );
      setAprendizes(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAprendizes(1, search);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    fetchAprendizes(1, "");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AprendizSidebar />

      <main className="flex-1 flex flex-col p-6 overflow-auto bg-gray-100">
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#133c86]">
              Cadastro de Aprendizes
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie os jovens aprendizes do programa
            </p>
          </div>
          <button
            onClick={() => router.push("/aprendizes/cadaprendizes")}
            className="px-6 py-3 bg-[#133c86] text-white font-semibold rounded-lg hover:bg-[#0f2e6b] transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Novo Aprendiz
          </button>
        </div>

        {/* Search Bar Standardized */}
        <div className="flex bg-[#bacce6] p-2 h-20 mb-6 rounded justify-between items-center">
          <div className="flex items-center gap-2 ml-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-2 pr-10 w-96 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#133c86]"
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
          {filter && (
            <div className="mr-4 flex items-center gap-2">
              <span className="text-xs font-bold text-[#133c86] uppercase">
                Filtro Ativo:
              </span>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-2">
                {filter === "working"
                  ? "Trabalhando"
                  : filter === "available"
                    ? "Disponíveis"
                    : "Férias/Licença"}
                <button
                  onClick={() => router.push("/aprendizes")}
                  className="hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Tabela Modernizada */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Nome
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  CPF
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Unidade
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Calendário
                </th>
                <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Carregando dados...
                  </td>
                </tr>
              ) : aprendizes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Nenhum aprendiz encontrado.
                  </td>
                </tr>
              ) : (
                aprendizes.map((a) => (
                  <tr
                    key={a.IdAluno}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {a.NomeJovem}
                    </td>
                    <td className="p-4 text-gray-600">
                      {a.CPF || "Não informado"}
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm underline decoration-blue-200">
                        {a.unidade?.UniNome || "Não vinculada"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          a.StatusJovem === "Ativo"
                            ? "bg-green-100 text-green-700"
                            : a.StatusJovem === "Inativo"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.StatusJovem}
                      </span>
                    </td>
                    <td className=" text-gray-600">
                      <button
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm"
                        onClick={() =>
                          router.push(`/aprendizes/calendario?id=${a.IdAluno}`)
                        }
                      >
                        Calendário
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          router.push(
                            `/aprendizes/cadaprendizes?id=${a.IdAluno}`,
                          )
                        }
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm"
                      >
                        Ver / Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="mt-4 flex justify-between items-center text-gray-500 text-sm italic">
          <span>
            Mostrando página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
