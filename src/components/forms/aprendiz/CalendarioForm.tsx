import React, { useState } from "react";
import { CalendarDays, Calculator, Eye } from "lucide-react";
import { CA_Aprendiz } from "@/types";
import { AprendizFormData } from "./types";
import { CalendarioPreview } from "./CalendarioPreview";
import {
  gerarCalendario,
  CalendarioGerado,
  CalendarioInput,
} from "@/utils/calendarioAprendizagem";
import { toast } from "react-hot-toast";

interface Props {
  formData: CA_Aprendiz;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  calFormData: AprendizFormData;
  handleCalChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  unidades: any[];
  instituicoes: any[];
  parceiros: any[];
  cursos: any[];
}

export const CalendarioForm = React.memo(function CalendarioForm({
  formData,
  handleChange,
  calFormData,
  handleCalChange,
  unidades,
  instituicoes,
  parceiros,
  cursos,
}: Props) {
  const [calendarioGerado, setCalendarioGerado] = useState<CalendarioGerado | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const gerarCalendarioHandler = () => {
    if (!formData.Apr_InicioAprendizagem) {
      toast.error("Preencha a Data de Admissão.");
      return;
    }
    if (!formData.Apr_PrevFimAprendizagem && !calFormData.CalDataTerminoIntrodutorios) {
      toast.error("Preencha a Data Prevista de Término do contrato.");
      return;
    }

    const empresaNome =
      parceiros.find(
        (p: any) => String(p.ParCodigo) === String(formData.Apr_InstParceira),
      )?.ParDescricao || "";

    const cursoNome =
      cursos.find(
        (c: any) => String(c.AreaCodigo) === String(formData.Apr_AreaAtuacao),
      )?.AreaDescricao || String(formData.Apr_AreaAtuacao || "");

    const input: CalendarioInput = {
      nomeAprendiz:             formData.Apr_Nome || "",
      curso:                    cursoNome,
      empresa:                  empresaNome,
      jornadaDiaria:            String(formData.Apr_HorasDiarias || "4"),
      diasTeoria:               calFormData.CalDiasAprendizagemTeorica || "",
      diasPratica:              calFormData.CalDiasAprendizagemPratica || "",
      dataAdmissao:             formData.Apr_InicioAprendizagem || "",
      dataTerminoIntrodutorios: calFormData.CalDataTerminoIntrodutorios || "",
      diaEncontroSemanal:       calFormData.CalDiaEncontroSemanal || "",
      dataInicioEncontroSemanal: calFormData.CalDataInicioEncontroSemanal || "",
      diaEncontroMensal:        calFormData.CalDiaEncontroMensal || "",
      semanaEncontroMensal:     calFormData.CalSemanaEncontroMensal || "",
      folga:                    calFormData.CalFolga || "Normal",
      feriados:                 [],
      periodoFeriasDe:          formData.Apr_DataInicioFerias  ?? undefined,
      periodoFeriasAte:         formData.Apr_DataTerminoFerias ?? undefined,
      periodoFerias2De:         calFormData.CalPeriodoFerias2De,
      periodoFerias2Ate:        calFormData.CalPeriodoFerias2Ate,
      periodoSuspensaoDe:       calFormData.CalPeriodoSuspensaoDe,
      periodoSuspensaoAte:      calFormData.CalPeriodoSuspensaoAte,
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

  const inputCls = "p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all";
  const labelCls = "text-xs font-bold text-gray-500 uppercase";

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
          {/* ── Parâmetros básicos (persistidos em CA_Aprendiz) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Curso → Apr_AreaAtuacao */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Curso</label>
              <select
                name="Apr_AreaAtuacao"
                value={formData.Apr_AreaAtuacao ?? ""}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {cursos.map((c: any) => (
                  <option key={c.AreaCodigo} value={c.AreaCodigo}>
                    {c.AreaDescricao}
                  </option>
                ))}
              </select>
            </div>

            {/* Jornada → Apr_HorasDiarias */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Jornada Diária (horas)</label>
              <input
                name="Apr_HorasDiarias"
                type="number"
                value={formData.Apr_HorasDiarias ?? ""}
                onChange={handleChange}
                placeholder="Ex: 4"
                className={inputCls}
              />
            </div>

            {/* Dias teoria → calFormData (sem coluna no banco) */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Dias de Aprendizagem Teórica</label>
              <input
                name="CalDiasAprendizagemTeorica"
                value={calFormData.CalDiasAprendizagemTeorica || ""}
                onChange={handleCalChange}
                className={inputCls}
              />
            </div>

            {/* Dias prática → calFormData */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Dias de Aprendizagem Prática</label>
              <input
                name="CalDiasAprendizagemPratica"
                value={calFormData.CalDiasAprendizagemPratica || ""}
                onChange={handleCalChange}
                className={inputCls}
              />
            </div>

            {/* Data admissão → Apr_InicioAprendizagem */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Data de Admissão</label>
              <input
                type="date"
                name="Apr_InicioAprendizagem"
                value={formData.Apr_InicioAprendizagem ?? ""}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Término introdutórios → calFormData (sem coluna no banco) */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Data de Término Introdutórios</label>
              <input
                type="date"
                name="CalDataTerminoIntrodutorios"
                value={calFormData.CalDataTerminoIntrodutorios || ""}
                onChange={handleCalChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Agenda de encontros (calFormData — sem coluna no banco) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Unidade Introdutório</label>
              <select
                name="CalUnidadeIntrodutorio"
                value={calFormData.CalUnidadeIntrodutorio || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {unidades.map((u: any) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Dia Encontro Semanal</label>
              <select
                name="CalDiaEncontroSemanal"
                value={calFormData.CalDiaEncontroSemanal || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {["Segunda-Feira","Terça-Feira","Quarta-Feira","Quinta-Feira","Sexta-Feira","Sábado","Domingo"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Data Início Encontro Semanal</label>
              <input
                type="date"
                name="CalDataInicioEncontroSemanal"
                value={calFormData.CalDataInicioEncontroSemanal || ""}
                onChange={handleCalChange}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Dia Encontro Mensal</label>
              <select
                name="CalDiaEncontroMensal"
                value={calFormData.CalDiaEncontroMensal || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {["Segunda-Feira","Terça-Feira","Quarta-Feira","Quinta-Feira","Sexta-Feira","Sábado","Domingo"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Semana Encontro Mensal</label>
              <select
                name="CalSemanaEncontroMensal"
                value={calFormData.CalSemanaEncontroMensal || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {["Primeira Semana","Segunda Semana","Terceira Semana","Quarta Semana","Última Semana"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Folga</label>
              <select
                name="CalFolga"
                value={calFormData.CalFolga || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                <option value="Normal">Normal</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
                <option value="Sábado e Domingo">Sábado e Domingo</option>
              </select>
            </div>
          </div>

          {/* ── Unidades de feriado e empresa (misto) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Unidade Feriado Teoria</label>
              <select
                name="CalUnidadeFeriadoTeoria"
                value={calFormData.CalUnidadeFeriadoTeoria || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {unidades.map((u: any) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Unidade Feriado Prática</label>
              <select
                name="CalUnidadeFeriadoPratica"
                value={calFormData.CalUnidadeFeriadoPratica || ""}
                onChange={handleCalChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {unidades.map((u: any) => (
                  <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
                ))}
              </select>
            </div>

            {/* Empresa → Apr_InstParceira (CA_Parceiros) */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Empresa</label>
              <select
                name="Apr_InstParceira"
                value={formData.Apr_InstParceira ?? ""}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {parceiros.map((p: any) => (
                  <option key={p.ParCodigo} value={p.ParCodigo}>{p.ParDescricao}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Período de Férias ── */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              Período de Férias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1º período → Apr_DataInicioFerias / Apr_DataTerminoFerias */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Férias De</label>
                <input
                  type="date"
                  name="Apr_DataInicioFerias"
                  value={formData.Apr_DataInicioFerias ?? ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Férias Até</label>
                <input
                  type="date"
                  name="Apr_DataTerminoFerias"
                  value={formData.Apr_DataTerminoFerias ?? ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              {/* 2º período → calFormData (sem coluna no banco) */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Férias 2 De</label>
                <input
                  type="date"
                  name="CalPeriodoFerias2De"
                  value={calFormData.CalPeriodoFerias2De || ""}
                  onChange={handleCalChange}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Férias 2 Até</label>
                <input
                  type="date"
                  name="CalPeriodoFerias2Ate"
                  value={calFormData.CalPeriodoFerias2Ate || ""}
                  onChange={handleCalChange}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── Período de Suspensão (calFormData — sem coluna no banco) ── */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full" />
              Período de Suspensão
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Suspensão De</label>
                <input
                  type="date"
                  name="CalPeriodoSuspensaoDe"
                  value={calFormData.CalPeriodoSuspensaoDe || ""}
                  onChange={handleCalChange}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Suspensão Até</label>
                <input
                  type="date"
                  name="CalPeriodoSuspensaoAte"
                  value={calFormData.CalPeriodoSuspensaoAte || ""}
                  onChange={handleCalChange}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── Botões ── */}
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
                <span>📊 <strong>{calendarioGerado.resumo.totalEncontros}</strong> encontros</span>
                <span className="text-gray-300">|</span>
                <span>⏱️ <strong>{calendarioGerado.resumo.totalHoras}</strong>h total</span>
                <span className="text-gray-300">|</span>
                <span>📘 {calendarioGerado.resumo.porcentagemTeoria.toFixed(1)}% teoria</span>
                <span className="text-gray-300">|</span>
                <span>📗 {calendarioGerado.resumo.porcentagemPratica.toFixed(1)}% prática</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {showPreview && calendarioGerado && (
        <CalendarioPreview
          calendario={calendarioGerado}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
});
