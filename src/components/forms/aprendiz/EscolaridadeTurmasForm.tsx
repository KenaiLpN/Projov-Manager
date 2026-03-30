import React from "react";
import { GraduationCap } from "lucide-react";
import { AprendizFormData } from "./types";
interface Props {
  formData: AprendizFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  escolas: any[];
  turmas: any[];
}
export function EscolaridadeTurmasForm({
  formData,
  handleChange,
  escolas,
  turmas,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <GraduationCap size={18} className="text-[#133c86]" />
        <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
          Escolaridade e Turmas
        </h2>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Estuda Atualmente?
          </label>
          <select
            name="EstudaAtualmente"
            value={formData.EstudaAtualmente || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Escolaridade / Nível
          </label>
          <select
            name="EscolaridadeNivel"
            value={formData.EscolaridadeNivel || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Fundamental Incompleto">
              Fundamental Incompleto
            </option>
            <option value="Fundamental Completo">Fundamental Completo</option>
            <option value="Médio Incompleto">Médio Incompleto</option>
            <option value="Médio Completo">Médio Completo</option>
            <option value="Superior Incompleto">Superior Incompleto</option>
            <option value="Superior Completo">Superior Completo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Instituição de Ensino
          </label>
          <select
            name="IdEscola"
            value={formData.IdEscola || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {escolas.map((e) => (
              <option key={e.EscCodigo} value={e.EscCodigo}>
                {e.EscNome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Turno Escolar
          </label>
          <select
            name="TurnoEscolar"
            value={formData.TurnoEscolar || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
            <option value="Integral">Integral</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Turma Simultaneidade
          </label>
          <select
            name="TurmaSimultaneidade"
            value={formData.TurmaSimultaneidade || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {turmas.map((t: any) => (
              <option key={t.TurCodigo} value={t.TurNome}>
                {t.TurNome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Turma CCI
          </label>
          <select
            name="TurmaCCI"
            value={formData.TurmaCCI || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {turmas.map((t: any) => (
              <option key={t.TurCodigo} value={t.TurNome}>
                {t.TurNome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Capacitação
          </label>
          <select
            name="IdTurmaCapacitacao"
            value={formData.IdTurmaCapacitacao || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            {turmas.map((t: any) => (
              <option key={t.TurCodigo} value={t.TurCodigo}>
                {t.TurNome}
              </option>
            ))}
          </select>
        </div>

      </div>
    </section>
  );
}