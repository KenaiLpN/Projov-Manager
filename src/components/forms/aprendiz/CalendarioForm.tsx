import React, { useState } from "react";
import { CalendarDays, Calculator, Eye } from "lucide-react";
import { AprendizFormData } from "./types";
import { CalendarioPreview } from "./CalendarioPreview";
import {
  gerarCalendario,
  CalendarioGerado,
  CalendarioInput,
} from "@/utils/calendarioAprendizagem";
import { toast } from "react-hot-toast";
interface Props {
  formData: AprendizFormData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  unidades: any[];
  instituicoes: any[];
  cursos: any[];
}
export const CalendarioForm = React.memo(function CalendarioForm({
  formData,
  handleChange,
  unidades,
  instituicoes,
  cursos,
}: Props) {
  const [calendarioGerado, setCalendarioGerado] =
    useState<CalendarioGerado | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const gerarCalendarioHandler = () => {
    if (!formData.CalDataAdmissao) {
      toast.error("Preencha a Data de Admissão.");
      return;
    }
    if (
      !formData.DataPrevistaTermino &&
      !formData.CalDataTerminoIntrodutorios
    ) {
      toast.error("Preencha a Data Prevista de Término do contrato.");
      return;
    }
    const empresaNome =
      instituicoes.find(
        (i: any) => String(i.IpaCodigo) === String(formData.CalEmpresa),
      )?.IpaDescricao || "";
    const cursoNome =
      cursos.find((c: any) => String(c.AreaCodigo) === String(formData.CalCurso))
        ?.AreaDescricao || formData.CalCurso;
    const input: CalendarioInput = {
      nomeAprendiz: formData.NomeJovem || "",
      curso: cursoNome || "",
      empresa: empresaNome,
      jornadaDiaria: formData.CalJornadaDiaria || "4",
      diasTeoria: formData.CalDiasAprendizagemTeorica || "",
      diasPratica: formData.CalDiasAprendizagemPratica || "",
      dataAdmissao: formData.CalDataAdmissao || "",
      dataTerminoIntrodutorios: formData.CalDataTerminoIntrodutorios || "",
      diaEncontroSemanal: formData.CalDiaEncontroSemanal || "",
      dataInicioEncontroSemanal: formData.CalDataInicioEncontroSemanal || "",
      diaEncontroMensal: formData.CalDiaEncontroMensal || "",
      semanaEncontroMensal: formData.CalSemanaEncontroMensal || "",
      folga: formData.CalFolga || "Normal",
      feriados: [],
      periodoFeriasDe: formData.CalPeriodoFeriasDe,
      periodoFeriasAte: formData.CalPeriodoFeriasAte,
      periodoFerias2De: formData.CalPeriodoFerias2De,
      periodoFerias2Ate: formData.CalPeriodoFerias2Ate,
      periodoSuspensaoDe: formData.CalPeriodoSuspensaoDe,
      periodoSuspensaoAte: formData.CalPeriodoSuspensaoAte,
    };
    try {
      const resultado = gerarCalendario(input);
      setCalendarioGerado(resultado);
      toast.success(
        `Calendário gerado! ${resultado.resumo.totalEncontros} encontros / ${resultado.resumo.totalHoras}h`,
      );
    } catch (err) {
      console.error("Erro ao gerar calendário:", err);
      toast.error("Erro ao gerar o calendário. Verifique os dados.");
    }
  };
  const visualizarCalendario = () => {
    if (!calendarioGerado) {
      toast.error("Gere o calendário primeiro clicando em 'Calcular'.");
      return;
    }
    setShowPreview(true);
  };
  return (
    <>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <CalendarDays size={18} className="text-[#133c86]" />
          <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
            Calendário
          </h2>
        </div>
        <div className="p-8 space-y-8">
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Curso
              </label>
              <select
                name="CalCurso"
                value={formData.CalCurso || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {cursos.map((c: any) => (
                  <option key={c.AreaCodigo} value={c.AreaCodigo}>
                    {c.AreaDescricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Jornada Diária
              </label>
              <input
                name="CalJornadaDiaria"
                value={formData.CalJornadaDiaria || ""}
                onChange={handleChange}
                placeholder="Ex: 4"
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Dias de Aprendizagem Teórica
              </label>
              <input
                name="CalDiasAprendizagemTeorica"
                value={formData.CalDiasAprendizagemTeorica || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Dias de Aprendizagem Prática
              </label>
              <input
                name="CalDiasAprendizagemPratica"
                value={formData.CalDiasAprendizagemPratica || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Data de Admissão
              </label>
              <input
                type="date"
                name="CalDataAdmissao"
                value={formData.CalDataAdmissao || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Data de Término Introdutórios
              </label>
              <input
                type="date"
                name="CalDataTerminoIntrodutorios"
                value={formData.CalDataTerminoIntrodutorios || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Unidade Introdutório
              </label>
              <select
                name="CalUnidadeIntrodutorio"
                value={formData.CalUnidadeIntrodutorio || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {unidades.map((u: any) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>
                    {u.UniNome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Dia Encontro Semanal
              </label>
              <select
                name="CalDiaEncontroSemanal"
                value={formData.CalDiaEncontroSemanal || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Segunda-Feira">Segunda-Feira</option>
                <option value="Terça-Feira">Terça-Feira</option>
                <option value="Quarta-Feira">Quarta-Feira</option>
                <option value="Quinta-Feira">Quinta-Feira</option>
                <option value="Sexta-Feira">Sexta-Feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Data Início Encontro Semanal
              </label>
              <input
                type="date"
                name="CalDataInicioEncontroSemanal"
                value={formData.CalDataInicioEncontroSemanal || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Dia Encontro Mensal
              </label>
              <select
                name="CalDiaEncontroMensal"
                value={formData.CalDiaEncontroMensal || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Segunda-Feira">Segunda-Feira</option>
                <option value="Terça-Feira">Terça-Feira</option>
                <option value="Quarta-Feira">Quarta-Feira</option>
                <option value="Quinta-Feira">Quinta-Feira</option>
                <option value="Sexta-Feira">Sexta-Feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Semana Encontro Mensal
              </label>
              <select
                name="CalSemanaEncontroMensal"
                value={formData.CalSemanaEncontroMensal || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Primeira Semana">Primeira Semana</option>
                <option value="Segunda Semana">Segunda Semana</option>
                <option value="Terceira Semana">Terceira Semana</option>
                <option value="Quarta Semana">Quarta Semana</option>
                <option value="Última Semana">Última Semana</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Folga
              </label>
              <select
                name="CalFolga"
                value={formData.CalFolga || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Normal">Normal</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
                <option value="Sábado e Domingo">Sábado e Domingo</option>
              </select>
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Unidade Feriado Teoria
              </label>
              <select
                name="CalUnidadeFeriadoTeoria"
                value={formData.CalUnidadeFeriadoTeoria || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {unidades.map((u: any) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>
                    {u.UniNome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Unidade Feriado Prática
              </label>
              <select
                name="CalUnidadeFeriadoPratica"
                value={formData.CalUnidadeFeriadoPratica || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {unidades.map((u: any) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>
                    {u.UniNome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Empresa
              </label>
              <select
                name="CalEmpresa"
                value={formData.CalEmpresa || ""}
                onChange={handleChange}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {instituicoes.map((i: any) => (
                  <option key={i.IpaCodigo} value={i.IpaCodigo}>
                    {i.IpaDescricao}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Período de Férias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Período Férias De
                </label>
                <input
                  type="date"
                  name="CalPeriodoFeriasDe"
                  value={formData.CalPeriodoFeriasDe || ""}
                  onChange={handleChange}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Período Férias Até
                </label>
                <input
                  type="date"
                  name="CalPeriodoFeriasAte"
                  value={formData.CalPeriodoFeriasAte || ""}
                  onChange={handleChange}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Período Férias 2 De
                </label>
                <input
                  type="date"
                  name="CalPeriodoFerias2De"
                  value={formData.CalPeriodoFerias2De || ""}
                  onChange={handleChange}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Período Férias 2 Até
                </label>
                <input
                  type="date"
                  name="CalPeriodoFerias2Ate"
                  value={formData.CalPeriodoFerias2Ate || ""}
                  onChange={handleChange}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
          {}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              Período de Suspensão
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Período Suspensão De
                </label>
                <input
                  type="date"
                  name="CalPeriodoSuspensaoDe"
                  value={formData.CalPeriodoSuspensaoDe || ""}
                  onChange={handleChange}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Período Suspensão Até
                </label>
                <input
                  type="date"
                  name="CalPeriodoSuspensaoAte"
                  value={formData.CalPeriodoSuspensaoAte || ""}
                  onChange={handleChange}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
          {}
          <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={gerarCalendarioHandler}
              className="flex items-center gap-2 px-6 py-3 bg-[#133c86] text-white rounded-xl font-bold hover:bg-[#0f2e6b] transition-all shadow-lg hover:shadow-xl"
            >
              <Calculator size={18} />
              Calcular
            </button>
            <button
              type="button"
              onClick={visualizarCalendario}
              disabled={!calendarioGerado}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye size={18} />
              Visualizar Calendário
            </button>
            {calendarioGerado && (
              <div className="flex items-center gap-3 ml-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                <span>
                  📊 <strong>{calendarioGerado.resumo.totalEncontros}</strong>{" "}
                  encontros
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  ⏱️ <strong>{calendarioGerado.resumo.totalHoras}</strong>h
                  total
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  📘 {calendarioGerado.resumo.porcentagemTeoria.toFixed(1)}%
                  teoria
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  📗 {calendarioGerado.resumo.porcentagemPratica.toFixed(1)}%
                  prática
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
      {}
      {showPreview && calendarioGerado && (
        <CalendarioPreview
          calendario={calendarioGerado}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
});