"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  ArrowLeft, 
  Save, 
  Building2,
  FileText,
  MessageSquare,
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface Empresa {
  ParCodigo: number;
  ParDescricao: string;
  ParCNPJ?: string;
}

interface AreaAtuacao {
  AreaCodigo: number;
  AreaDescricao: string;
}

export interface VagaFormData {
  ReqEmpresa: string;
  ReqDataSolita__o: string;
  ReqQuantidade: string;
  ReqSexo: string;
  ReqHorarioEntrevista: string;
  ReqSubstituicao: string;
  ReqSubstituir: string;
  ReqAreaAtuacao: string;
  ReqHorarioTrabalho: string;
  ReqSituacao: string;
  ReqDataEntrevista: string;
  ReqMaiorMenor: string;
  ReqIdadeMinima: string;
  ReqEndEntrevista: string;
  ReqCaracteristicasPessoais: string;
  ReqHabilidades: string;
  ReqAtividades: string;
  ReqContaoEntrevista: string;
  ReqObservacoes: string;
  ReqObservacoesInst: string;
  ReqSalario: string;
}

const initialFormData: VagaFormData = {
  ReqEmpresa: "",
  ReqDataSolita__o: new Date().toISOString().split('T')[0],
  ReqQuantidade: "1",
  ReqSexo: "A",
  ReqHorarioEntrevista: "",
  ReqSubstituicao: "N",
  ReqSubstituir: "",
  ReqAreaAtuacao: "",
  ReqHorarioTrabalho: "",
  ReqSituacao: "A",
  ReqDataEntrevista: "",
  ReqMaiorMenor: "I",
  ReqIdadeMinima: "14",
  ReqEndEntrevista: "",
  ReqCaracteristicasPessoais: "",
  ReqHabilidades: "",
  ReqAtividades: "",
  ReqContaoEntrevista: "",
  ReqObservacoes: "",
  ReqObservacoesInst: "",
  ReqSalario: "",
};

