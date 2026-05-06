"use client";
import { useState, useEffect } from "react";
import { EstatSidebar } from "@/components/estatsidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
// Importando componentes do Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const OPCOES_BOTOES = [
  { id: 1, label: "Relatório Mensal" },
  { id: 2, label: "Frequência" },
  { id: 3, label: "Desempenho" },
  { id: 4, label: "Cadastro Novo" },
  { id: 5, label: "Exportar Dados" },
];

interface RelatorioData {
  Qtde: number;
  Turma: string;
}

export default function ListaJovensCargaHorariaPage() {
  const [data, setData] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeForm, setActiveForm] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/participantessituacao/ativos_por_turma");
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

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const codAprendiz = (item.Qtde ?? "").toString();
    const status = (item.Turma ?? "").toLowerCase();
    return codAprendiz.includes(term) || status.includes(term);
  });

  const getActiveLabel = () => OPCOES_BOTOES.find(b => b.id === activeForm)?.label;

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      <EstatSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        <div className="bg-[#133c86] p-4 flex justify-between items-center text-white">
          <h1 className="text-xl font-bold uppercase tracking-wide">Ativos Por Turma</h1>
          <div className="text-sm">Estatística / Ativos Por Turma</div>
        </div>

        {/* Menu de Botões */}
        <div className="bg-white border-b border-gray-200 p-3 flex gap-2 flex-wrap shadow-sm">
          {OPCOES_BOTOES.map((botao) => (
            <button
              key={botao.id}
              onClick={() => setActiveForm(botao.id)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                activeForm === botao.id 
                ? "bg-[#133c86] text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {botao.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeForm !== null ? (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
               <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#133c86]">{getActiveLabel()}</h2>
                <button onClick={() => setActiveForm(null)} className="text-blue-600 hover:underline text-sm">Voltar</button>
               </div>
               <p className="text-gray-500 italic">Conteúdo do formulário {activeForm} aqui...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* --- SEÇÃO DO GRÁFICO --- */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-gray-700 font-bold mb-4 uppercase text-sm tracking-wider">Visualização Gráfica (Ativos por Turma)</h2>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-400">Carregando gráfico...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="Turma" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                          dataKey="Qtde" 
                          fill="#133c86" 
                          radius={[4, 4, 0, 0]} 
                          barSize={40}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* --- SEÇÃO DA TABELA --- */}
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
                        <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Turma</th>
                        <th className="p-3 text-sm font-bold text-gray-800">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={2} className="p-8 text-center text-gray-500">Carregando...</td></tr>
                      ) : filteredData.map((item, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                          <td className="p-3 text-sm text-gray-700 border-r border-gray-100 font-medium">{item.Turma}</td>
                          <td className="p-3 text-sm text-gray-700">{item.Qtde}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}