"use client";

import { useEffect, useState } from "react";
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

const logColumns = [
  { label: "Aprendiz", field: "Log_Aprendiz" },
  { label: "Usuario", field: "Log_usuario" },
  { label: "Data Log", field: "Log_Data" },
  { label: "Tela", field: "Log_Tela" },
  { label: "IP", field: "Log_Ip" },
  { label: "Turma", field: "Log_Turma" },
] as const;

export default function ListaLogTransacao() {
  const [data, setData] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<RelatorioData[]>("/estatisticalogtransacoes");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar relatorio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return logColumns.some(({ field }) =>
      String(item[field] ?? "").toLowerCase().includes(term),
    );
  });

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      <EstatSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-[#133c86] p-4 flex justify-between items-center text-white">
          <h1 className="text-xl font-bold uppercase tracking-wide">Lista LOG Transacao</h1>
          <div className="text-sm">Estatistica / Lista LOG Transacao</div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
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
                    {logColumns.map(({ label }) => (
                      <th
                        key={label}
                        className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={logColumns.length} className="p-8 text-center text-gray-500 italic">
                        Carregando dados...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={logColumns.length} className="p-8 text-center text-gray-500 italic">
                        Nenhum registro encontrado para este periodo.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr
                        key={`${item.Log_Data}-${item.Log_usuario}-${idx}`}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}
                      >
                        {logColumns.map(({ field }, columnIndex) => (
                          <td
                            key={field}
                            className={`p-3 text-sm text-gray-700 border-r border-gray-100 ${columnIndex === 0 ? "font-medium" : ""}`}
                          >
                            {item[field] || "-"}
                          </td>
                        ))}
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
