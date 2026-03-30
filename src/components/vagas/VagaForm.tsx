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
import { Dropdown } from "primereact/dropdown";

interface Empresa {
  ParCodigo: number;
  ParDescricao: string;
  ParCNPJ?: string;
}

interface AreaAtuacao {
  AreaCodigo: number;
  AreaDescricao: string;
}

interface Unidade {
  ParUniCodigo: number;
  ParUniCodigoParceiro: number;
  ParUniDescricao: string;
  ParUniEndereco?: string;
  ParUniNumeroEndereco?: string;
  ParUniBairro?: string;
  ParUniCidade?: string;
  ParUniEstado?: string;
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
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [areas, setAreas] = useState<AreaAtuacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmpresaCNPJ, setSelectedEmpresaCNPJ] = useState("");
  const [selectedUnidade, setSelectedUnidade] = useState<string>("");

  useEffect(() => {
    fetchAuxData();
  }, []);

  const fetchAuxData = async () => {
    try {
      const [empRes, areaRes, uniRes] = await Promise.all([
        api.get("/parceiros?limit=1000"),
        api.get("/areas?limit=1000"),
        api.get("/unidades-parceiro?limit=1000")
      ]);
      
      const empList = (Array.isArray(empRes.data) ? empRes.data : empRes.data.data || [])
        .sort((a: any, b: any) => a.ParDescricao.localeCompare(b.ParDescricao));
        
      setEmpresas(empList);
      setAreas(Array.isArray(areaRes.data) ? areaRes.data : areaRes.data.data || []);
      setUnidades(Array.isArray(uniRes.data) ? uniRes.data : uniRes.data.data || []);
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
      setSelectedUnidade(""); // Reset unidade when empresa changes
    }
  };

  const handleUnidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUnidade(value);
    
    if (value) {
      const unidade = unidades.find(u => u.ParUniCodigo.toString() === value);
      if (unidade) {
        const enderecoCompleto = `${unidade.ParUniEndereco || ""}, ${unidade.ParUniNumeroEndereco || ""}${unidade.ParUniBairro ? ` - ${unidade.ParUniBairro}` : ""} - ${unidade.ParUniCidade || ""}/${unidade.ParUniEstado || ""}`;
        setFormData(prev => ({ ...prev, ReqEndEntrevista: enderecoCompleto.replace(/^, /, "") }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ReqEmpresa: parseInt(formData.ReqEmpresa) || 0,
        ReqDataSolita__o: formData.ReqDataSolita__o,
        ReqQuantidade: parseInt(formData.ReqQuantidade) || 1,
        ReqSexo: formData.ReqSexo || "A",
        ReqHorarioEntrevista: formData.ReqHorarioEntrevista || null,
        ReqSubstituicao: formData.ReqSubstituicao || "N",
        ReqSubstituir: formData.ReqSubstituir || null,
        ReqAreaAtuacao: parseInt(formData.ReqAreaAtuacao) || 0,
        ReqHorarioTrabalho: formData.ReqHorarioTrabalho || null,
        ReqSituacao: formData.ReqSituacao || "A",
        ReqDataEntrevista: formData.ReqDataEntrevista || null,
        ReqMaiorMenor: formData.ReqMaiorMenor || "I",
        ReqIdadeMinima: parseInt(formData.ReqIdadeMinima) || 14,
        ReqEndEntrevista: formData.ReqEndEntrevista || null,
        ReqCaracteristicasPessoais: formData.ReqCaracteristicasPessoais || null,
        ReqHabilidades: formData.ReqHabilidades || null,
        ReqAtividades: formData.ReqAtividades || null,
        ReqContaoEntrevista: formData.ReqContaoEntrevista || null,
        ReqObservacoes: formData.ReqObservacoes || null,
        ReqObservacoesInst: formData.ReqObservacoesInst || null,
        ReqSalario: formData.ReqSalario ? parseFloat(formData.ReqSalario) : null,
      };

      // Limpar campos extras do submitData se houver algum
      Object.keys(submitData).forEach(key => {
        if (submitData[key as keyof typeof submitData] === "") {
          (submitData as any)[key] = null;
        }
      });

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
            <Dropdown
              id="ReqEmpresa"
              name="ReqEmpresa"
              value={formData.ReqEmpresa ? Number(formData.ReqEmpresa) : null}
              options={empresas.map(emp => ({ 
                label: emp.ParDescricao, 
                value: emp.ParCodigo 
              }))}
              onChange={(e) => {
                const value = e.value;
                setFormData(prev => ({ ...prev, ReqEmpresa: String(value) }));
                const empresa = empresas.find(emp => emp.ParCodigo === value);
                setSelectedEmpresaCNPJ(empresa?.ParCNPJ || "");
                setSelectedUnidade("");
              }}
              filter
              filterBy="label"
              placeholder="Selecione uma empresa"
              className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-medium text-gray-700 h-[50px] flex items-center"
              pt={{
                input: { className: 'h-full flex items-center p-3 text-sm' },
                trigger: { className: 'p-3' },
                panel: { className: 'custom-dropdown-panel' },
                filterInput: { className: 'p-2 border-b border-gray-100 outline-none' }
              }}
            />
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
            <Dropdown
              id="ReqAreaAtuacao"
              name="ReqAreaAtuacao"
              value={formData.ReqAreaAtuacao ? Number(formData.ReqAreaAtuacao) : null}
              options={areas.map(area => ({ 
                label: area.AreaDescricao, 
                value: area.AreaCodigo 
              }))}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, ReqAreaAtuacao: String(e.value) }));
              }}
              filter
              filterBy="label"
              placeholder="Selecione uma área"
              className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-medium text-gray-700 h-[50px] flex items-center"
              pt={{
                input: { className: 'h-full flex items-center p-3 text-sm' },
                trigger: { className: 'p-3' },
                panel: { className: 'custom-dropdown-panel' },
                filterInput: { className: 'p-2 border-b border-gray-100 outline-none' }
              }}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Unidade</label>
              <select
                value={selectedUnidade}
                onChange={handleUnidadeChange}
                disabled={!formData.ReqEmpresa}
                className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecione uma unidade...</option>
                {unidades
                  .filter(u => u.ParUniCodigoParceiro.toString() === formData.ReqEmpresa)
                  .map(uni => (
                    <option key={uni.ParUniCodigo} value={uni.ParUniCodigo}>
                      {uni.ParUniDescricao}
                    </option>
                  ))}
              </select>
            </div>
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
