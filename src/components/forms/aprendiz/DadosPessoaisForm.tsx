import React from "react";
import { User } from "lucide-react";
import { AprendizFormData, ufOptions } from "./types";
interface Props {
  formData: AprendizFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}
export const DadosPessoaisForm = React.memo(function DadosPessoaisForm({ formData, handleChange }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <User size={18} className="text-[#133c86]" />
        <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
          Dados do Jovem
        </h2>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
        <div className="flex flex-col gap-1.5 lg:col-span-1">
          <label className="text-xs font-bold text-gray-400 uppercase">
            Código Externo
          </label>
          <input
            name="CodigoExterno"
            value={formData.CodigoExterno || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Nome Completo *
          </label>
          <input
            name="NomeJovem"
            value={formData.NomeJovem}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Nome Social
          </label>
          <input
            name="NomeSocial"
            value={formData.NomeSocial || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Data Nascimento
          </label>
          <input
            type="date"
            name="DataNascimento"
            value={formData.DataNascimento || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Sexo
          </label>
          <select
            name="Sexo"
            value={formData.Sexo || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Estado Civil
          </label>
          <select
            name="EstadoCivil"
            value={formData.EstadoCivil || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Solteiro">Solteiro(a)</option>
            <option value="Casado">Casado(a)</option>
            <option value="Divorciado">Divorciado(a)</option>
            <option value="Viúvo">Viúvo(a)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Nacionalidade
          </label>
          <input
            name="Nacionalidade"
            value={formData.Nacionalidade || ""}
            onChange={handleChange}
            placeholder="Ex: Brasileira"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Naturalidade (Cidade)
          </label>
          <input
            name="Naturalidade"
            value={formData.Naturalidade || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            UF Naturalidade
          </label>
          <select
            name="UF_Naturalidade"
            value={formData.UF_Naturalidade || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">--</option>
            {ufOptions.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Alistamento Militar
          </label>
          <select
            name="AlistamentoMilitar"
            value={formData.AlistamentoMilitar || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          >
            <option value="">Selecione...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Status do Jovem
          </label>
          <select
            name="StatusJovem"
            value={formData.StatusJovem || ""}
            onChange={handleChange}
            className="p-3 bg-blue-50 text-blue-700 font-bold border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Desligado">Desligado</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Senha (Para Login do Aprendiz)
          </label>
          <input
            type="password"
            name="Senha"
            value={formData.Senha || ""}
            onChange={handleChange}
            placeholder="Deixe em branco para não alterar"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>
    </section>
  );
});