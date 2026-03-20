import React from "react";
import { Briefcase } from "lucide-react";
import { AprendizFormData } from "./types";
interface Props {
  formData: AprendizFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  unidades: any[];
  instituicoes: any[];
  orientadores: any[];
}
export function VinculoContratoForm({
  formData,
  handleChange,
  unidades,
  instituicoes,
  orientadores,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Briefcase size={18} className="text-[#133c86]" />
        <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
          Vínculo e Contrato
        </h2>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-blue-600 uppercase">
            Unidade Administrativa
          </label>
          <select
            name="IdUnidade"
            value={formData.IdUnidade || ""}
            onChange={handleChange}
            className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.UniCodigo} value={u.UniCodigo}>
                {u.UniNome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Instituição Parceira
          </label>
          <select
            name="IdInstituicaoParceira"
            value={formData.IdInstituicaoParceira || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {instituicoes.map((i) => (
              <option key={i.IpaCodigo} value={i.IpaCodigo}>
                {i.IpaDescricao}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Orientador Responsável
          </label>
          <select
            name="IdMonitorResponsavel"
            value={formData.IdMonitorResponsavel || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {orientadores.map((o) => (
              <option key={o.id_usuario} value={o.id_usuario}>
                {o.UsuNome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Tipo de Aprendizagem
          </label>
          <select
            name="TipoAprendizagem"
            value={formData.TipoAprendizagem || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Administrativo">Administrativo</option>
            <option value="Operacional">Operacional</option>
            <option value="Comercial">Comercial</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            CBO / Função
          </label>
          <input
            name="CBO"
            value={formData.CBO || ""}
            onChange={handleChange}
            placeholder="Código CBO"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Área de Atuação
          </label>
          <input
            name="AreaAtuacao"
            value={formData.AreaAtuacao || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Horas Diárias
          </label>
          <input
            type="number"
            name="HorasDiarias"
            value={formData.HorasDiarias || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Meses de Contrato
          </label>
          <input
            type="number"
            name="MesesContrato"
            value={formData.MesesContrato || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Tipo de Pagamento
          </label>
          <select
            name="TipoPagamento"
            value={formData.TipoPagamento || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Mensal">Mensalista</option>
            <option value="Horista">Horista</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Data Início Empresa
          </label>
          <input
            type="date"
            name="DataInicioEmpresa"
            value={formData.DataInicioEmpresa || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Data Início Aprendizagem
          </label>
          <input
            type="date"
            name="DataInicioAprendizagem"
            value={formData.DataInicioAprendizagem || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Data Prevista Término
          </label>
          <input
            type="date"
            name="DataPrevistaTermino"
            value={formData.DataPrevistaTermino || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Data Desligamento
          </label>
          <input
            type="date"
            name="DataDesligamento"
            value={formData.DataDesligamento || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Início Férias
          </label>
          <input
            type="date"
            name="DataInicioFerias"
            value={formData.DataInicioFerias || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Término Férias
          </label>
          <input
            type="date"
            name="DataTerminoFerias"
            value={formData.DataTerminoFerias || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>
    </section>
  );
}