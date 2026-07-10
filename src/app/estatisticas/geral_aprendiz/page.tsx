"use client";
import { useState, useEffect } from "react";
import { EstatSidebar } from "@/components/estatsidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import {  BarChart, 
          Bar, 
          XAxis, 
          YAxis, 
          CartesianGrid, 
          Tooltip, 
          ResponsiveContainer ,
          PieChart,    
          Pie,
          Cell,
          Legend
        } from 'recharts';
// Importando ícones simples para os botões (opcional, usei texto para facilitar)

const OPCOES_BOTOES = [
  { id: 1, label: "Ativos Por Turma" },
  { id: 2, label: "Ativos Por Área" },
  { id: 3, label: "Ativos Por Cidade" },
  { id: 4, label: "Desligados No Período" },
  { id: 5, label: "Desligador Por Motivo" },
  { id: 6, label: "Alocações Por Parceiro" },
  { id: 7, label: "Ativos Por Unidade" },
  { id: 8, label: "Tipo de Pagamento" },
  { id: 9, label: "Como Conheceu ProJov" },
];

interface EstatisticaGeralItem {
  Qtde?: number;
  Turma?: string;
  d_nome?: string;
  Status?: string;
  Area?: string;
  Cidade?: string;
  d_turma?: string;
  d_unidade?: string;
  d_DataInicio?: string;
  d_DataFim?: string;
  d_benficio?: string;
  d_bolsa?: string;
  d_genero?: string;
  d_situacao?: string;
  d_nascimento?: string;
  d_idade?: string | number;
  Motivo?: string;
  NomeFantasia?: string;
  Descricao?: string;
  Unidade?: string;
  TipoPagamento?: string;
  ConhecInstituicao?: string;
}


