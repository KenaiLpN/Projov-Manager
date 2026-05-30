"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { downloadElementAsPdf } from "@/utils/downloadElementAsPdf";

interface RelatorioData {
  CodAprendiz: number;
  Aprendiz: string;
  Parceiro: string;
  CNPJParceiro: string;
  InicioAprendizagem: string | null;
  PrevTermino: string | null;
  Turma: string;
  DataInicioTurma: string;
  DataTerminoTurma: string;
}

export default function ListaJovensCargaHorariaPage() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [data, setData] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const listaJovensPdfRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/relatorio/carga_horaria_final", {
        params: { startDate, endDate },
      });
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.Aprendiz.toLowerCase().includes(term) ||
      item.Parceiro.toLowerCase().includes(term) ||
      item.CodAprendiz.toString().includes(term)
    );
  });

  const handleDownloadPdf = async () => {
    if (!listaJovensPdfRef.current || filteredData.length === 0) {
      toast.error("Nao ha dados para gerar o PDF.");
      return;
    }

    setPdfLoading(true);
    try {
      await downloadElementAsPdf(listaJovensPdfRef.current, {
        filename: `lista-jovens-carga-horaria-${startDate}-${endDate}.pdf`,
        orientation: "landscape",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header azul como no print */}
        <div className="bg-[#133c86] p-4 flex justify-between items-center text-white">
          <h1 className="text-xl font-bold uppercase tracking-wide">Lista Jovens Carga Horaria Final</h1>
          <div className="text-sm">
             Pedagógico / Lista Jovens Carga Horaria Final
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Data Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Data Término</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#133c86] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-6 py-2 bg-[#0096da] hover:bg-[#007cb5] text-white font-bold rounded transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? "Processando..." : "Pesquisar"}
              </button>
              <button 
                onClick={handleDownloadPdf}
                disabled={loading || pdfLoading || filteredData.length === 0}
                className="px-6 py-2 bg-[#0096da] hover:bg-[#007cb5] text-white font-bold rounded transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {pdfLoading ? "Gerando PDF..." : "Baixar PDF"}
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Mostrar</span>
                  <select className="border border-gray-300 rounded p-1 text-sm outline-none">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-sm text-gray-600">registros</span>
               </div>
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

            <div ref={listaJovensPdfRef} className="bg-white">
              <div className="px-4 py-3 text-center">
                <h2 className="text-base font-bold text-[#133c86]">Lista Jovens Carga Horaria Final</h2>
                <p className="text-xs text-gray-500">
                  Periodo: {formatDate(startDate)} a {formatDate(endDate)} - {filteredData.length} registro(s)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Cod. Aprendiz</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Aprendiz</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Parceiro</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">CNPJ Parceiro</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100 uppercase">Início Aprendizagem</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100 uppercase">Prev. Término</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Turma</th>
                    <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Data Início da Turma</th>
                    <th className="p-3 text-sm font-bold text-gray-800">Data Término da Turma</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500 italic">Carregando dados...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado para este período.</td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.CodAprendiz}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100 font-medium">{item.Aprendiz}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Parceiro}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100 font-mono">{item.CNPJParceiro}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{formatDate(item.InicioAprendizagem)}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{formatDate(item.PrevTermino)}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Turma}</td>
                        <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{formatDate(item.DataInicioTurma)}</td>
                        <td className="p-3 text-sm text-gray-700">{formatDate(item.DataTerminoTurma)}</td>
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
    </div>
  );
}