interface VagaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VagaForm({ onSuccess, onCancel }: VagaFormProps) {
  const [formData, setFormData] = useState<VagaFormData>(initialFormData);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [areas, setAreas] = useState<AreaAtuacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmpresaCNPJ, setSelectedEmpresaCNPJ] = useState("");

  useEffect(() => {
    fetchAuxData();
  }, []);

  const fetchAuxData = async () => {
    try {
      const [empRes, areaRes] = await Promise.all([
        api.get("/parceiros"),
        api.get("/areas")
      ]);
      
      setEmpresas(Array.isArray(empRes.data) ? empRes.data : empRes.data.data || []);
      setAreas(Array.isArray(areaRes.data) ? areaRes.data : areaRes.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados auxiliares:", error);
      toast.error("Erro ao carregar empresas e áreas.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "ReqEmpresa") {
      const empresa = empresas.find(emp => emp.ParCodigo.toString() === value);
      setSelectedEmpresaCNPJ(empresa?.ParCNPJ || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        ReqEmpresa: parseInt(formData.ReqEmpresa),
        ReqQuantidade: parseInt(formData.ReqQuantidade),
        ReqAreaAtuacao: parseInt(formData.ReqAreaAtuacao),
        ReqIdadeMinima: parseInt(formData.ReqIdadeMinima),
        ReqSalario: formData.ReqSalario ? parseFloat(formData.ReqSalario) : null,
        ReqDataSolita__o: new Date(formData.ReqDataSolita__o),
        ReqDataEntrevista: formData.ReqDataEntrevista ? new Date(formData.ReqDataEntrevista) : null,
      };

      await api.post("/vagas", submitData);
      toast.success("Vaga cadastrada com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar vaga:", error);
      toast.error("Erro ao salvar os dados da vaga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Section 1: Dados da Vaga */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-[#133c86]" />
            <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
              Dados da Vaga
            </h2>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase">Código da Vaga</label>
            <input 
              disabled 
              placeholder="Automático"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Empresa *</label>
            <select
              name="ReqEmpresa"
              value={formData.ReqEmpresa || ""}
              onChange={handleChange}
              required
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            >
              <option value="">Selecione...</option>
              {empresas.map(emp => (
                <option key={emp.ParCodigo} value={emp.ParCodigo}>
                  {emp.ParDescricao}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase">CNPJ</label>
            <input 
              value={selectedEmpresaCNPJ}
              disabled
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Data Solicitação *</label>
            <input
              type="date"
              name="ReqDataSolita__o"
              value={formData.ReqDataSolita__o || ""}
              onChange={handleChange}
              required
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Quantidade Vagas *</label>
            <input
              type="number"
              name="ReqQuantidade"
              value={formData.ReqQuantidade || ""}
              onChange={handleChange}
              required
              min="1"
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Sexo *</label>
            <select
              name="ReqSexo"
              value={formData.ReqSexo || ""}
              onChange={handleChange}
              required
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            >
              <option value="A">Ambos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Horário Entrevista *</label>
            <input
              name="ReqHorarioEntrevista"
              value={formData.ReqHorarioEntrevista || ""}
              onChange={handleChange}
              placeholder="Ex: 14:00"
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Substituição *</label>
            <select
              name="ReqSubstituicao"
              value={formData.ReqSubstituicao || ""}
              onChange={handleChange}
              required
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            >
              <option value="N">Não</option>
              <option value="S">Sim</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className={`text-xs font-bold uppercase ${formData.ReqSubstituicao === 'S' ? 'text-gray-500' : 'text-gray-300'}`}>
              Nome do Substituído
            </label>
            <input
              name="ReqSubstituir"
              value={formData.ReqSubstituir || ""}
              onChange={handleChange}
              disabled={formData.ReqSubstituicao !== 'S'}
              placeholder={formData.ReqSubstituicao === 'S' ? "Nome completo" : ""}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Área de Atuação *</label>
            <select
              name="ReqAreaAtuacao"
              value={formData.ReqAreaAtuacao || ""}
              onChange={handleChange}
              required
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            >
              <option value="">Selecione...</option>
              {areas.map(area => (
                <option key={area.AreaCodigo} value={area.AreaCodigo}>
                  {area.AreaDescricao}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Horário Trabalho *</label>
            <input
              name="ReqHorarioTrabalho"
              value={formData.ReqHorarioTrabalho || ""}
              onChange={handleChange}
              placeholder="Ex: 08:00 às 12:00"
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Situação *</label>
            <select
              name="ReqSituacao"
              value={formData.ReqSituacao || ""}
              onChange={handleChange}
              className="p-3 bg-blue-50 text-blue-700 font-bold border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="A">Ativo</option>
              <option value="I">Inativo</option>
              <option value="F">Fechado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Data Entrevista *</label>
            <input
              type="date"
              name="ReqDataEntrevista"
              value={formData.ReqDataEntrevista || ""}
              onChange={handleChange}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Maior/Menor *</label>
            <select
              name="ReqMaiorMenor"
              value={formData.ReqMaiorMenor || ""}
              onChange={handleChange}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            >
              <option value="I">Indiferente</option>
              <option value="M">Maior</option>
              <option value="E">Menor</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Idade Mínima *</label>
            <input
              type="number"
              name="ReqIdadeMinima"
              value={formData.ReqIdadeMinima || ""}
              onChange={handleChange}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Salário</label>
            <input
              type="number"
              step="0.01"
              name="ReqSalario"
              value={formData.ReqSalario || ""}
              onChange={handleChange}
              placeholder="R$ 0,00"
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Dados da Unidade do Parceiro */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 size={18} className="text-[#133c86]" />
          <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
            Dados da Unidade do Parceiro
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Local Entrevista</label>
            <input
              name="ReqEndEntrevista"
              value={formData.ReqEndEntrevista || ""}
              onChange={handleChange}
              placeholder="Externo ou endereço específico"
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all w-full"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Detalhes e Observações */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText size={18} className="text-[#133c86]" />
          <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
            Detalhes da Vaga
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Características Pessoais</label>
            <textarea
              name="ReqCaracteristicasPessoais"
              value={formData.ReqCaracteristicasPessoais || ""}
              onChange={handleChange}
              rows={2}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Habilidades</label>
            <textarea
              name="ReqHabilidades"
              value={formData.ReqHabilidades || ""}
              onChange={handleChange}
              rows={2}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Atividades</label>
            <textarea
              name="ReqAtividades"
              value={formData.ReqAtividades || ""}
              onChange={handleChange}
              rows={2}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Contato Entrevista</label>
            <textarea
              name="ReqContaoEntrevista"
              value={formData.ReqContaoEntrevista || ""}
              onChange={handleChange}
              rows={2}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Observação</label>
              <textarea
                name="ReqObservacoes"
                value={formData.ReqObservacoes || ""}
                onChange={handleChange}
                rows={3}
                className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Observação Instituição</label>
              <textarea
                name="ReqObservacoesInst"
                value={formData.ReqObservacoesInst || ""}
                onChange={handleChange}
                rows={3}
                className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Required Fields Tip */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 text-blue-700 text-xs font-medium">
        <div className="bg-blue-100 p-1.5 rounded-lg">
          <MessageSquare size={14} />
        </div>
        Obs.: Os campos com (*) indicam dados obrigatórios.
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-[#133c86] text-white font-bold rounded-xl shadow-lg border border-[#133c86] hover:bg-[#1a4da6] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
        >
          <Save size={18} />
          {loading ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-8 py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={18} />
          Cancelar
        </button>
      </div>
    </form>
  );
}
