import React from "react";
import { FileText } from "lucide-react";
import { AprendizFormData, ufOptions } from "./types";
interface Props {
  formData: AprendizFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}
export function DocumentacaoForm({ formData, handleChange }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <FileText size={18} className="text-[#133c86]" />
        <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
          Documentação
        </h2>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            CPF
          </label>
          <input
            name="CPF"
            value={formData.CPF || ""}
            onChange={handleChange}
            placeholder="000.000.000-00"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            RG
          </label>
          <input
            name="RG"
            value={formData.RG || ""}
            onChange={handleChange}
            placeholder="Número do RG"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            RG Data Emissão
          </label>
          <input
            type="date"
            name="RG_DataEmissao"
            value={formData.RG_DataEmissao || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Órgão Expedidor / UF
          </label>
          <div className="flex gap-2">
            <input
              name="RG_OrgaoExpedidor"
              value={formData.RG_OrgaoExpedidor || ""}
              onChange={handleChange}
              placeholder="SSP"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
            <select
              name="RG_UF"
              value={formData.RG_UF || ""}
              onChange={handleChange}
              className="w-20 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            >
              <option value="">--</option>
              {ufOptions.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            PIS / PASEP
          </label>
          <input
            name="PIS"
            value={formData.PIS || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            CTPS (Número / Série)
          </label>
          <div className="flex gap-2">
            <input
              name="CTPS_Numero"
              value={formData.CTPS_Numero || ""}
              onChange={handleChange}
              placeholder="Número"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
            <input
              name="CTPS_Serie"
              value={formData.CTPS_Serie || ""}
              onChange={handleChange}
              placeholder="Série"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Reservista
          </label>
          <input
            name="Reservista"
            value={formData.Reservista || ""}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Título Eleitor (Z / S)
          </label>
          <div className="flex gap-2">
            <input
              name="TituloEleitor"
              value={formData.TituloEleitor || ""}
              onChange={handleChange}
              placeholder="Número"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
            <input
              name="TituloZona"
              value={formData.TituloZona || ""}
              onChange={handleChange}
              placeholder="Z"
              className="w-16 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
            <input
              name="TituloSecao"
              value={formData.TituloSecao || ""}
              onChange={handleChange}
              placeholder="S"
              className="w-16 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
}