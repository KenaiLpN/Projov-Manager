"use client";
import { useState, useEffect } from "react";
import { EstatSidebar } from "@/components/estatsidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface RelatorioData {
  Log_Aprendiz: string;
  Log_usuario: string;
  Log_Data: string;
  Log_Tela: string;
  Log_Ip: string;
  Log_Turma: string;
}

export default function ListaAprendizPorParceiro() {
  const [data, setData] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/estatisticalogtransacoes");
      setData(response.data);
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };
  // src/app/estatisticas/geral_aprendiz/page.tsx

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    
    // Use optional chaining and fallback to empty string
    const nomefantasia = (item.Log_Aprendiz ?? "").toLowerCase();

    return (
        item.Log_Aprendiz?.toLowerCase().includes(term) ||
        item.Log_usuario?.toLowerCase().includes(term) ||
        item.Log_Data?.toLowerCase().includes(term) ||
        item.Log_Tela?.toLowerCase().includes(term) ||
        item.Log_Ip?.toLowerCase().includes(term) ||
        item.Log_Turma?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      <EstatSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header azul como no print */}
        <div className="bg-[#133c86] p-4 flex justify-between items-center text-white">
          <h1 className="text-xl font-bold uppercase tracking-wide">Lista LOG Transação</h1>
          <div className="text-sm">
             Estatística / Lista LOG Transação
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
     
          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">

               <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Procurar:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86]"
                  />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Código</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Nome</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Data Log</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Tela </th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">IP</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Turma </th>

                    {/* <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Quantitativo </th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Analitico </th> */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 italic">Carregando dados...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado para este período.</td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}>
                        
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100 font-medium">{item.Parceiro}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Unidade}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Aprendiz}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.PesquisaCodigo}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.MesLiteral}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.PepAno}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.PepRealizada}</td>
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
