"use client";

import { useState, useEffect, useCallback } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Turma { TurCodigo: number; TurNome: string; }
interface Parceiro { ParCodigo: number; ParDescricao: string; }

type TabId = "data" | "turma-periodo" | "parceiro-periodo" | "relatorios";

type SubData = "regular" | "capacitacao";
type SubTurma = "presenca" | "presenca-cap" | "total-aulas" | "total-aulas-cap" | "conteudos";
type SubParceiro = "presenca" | "total-aulas" | "faltas-parceiro";
type SubRelatorio = "contagem-faltas" | "aulas-dadas" | "aprendizes-faltas";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return format(new Date(iso.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR });
}
function pct(v: number) {
  const color = v >= 75 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-600";
  return <span className={`font-semibold ${color}`}>{v}%</span>;
}

// ─── Shared UI ───────────────────────────────────────────────────────────────
function TH({ children }: { children: React.ReactNode }) {
  return <th className="bg-[#133c86] text-white text-xs uppercase tracking-wider px-4 py-3 text-left font-semibold whitespace-nowrap">{children}</th>;
}
function TD({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <td className={`px-4 py-3 text-sm text-slate-700 border-b border-slate-100 ${center ? "text-center" : ""}`}>{children}</td>;
}
function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm">Nenhum dado encontrado.</p>
    </div>
  );
}
function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-[#133c86]/20 border-t-[#133c86] rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ControlePresencaPage() {
  const [tab, setTab] = useState<TabId>("data");
  const [subData, setSubData] = useState<SubData>("regular");
  const [subTurma, setSubTurma] = useState<SubTurma>("presenca");
  const [subParceiro, setSubParceiro] = useState<SubParceiro>("presenca");
  const [subRelatorio, setSubRelatorio] = useState<SubRelatorio>("contagem-faltas");

  // filter states
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [datas, setDatas] = useState<string[]>([]);

  const [selTurma, setSelTurma] = useState("");
  const [selData, setSelData] = useState("");
  const [selParceiro, setSelParceiro] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minFaltas, setMinFaltas] = useState("8");
  const [tipoPagamento, setTipoPagamento] = useState("Todos");

  // results
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // load reference data
  useEffect(() => {
    api.get("/turmas?limit=1000").then(r => setTurmas(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => {});
    api.get("/parceiros?page=1&limit=1000").then(r => setParceiros(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => {});
  }, []);

  // load available dates when turma changes (for "Por Data" tab)
  useEffect(() => {
    if (!selTurma) { setDatas([]); setSelData(""); return; }
    api.get(`/attendance/turmas/${selTurma}/dates`)
      .then(r => { setDatas(Array.isArray(r.data) ? r.data : []); setSelData(""); })
      .catch(() => {});
  }, [selTurma]);

  // reset results on tab/sub change
  useEffect(() => { setResult(null); }, [tab, subData, subTurma, subParceiro, subRelatorio]);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (tab === "data") {
      if (!selTurma || !selData) return null;
      params.set("turmaId", selTurma);
      params.set("date", selData.substring(0, 10));
      return `/presenca/data?${params}`;
    }
    if (tab === "turma-periodo") {
      if (!selTurma || !startDate || !endDate) return null;
      params.set("turmaId", selTurma);
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (subTurma === "presenca" || subTurma === "presenca-cap") return `/presenca/turma-periodo?${params}`;
      if (subTurma === "total-aulas" || subTurma === "total-aulas-cap") return `/presenca/total-aulas-turma?${params}`;
      if (subTurma === "conteudos") return `/presenca/conteudos?${params}`;
    }
    if (tab === "parceiro-periodo") {
      if (!startDate || !endDate) return null;
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (subParceiro === "faltas-parceiro") return `/presenca/faltas-parceiro?${params}`;
      if (!selParceiro) return null;
      params.set("parceiroId", selParceiro);
      if (subParceiro === "presenca") return `/presenca/parceiro-periodo?${params}`;
      if (subParceiro === "total-aulas") return `/presenca/total-aulas-parceiro?${params}`;
    }
    if (tab === "relatorios") {
      if (!startDate || !endDate) return null;
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (subRelatorio === "contagem-faltas") {
        if (tipoPagamento !== "Todos") params.set("tipoPagamento", tipoPagamento);
        return `/presenca/contagem-faltas?${params}`;
      }
      if (subRelatorio === "aulas-dadas") return `/presenca/aulas-dadas?${params}`;
      if (subRelatorio === "aprendizes-faltas") {
        params.set("minFaltas", minFaltas);
        if (selTurma) params.set("turmaId", selTurma);
        if (selParceiro) params.set("parceiroId", selParceiro);
        return `/presenca/aprendizes-faltas?${params}`;
      }
    }
    return null;
  }, [tab, subData, subTurma, subParceiro, subRelatorio, selTurma, selData, selParceiro, startDate, endDate, minFaltas, tipoPagamento]);

  const handleSearch = async () => {
    const url = buildQuery();
    if (!url) { toast.error("Preencha todos os filtros obrigatórios."); return; }
    setLoading(true);
    setResult(null);
    try {
      const r = await api.get(url);
      setResult(r.data);
    } catch {
      toast.error("Erro ao buscar dados.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Tab definitions ────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string }[] = [
    { id: "data", label: "Por Data" },
    { id: "turma-periodo", label: "Turma por Período" },
    { id: "parceiro-periodo", label: "Parceiro por Período" },
    { id: "relatorios", label: "Relatórios" },
  ];

  // ─── Filters per tab ────────────────────────────────────────────────────
  function Filters() {
    const turmaSelect = (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</label>
        <select value={selTurma} onChange={e => setSelTurma(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none">
          <option value="">Selecione...</option>
          {turmas.map(t => <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>)}
        </select>
      </div>
    );
    const parceiroSelect = (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parceiro</label>
        <select value={selParceiro} onChange={e => setSelParceiro(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none">
          <option value="">Selecione...</option>
          {parceiros.map(p => <option key={p.ParCodigo} value={p.ParCodigo}>{p.ParDescricao}</option>)}
        </select>
      </div>
    );
    const periodInputs = (
      <>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período — de</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">até</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none" />
        </div>
      </>
    );

    if (tab === "data") return (
      <div className="flex flex-wrap gap-4 items-end">
        {turmaSelect}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data</label>
          <select value={selData} onChange={e => setSelData(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none min-w-[220px]">
            <option value="">Selecione a data...</option>
            {datas.map(d => <option key={d} value={d}>{format(new Date(d.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}</option>)}
          </select>
        </div>
      </div>
    );

    if (tab === "turma-periodo") return (
      <div className="flex flex-wrap gap-4 items-end">
        {turmaSelect}
        {periodInputs}
      </div>
    );

    if (tab === "parceiro-periodo") return (
      <div className="flex flex-wrap gap-4 items-end">
        {subParceiro !== "faltas-parceiro" && parceiroSelect}
        {periodInputs}
      </div>
    );

    if (tab === "relatorios") {
      return (
        <div className="flex flex-wrap gap-4 items-end">
          {subRelatorio === "contagem-faltas" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo Pagamento</label>
              <select value={tipoPagamento} onChange={e => setTipoPagamento(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none">
                <option>Todos</option>
                <option>Mensalidade</option>
                <option>Bolsa</option>
              </select>
            </div>
          )}
          {subRelatorio === "aprendizes-faltas" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qtde Mín. Faltas</label>
                <input type="number" min={1} value={minFaltas} onChange={e => setMinFaltas(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none" />
              </div>
              {turmaSelect}
              {parceiroSelect}
            </>
          )}
          {periodInputs}
        </div>
      );
    }
    return null;
  }

  // ─── Sub-option bars ────────────────────────────────────────────────────
  function SubBar() {
    function SubBtn({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
      return (
        <button onClick={onClick} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${active ? "bg-[#133c86] text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          {label}
        </button>
      );
    }
    if (tab === "data") return (
      <div className="flex gap-2 flex-wrap">
        <SubBtn id="regular" label="Turma Regular" active={subData === "regular"} onClick={() => setSubData("regular")} />
        <SubBtn id="capacitacao" label="Capacitação" active={subData === "capacitacao"} onClick={() => setSubData("capacitacao")} />
      </div>
    );
    if (tab === "turma-periodo") return (
      <div className="flex gap-2 flex-wrap">
        {([
          ["presenca", "Presença"],
          ["presenca-cap", "Presença Capacitação"],
          ["total-aulas", "Total Aulas"],
          ["total-aulas-cap", "Total Aulas Cap."],
          ["conteudos", "Conteúdos Lecionados"],
        ] as [SubTurma, string][]).map(([id, label]) => (
          <SubBtn key={id} id={id} label={label} active={subTurma === id} onClick={() => setSubTurma(id)} />
        ))}
      </div>
    );
    if (tab === "parceiro-periodo") return (
      <div className="flex gap-2 flex-wrap">
        {([
          ["presenca", "Presença"],
          ["total-aulas", "Total Aulas"],
          ["faltas-parceiro", "Faltas por Parceiro"],
        ] as [SubParceiro, string][]).map(([id, label]) => (
          <SubBtn key={id} id={id} label={label} active={subParceiro === id} onClick={() => setSubParceiro(id)} />
        ))}
      </div>
    );
    if (tab === "relatorios") return (
      <div className="flex gap-2 flex-wrap">
        {([
          ["contagem-faltas", "Contagem de Faltas"],
          ["aulas-dadas", "Aulas Dadas"],
          ["aprendizes-faltas", "Aprendizes com Faltas"],
        ] as [SubRelatorio, string][]).map(([id, label]) => (
          <SubBtn key={id} id={id} label={label} active={subRelatorio === id} onClick={() => setSubRelatorio(id)} />
        ))}
      </div>
    );
    return null;
  }

  // ─── Result tables ───────────────────────────────────────────────────────
  function Results() {
    if (loading) return <Spinner />;
    if (!result) return null;

    // 1. Por Data
    if (tab === "data") {
      const { sessions, students } = result as {
        sessions: { ordem: number; disciplina: string; conteudo: string; recursos: string; observacoes: string }[];
        students: { IdAluno: number; NomeJovem: string; presencas: { ordem: number; presenca: string | null }[] }[];
      };
      if (!students?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          {sessions.some(s => s.conteudo) && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {sessions.map(s => s.conteudo && (
                <div key={s.ordem} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">{s.disciplina} — {s.ordem}ª Aula</p>
                  <p className="text-sm text-slate-700"><span className="font-semibold">Conteúdo:</span> {s.conteudo}</p>
                  {s.recursos && <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Recursos:</span> {s.recursos}</p>}
                  {s.observacoes && <p className="text-sm text-slate-500 mt-1 italic">{s.observacoes}</p>}
                </div>
              ))}
            </div>
          )}
          <table className="w-full">
            <thead><tr>
              <TH>Matrícula</TH>
              <TH>Nome</TH>
              {sessions.map(s => <TH key={s.ordem}>{s.ordem}ª Aula<br /><span className="font-normal normal-case">{s.disciplina}</span></TH>)}
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.IdAluno} className="hover:bg-slate-50">
                  <TD>{s.IdAluno}</TD>
                  <TD>{s.NomeJovem}</TD>
                  {s.presencas.map(p => {
                    const v = p.presenca?.toUpperCase() || "";
                    const cls = v === "P" ? "bg-green-100 text-green-700" : v === "F" ? "bg-red-100 text-red-700" : v ? "bg-yellow-100 text-yellow-700" : "text-slate-300";
                    return <TD key={p.ordem} center><span className={`inline-block w-7 h-7 rounded-full text-center font-bold text-sm leading-7 ${cls}`}>{v || "·"}</span></TD>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 2. Presença Turma por Período
    if (tab === "turma-periodo" && (subTurma === "presenca" || subTurma === "presenca-cap")) {
      const { totalAulas, students } = result as { totalAulas: number; students: any[] };
      if (!students?.length) return <Empty />;
      return (
        <div>
          <p className="text-sm text-slate-500 mb-3 px-1">Total de aulas no período: <strong>{totalAulas}</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <TH>Matrícula</TH><TH>Nome</TH><TH>Presenças</TH><TH>Faltas</TH><TH>Justificadas</TH><TH>Total Reg.</TH><TH>% Freq.</TH>
              </tr></thead>
              <tbody>
                {students.map((s: any) => (
                  <tr key={s.IdAluno} className="hover:bg-slate-50">
                    <TD>{s.IdAluno}</TD><TD>{s.NomeJovem}</TD>
                    <TD center>{s.presencas}</TD><TD center>{s.faltas}</TD><TD center>{s.justificadas}</TD><TD center>{s.total}</TD>
                    <TD center>{pct(s.percentual)}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 3. Total Aulas Turma por Período
    if (tab === "turma-periodo" && (subTurma === "total-aulas" || subTurma === "total-aulas-cap")) {
      const data = result as { disciplina: string; totalDias: number; totalSessoes: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Disciplina</TH><TH>Dias de Aula</TH><TH>Total Sessões</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <TD>{r.disciplina}</TD><TD center>{r.totalDias}</TD><TD center>{r.totalSessoes}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 4. Conteúdos Lecionados
    if (tab === "turma-periodo" && subTurma === "conteudos") {
      const data = result as { data: string; ordem: number; disciplina: string; conteudo: string; recursos: string; observacoes: string }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Data</TH><TH>Aula</TH><TH>Disciplina</TH><TH>Conteúdo Lecionado</TH><TH>Recursos Usados</TH><TH>Observações</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <TD>{fmtDate(r.data)}</TD><TD center>{r.ordem}ª</TD><TD>{r.disciplina}</TD>
                  <TD>{r.conteudo || "—"}</TD><TD>{r.recursos || "—"}</TD><TD>{r.observacoes || "—"}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 5. Presença Parceiro por Período
    if (tab === "parceiro-periodo" && subParceiro === "presenca") {
      const data = result as { IdAluno: number; NomeJovem: string; unidade: string; presencas: number; faltas: number; total: number; percentual: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Matrícula</TH><TH>Nome</TH><TH>Unidade</TH><TH>Presenças</TH><TH>Faltas</TH><TH>Total</TH><TH>% Freq.</TH></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.IdAluno} className="hover:bg-slate-50">
                  <TD>{r.IdAluno}</TD><TD>{r.NomeJovem}</TD><TD>{r.unidade}</TD>
                  <TD center>{r.presencas}</TD><TD center>{r.faltas}</TD><TD center>{r.total}</TD><TD center>{pct(r.percentual)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 6. Total Aulas Parceiro
    if (tab === "parceiro-periodo" && subParceiro === "total-aulas") {
      const data = result as { turma: string; totalAulas: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Turma</TH><TH>Total Aulas</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50"><TD>{r.turma}</TD><TD center>{r.totalAulas}</TD></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 7. Faltas por Parceiro
    if (tab === "parceiro-periodo" && subParceiro === "faltas-parceiro") {
      const data = result as { parceiro: string; unidade: string; faltas: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Parceiro</TH><TH>Unidade</TH><TH>Total Faltas</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <TD>{r.parceiro}</TD><TD>{r.unidade}</TD>
                  <TD center><span className="font-bold text-red-600">{r.faltas}</span></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 8. Contagem de Faltas
    if (tab === "relatorios" && subRelatorio === "contagem-faltas") {
      const data = result as { IdAluno: number; NomeJovem: string; tipoPagamento: string; presencas: number; faltas: number; total: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Matrícula</TH><TH>Nome</TH><TH>Tipo Pagamento</TH><TH>Presenças</TH><TH>Faltas</TH><TH>Total Reg.</TH></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.IdAluno} className="hover:bg-slate-50">
                  <TD>{r.IdAluno}</TD><TD>{r.NomeJovem}</TD><TD>{r.tipoPagamento || "—"}</TD>
                  <TD center>{r.presencas}</TD>
                  <TD center><span className={r.faltas > 0 ? "font-bold text-red-600" : ""}>{r.faltas}</span></TD>
                  <TD center>{r.total}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 9. Aulas Dadas
    if (tab === "relatorios" && subRelatorio === "aulas-dadas") {
      const data = result as { data: string; ordem: number; turma: string; disciplina: string; conteudo: string }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Data</TH><TH>Aula</TH><TH>Turma</TH><TH>Disciplina</TH><TH>Conteúdo</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <TD>{fmtDate(r.data)}</TD><TD center>{r.ordem}ª</TD><TD>{r.turma}</TD><TD>{r.disciplina}</TD><TD>{r.conteudo || "—"}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 10. Aprendizes com Faltas
    if (tab === "relatorios" && subRelatorio === "aprendizes-faltas") {
      const data = result as { IdAluno: number; NomeJovem: string; turma: string; unidadeParceiro: string; faltas: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Matrícula</TH><TH>Nome</TH><TH>Turma</TH><TH>Unidade Parceiro</TH><TH>Faltas</TH></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={`${r.IdAluno}-${r.turma}`} className="hover:bg-slate-50">
                  <TD>{r.IdAluno}</TD><TD>{r.NomeJovem}</TD><TD>{r.turma}</TD><TD>{r.unidadeParceiro}</TD>
                  <TD center><span className="font-bold text-red-600">{r.faltas}</span></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  const tabTitles: Record<TabId, string> = {
    "data": "Controle de Presença por Data/Turma",
    "turma-periodo": "Controle de Presença de Turma por Período",
    "parceiro-periodo": "Controle de Presença de Parceiro por Período",
    "relatorios": "Relatórios de Faltas e Aulas",
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
          <h1 className="text-2xl font-bold text-[#133c86] tracking-tight">CONTROLE DE PRESENÇA</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tabTitles[tab]}</p>

          {/* Main tabs */}
          <div className="flex gap-1 mt-4 border-b border-slate-200">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all -mb-px ${
                  tab === t.id
                    ? "bg-white border border-b-white border-slate-200 text-[#133c86]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          {/* Sub-options + Filters + Search button */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <SubBar />
            <div className="flex flex-wrap gap-4 items-end">
              <Filters />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-[#133c86] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f2e6b] disabled:bg-slate-300 transition-all shadow-md active:scale-95"
              >
                {loading ? "Pesquisando..." : "Pesquisar"}
              </button>
            </div>
          </div>

          {/* Results */}
          {(result || loading) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resultados
              </div>
              <div className="p-4">
                <Results />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
