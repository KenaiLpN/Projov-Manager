"use client";
import { useState, useEffect } from "react";
import { EstatSidebar } from "@/components/estatsidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Importando ícones simples para os botões (opcional, usei texto para facilitar)
import { ChevronLeft, ChevronRight } from "lucide-react"; 

const OPCOES_BOTOES = [
  { id: 1, label: "Ativos Por Turma" },
  { id: 2, label: "Ativos Por Área" },
  { id: 3, label: "Ativos Por Cidade" },
  { id: 4, label: "Desligados No Período" },
  { id: 5, label: "Desligador Por Motivo" },
  { id: 6, label: "Alocações No Período" },
  { id: 7, label: "Ativos Por Unidade" },
  { id: 8, label: "Tipo de Pagamento" },
  { id: 9, label: "Como Conheceu ProJov" },
];


export default function ListaJovensCargaHorariaPage() {
  const [data, setData] = useState<any[]>([]);
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
          <div id="div-ativos-turma" className="p-6 bg-white rounded-xl shadow-sm border border-blue-100">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Ativos Por Turma</h3>
            
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
                          <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Turma}</td>
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

      case 3:
        return (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-green-800 mb-4">Ativos por Cidade</h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Procurar:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-sm outline-none w-64 focus:border-[#133c86]"
                    placeholder="Filtrar por cidade..."
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
                      <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Cidade</th>
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
                          <td className="p-3 text-sm text-gray-700 border-r border-gray-100">{item.Cidade}</td>
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
                      <th className="p-3 text-sm font-bold text-gray-800 border-r border-gray-100">Cidade</th>
                      <th className="p-3 text-sm font-bold text-gray-800">Quantidade</th>

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