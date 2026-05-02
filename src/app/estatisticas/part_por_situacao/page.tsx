"use client";
import { useState, useEffect, useMemo } from "react"; // Adicionado useMemo
import { EstatSidebar } from "@/components/estatsidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface RelatorioData {
  QtdeAprendiz: number;
  StatusAprendiz: string;
}

export default function ParticipantesPorSituacaoPage() {
  const [data, setData] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10); // Estado para o select de registros

  const fetchData = async () => {
    setLoading(true);
    try {
        // src/app/estatisticas/part_por_situacao/page.tsx
        const response = await api.get("/participantes-situacao", { 
          params: { page: 1, limit: 10 } // Lembre-se que agora a rota espera query params!
        });

      // const response = await api.get("/participantes-por-situacao/participantes-situacao", {
        
      // });
      setData(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Otimização da busca: só re-calcula se 'data' ou 'searchTerm' mudar
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      item.StatusAprendiz?.toLowerCase().includes(term)
    ).slice(0, rowsPerPage); // Aplica a limitação de registros
  }, [data, searchTerm, rowsPerPage]);

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      <EstatSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#133c86] p-4 flex justify-between items-left text-white shadow-md">
          <h1 className="text-xl font-bold uppercase tracking-wide">Participantes Por Situação</h1>
          <div className="text-sm opacity-80">
             Estatísticas / Participantes Por Situação
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Filtros
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-end gap-6">
            <div className="flex gap-2">
            </div>
          </div> */}

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Mostrar</span>
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded p-1 text-sm outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">registros</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Procurar:</span>
                  <input
                    type="text"
                    placeholder="Filtrar por status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86] transition-all"
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Status Do Jovem</th>
                    <th className="p-3 text-sm font-bold text-gray-800">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-500 italic">Carregando dados...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors border-b border-gray-100`}>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.StatusAprendiz}</td>
                        <td className="p-3 text-sm text-gray-700 font-medium">{item.QtdeAprendiz}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}