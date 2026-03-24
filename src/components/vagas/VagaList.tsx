"use client";

import React from "react";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Clock,
  Briefcase,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

export interface Vaga {
  ReqId: number;
  ReqEmpresa: number;
  ReqDataSolita__o: string;
  ReqQuantidade: number;
  ReqSexo?: string;
  ReqHorarioEntrevista?: string;
  ReqSubstituicao: string;
  ReqAreaAtuacao: number;
  ReqSituacao?: string;
  ReqDataEntrevista?: string;
  ReqHorarioTrabalho?: string;
  ReqSalario?: number;
}

interface VagaListProps {
  vagas: Vaga[];
  loading: boolean;
  empresas: any[];
  areas: any[];
  onEdit: (vaga: Vaga) => void;
  onDelete: (id: number) => void;
  onView: (vaga: Vaga) => void;
}

export default function VagaList({ 
  vagas, 
  loading, 
  empresas, 
  areas, 
  onEdit, 
  onDelete,
  onView 
}: VagaListProps) {
  
  const getEmpresaNome = (id: number) => {
    const empresa = empresas.find(e => e.ParCodigo === id);
    return empresa ? empresa.ParDescricao : "Não encontrada";
  };

  const getAreaNome = (id: number) => {
    const area = areas.find(a => a.AreaCodigo === id);
    return area ? area.AreaDescricao : "Não encontrada";
  };

  const formatData = (dataStr: string) => {
    if (!dataStr) return "-";
    try {
      const date = new Date(dataStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dataStr;
    }
  };

  const getStatusBadge = (situacao: string | undefined) => {
    switch (situacao) {
      case "A":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Ativa</span>;
      case "I":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">Inativa</span>;
      case "F":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">Fechada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Pendente</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-[#133c86] rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando vagas...</p>
      </div>
    );
  }

  if (vagas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="text-gray-300" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-1">Nenhuma vaga encontrada</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Não há requisições de vagas cadastradas no momento. Clique em "Nova Vaga" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vagas.map((vaga) => (
        <div 
          key={vaga.ReqId} 
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden flex flex-col"
        >
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            {getStatusBadge(vaga.ReqSituacao)}
          </div>

          {/* Header Info */}
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 group-hover:bg-blue-50/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#133c86] group-hover:bg-[#133c86] group-hover:text-white transition-all">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 line-clamp-1 leading-tight py-1">
                  {getEmpresaNome(vaga.ReqEmpresa)}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  #{vaga.ReqId} • {getAreaNome(vaga.ReqAreaAtuacao)}
                </p>
              </div>
            </div>
          </div>

          {/* Body Info */}
          <div className="p-6 grow space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5 text-gray-500">
                <Calendar size={16} className="text-gray-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Solicitado em</span>
                  <span className="text-xs font-semibold">{formatData(vaga.ReqDataSolita__o)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                <Users size={16} className="text-gray-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Quantidade</span>
                  <span className="text-xs font-semibold">{vaga.ReqQuantidade} {vaga.ReqQuantidade === 1 ? 'vaga' : 'vagas'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
               <div className="flex items-center gap-2.5 text-gray-500">
                <Clock size={16} className="text-gray-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Carga Horária</span>
                  <span className="text-xs font-semibold truncate max-w-28">{vaga.ReqHorarioTrabalho || "A definir"}</span>
                </div>
              </div>
              {vaga.ReqSalario && (
                <div className="flex items-center gap-2.5 text-gray-500">
                  <span className="text-xs font-bold text-gray-300">R$</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Salário</span>
                    <span className="text-xs font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vaga.ReqSalario)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onView(vaga)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Ver Detalhes"
              >
                <Eye size={18} />
              </button>
              <button 
                onClick={() => onEdit(vaga)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit size={18} />
              </button>
            </div>
            <button 
              onClick={() => onDelete(vaga.ReqId)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