export default function ListaJovensCargaHorariaPage() {
  const [data, setData] = useState<EstatisticaGeralItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeForm, setActiveForm] = useState<number | null>(null);

  // --- ESTADOS DE PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Quantidade de linhas por página

      // Chamada do EndPoint para popular tabela de Ativos Por Turma
      const fetchAtivosPorTurma = async () => {
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

    // Chamada do EndPoint para popular tabela de Ativos Por Area
    const fetchAtivosArea = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/ativos_por_area_atuacao");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar áreas.");
      } finally {
        setLoading(false);
      }
    };

   // Chamada do EndPoint para popular tabela de Ativos Por Cidade
    const fetchAtivosCidade = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/ativos_por_cidade");
        setData(response.data);
    } catch {
        toast.error("Erro ao carregar cidades.");
      } finally {
        setLoading(false);
      }
    };
   // Chamada do EndPoint para popular tabela Desligado Por Periodo
    const fetchDesligadosPeriodo = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/desligados_por_periodo");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar desligados.");
      } finally {
        setLoading(false);
      }
    };

   // Chamada do EndPoint para popular desligados por Motivo
    const fetchDesligadosMotivo = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/desligados_por_motivo");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar desligados.");
      } finally {
        setLoading(false);
      }
    };

   // Chamada do EndPoint para popular tabela de Alocações Periodo
    const fetchAtivosPeriodo = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/alocacao_no_periodo");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar Periodo.");
      } finally {
        setLoading(false);
      }
    };

   // Chamada do EndPoint para popular tabela de Ativos Por Unidade
    const fetchAtivosUnidade = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/ativos_por_unidade");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar áreas.");
      } finally {
        setLoading(false);
      }
    };

   // Chamada do EndPoint para popular tabela de Tipo Pagamento
    const fetchTipoPagamento = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/tipo_pagamento");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar áreas.");
      } finally {
        setLoading(false);
      }
    };

   // Chamada do EndPoint para popular tabela de Como conheceu ProJov
    const fetchComoConheceu = async () => {
      setLoading(true);
      setData([]); 
      try {
        const response = await api.get("/participantessituacao/conheceu_projov");
        setData(response.data);
      } catch {
        toast.error("Erro ao carregar áreas.");
      } finally {
        setLoading(false);
      }
    };
 
      useEffect(() => {
        setCurrentPage(1)
        fetchAtivosPorTurma();
      }, []);

 


  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const codAprendiz = (item.Qtde ?? "").toString();
    const status = (item.Turma ?? "").toLowerCase();

    return codAprendiz.includes(term) || status.includes(term);
  });

  // --- LÓGICA DE PAGINAÇÃO ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getActiveLabel = () => OPCOES_BOTOES.find(b => b.id === activeForm)?.label;

  const renderContent = () => {
    switch (activeForm) {
        case 1:
          return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              {/* Título do Indicador Principal */}
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-700 rounded-full"></span>
                Ativos Por Turma
              </h3>

              <div className="flex flex-col gap-6">
                
                {/* SEÇÃO DA TABELA: Detalhamento de Dados */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase">Pesquisa rápida:</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-slate-300 rounded-lg p-2 text-xs outline-none w-64 focus:ring-2 focus:ring-blue-600 transition-all"
                        placeholder="Filtrar dados do Case 1..."
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border">
                      TOTAL: {filteredData.length} CATEGORIAS
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-200">
                          <th className="p-3 text-xs font-bold text-slate-700 uppercase">Turma</th>
                          <th className="p-3 text-xs font-bold text-slate-700 uppercase text-center">Alunos Por Turma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr><td colSpan={2} className="p-8 text-center text-gray-400 italic">Nenhum dado disponível.</td></tr>
                        ) : (
                          currentItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors">
                              {/* AJUSTE: Use o campo correto da sua query SQL aqui (ex: item.d_nome, item.Status) */}
                              <td className="p-2 text-xs text-gray-700 font-medium lowercase first-letter:uppercase">
                                { item.Turma}
                              </td>
                              <td className="p-2 text-xs text-blue-800 font-bold text-center">
                                {item.Qtde}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação Estilizada */}
                  <div className="p-3 bg-slate-50/30 border-t flex items-center justify-between">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1 text-[10px] font-bold border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                      ANTERIOR
                    </button>
                    <div className="text-[10px] font-bold text-slate-600">
                      PÁGINA {currentPage} DE {totalPages || 1}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-1 text-[10px] font-bold border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                      PRÓXIMO
                    </button>
                  </div>
                </div>

                {/* ÁREA DOS GRÁFICOS (Layout Lado a Lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* GRÁFICO DE BARRAS - Comparação Visual */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-[350px]">
                    <h4 className="text-[10px] font-bold text-slate-400 mb-6 uppercase text-center tracking-widest">Análise de Volume</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="Turma" 
                          tick={{fontSize: 9, fill: '#64748b'}} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar 
                          dataKey="Qtde" 
                          fill="#1d4ed8" 
                          radius={[4, 4, 0, 0]} 
                          barSize={40} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* GRÁFICO DE PIZZA - Composição Relativa */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-[350px]">
                    <h4 className="text-[10px] font-bold text-slate-400 mb-6 uppercase text-center tracking-widest">Percentual de Composição</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={filteredData}
                          dataKey="Qtde"
                          nameKey="Descricao"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={2}
                          label={{ fontSize: 10, fontWeight: 'bold', fill: '#334155' }}
                        >
                          {filteredData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle" 
                          wrapperStyle={{ fontSize: '10px' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>
            </div>
          );
      case 2:
        return (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-green-800 mb-4">Ativos por Área de Atuação</h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Procurar:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86]"
                    placeholder="Filtrar por turma..."
                  />
                </div>
                
                {/* Info de contagem */}
                <span className="text-xs text-gray-500 font-medium">
                  Mostrando {currentItems.length} de {filteredData.length} registros
                </span>
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
                      <tr><td colSpan={2} className="p-8 text-center text-gray-500 italic">Carregando dados...</td></tr>
                    ) : currentItems.length === 0 ? (
                      <tr><td colSpan={2} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td></tr>
                    ) : (
                      currentItems.map((item, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}>
                          <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Area}</td>
                          <td className="p-3 text-sm text-gray-700 font-medium">{item.Qtde}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- CONTROLES DE PAGINAÇÃO --- */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </button>
                  
                  {/* Números das páginas (Opcional - simplificado) */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 text-sm border rounded transition-all ${currentPage === i + 1 ? "bg-[#133c86] text-white border-[#133c86]" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      // case 3:
      //   return (
      //     <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
      //       <h3 className="text-lg font-bold text-green-800 mb-4">Ativos por Cidade</h3>
            
      //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      //         <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      //           <div className="flex items-center gap-2">
      //             <span className="text-sm text-gray-600 font-medium">Procurar:</span>
      //             <input
      //               type="text"
      //               value={searchTerm}
      //               onChange={(e) => setSearchTerm(e.target.value)}
      //               className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86]"
      //               placeholder="Filtrar por cidade..."
      //             />
      //           </div>
                
      //           {/* Info de contagem */}
      //           <span className="text-xs text-gray-500 font-medium">
      //             Mostrando {currentItems.length} de {filteredData.length} registros
      //           </span>
      //         </div>

      //         <div className="overflow-x-auto">
      //           <table className="w-full text-left border-collapse">
      //             <thead>
      //               <tr className="bg-white border-b border-gray-200">
      //                 <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Cidade</th>
      //                 <th className="p-3 text-sm font-bold text-gray-800">Quantidade</th>
      //               </tr>
      //             </thead>
      //             <tbody>
      //               {loading ? (
      //                 <tr><td colSpan={2} className="p-8 text-center text-gray-500 italic">Carregando dados...</td></tr>
      //               ) : currentItems.length === 0 ? (
      //                 <tr><td colSpan={2} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td></tr>
      //               ) : (
      //                 currentItems.map((item, idx) => (
      //                   <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}>
      //                     <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Cidade}</td>
      //                     <td className="p-3 text-sm text-gray-700 font-medium">{item.Qtde}</td>
      //                   </tr>
      //                 ))
      //               )}
      //             </tbody>
      //           </table>
      //         </div>

      //         {/* --- CONTROLES DE PAGINAÇÃO --- */}
      //         <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
      //           <div className="text-sm text-gray-600">
      //             Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
      //           </div>
                
      //           <div className="flex items-center gap-2">
      //             <button
      //               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      //               disabled={currentPage === 1 || loading}
      //               className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      //             >
      //               Anterior
      //             </button>
                  
      //             {/* Números das páginas (Opcional - simplificado) */}
      //             <div className="flex gap-1">
      //               {[...Array(totalPages)].map((_, i) => (
      //                 <button
      //                   key={i}
      //                   onClick={() => setCurrentPage(i + 1)}
      //                   className={`px-3 py-1 text-sm border rounded transition-all ${currentPage === i + 1 ? "bg-[#133c86] text-white border-[#133c86]" : "bg-white text-gray-600 hover:bg-gray-100"}`}
      //                 >
      //                   {i + 1}
      //                 </button>
      //               )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
      //             </div>

      //             <button
      //               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      //               disabled={currentPage === totalPages || totalPages === 0 || loading}
      //               className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      //             >
      //               Próximo
      //             </button>
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   );
case 3:
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-teal-100">
      {/* Cabeçalho com foco em Localização */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-teal-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
            Distribuição Geográfica de Aprendizes
          </h3>
          <p className="text-xs text-gray-500 mt-1">Análise por Cidade, Bairro ou Unidade Regional</p>
        </div>
        <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
          <span className="text-[10px] font-bold text-teal-700 uppercase">Regiões Ativas: {filteredData.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* SEÇÃO 1: TABELA DE LOCALIDADES */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-xs outline-none w-64 focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="Filtrar por cidade ou bairro..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teal-50/50 border-b border-teal-100">
                  <th className="p-3 text-xs font-bold text-teal-900 uppercase">Cidade</th>
                  <th className="p-3 text-xs font-bold text-teal-900 uppercase text-center">Nº Aprendizes</th>
                  <th className="p-3 text-xs font-bold text-teal-900 uppercase text-right">Representação</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, idx) => {
                  const total = filteredData.reduce((acc, curr) => acc + (curr.Qtde ?? 0), 0);
                  const percent = total > 0 ? (((item.Qtde ?? 0) / total) * 100).toFixed(1) : "0.0";
                  
                  return (
                    <tr key={idx} className="hover:bg-teal-50/30 border-b border-gray-100 transition-colors">
                      <td className="p-2 text-xs text-gray-700 font-medium">
                         📍 {item.Cidade || 'Não Identificado'}
                      </td>
                      <td className="p-2 text-xs text-gray-700 font-bold text-center">{item.Qtde}</td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-bold text-teal-600">{percent}%</span>
                          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-500 h-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO 2: GRÁFICOS (Barras e Pizza) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* RANKING GEOGRÁFICO (BARRAS HORIZONTAIS) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-[400px]">
            <h4 className="text-[10px] font-bold text-gray-400 mb-6 uppercase text-center tracking-widest">Ranking de Concentração</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart 
                data={filteredData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="Cidade" 
                  type="category" 
                  tick={{fontSize: 9, fill: '#0f766e'}} 
                  width={80}
                  axisLine={false}
                />
                <Tooltip cursor={{fill: '#f0fdfa'}} />
                <Bar 
                  dataKey="Qtde" 
                  fill="#0d9488" 
                  radius={[0, 4, 4, 0]} 
                  barSize={15} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* COMPOSIÇÃO REGIONAL (PIZZA) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-[400px]">
            <h4 className="text-[10px] font-bold text-gray-400 mb-6 uppercase text-center tracking-widest">Divisão por Região</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={filteredData}
                  dataKey="Qtde"
                  nameKey="Descricao"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {filteredData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#ccfbf1'][index % 5]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="diamond" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
      case 4:
        return (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-green-800 mb-4">Desligados No Período</h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Procurar:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86]"
                    placeholder="Filtrar por período..."
                  />
                </div>
                
                {/* Info de contagem */}
                <span className="text-xs text-gray-500 font-medium">
                  Mostrando {currentItems.length} de {filteredData.length} registros
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">

                      <th className="p-3 text-sm font-bold text-gray-800">Nome</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Turma</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Unidade</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Data Inicio</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Data Fim</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Benficio</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Bolsa</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Genero</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Situacao</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Data Nascimento</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Idade </th>


                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={11} className="p-8 text-center text-gray-500 italic">Carregando dados...</td></tr>
                    ) : currentItems.length === 0 ? (
                      <tr><td colSpan={11} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td></tr>
                    ) : (
                      currentItems.map((item, idx) => (
                        <tr 
                          key={idx} 
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}
                        >
                          {/* Usei text-xs e reduzi o padding lateral (px-2) e vertical (py-2) */}
                          <td className="p-2 text-xs text-gray-700 font-light whitespace-nowrap">{item.d_nome}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_turma}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_unidade}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium whitespace-nowrap">{item.d_DataInicio}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium whitespace-nowrap">{item.d_DataFim}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_benficio}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_bolsa}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_genero}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_situacao}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.d_nascimento}</td>
                          <td className="p-2 text-xs text-gray-700 font-bold">{item.d_idade}</td>
                        </tr>                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- CONTROLES DE PAGINAÇÃO --- */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </button>
                  
                  {/* Números das páginas (Opcional - simplificado) */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 text-sm border rounded transition-all ${currentPage === i + 1 ? "bg-[#133c86] text-white border-[#133c86]" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        case 5:
          return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-amber-100">
              {/* Cabeçalho do Case 5 */}
              <h3 className="text-lg font-bold text-amber-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                Desligados Por Motivo
              </h3>

              <div className="flex flex-col gap-6">
                
                {/* TABELA DE DADOS PRINCIPAL */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 uppercase">Busca:</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-amber-200 rounded p-1.5 text-xs outline-none w-56 focus:ring-2 focus:ring-amber-500"
                        placeholder="Filtrar dados do Case 5..."
                      />
                    </div>
                    <div className="px-3 py-1 bg-amber-100 rounded-full">
                      <span className="text-[10px] text-amber-800 font-bold uppercase">
                        {filteredData.length} Itens
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-3 text-xs font-bold text-gray-600 uppercase">Motivo</th>
                          <th className="p-3 text-xs font-bold text-gray-600 uppercase text-center">Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr><td colSpan={2} className="p-8 text-center text-gray-400 italic">Sem registros para exibir.</td></tr>
                        ) : (
                          currentItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/30 border-b border-gray-100 transition-colors">
                              <td className="p-2 text-xs text-gray-700 font-medium">{item.Motivo}</td>
                              <td className="p-2 text-xs text-gray-700 font-bold text-center">
                                <span className="bg-gray-100 px-2 py-0.5 rounded">{item.Qtde}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="text-[10px] font-bold text-amber-700 hover:underline disabled:text-gray-300"
                    >
                      ← ANTERIOR
                    </button>
                    <span className="text-[10px] font-mono bg-white px-2 border rounded">
                      {currentPage} / {totalPages || 1}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="text-[10px] font-bold text-amber-700 hover:underline disabled:text-gray-300"
                    >
                      PRÓXIMO →
                    </button>
                  </div>
                </div>

                {/* GRÁFICOS (Lado a Lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* GRÁFICO DE BARRAS */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[320px]">
                    <h4 className="text-[10px] font-bold text-gray-400 mb-6 uppercase text-center">Visualização em Colunas</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#fef3c7" />
                        <XAxis 
                          dataKey="Motivo" 
                          tick={{fontSize: 9}} 
                          axisLine={{stroke: '#f59e0b'}}
                        />
                        <YAxis tick={{fontSize: 10}} axisLine={false} />
                        <Tooltip cursor={{fill: '#fff7ed'}} />
                        <Bar dataKey="Qtde" fill="#d97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* GRÁFICO DE PIZZA (Estilo Rosca) */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[320px]">
                    <h4 className="text-[10px] font-bold text-gray-400 mb-6 uppercase text-center">Percentual de Participação</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={filteredData}
                          dataKey="Qtde"
                          nameKey="Motivo"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          label={{ fontSize: 10, fill: '#92400e' }}
                        >
                          {filteredData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="rect" wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>
            </div>
          );
      case 6:
        return (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-green-800 mb-4">Alocações Por Parceiro</h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Procurar:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86]"
                    placeholder="Filtrar por parceiro..."
                  />
                </div>
                
                {/* Info de contagem */}
                <span className="text-xs text-gray-500 font-medium">
                  Mostrando {currentItems.length} de {filteredData.length} registros
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">

                      <th className="p-3 text-sm font-bold text-gray-800">Parceiro</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Aprendizes Alocados</th>

                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={2} className="p-8 text-center text-gray-500 italic">Carregando dados...</td></tr>
                    ) : currentItems.length === 0 ? (
                      <tr><td colSpan={2} className="p-8 text-center text-gray-500 italic">Nenhum registro encontrado.</td></tr>
                    ) : (
                      currentItems.map((item, idx) => (
                        <tr 
                          key={idx} 
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors border-b border-gray-100`}
                        >
                          {/* Usei text-xs e reduzi o padding lateral (px-2) e vertical (py-2) */}
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.NomeFantasia}</td>
                          <td className="p-2 text-xs text-gray-700 font-medium">{item.Qtde}</td>
                        </tr>                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- CONTROLES DE PAGINAÇÃO --- */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </button>
                  
                  {/* Números das páginas (Opcional - simplificado) */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 text-sm border rounded transition-all ${currentPage === i + 1 ? "bg-[#133c86] text-white border-[#133c86]" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

        case 7:
          return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-indigo-100">
              {/* Título com Identificador Visual */}
              <h3 className="text-lg font-bold text-indigo-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                Ativos Por Unidade
              </h3>

              <div className="flex flex-col gap-6">
                
                {/* SEÇÃO DA TABELA */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 text-xs outline-none w-48 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Pesquisar nesta categoria..."
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {filteredData.length} Registos Totais
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-indigo-50/30 border-b border-gray-200">
                          <th className="p-3 text-xs font-bold text-indigo-900 uppercase">Unidade</th>
                          <th className="p-3 text-xs font-bold text-indigo-900 uppercase text-center">Aprendizes Por Unidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={2} className="p-8 text-center text-gray-400 italic">A carregar dados...</td></tr>
                        ) : currentItems.length === 0 ? (
                          <tr><td colSpan={2} className="p-8 text-center text-gray-400 italic">Nenhum dado encontrado.</td></tr>
                        ) : (
                          currentItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/20 border-b border-gray-100 transition-colors">
                              <td className="p-2 text-xs text-gray-700 font-medium">{item.Descricao || item.Unidade}</td>
                              <td className="p-2 text-xs text-gray-700 font-bold text-center">{item.Qtde}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação Compacta */}
                  <div className="p-3 bg-gray-50/30 border-t flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-medium">Página {currentPage} de {totalPages || 1}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-[10px] border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-[10px] border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO DE GRÁFICOS (Grid Duplo) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* GRÁFICO DE BARRAS - Visualização de Ranking */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-[320px]">
                    <h4 className="text-[10px] font-extrabold text-indigo-400 mb-4 uppercase text-center tracking-widest">Gráfico de Frequência</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="Unidade" 
                          tick={{fontSize: 9, fill: '#6366f1'}} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="Qtde" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* GRÁFICO DE PIZZA - Visualização de Composição */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-[320px]">
                    <h4 className="text-[10px] font-extrabold text-indigo-400 mb-4 uppercase text-center tracking-widest">Composição Percentual</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={filteredData}
                          dataKey="Qtde"
                          nameKey="Unidade"
                          cx="50%"
                          cy="50%"
                          innerRadius={60} // Transformado em Donut Chart para visual moderno
                          outerRadius={85}
                          paddingAngle={5}
                          label={{ fontSize: 9, fontWeight: 'bold' }}
                        >
                          {filteredData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>
            </div>
          );

        case 8:
          return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-blue-100">
              <h3 className="text-lg font-bold text-blue-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                Tipo de Pagamento
              </h3>

              <div className="flex flex-col gap-6">
                
                {/* TABELA DE DADOS */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">Filtro:</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded p-1.5 text-xs outline-none w-48 focus:border-blue-600"
                        placeholder="Pesquisar..."
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {filteredData.length} Registos encontrados
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-3 text-xs font-bold text-gray-700">Tipo Pagamento</th>
                          <th className="p-3 text-xs font-bold text-gray-700 text-center">Quantidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/30 border-b border-gray-100 transition-colors">                            
                            <td className="p-2 text-xs text-gray-600 font-medium">{item.TipoPagamento}</td>
                            <td className="p-2 text-xs text-gray-800 font-bold text-center">{item.Qtde}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Paginação Simples */}
                  <div className="p-2 bg-gray-50/50 border-t flex justify-center gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="px-2 py-1 text-[10px] border rounded bg-white">Anterior</button>
                    <span className="text-[10px] self-center">Pág {currentPage}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="px-2 py-1 text-[10px] border rounded bg-white">Próxima</button>
                  </div>
                </div>

                {/* ÁREA DOS GRÁFICOS (Lado a Lado) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* GRÁFICO DE BARRAS */}
                  <div className="bg-gray-50/30 p-4 rounded-lg border border-gray-200 h-[300px]">
                    <h4 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-wider text-center">Comparativo Volumétrico</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="TipoPagamento" 
                          tick={{fontSize: 9}} 
                          interval={0}
                        />
                        <YAxis tick={{fontSize: 10}} />
                        <Tooltip />
                        <Bar dataKey="Qtde" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* GRÁFICO DE PIZZA */}
                  <div className="bg-gray-50/30 p-4 rounded-lg border border-gray-200 h-[300px]">
                    <h4 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-wider text-center">Participação %</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={filteredData}
                          dataKey="Qtde"
                          nameKey="TipoPagamento"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={{ fontSize: 10 }}
                        >
                          {filteredData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>
            </div>
          );
    case 9:
      return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
          <h3 className="text-lg font-bold text-green-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            Como Conheceu A Instituição
          </h3>

          {/* Grid Principal: Tabela em cima (ou lateral) e Gráficos lado a lado */}
          <div className="flex flex-col gap-6">
            
            {/* SEÇÃO 1: TABELA (Largura Total) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-xs outline-none w-64 focus:ring-2 focus:ring-blue-500"
                    placeholder="Filtrar registros..."
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">
                  {filteredData.length} Resultados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 text-xs font-bold text-gray-600 uppercase">Origem</th>
                      <th className="p-3 text-xs font-bold text-gray-600 uppercase text-center">Total Aprendizes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <td className="p-2 text-xs text-gray-700 font-medium">{item.ConhecInstituicao}</td>
                        <td className="p-2 text-xs text-gray-700 font-bold text-center">{item.Qtde}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEÇÃO 2: GRÁFICOS LADO A LADO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GRÁFICO DE BARRAS */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[350px]">
                <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase">Ranking por Quantidade</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={filteredData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="ConhecInstituicao" 
                      type="category" 
                      tick={{ fontSize: 10 }} 
                      width={100}
                    />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="Qtde" fill="#133c86" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* GRÁFICO DE PIZZA */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-[350px]">
                <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase">Distribuição Percentual</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={filteredData}
                      dataKey="Qtde"
                      nameKey="ConhecInstituicao"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={{ fontSize: 10 }}
                    >
                      {filteredData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#133c86', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </div>
      );        

        default:
        return (
          <div className="p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Selecione uma opção no menu lateral.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-gray-50">
      <EstatSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-[#133c86] p-4 flex justify-between items-center text-white shrink-0">
          <h1 className="text-xl font-bold uppercase tracking-wide">Painel Estatístico</h1>
          <div className="text-sm">Estatística / {activeForm ? getActiveLabel() : "Geral"}</div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-2 shrink-0">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Relatórios</h2>
            
            {OPCOES_BOTOES.map((botao) => (
              <button
                key={botao.id}
                onClick={() => {
                  setActiveForm(botao.id);
                  // Chamadas individuais para cada rota
                  if (botao.id === 1) fetchAtivosPorTurma();
                  if (botao.id === 2) fetchAtivosArea();
                  if (botao.id === 3) fetchAtivosCidade();
                  if (botao.id === 4) fetchDesligadosPeriodo();
                  if (botao.id === 5) fetchDesligadosMotivo();
                  if (botao.id === 6) fetchAtivosPeriodo();
                  if (botao.id === 7) fetchAtivosUnidade();
                  if (botao.id === 8) fetchTipoPagamento();
                  if (botao.id === 9) fetchComoConheceu();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeForm === botao.id 
                    ? "bg-[#133c86] text-white shadow-md" 
                    : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-[#133c86]"
                }`}
              >
                {botao.label}
              </button>
            ))}

            {activeForm && (
              <button 
                onClick={() => {
                  setActiveForm(null);
                  fetchAtivosPorTurma(); // Volta os dados para o gráfico principal
                }} 
                className="mt-4 w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg border border-dashed border-red-200"
              >
                VOLTAR PARA O GRÁFICO
              </button>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
            {activeForm === null ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-gray-700 font-bold mb-6 uppercase text-xs tracking-widest border-l-4 border-[#133c86] pl-3">Visão Geral: Ativos por Turma</h2>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="Turma" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="Qtde" fill="#133c86" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                {renderContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
