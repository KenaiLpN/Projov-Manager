import React, { useState, useEffect } from "react";
import { CalendarDays, Calculator, Eye, Users } from "lucide-react";
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
  turmas?: TurmaCalendario[];
  calendarMode?: "aprendiz" | "turma";
  onCalendarModeChange?: (mode: "aprendiz" | "turma") => void;
}

interface TurmaCalendario {
  TurCodigo: number | string;
  TurNome: string;
}

type CalendarioDraftData = AprendizFormData & {
  CalTurma?: string;
  CalTurmaIntrodutorio?: string;
  CalTurmaEncontroSemanal?: string;
  CalTurmaEncontroMensal?: string;
};

export const CalendarioForm = React.memo(function CalendarioForm({
  formData,
  handleChange,
  calFormData,
  handleCalChange,
  unidades,
  instituicoes,
  parceiros,
  cursos,
  turmas = [],
  calendarMode = "aprendiz",
  onCalendarModeChange,
}: Props) {
  const [calendarioGerado, setCalendarioGerado] = useState<CalendarioGerado | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const calendarioDraft = calFormData as CalendarioDraftData;
  const isTurmaMode = calendarMode === "turma";
  const selectedTurma =
    calendarioDraft.CalTurmaEncontroSemanal ||
    calendarioDraft.CalTurmaIntrodutorio ||
    calendarioDraft.CalTurma ||
    (formData.Apr_Turma ? String(formData.Apr_Turma) : "");
  const selectedTurmaNome =
    turmas.find((t) => String(t.TurCodigo) === String(selectedTurma))?.TurNome || "";

  useEffect(() => {
    setCalendarioGerado(null);
    setShowPreview(false);
  }, [calendarMode, selectedTurma]);

  useEffect(() => {
    const cursoId = formData.Apr_AreaAtuacao;
    const jornada = Number(formData.Apr_HorasDiarias);
    if (!cursoId || !jornada) return;

    const curso = cursos.find((c: any) => String(c.AreaCodigo) === String(cursoId));
    if (!curso) return;

    let diasTeoria: number | undefined;
    let diasPratica: number | undefined;

    if (jornada === 4) {
      diasTeoria = Math.ceil((curso.AreaCargaTeorica4h || 0) / 4);
      diasPratica = Math.ceil((curso.AreaCargaPratica4h || 0) / 4);
    } else if (jornada === 6) {
      diasTeoria = Math.ceil((curso.AreaCargaTeorica6h || 0) / 6);
      diasPratica = Math.ceil((curso.AreaCargaPratica6h || 0) / 6);
    }

    if (diasTeoria !== undefined && diasTeoria > 0) {
      handleCalChange({ target: { name: "CalDiasAprendizagemTeorica", value: String(diasTeoria) } } as React.ChangeEvent<HTMLInputElement>);
    }
    if (diasPratica !== undefined && diasPratica > 0) {
      handleCalChange({ target: { name: "CalDiasAprendizagemPratica", value: String(diasPratica) } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [formData.Apr_AreaAtuacao, formData.Apr_HorasDiarias]);

  const gerarCalendarioHandler = () => {
    if (isTurmaMode && !selectedTurma) {
      toast.error("Selecione a turma do encontro semanal.");
      return;
    }
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
      nomeAprendiz:             isTurmaMode ? (selectedTurmaNome || "Calendário de Turma") : (formData.Apr_Nome || ""),
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
  const turmaLabelCls = "text-xs font-semibold text-gray-700 leading-tight min-h-8 flex items-end";
  const modeOptions = [
    { id: "aprendiz" as const, label: "Calendário", icon: CalendarDays },
    { id: "turma" as const, label: "Calendário de Turmas", icon: Users },
  ];

  return (
    <>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            {isTurmaMode ? (
              <Users size={18} className="text-[#133c86]" />
            ) : (
              <CalendarDays size={18} className="text-[#133c86]" />
            )}
            <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
              {isTurmaMode ? "Calendário de Turmas" : "Calendário"}
            </h2>
          </div>
          <div className="inline-flex w-full rounded-xl bg-white border border-gray-200 p-1 shadow-sm sm:w-auto" role="tablist" aria-label="Tipo de calendario">
            {modeOptions.map((option) => {
              const Icon = option.icon;
              const active = calendarMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCalendarModeChange?.(option.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all whitespace-nowrap sm:flex-none ${
                    active
                      ? "bg-[#133c86] text-white shadow"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#133c86]"
                  }`}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {isTurmaMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-x-6 gap-y-5">
              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Código</label>
                <input value={formData.Apr_Codigo ?? ""} readOnly className={`${inputCls} bg-gray-100`} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-10">
                <label className={turmaLabelCls}>Aprendiz</label>
                <input value={formData.Apr_Nome ?? ""} readOnly className={`${inputCls} bg-gray-100`} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Curso</label>
                <select name="Apr_AreaAtuacao" value={formData.Apr_AreaAtuacao ?? ""} onChange={handleChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  {cursos.map((c: any) => (
                    <option key={c.AreaCodigo} value={c.AreaCodigo}>{c.AreaDescricao}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Jornada Diária</label>
                <select name="Apr_HorasDiarias" value={formData.Apr_HorasDiarias ?? ""} onChange={handleChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  <option value="4">4 horas</option>
                  <option value="6">6 horas</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Dias de Aprendizagem Teórica</label>
                <input name="CalDiasAprendizagemTeorica" type="number" value={calFormData.CalDiasAprendizagemTeorica || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Dias de Aprendizagem Prática</label>
                <input name="CalDiasAprendizagemPratica" type="number" value={calFormData.CalDiasAprendizagemPratica || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Data admissão</label>
                <input type="date" name="Apr_InicioAprendizagem" value={formData.Apr_InicioAprendizagem ?? ""} onChange={handleChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Data de Término Introdutórios</label>
                <input type="date" name="CalDataTerminoIntrodutorios" value={calFormData.CalDataTerminoIntrodutorios || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-3">
                <label className={turmaLabelCls}>Turma Introdutório</label>
                <select name="CalTurmaIntrodutorio" value={calendarioDraft.CalTurmaIntrodutorio || ""} onChange={handleCalChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  {turmas.map((t) => (
                    <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-3">
                <label className={turmaLabelCls}>Turma Encontro Semanal</label>
                <select name="CalTurmaEncontroSemanal" value={calendarioDraft.CalTurmaEncontroSemanal || ""} onChange={handleCalChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  {turmas.map((t) => (
                    <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Data Início Encontro Semanal</label>
                <input type="date" name="CalDataInicioEncontroSemanal" value={calFormData.CalDataInicioEncontroSemanal || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Turma Encontro Mensal</label>
                <select name="CalTurmaEncontroMensal" value={calendarioDraft.CalTurmaEncontroMensal || ""} onChange={handleCalChange} className={inputCls}>
                  <option value="">Não se aplica</option>
                  {turmas.map((t) => (
                    <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Folga</label>
                <select name="CalFolga" value={calFormData.CalFolga || ""} onChange={handleCalChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  <option value="Normal">Normal</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                  <option value="Sábado e Domingo">Sábado e Domingo</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Unidade Feriado Teoria</label>
                <select name="CalUnidadeFeriadoTeoria" value={calFormData.CalUnidadeFeriadoTeoria || ""} onChange={handleCalChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  {unidades.map((u: any) => (
                    <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Unidade Feriado Prática</label>
                <select name="CalUnidadeFeriadoPratica" value={calFormData.CalUnidadeFeriadoPratica || ""} onChange={handleCalChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  {unidades.map((u: any) => (
                    <option key={u.UniCodigo} value={u.UniCodigo}>{u.UniNome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-4">
                <label className={turmaLabelCls}>Empresa</label>
                <select name="Apr_InstParceira" value={formData.Apr_InstParceira ?? ""} onChange={handleChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  {parceiros.map((p: any) => (
                    <option key={p.ParCodigo} value={p.ParCodigo}>{p.ParDescricao}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Período férias de</label>
                <input type="date" name="Apr_DataInicioFerias" value={formData.Apr_DataInicioFerias ?? ""} onChange={handleChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Período férias até</label>
                <input type="date" name="Apr_DataTerminoFerias" value={formData.Apr_DataTerminoFerias ?? ""} onChange={handleChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-3">
                <label className={turmaLabelCls}>Período Férias 2 De</label>
                <input type="date" name="CalPeriodoFerias2De" value={calFormData.CalPeriodoFerias2De || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-3">
                <label className={turmaLabelCls}>Período Férias 2 Até</label>
                <input type="date" name="CalPeriodoFerias2Ate" value={calFormData.CalPeriodoFerias2Ate || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Período Suspensão de</label>
                <input type="date" name="CalPeriodoSuspensaoDe" value={calFormData.CalPeriodoSuspensaoDe || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Período Suspensão até</label>
                <input type="date" name="CalPeriodoSuspensaoAte" value={calFormData.CalPeriodoSuspensaoAte || ""} onChange={handleCalChange} className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5 xl:col-span-2">
                <label className={turmaLabelCls}>Tipo de Pagamento</label>
                <select name="Apr_TipoContrato" value={formData.Apr_TipoContrato ?? ""} onChange={handleChange} className={inputCls}>
                  <option value="">Selecione...</option>
                  <option value="C">Projov</option>
                  <option value="E">Empresa</option>
                </select>
              </div>
            </div>
          ) : (
            <>
          {/* ── Parâmetros básicos (persistidos em CA_Aprendiz) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isTurmaMode && (
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Turma</label>
                <select
                  name="CalTurma"
                  value={selectedTurma}
                  onChange={handleCalChange}
                  className={inputCls}
                >
                  <option value="">Selecione...</option>
                  {turmas.map((t) => (
                    <option key={t.TurCodigo} value={t.TurCodigo}>
                      {t.TurNome}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              <select
                name="Apr_HorasDiarias"
                value={formData.Apr_HorasDiarias ?? ""}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                <option value="4">4 horas</option>
                <option value="6">6 horas</option>
              </select>
            </div>

            {/* Dias teoria → calFormData (preenchido automaticamente pelo curso + jornada) */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>
                Dias de Aprendizagem Teórica
                {calFormData.CalDiasAprendizagemTeorica && formData.Apr_AreaAtuacao && (
                  <span className="ml-2 text-blue-500 normal-case font-normal text-[10px]">auto</span>
                )}
              </label>
              <input
                name="CalDiasAprendizagemTeorica"
                type="number"
                value={calFormData.CalDiasAprendizagemTeorica || ""}
                onChange={handleCalChange}
                className={inputCls}
              />
            </div>

            {/* Dias prática → calFormData */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>
                Dias de Aprendizagem Prática
                {calFormData.CalDiasAprendizagemPratica && formData.Apr_AreaAtuacao && (
                  <span className="ml-2 text-blue-500 normal-case font-normal text-[10px]">auto</span>
                )}
              </label>
              <input
                name="CalDiasAprendizagemPratica"
                type="number"
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

            </>
          )}

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
          </div>

          {/* ── Resumo do calendário gerado ── */}
          {calendarioGerado && (
            <div className="border-t border-gray-100 pt-6">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    { label: "Data de Término de Contrato", valor: calendarioGerado.resumo.dataTerminoContrato },
                    { label: "Data de Início Introdutório", valor: calendarioGerado.resumo.inicioFormacao },
                    { label: "Data de Término Introdutório", valor: calFormData.CalDataTerminoIntrodutorios
                        ? calFormData.CalDataTerminoIntrodutorios.split("-").reverse().join("/")
                        : "" },
                    { label: "Número de Encontros Introdutório", valor: calendarioGerado.resumo.encontrosIntrodutorio },
                    { label: "Data de Início na Empresa", valor: calendarioGerado.resumo.dataInicioEmpresa },
                    { label: "Data de Início Encontro Semanal", valor: calendarioGerado.resumo.dataInicioEncontroSemanal },
                    { label: "Número de Encontros Semanal", valor: calendarioGerado.resumo.encontrosSemanal },
                    { label: "Data de Início Encontro Finais", valor: calendarioGerado.resumo.dataInicioEncontroFinais },
                    { label: "Encontros Finais (Mensal)", valor: calendarioGerado.resumo.encontrosMensal },
                    { label: "Número de Dias Teoria", valor: calendarioGerado.resumo.diasTeoria },
                    { label: "Número de Dias Prática", valor: calendarioGerado.resumo.diasPratica },
                  ].map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-2 font-semibold text-gray-700 border border-gray-200 w-2/3">
                        {item.label}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-gray-800 border border-gray-200 w-1/3">
                        {item.valor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
