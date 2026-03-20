import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { AprendizFormData, ufOptions } from "./types";
interface Props {
  formData: AprendizFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  buscaCEP: (cep: string) => void;
}
export function EnderecoContatoForm({
  formData,
  handleChange,
  buscaCEP,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <MapPin size={18} className="text-[#133c86]" />
        <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
          Endereço e Contato
        </h2>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              CEP
            </label>
            <input
              name="CEP"
              value={formData.CEP || ""}
              onChange={handleChange}
              onBlur={(e) => buscaCEP(e.target.value)}
              placeholder="00000-000"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-4">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Logradouro
            </label>
            <input
              name="Logradouro"
              value={formData.Logradouro || ""}
              onChange={handleChange}
              placeholder="Rua, Avenida, etc"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Número
            </label>
            <input
              name="Numero"
              value={formData.Numero || ""}
              onChange={handleChange}
              placeholder="Nº"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Complemento
            </label>
            <input
              name="Complemento"
              value={formData.Complemento || ""}
              onChange={handleChange}
              placeholder="Apto, Bloco, etc"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Bairro
            </label>
            <input
              name="Bairro"
              value={formData.Bairro || ""}
              onChange={handleChange}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Município
            </label>
            <input
              name="Municipio"
              value={formData.Municipio || ""}
              onChange={handleChange}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              UF
            </label>
            <select
              name="UF_Endereco"
              value={formData.UF_Endereco || ""}
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Celular
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                name="Celular"
                value={formData.Celular || ""}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="p-3 pl-10 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Telefone Fixo
            </label>
            <input
              name="TelefoneFixo"
              value={formData.TelefoneFixo || ""}
              onChange={handleChange}
              placeholder="(00) 0000-0000"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Email
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="Email"
                value={formData.Email || ""}
                onChange={handleChange}
                placeholder="jovem@email.com"
                className="p-3 pl-10 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Outros Telefones
            </label>
            <input
              name="OutrosTelefones"
              value={formData.OutrosTelefones || ""}
              onChange={handleChange}
              placeholder="Recados, etc"
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
}