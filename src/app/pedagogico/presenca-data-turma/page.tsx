"use client";

import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { downloadElementAsPdf } from "@/utils/downloadElementAsPdf";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Turma { TurCodigo: number; TurNome: string; }
interface Parceiro { ParCodigo: number; ParDescricao: string; }
interface SituacaoAprendiz { StaCodigo: number; StaDescricao: string | null; }
interface UnidadeParceiro { ParUniCodigo: number; ParUniDescricao: string; }

const offscreenReportStyle = (width: number): CSSProperties => ({
  position: "fixed",
  left: 0,
  top: 0,
  width: `${width}px`,
  backgroundColor: "#fff",
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
});

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}

type TabId =
  | "comunicado-faltas"
  | "data-turma"
  | "data-turma-capacitacao"
  | "turma-periodo"
  | "turma-periodo-capacitacao"
  | "parceiro-periodo"
  | "total-aulas-turma"
  | "total-aulas-turma-capacitacao"
  | "total-aulas-parceiro"
  | "faltas-parceiro"
  | "contagem-faltas-periodo"
  | "conteudos-lecionados"
  | "aulas-dadas"
  | "controle-faltas"
  | "estatisticas-presenca-jovem";

type PeriodMatrixColumn = {
  key: string;
  label: string;
  date: string;
  ordem: number;
};

type PeriodMatrixStudent = {
  key?: string;
  IdAluno: number;
  NomeJovem: string;
  UnidadeParceiro: string;
  Turma?: string;
  presencas: Record<string, string>;
};

type PeriodMatrixResult = {
  kind: "period-matrix";
  columns: PeriodMatrixColumn[];
  students: PeriodMatrixStudent[];
};

type TotalPeriodoTurmaColumn = {
  key: string;
  label: string;
};

type TotalPeriodoTurmaStudent = {
  IdAluno: number;
  NomeJovem: string;
  UnidadeParceiro?: string;
  totais: Record<string, { aulas: number; presencas: number; justificadas?: number; faltas: number }>;
};

type TotalPeriodoTurmaResult = {
  kind: "total-periodo-turma";
  columns: TotalPeriodoTurmaColumn[];
  students: TotalPeriodoTurmaStudent[];
};

type ContagemFaltasPeriodoRow = {
  parceiro: string;
  cnpj: string;
  codAprendiz: number;
  numSistExt: string;
  nome: string;
  tipoPagamento?: string;
  faltaDias: number;
  horasFalta: number;
  aulasPeriodo: number;
};

type EstatisticaPresencaJovemRow = {
  codigo: number;
  nome: string;
  unidadeParceiro: string;
  status: string;
  inicioAprendizagem: string | null;
  previsaoFimAprendizagem: string | null;
  faltas: number;
  faltasJustificadas: number;
  aCursar: number;
  total: number;
  presenca: number;
  aulasCursadas: number;
  percentual: number;
};

type DataTurmaSession = {
  ordem: number;
  disciplina?: string | null;
  conteudo?: string | null;
  recursos?: string | null;
  observacoes?: string | null;
};

type DataTurmaPresence = {
  ordem: number;
  presenca: string | null;
  presencaInf?: string | null;
  disciplina?: string | null;
  modulo?: string | null;
};

type DataTurmaStudent = {
  IdAluno: number;
  NomeJovem: string;
  Turma?: string | null;
  TurNome?: string | null;
  Parceiro?: string | null;
  parceiro?: string | null;
  UnidadeParceiro?: string | null;
  unidadeParceiro?: string | null;
  AreaAtuacao?: string | null;
  areaAtuacao?: string | null;
  AreaDescricao?: string | null;
  presencas: DataTurmaPresence[];
};

type DataTurmaRow = {
  key: string;
  turma: string;
  codigo: number;
  nome: string;
  modulo: string;
  parceiro: string;
  areaAtuacao: string;
  presenca: string;
  presencaInf: string;
};

type DataTurmaSortKey = Exclude<keyof DataTurmaRow, "key">;
type SortDirection = "asc" | "desc";

type DataTurmaResult = {
  sessions: DataTurmaSession[];
  students: DataTurmaStudent[];
};

type CapacitacaoAprendiz = {
  Apr_Codigo?: number | string;
  IdAluno?: number | string;
  Apr_Nome?: string | null;
  NomeJovem?: string | null;
  Turma?: string | null;
  TurNome?: string | null;
  Parceiro?: string | null;
  parceiro?: string | null;
  UnidadeParceiro?: string | null;
  unidadeParceiro?: string | null;
  AreaAtuacao?: string | null;
  areaAtuacao?: string | null;
  AreaDescricao?: string | null;
  CapDataInicio?: string | null;
  CapDataPrevTermino?: string | null;
  CapDataTermino?: string | null;
};

type CapacitacaoPresenca = {
  AcpAprendiz?: number | string;
  IdAluno?: number | string;
  Apr_Codigo?: number | string;
  aprendiz?: number | string;
  AcpPresenca?: string | null;
  AcpPresencaInf?: string | null;
  AcpPresencaInformatica?: string | null;
  presenca?: string | null;
  presencaInf?: string | null;
  presencaInformatica?: string | null;
  Presenca?: string | null;
  PresencaInf?: string | null;
  PresencaInformatica?: string | null;
};

const dataTurmaColumns: { key: DataTurmaSortKey; label: string }[] = [
  { key: "turma", label: "Turma" },
  { key: "codigo", label: "Código" },
  { key: "nome", label: "Nome" },
  { key: "modulo", label: "Módulo" },
  { key: "parceiro", label: "Parceiro" },
  { key: "areaAtuacao", label: "Área Atuação" },
  { key: "presenca", label: "Presença" },
];

const dataTurmaCapacitacaoColumns: { key: DataTurmaSortKey; label: string }[] = [
  { key: "turma", label: "Turma" },
  { key: "codigo", label: "Código" },
  { key: "nome", label: "Nome" },
  { key: "presenca", label: "Presença" },
  { key: "presencaInf", label: "Pres. Inf." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return format(new Date(iso.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR });
}
function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return `"${text.replace(/"/g, '""')}"`;
}
function pct(v: number) {
  const color = v >= 75 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-600";
  return <span className={`font-semibold ${color}`}>{v}%</span>;
}
function isFourDigitNativeDate(value: string) {
  return value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
function parseBrDateToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return "";
  }
  return `${yyyy}-${mm}-${dd}`;
}
function formatIsoToBrDate(value: string) {
  if (!value) return "";
  const iso = value.substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return value;
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}
function normalizeDateParam(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.substring(0, 10);
  return parseBrDateToIso(value);
}
function normalizeLooseDateParam(value: unknown) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.substring(0, 10);
  return parseBrDateToIso(text);
}
function normalizePayloadDate(value: unknown) {
  if (typeof value === "string") return normalizeLooseDateParam(value);
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  return normalizeLooseDateParam(
    record.data ??
      record.Data ??
      record.date ??
      record.Date ??
      record.AcpData ??
      record.CapData ??
      record.PresData ??
      record.AulaData ??
      record.dia ??
      record.Dia
  );
}
function asArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as { data?: unknown; rows?: unknown; items?: unknown; result?: unknown };
  const nested = record.data ?? record.rows ?? record.items ?? record.result;
  return Array.isArray(nested) ? (nested as T[]) : [];
}
function toNumericId(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
function isDateInsideCapacitacao(aprendiz: CapacitacaoAprendiz, date: string) {
  const start = normalizeLooseDateParam(aprendiz.CapDataInicio);
  const end =
    normalizeLooseDateParam(aprendiz.CapDataTermino) ||
    normalizeLooseDateParam(aprendiz.CapDataPrevTermino);

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}
function isPeriodOverlappingCapacitacao(aprendiz: CapacitacaoAprendiz, startDate: string, endDate: string) {
  const start = normalizeLooseDateParam(aprendiz.CapDataInicio);
  const end =
    normalizeLooseDateParam(aprendiz.CapDataTermino) ||
    normalizeLooseDateParam(aprendiz.CapDataPrevTermino);

  if (start && start > endDate) return false;
  if (end && end < startDate) return false;
  return true;
}
function getFirstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}
function formatPresence(value: string | null | undefined) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized || normalized === "P") return normalized === "P" ? "." : "";
  return normalized;
}
function formatCapacitacaoPeriodPresence(value: string | null | undefined) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized || normalized === "P") return "..";
  return normalized;
}
function compareDataTurmaValue(a: DataTurmaRow, b: DataTurmaRow, key: DataTurmaSortKey) {
  if (key === "codigo") return a.codigo - b.codigo;
  return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

// ─── Shared UI ───────────────────────────────────────────────────────────────
function TH({ children }: { children: React.ReactNode }) {
  return <th className="bg-[#133c86] text-white text-xs uppercase tracking-wider px-4 py-3 text-left font-semibold whitespace-nowrap">{children}</th>;
}
function TD({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <td className={`px-4 py-3 text-sm text-gray-700 border-b border-gray-100 ${center ? "text-center" : ""}`}>{children}</td>;
}
function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
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
  const [tab, setTab] = useState<TabId>("data-turma");

  // filter states
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [situacoesAprendiz, setSituacoesAprendiz] = useState<SituacaoAprendiz[]>([]);
  const [unidadesParceiro, setUnidadesParceiro] = useState<UnidadeParceiro[]>([]);
  const [datas, setDatas] = useState<string[]>([]);

  const [selTurma, setSelTurma] = useState("");
  const [selData, setSelData] = useState("");
  const [selParceiro, setSelParceiro] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conteudoLecionado, setConteudoLecionado] = useState("");
  const [recursosUsados, setRecursosUsados] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [minFaltas, setMinFaltas] = useState("8");
  const [tipoPagamento, setTipoPagamento] = useState("T");
  const [selSituacaoAprendiz, setSelSituacaoAprendiz] = useState("");
  const [selUnidadeParceiro, setSelUnidadeParceiro] = useState("");

  // results
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [gridSearch, setGridSearch] = useState("");
  const [gridPageSize, setGridPageSize] = useState(10);
  const [gridPage, setGridPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportPdfRef = useRef<HTMLDivElement>(null);
  const [dataTurmaSort, setDataTurmaSort] = useState<{
    key: DataTurmaSortKey;
    direction: SortDirection;
  } | null>(null);

  // load reference data
  useEffect(() => {
    api.get("/turmas?limit=1000").then(r => setTurmas(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => {});
    api.get("/parceiros?page=1&limit=1000").then(r => setParceiros(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => {});
    api.get("/presenca/estatisticas-jovem/filtros").then(r => {
      setSituacoesAprendiz(Array.isArray(r.data?.situacoes) ? r.data.situacoes : []);
      setUnidadesParceiro(Array.isArray(r.data?.unidades) ? r.data.unidades : []);
    }).catch(() => {});
  }, []);

  // load available dates when turma changes (for "Por Data" tab)
  useEffect(() => {
    if (!selTurma) { setDatas([]); setSelData(""); return; }
    if (tab === "data-turma") {
      api.get(`/attendance/turmas/${selTurma}/dates`)
        .then(r => { setDatas(Array.isArray(r.data) ? r.data : []); setSelData(""); })
        .catch(() => {});
      return;
    }
    if (tab === "data-turma-capacitacao") {
      api.get(`/faltas-capacitacao/datas?turma=${encodeURIComponent(selTurma)}`)
        .then(r => {
          const dates = asArrayPayload<unknown>(r.data)
            .map(normalizePayloadDate)
            .filter(Boolean)
            .sort();
          setDatas([...new Set(dates)]);
          setSelData("");
        })
        .catch(() => {});
      return;
    }
    setDatas([]);
  }, [selTurma, tab]);

  // reset results on tab/sub change
  useEffect(() => { setResult(null); }, [tab]);
  useEffect(() => {
    setGridSearch("");
    setGridPage(1);
    setDataTurmaSort(null);
  }, [result, tab]);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (tab === "comunicado-faltas") return null;

    if (tab === "data-turma") {
      const date = normalizeDateParam(selData);
      if (!selTurma || !date) return null;
      params.set("turmaId", selTurma);
      params.set("date", date);
      return `/presenca/data?${params}`;
    }

    if (
      tab === "turma-periodo" ||
      tab === "total-aulas-turma" ||
      tab === "total-aulas-turma-capacitacao" ||
      tab === "conteudos-lecionados"
    ) {
      if (!selTurma || !startDate || !endDate) return null;
      params.set("turmaId", selTurma);
      params.set("startDate", startDate);
      params.set("endDate", endDate);

      if (tab === "turma-periodo") return `/presenca/turma-periodo?${params}`;
      if (tab === "total-aulas-turma") return `/presenca/total-aulas-turma?${params}`;
      if (tab === "total-aulas-turma-capacitacao") return `/presenca/total-aulas-turma-capacitacao?${params}`;
      if (tab === "conteudos-lecionados") return `/presenca/conteudos?${params}`;
    }

    if (tab === "parceiro-periodo" || tab === "total-aulas-parceiro" || tab === "faltas-parceiro") {
      if (!startDate || !endDate) return null;
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (tab === "faltas-parceiro") return `/presenca/faltas-parceiro?${params}`;
      if (!selParceiro) return null;
      params.set("parceiroId", selParceiro);
      if (tab === "parceiro-periodo") return `/presenca/parceiro-periodo?${params}`;
      if (tab === "total-aulas-parceiro") return `/presenca/total-aulas-parceiro?${params}`;
    }

    if (tab === "estatisticas-presenca-jovem") {
      if (selSituacaoAprendiz) params.set("statusId", selSituacaoAprendiz);
      if (selUnidadeParceiro) params.set("unidadeParceiroId", selUnidadeParceiro);
      return `/presenca/estatisticas-jovem?${params}`;
    }

    if (tab === "contagem-faltas-periodo" || tab === "aulas-dadas" || tab === "controle-faltas") {
      if (!startDate || !endDate) return null;
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (tab === "contagem-faltas-periodo") {
        if (tipoPagamento !== "T") params.set("tipoPagamento", tipoPagamento);
        return `/presenca/contagem-faltas?${params}`;
      }
      if (tab === "aulas-dadas") return `/presenca/aulas-dadas?${params}`;
      if (tab === "controle-faltas") {
        params.set("minFaltas", minFaltas);
        if (selTurma) params.set("turmaId", selTurma);
        if (selParceiro) params.set("parceiroId", selParceiro);
        return `/presenca/aprendizes-faltas?${params}`;
      }
    }
    return null;
  }, [tab, selTurma, selData, selParceiro, startDate, endDate, minFaltas, tipoPagamento, selSituacaoAprendiz, selUnidadeParceiro]);

  const buildPeriodMatrix = useCallback(async (): Promise<PeriodMatrixResult | null> => {
    if (!selTurma || !startDate || !endDate) return null;

    const params = new URLSearchParams({
      turmaId: selTurma,
      startDate,
      endDate,
    });
    const response = await api.get<PeriodMatrixResult>(`/presenca/turma-periodo-matriz?${params}`);

    return {
      kind: "period-matrix",
      columns: Array.isArray(response.data?.columns) ? response.data.columns : [],
      students: Array.isArray(response.data?.students) ? response.data.students : [],
    };
  }, [endDate, selTurma, startDate]);

  const buildDataTurmaCapacitacao = useCallback(async (date: string): Promise<DataTurmaResult> => {
    const turmaParam = encodeURIComponent(selTurma);
    const dateParam = encodeURIComponent(date);
    const [aprendizesResponse, presencasResponse] = await Promise.all([
      api.get(`/faltas-capacitacao/aprendizes?turma=${turmaParam}&data=${dateParam}`),
      api.get(`/faltas-capacitacao/presencas?turma=${turmaParam}&data=${dateParam}`),
    ]);
    const aprendizes = asArrayPayload<CapacitacaoAprendiz>(aprendizesResponse.data)
      .filter(aprendiz => isDateInsideCapacitacao(aprendiz, date));
    const presencas = asArrayPayload<CapacitacaoPresenca>(presencasResponse.data);
    const turmaName = turmas.find(t => String(t.TurCodigo) === String(selTurma))?.TurNome ?? "";
    const presencasByAprendiz = new Map<number, { presenca: string | null; presencaInf: string | null }>();

    presencas.forEach(presenca => {
      const aprendizId = toNumericId(
        presenca.AcpAprendiz ?? presenca.IdAluno ?? presenca.Apr_Codigo ?? presenca.aprendiz
      );
      if (!aprendizId) return;
      presencasByAprendiz.set(
        aprendizId,
        {
          presenca: presenca.AcpPresenca ?? presenca.presenca ?? presenca.Presenca ?? null,
          presencaInf:
            presenca.AcpPresencaInf ??
            presenca.AcpPresencaInformatica ??
            presenca.presencaInf ??
            presenca.presencaInformatica ??
            presenca.PresencaInf ??
            presenca.PresencaInformatica ??
            "P",
        }
      );
    });

    return {
      sessions: [{ ordem: 1, disciplina: "Capacitação" }],
      students: aprendizes.map(aprendiz => {
        const id = toNumericId(aprendiz.Apr_Codigo ?? aprendiz.IdAluno);
        const presenca = presencasByAprendiz.get(id);
        return {
          IdAluno: id,
          NomeJovem: getFirstText(aprendiz.Apr_Nome, aprendiz.NomeJovem),
          Turma: getFirstText(aprendiz.Turma, aprendiz.TurNome, turmaName),
          Parceiro: getFirstText(aprendiz.Parceiro, aprendiz.parceiro),
          UnidadeParceiro: getFirstText(aprendiz.UnidadeParceiro, aprendiz.unidadeParceiro),
          AreaAtuacao: getFirstText(aprendiz.AreaAtuacao, aprendiz.areaAtuacao, aprendiz.AreaDescricao),
          presencas: [{ ordem: 1, presenca: presenca?.presenca ?? null, presencaInf: presenca?.presencaInf ?? null }],
        };
      }),
    };
  }, [selTurma, turmas]);

  const buildCapacitacaoPeriodMatrix = useCallback(async (): Promise<PeriodMatrixResult | null> => {
    if (!selTurma || !startDate || !endDate) return null;

    const turmaParam = encodeURIComponent(selTurma);
    const [datasResponse, aprendizesResponse] = await Promise.all([
      api.get(`/faltas-capacitacao/datas?turma=${turmaParam}`),
      api.get(`/faltas-capacitacao/aprendizes?turma=${turmaParam}`),
    ]);
    const periodDates = [...new Set(
      asArrayPayload<unknown>(datasResponse.data)
        .map(normalizePayloadDate)
        .filter((date): date is string => Boolean(date) && date >= startDate && date <= endDate)
    )].sort();
    const aprendizes = asArrayPayload<CapacitacaoAprendiz>(aprendizesResponse.data)
      .filter(aprendiz => isPeriodOverlappingCapacitacao(aprendiz, startDate, endDate));
    const presencasPorData = await Promise.all(
      periodDates.map(async date => {
        const response = await api.get(`/faltas-capacitacao/presencas?turma=${turmaParam}&data=${encodeURIComponent(date)}`);
        return {
          date,
          presencas: asArrayPayload<CapacitacaoPresenca>(response.data),
        };
      })
    );
    const presencasByDateAndAprendiz = new Map<string, string | null>();

    presencasPorData.forEach(({ date, presencas }) => {
      presencas.forEach(presenca => {
        const aprendizId = toNumericId(
          presenca.AcpAprendiz ?? presenca.IdAluno ?? presenca.Apr_Codigo ?? presenca.aprendiz
        );
        if (!aprendizId) return;
        presencasByDateAndAprendiz.set(
          `${date}:${aprendizId}`,
          presenca.AcpPresenca ?? presenca.presenca ?? presenca.Presenca ?? null
        );
      });
    });

    return {
      kind: "period-matrix",
      columns: periodDates.map((date, index) => ({
        key: date,
        label: format(new Date(date + "T12:00:00"), "dd/MM", { locale: ptBR }),
        date,
        ordem: index + 1,
      })),
      students: aprendizes.map(aprendiz => {
        const id = toNumericId(aprendiz.Apr_Codigo ?? aprendiz.IdAluno);
        return {
          IdAluno: id,
          NomeJovem: getFirstText(aprendiz.Apr_Nome, aprendiz.NomeJovem),
          UnidadeParceiro: "",
          presencas: Object.fromEntries(
            periodDates.map(date => {
              if (!isDateInsideCapacitacao(aprendiz, date)) return [date, ""];
              return [date, formatCapacitacaoPeriodPresence(presencasByDateAndAprendiz.get(`${date}:${id}`))];
            })
          ),
        };
      }),
    };
  }, [endDate, selTurma, startDate]);

  function exportPeriodMatrixCsv(matrix: PeriodMatrixResult, options: { includeUnidade?: boolean; includeTurma?: boolean; slug?: string } = {}) {
    const includeUnidade = options.includeUnidade ?? true;
    const includeTurma = options.includeTurma ?? false;
    const headers = [
      "Matricula",
      "Nome",
      ...(includeUnidade ? ["Unidade"] : []),
      ...(includeTurma ? ["Turma"] : []),
      ...matrix.columns.map(c => c.label),
    ];
    const rows = matrix.students.map(student => [
      student.IdAluno,
      student.NomeJovem,
      ...(includeUnidade ? [student.UnidadeParceiro] : []),
      ...(includeTurma ? [student.Turma ?? ""] : []),
      ...matrix.columns.map(column => student.presencas[column.key] ?? ""),
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-presenca-${options.slug ?? "turma-periodo"}-${selParceiro || selTurma || "periodo"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportFaltasPeriodoCsv(matrix: PeriodMatrixResult) {
    const headers = [
      "Unidade",
      "Matricula",
      "Nome",
      "Turma",
      ...matrix.columns.map(c => c.label),
    ];
    const rows = matrix.students.map(student => [
      student.UnidadeParceiro,
      student.IdAluno,
      student.NomeJovem,
      student.Turma ?? "",
      ...matrix.columns.map(column => student.presencas[column.key] ?? ""),
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-presenca-total-periodo-faltas-${startDate || "inicio"}-${endDate || "fim"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportTotalPeriodoTurmaCsv(data: TotalPeriodoTurmaResult, options: { includeUnidade?: boolean; slug?: string } = {}) {
    const includeUnidade = options.includeUnidade ?? true;
    const headers = [
      "Matricula",
      "Nome",
      ...(includeUnidade ? ["Parceiro/Unidade"] : []),
      ...data.columns.flatMap(column => [
        `${column.label} Aulas`,
        `${column.label} Presencas`,
        `${column.label} Justificadas`,
        `${column.label} Faltas`,
      ]),
    ];
    const rows = data.students.map(student => [
      student.IdAluno,
      student.NomeJovem,
      ...(includeUnidade ? [student.UnidadeParceiro ?? ""] : []),
      ...data.columns.flatMap(column => {
        const total = student.totais[column.key];
        return [total?.aulas ?? "", total?.presencas ?? "", total?.justificadas ?? 0, total?.faltas ?? ""];
      }),
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-presenca-${options.slug ?? "total-periodo-turma"}-${selParceiro || selTurma || "periodo"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportDataTurmaCsv(rows: DataTurmaRow[], columns: { key: DataTurmaSortKey; label: string }[], slug: string) {
    const headers = columns.map(column => column.label);
    const dataRows = rows.map(row => columns.map(column => row[column.key]));
    const csv = [headers, ...dataRows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-presenca-${slug}-${selTurma || "turma"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportContagemFaltasPeriodoCsv(rows: ContagemFaltasPeriodoRow[]) {
    const headers = [
      "Parceiro",
      "CNPJ",
      "Cod Aprendiz",
      "Num. Sist. Ext.",
      "Nome",
      "Falta Dias",
      "Horas Falta",
      "Aulas Periodo",
    ];
    const dataRows = rows.map(row => [
      row.parceiro,
      row.cnpj,
      row.codAprendiz,
      row.numSistExt,
      row.nome,
      row.faltaDias,
      row.horasFalta,
      row.aulasPeriodo,
    ]);
    const csv = [headers, ...dataRows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-presenca-contagem-faltas-periodo-${tipoPagamento}-${startDate || "inicio"}-${endDate || "fim"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportEstatisticasPresencaJovemCsv(rows: EstatisticaPresencaJovemRow[]) {
    const headers = [
      "Codigo",
      "Nome",
      "Unidade Parceiro",
      "Status",
      "Inicio Aprendizagem",
      "Previsao Fim Aprendizagem",
      "Faltas",
      "Faltas Justificadas",
      "A Cursar",
      "Total",
      "Presenca",
      "Aulas Cursadas",
      "Percentual",
    ];
    const dataRows = rows.map(row => [
      row.codigo,
      row.nome,
      row.unidadeParceiro,
      row.status,
      formatIsoToBrDate(row.inicioAprendizagem || ""),
      formatIsoToBrDate(row.previsaoFimAprendizagem || ""),
      row.faltas,
      row.faltasJustificadas,
      row.aCursar,
      row.total,
      row.presenca,
      row.aulasCursadas,
      row.percentual.toFixed(2).replace(".", ","),
    ]);
    const csv = [headers, ...dataRows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "estatisticas-presenca-por-jovem.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const handleStartDateChange = (value: string) => {
    if (isFourDigitNativeDate(value)) setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    if (isFourDigitNativeDate(value)) setEndDate(value);
  };

  const handleDataTurmaDateChange = (value: string) => {
    setSelData(formatDateInput(value));
  };

  const handleDataTurmaSort = (key: DataTurmaSortKey) => {
    setDataTurmaSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
    setGridPage(1);
  };

  const handleContentSave = () => {
    toast("O lançamento de conteúdo ainda depende do endpoint de gravação.");
  };

  const handleDownloadReportPdf = async (filenameBase: string) => {
    if (!reportPdfRef.current) {
      toast.error("Gere um relatorio antes de baixar o PDF.");
      return;
    }

    setPdfLoading(true);
    try {
      await downloadElementAsPdf(reportPdfRef.current, {
        filename: `${filenameBase}.pdf`,
        orientation: "landscape",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  function renderExportButtons(options: { onExcel: () => void; filenameBase: string }) {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => handleDownloadReportPdf(options.filenameBase)}
          disabled={pdfLoading}
          className="rounded-lg bg-[#133c86] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#0f2e6b] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {pdfLoading ? "Gerando PDF..." : "Baixar PDF"}
        </button>
        <button
          type="button"
          onClick={options.onExcel}
          className="rounded-lg bg-[#133c86] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#0f2e6b]"
        >
          Exportar Excel
        </button>
      </div>
    );
  }

  function renderPagination(currentPage: number, totalPages: number) {
    const paginationItems = getPaginationItems(currentPage, totalPages);

    return (
      <div className="flex items-center">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setGridPage(currentPage - 1)}
          className="rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-[#133c86] disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Anterior
        </button>
        {paginationItems.map(item => {
          if (typeof item !== "number") {
            return (
              <span key={item} className="border-y border-r border-gray-300 bg-white px-3 py-1.5 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <button
              type="button"
              key={item}
              onClick={() => setGridPage(item)}
              className={`border-y border-r border-gray-300 px-3 py-1.5 ${
                currentPage === item ? "bg-[#133c86] text-white" : "bg-white text-[#133c86] hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          );
        })}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setGridPage(currentPage + 1)}
          className="rounded-r-lg border-y border-r border-gray-300 bg-white px-3 py-1.5 text-[#133c86] disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Seguinte
        </button>
      </div>
    );
  }

  const handleSearch = async () => {
    if (tab === "comunicado-faltas") {
      toast.error("A lógica de Comunicado Faltas ainda será implementada.");
      return;
    }
    if (tab === "turma-periodo") {
      if (!selTurma || !startDate || !endDate) {
        toast.error("Preencha todos os filtros obrigatórios.");
        return;
      }
      setLoading(true);
      setResult(null);
      try {
        const matrix = await buildPeriodMatrix();
        setResult(matrix);
      } catch {
        toast.error("Erro ao montar a tabela por período.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (tab === "turma-periodo-capacitacao") {
      if (!selTurma || !startDate || !endDate) {
        toast.error("Preencha todos os filtros obrigatórios.");
        return;
      }
      setLoading(true);
      setResult(null);
      try {
        const matrix = await buildCapacitacaoPeriodMatrix();
        setResult(matrix);
      } catch {
        toast.error("Erro ao montar a tabela de capacitação por período.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (tab === "data-turma-capacitacao") {
      const date = normalizeDateParam(selData);
      if (!selTurma || !date) {
        toast.error("Preencha todos os filtros obrigatÃ³rios.");
        return;
      }
      setLoading(true);
      setResult(null);
      try {
        const data = await buildDataTurmaCapacitacao(date);
        setResult(data);
        setConteudoLecionado("");
        setRecursosUsados("");
        setObservacoes("");
      } catch {
        toast.error("Erro ao buscar dados de capacitaÃ§Ã£o.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const url = buildQuery();
    if (!url) { toast.error("Preencha todos os filtros obrigatórios."); return; }
    setLoading(true);
    setResult(null);
    try {
      const r = await api.get(url);
      setResult(r.data);
      if (tab === "data-turma") {
        const data = r.data as Partial<DataTurmaResult>;
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];
        setConteudoLecionado(getFirstText(...sessions.map(s => s.conteudo)));
        setRecursosUsados(getFirstText(...sessions.map(s => s.recursos)));
        setObservacoes(getFirstText(...sessions.map(s => s.observacoes)));
      }
    } catch {
      toast.error("Erro ao buscar dados.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Tab definitions ────────────────────────────────────────────────────
  function getSelectedTurmaName() {
    return turmas.find(t => String(t.TurCodigo) === String(selTurma))?.TurNome ?? "";
  }

  function formatModuleLabel(session: DataTurmaSession, presence?: DataTurmaPresence) {
    const base = getFirstText(presence?.modulo, presence?.disciplina, session.disciplina);
    const aula = `Aula ${String(session.ordem).padStart(2, "0")}`;
    if (!base) return aula;
    return base.toLowerCase().includes("aula") ? base : `${base} - ${aula}`;
  }

  function buildDataTurmaRows(data: DataTurmaResult): DataTurmaRow[] {
    const turmaName = getSelectedTurmaName();
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const students = Array.isArray(data.students) ? data.students : [];

    return students.flatMap(student => {
      const presencas = Array.isArray(student.presencas) ? student.presencas : [];
      const orderedSessions = sessions.length
        ? sessions
        : presencas.map(p => ({ ordem: p.ordem, disciplina: p.disciplina || p.modulo || "" }));

      return orderedSessions.map(session => {
        const presence = presencas.find(p => Number(p.ordem) === Number(session.ordem));
        return {
          key: `${student.IdAluno}-${session.ordem}`,
          turma: getFirstText(student.Turma, student.TurNome, turmaName),
          codigo: student.IdAluno,
          nome: student.NomeJovem,
          modulo: formatModuleLabel(session, presence),
          parceiro: getFirstText(student.Parceiro, student.parceiro, student.UnidadeParceiro, student.unidadeParceiro),
          areaAtuacao: getFirstText(student.AreaAtuacao, student.areaAtuacao, student.AreaDescricao),
          presenca: formatPresence(presence?.presenca),
          presencaInf: formatPresence(presence?.presencaInf ?? (tab === "data-turma-capacitacao" ? "P" : null)),
        };
      });
    });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "data-turma", label: "Por Data/Turma" },
    { id: "data-turma-capacitacao", label: "Por Data/Turma Capacitação" },
    { id: "turma-periodo", label: "Por Período/Turma" },
    { id: "turma-periodo-capacitacao", label: "Por Turma/Período Capacitação" },
    { id: "parceiro-periodo", label: "Por Parceiro/Período" },
    { id: "total-aulas-turma", label: "Total Período/Turma" },
    { id: "total-aulas-turma-capacitacao", label: "Total Período/Turma Capacitação" },
    { id: "total-aulas-parceiro", label: "Total Período/Parceiros" },
    { id: "faltas-parceiro", label: "Total Período/Faltas" },
    { id: "contagem-faltas-periodo", label: "Contagem Faltas Período" },
  ];

  // ─── Filters per tab ────────────────────────────────────────────────────
  function renderDataTurmaPanel() {
    const isCapacitacao = tab === "data-turma-capacitacao";
    const fieldClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20";
    const textareaClass = `${fieldClass} min-h-[76px] resize-y`;
    const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500";

    return (
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm">
        <header className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold text-[#133c86]">
            {isCapacitacao ? "Controle de Presença por Data/Turma Capacitação" : "Controle de Presença por Data/Turma"}
          </h2>
        </header>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Turma</label>
              <select value={selTurma} onChange={e => setSelTurma(e.target.value)} className={fieldClass}>
                <option value="">Selecione...</option>
                {turmas.map(t => <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Data</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                list="presenca-data-turma-datas"
                value={formatIsoToBrDate(selData)}
                onChange={e => handleDataTurmaDateChange(e.target.value)}
                onBlur={() => {
                  if (selData && !parseBrDateToIso(formatIsoToBrDate(selData))) setSelData("");
                }}
                placeholder="dd/mm/aaaa"
                className={fieldClass}
              />
              <datalist id="presenca-data-turma-datas">
                {datas.map(d => <option key={d} value={formatIsoToBrDate(d)} />)}
              </datalist>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass}>Conteúdo Lecionado</label>
            <textarea value={conteudoLecionado} onChange={e => setConteudoLecionado(e.target.value)} rows={3} className={textareaClass} />
          </div>
          <div className="mt-4">
            <label className={labelClass}>Recursos Usados</label>
            <textarea value={recursosUsados} onChange={e => setRecursosUsados(e.target.value)} rows={3} className={textareaClass} />
          </div>
          <div className="mt-4">
            <label className={labelClass}>Observações</label>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} className={textareaClass} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-[#133c86] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0f2e6b] disabled:bg-gray-300"
            >
              {loading ? "Pesquisando..." : "Pesquisar"}
            </button>
            <button
              type="button"
              onClick={handleContentSave}
              className="rounded-lg bg-[#133c86] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0f2e6b]"
            >
              Conteúdo
            </button>
          </div>

          {(result || loading) && (
            <div className="mt-1">
              {renderResults()}
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderFilters() {
    const oldPeriod = tab === "turma-periodo";
    const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider";
    const fieldClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20";
    const selectClass = fieldClass;
    const dateClass = `${fieldClass} w-[190px]`;
    const turmaSelect = (
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Turma:</label>
        <select value={selTurma} onChange={e => setSelTurma(e.target.value)} className={`${selectClass} ${oldPeriod ? "w-[632px] max-w-full" : ""}`}>
          <option value="">Selecione...</option>
          {turmas.map(t => <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>)}
        </select>
      </div>
    );
    const parceiroSelect = (
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Parceiro</label>
        <select value={selParceiro} onChange={e => setSelParceiro(e.target.value)} className={`${selectClass} min-w-[220px]`}>
          <option value="">Selecione...</option>
          {parceiros.map(p => <option key={p.ParCodigo} value={p.ParCodigo}>{p.ParDescricao}</option>)}
        </select>
      </div>
    );
    const periodInputs = (
      <>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Período</label>
          <input type="date" max="9999-12-31" value={startDate} onChange={e => handleStartDateChange(e.target.value)} className={dateClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>à:</label>
          <input type="date" max="9999-12-31" value={endDate} onChange={e => handleEndDateChange(e.target.value)} className={dateClass} />
        </div>
      </>
    );

    if (tab === "comunicado-faltas") return (
      <div className="text-sm text-gray-500">
        Essa aba foi criada para receber a lógica de comunicado de faltas.
      </div>
    );

    if (tab === "data-turma" || tab === "data-turma-capacitacao") return (
      <div className="flex flex-wrap gap-4 items-end">
        {turmaSelect}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Data</label>
          <select value={selData} onChange={e => setSelData(e.target.value)} className={`${selectClass} min-w-[220px]`}>
            <option value="">Selecione a data...</option>
            {datas.map(d => <option key={d} value={d}>{format(new Date(d.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}</option>)}
          </select>
        </div>
      </div>
    );

    if (
      tab === "turma-periodo" ||
      tab === "turma-periodo-capacitacao" ||
      tab === "total-aulas-turma" ||
      tab === "total-aulas-turma-capacitacao" ||
      tab === "conteudos-lecionados"
    ) return (
      <div className="flex flex-wrap gap-4 items-end">
        {turmaSelect}
        {periodInputs}
      </div>
    );

    if (tab === "parceiro-periodo" || tab === "total-aulas-parceiro" || tab === "faltas-parceiro") return (
      <div className="flex flex-wrap gap-4 items-end">
        {tab !== "faltas-parceiro" && parceiroSelect}
        {periodInputs}
      </div>
    );

    if (tab === "estatisticas-presenca-jovem") {
      return (
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Status do Jovem</label>
            <select value={selSituacaoAprendiz} onChange={e => setSelSituacaoAprendiz(e.target.value)} className={`${selectClass} min-w-[240px]`}>
              <option value="">Todos</option>
              {situacoesAprendiz.map(situacao => (
                <option key={situacao.StaCodigo} value={situacao.StaCodigo}>{situacao.StaDescricao}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Unidade Parceiro</label>
            <select value={selUnidadeParceiro} onChange={e => setSelUnidadeParceiro(e.target.value)} className={`${selectClass} min-w-[360px] max-w-full`}>
              <option value="">Todas</option>
              {unidadesParceiro.map(unidade => (
                <option key={unidade.ParUniCodigo} value={unidade.ParUniCodigo}>{unidade.ParUniDescricao}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (tab === "contagem-faltas-periodo" || tab === "aulas-dadas" || tab === "controle-faltas") {
      return (
        <div className="flex flex-wrap gap-4 items-end">
          {tab === "contagem-faltas-periodo" && (
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Tipo Pagamento</label>
              <select value={tipoPagamento} onChange={e => setTipoPagamento(e.target.value)} className={`${selectClass} min-w-[180px]`}>
                <option value="T">Todos</option>
                <option value="E">Empresa</option>
                <option value="C">Projov</option>
              </select>
            </div>
          )}
          {tab === "controle-faltas" && (
            <>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Qtde Mín. Faltas</label>
                <input type="number" min={1} value={minFaltas} onChange={e => setMinFaltas(e.target.value)} className={`${fieldClass} w-28`} />
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

  // ─── Result tables ───────────────────────────────────────────────────────

  function renderResults() {
    if (loading) return <Spinner />;
    if (!result) return null;

    if (
      (tab === "turma-periodo" || tab === "turma-periodo-capacitacao" || tab === "parceiro-periodo" || tab === "faltas-parceiro") &&
      (result as PeriodMatrixResult).kind === "period-matrix"
    ) {
      const matrix = result as PeriodMatrixResult;
      const isCapacitacaoPeriod = tab === "turma-periodo-capacitacao";
      const isParceiroPeriod = tab === "parceiro-periodo";
      const isFaltasPeriod = tab === "faltas-parceiro";
      const term = gridSearch.trim().toLowerCase();
      const filteredStudents = matrix.students.filter(student => {
        if (!term) return true;
        return [
          student.IdAluno,
          student.NomeJovem,
          ...(isCapacitacaoPeriod ? [] : [student.UnidadeParceiro]),
          ...(isParceiroPeriod || isFaltasPeriod ? [student.Turma] : []),
          ...matrix.columns.map(column => student.presencas[column.key] ?? ""),
        ].some(value => String(value).toLowerCase().includes(term));
      });
      const totalPages = Math.max(1, Math.ceil(filteredStudents.length / gridPageSize));
      const currentPage = Math.min(gridPage, totalPages);
      const start = filteredStudents.length ? (currentPage - 1) * gridPageSize : 0;
      const end = Math.min(start + gridPageSize, filteredStudents.length);
      const pageStudents = filteredStudents.slice(start, end);

      if (!matrix.columns.length || !matrix.students.length) return <Empty />;

      return (
        <div className="max-w-full overflow-hidden text-sm text-gray-600">
          <div className="flex flex-wrap justify-between gap-3 mb-3">
            <label className="flex items-center gap-2">
              <span>Mostrar</span>
              <select
                value={gridPageSize}
                onChange={e => {
                  setGridPageSize(Number(e.target.value));
                  setGridPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              >
                {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <span>registros</span>
            </label>
            <label className="flex items-center gap-2">
              <span>Procurar:</span>
              <input
                type="search"
                value={gridSearch}
                onChange={e => {
                  setGridSearch(e.target.value);
                  setGridPage(1);
                }}
                placeholder="Search"
                className="h-9 w-48 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              />
            </label>
          </div>

          <div className="relative max-w-full overflow-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-max min-w-full border-collapse bg-white text-sm text-gray-700">
              <thead>
                <tr>
                  {isFaltasPeriod ? (
                    <>
                      <th className="min-w-[180px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Unidade</th>
                      <th className="min-w-[90px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Matricula</th>
                      <th className="min-w-[220px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Nome</th>
                      <th className="min-w-[110px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Turma</th>
                    </>
                  ) : (
                    <>
                      <th className="min-w-[90px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Matricula</th>
                      <th className="min-w-[220px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Nome</th>
                      {!isCapacitacaoPeriod && (
                        <th className="min-w-[180px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Unidade</th>
                      )}
                      {isParceiroPeriod && (
                        <th className="min-w-[110px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Turma</th>
                      )}
                    </>
                  )}
                  {matrix.columns.map(column => (
                    <th key={column.key} className="min-w-[58px] border border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((student, index) => (
                  <tr key={student.key ?? `${student.IdAluno}-${student.Turma ?? ""}-${index}`} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/50`}>
                    {isFaltasPeriod ? (
                      <>
                        <td className="border border-gray-200 px-3 py-2">{student.UnidadeParceiro}</td>
                        <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">{student.IdAluno}</td>
                        <td className="border border-gray-200 px-3 py-2">{student.NomeJovem}</td>
                        <td className="border border-gray-200 px-3 py-2">{student.Turma}</td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">{student.IdAluno}</td>
                        <td className="border border-gray-200 px-3 py-2">{student.NomeJovem}</td>
                        {!isCapacitacaoPeriod && (
                          <td className="border border-gray-200 px-3 py-2">{student.UnidadeParceiro}</td>
                        )}
                        {isParceiroPeriod && (
                          <td className="border border-gray-200 px-3 py-2">{student.Turma}</td>
                        )}
                      </>
                    )}
                    {matrix.columns.map(column => (
                      <td key={column.key} className="border border-gray-200 px-3 py-2 text-center">
                        {student.presencas[column.key] || "\u00a0"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              {filteredStudents.length
                ? `Mostrando de ${start + 1} até ${end} de ${filteredStudents.length} registros`
                : "Mostrando de 0 até 0 de 0 registros"}
            </div>
            {renderPagination(currentPage, totalPages)}
          </div>

          {renderExportButtons({
            filenameBase: `controle-presenca-${
              isFaltasPeriod
                ? "total-periodo-faltas"
                : isParceiroPeriod
                ? "parceiro-periodo"
                : isCapacitacaoPeriod
                  ? "turma-periodo-capacitacao"
                  : "turma-periodo"
            }-${selParceiro || selTurma || "periodo"}`,
            onExcel: () => {
              if (isFaltasPeriod) {
                exportFaltasPeriodoCsv(matrix);
                return;
              }
              exportPeriodMatrixCsv(matrix, {
                includeUnidade: !isCapacitacaoPeriod,
                includeTurma: isParceiroPeriod,
                slug: isParceiroPeriod
                  ? "parceiro-periodo"
                  : isCapacitacaoPeriod
                    ? "turma-periodo-capacitacao"
                    : "turma-periodo",
              });
            },
          })}

          <div ref={reportPdfRef} className="p-4 text-xs text-gray-700" style={offscreenReportStyle(1400)}>
            <div className="mb-4 text-center">
              <h3 className="text-base font-bold text-[#133c86]">
                {isParceiroPeriod
                  ? "Controle de Presenca por Parceiro/Periodo"
                  : isFaltasPeriod
                    ? "Total Periodo/Faltas"
                  : isCapacitacaoPeriod
                    ? "Controle de Presenca por Turma/Periodo Capacitacao"
                    : "Controle de Presenca de Turma por Periodo"}
              </h3>
              <p className="text-gray-500">
                {formatIsoToBrDate(startDate)} a {formatIsoToBrDate(endDate)} - {filteredStudents.length} registro(s)
              </p>
            </div>
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  {isFaltasPeriod ? (
                    <>
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Unidade</th>
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Matricula</th>
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Nome</th>
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Turma</th>
                    </>
                  ) : (
                    <>
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Matricula</th>
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Nome</th>
                      {!isCapacitacaoPeriod && (
                        <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Unidade</th>
                      )}
                      {isParceiroPeriod && (
                        <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Turma</th>
                      )}
                    </>
                  )}
                  {matrix.columns.map(column => (
                    <th key={column.key} className="border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[#133c86]">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.key ?? `${student.IdAluno}-${student.Turma ?? ""}-${index}`}>
                    {isFaltasPeriod ? (
                      <>
                        <td className="border border-gray-200 px-2 py-1">{student.UnidadeParceiro}</td>
                        <td className="border border-gray-200 px-2 py-1">{student.IdAluno}</td>
                        <td className="border border-gray-200 px-2 py-1">{student.NomeJovem}</td>
                        <td className="border border-gray-200 px-2 py-1">{student.Turma}</td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-200 px-2 py-1">{student.IdAluno}</td>
                        <td className="border border-gray-200 px-2 py-1">{student.NomeJovem}</td>
                        {!isCapacitacaoPeriod && (
                          <td className="border border-gray-200 px-2 py-1">{student.UnidadeParceiro}</td>
                        )}
                        {isParceiroPeriod && (
                          <td className="border border-gray-200 px-2 py-1">{student.Turma}</td>
                        )}
                      </>
                    )}
                    {matrix.columns.map(column => (
                      <td key={column.key} className="border border-gray-200 px-2 py-1 text-center">
                        {student.presencas[column.key] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 1. Por Data
    if (tab === "data-turma" || tab === "data-turma-capacitacao") {
      const data = result as DataTurmaResult;
      const activeColumns = tab === "data-turma-capacitacao" ? dataTurmaCapacitacaoColumns : dataTurmaColumns;
      const rows = buildDataTurmaRows(data);
      const term = gridSearch.trim().toLowerCase();
      const filteredRows = rows.filter(row => {
        if (!term) return true;
        return activeColumns.some(column => String(row[column.key]).toLowerCase().includes(term));
      });
      const activeSort = dataTurmaSort && activeColumns.some(column => column.key === dataTurmaSort.key) ? dataTurmaSort : null;
      const sortedRows = activeSort
        ? filteredRows
            .map((row, index) => ({ row, index }))
            .sort((a, b) => {
              const comparison = compareDataTurmaValue(a.row, b.row, activeSort.key);
              const ordered = activeSort.direction === "asc" ? comparison : -comparison;
              return ordered || a.index - b.index;
            })
            .map(({ row }) => row)
        : filteredRows;
      const totalPages = Math.max(1, Math.ceil(sortedRows.length / gridPageSize));
      const currentPage = Math.min(gridPage, totalPages);
      const start = sortedRows.length ? (currentPage - 1) * gridPageSize : 0;
      const end = Math.min(start + gridPageSize, sortedRows.length);
      const pageRows = sortedRows.slice(start, end);

      if (!rows.length) return <Empty />;

      return (
        <div className="text-sm text-gray-700">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-1">
              <span>Mostrar</span>
              <select
                value={gridPageSize}
                onChange={e => {
                  setGridPageSize(Number(e.target.value));
                  setGridPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              >
                {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <span>registros</span>
            </label>
            <label className="flex items-center gap-2">
              <span>Procurar:</span>
              <input
                type="search"
                value={gridSearch}
                onChange={e => {
                  setGridSearch(e.target.value);
                  setGridPage(1);
                }}
                placeholder="Search"
                className="h-9 w-48 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full bg-white p-4">
              <div className="mb-4 text-center">
                <h3 className="text-base font-bold text-[#133c86]">
                  {tab === "data-turma-capacitacao"
                    ? "Controle de Presenca por Data/Turma Capacitacao"
                    : "Controle de Presenca por Data/Turma"}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatIsoToBrDate(selData)} - {filteredRows.length} registro(s)
                </p>
              </div>
              <table className="w-full border-collapse border border-gray-200 text-sm text-gray-700">
              <thead>
                <tr>
                  {activeColumns.map(column => {
                    const active = activeSort?.key === column.key;
                    const direction = active ? activeSort.direction : null;
                    const ariaSort = direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";
                    const icon = direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕";

                    return (
                      <th
                        key={column.key}
                        aria-sort={ariaSort}
                        className="border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap"
                      >
                        <button
                          type="button"
                          onClick={() => handleDataTurmaSort(column.key)}
                          className="flex w-full items-center justify-between gap-3 text-left font-bold"
                          title={`Ordenar por ${column.label}`}
                        >
                          <span>{column.label}</span>
                          <span className={active ? "text-[#337ab7]" : "text-[#bbb]"}>{icon}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={row.key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {activeColumns.map(column => (
                      <td
                        key={column.key}
                        className={`border border-gray-200 px-3 py-2 align-top ${
                          column.key === "codigo"
                            ? "font-medium text-gray-900 whitespace-nowrap"
                            : column.key === "nome"
                              ? "min-w-[280px]"
                              : column.key === "presenca" || column.key === "presencaInf"
                                ? "w-28 text-center"
                                : "whitespace-nowrap"
                        }`}
                      >
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              {filteredRows.length
                ? `Mostrando de ${start + 1} até ${end} de ${filteredRows.length} registros`
                : "Mostrando de 0 até 0 de 0 registros"}
            </div>
            {renderPagination(currentPage, totalPages)}
          </div>

          {renderExportButtons({
            filenameBase: `controle-presenca-${tab}-${normalizeDateParam(selData) || "relatorio"}`,
            onExcel: () => exportDataTurmaCsv(
              sortedRows,
              activeColumns,
              tab === "data-turma-capacitacao" ? "data-turma-capacitacao" : "data-turma"
            ),
          })}

          <div ref={reportPdfRef} className="p-4 text-xs text-gray-700" style={offscreenReportStyle(1200)}>
            <div className="mb-4 text-center">
              <h3 className="text-base font-bold text-[#133c86]">
                {tab === "data-turma-capacitacao"
                  ? "Controle de Presenca por Data/Turma Capacitacao"
                  : "Controle de Presenca por Data/Turma"}
              </h3>
              <p className="text-gray-500">
                {formatIsoToBrDate(selData)} - {sortedRows.length} registro(s)
              </p>
            </div>
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  {activeColumns.map(column => (
                    <th key={column.key} className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(row => (
                  <tr key={row.key}>
                    {activeColumns.map(column => (
                      <td key={column.key} className="border border-gray-200 px-2 py-1">
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      /*
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
      */
    }

    // 2. Presença Turma por Período
    if (tab === "turma-periodo") {
      const { totalAulas, students } = result as {
        totalAulas: number;
        students: {
          IdAluno: number;
          NomeJovem: string;
          presencas: number;
          faltas: number;
          justificadas: number;
          total: number;
          percentual: number;
        }[];
      };
      if (!students?.length) return <Empty />;
      return (
        <div>
          <p className="text-sm text-gray-500 mb-3 px-1">Total de aulas no período: <strong>{totalAulas}</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <TH>Matrícula</TH><TH>Nome</TH><TH>Presenças</TH><TH>Faltas</TH><TH>Justificadas</TH><TH>Total Reg.</TH><TH>% Freq.</TH>
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.IdAluno} className="hover:bg-blue-50/50">
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
    if (tab === "total-aulas-turma" || tab === "total-aulas-turma-capacitacao" || tab === "total-aulas-parceiro") {
      if ((result as TotalPeriodoTurmaResult).kind === "total-periodo-turma") {
        const data = result as TotalPeriodoTurmaResult;
        const isTotalCapacitacao = tab === "total-aulas-turma-capacitacao";
        const isTotalParceiro = tab === "total-aulas-parceiro";
        const term = gridSearch.trim().toLowerCase();
        const filteredStudents = data.students.filter(student => {
          if (!term) return true;
          return [
            student.IdAluno,
            student.NomeJovem,
            ...(isTotalCapacitacao ? [] : [student.UnidadeParceiro]),
            ...data.columns.flatMap(column => {
              const total = student.totais[column.key];
              return [total?.aulas, total?.presencas, total?.justificadas, total?.faltas];
            }),
          ].some(value => String(value ?? "").toLowerCase().includes(term));
        });
        const totalPages = Math.max(1, Math.ceil(filteredStudents.length / gridPageSize));
        const currentPage = Math.min(gridPage, totalPages);
        const start = filteredStudents.length ? (currentPage - 1) * gridPageSize : 0;
        const end = Math.min(start + gridPageSize, filteredStudents.length);
        const pageStudents = filteredStudents.slice(start, end);

        if (!data.students.length || !data.columns.length) return <Empty />;

        return (
          <div className="text-sm text-gray-700">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-gray-700">
                  Legenda:
                  <div className="mt-1 font-semibold">
                    <span className="text-blue-700">Aulas</span>
                    <span className="mx-1 text-gray-400">|</span>
                    <span className="text-green-700">Presenças</span>
                    <span className="mx-1 text-gray-400">|</span>
                    <span className="text-gray-500">Justificadas</span>
                    <span className="mx-1 text-gray-400">|</span>
                    <span className="text-red-600">Faltas</span>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <span>Procurar:</span>
                <input
                  type="search"
                  value={gridSearch}
                  onChange={e => {
                    setGridSearch(e.target.value);
                    setGridPage(1);
                  }}
                  placeholder="Search"
                  className="h-9 w-48 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
                />
              </label>
            </div>

            <div className="mb-3">
              <label className="flex w-fit items-center gap-2">
                <span>Mostrar</span>
                <select
                  value={gridPageSize}
                  onChange={e => {
                    setGridPageSize(Number(e.target.value));
                    setGridPage(1);
                  }}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
                >
                  {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <span>registros</span>
              </label>
            </div>

            <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-max w-full border-collapse text-sm text-gray-700">
                <thead>
                  <tr>
                    <th className="min-w-[90px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Matricula</th>
                    <th className="min-w-[280px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Nome</th>
                    {!isTotalCapacitacao && (
                      <th className="min-w-[300px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Parceiro/Unidade</th>
                    )}
                    {data.columns.map(column => (
                      <th key={column.key} className="min-w-[86px] border border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">
                        <div>{column.label}</div>
                        <div className="mt-1 normal-case tracking-normal">
                          <span className="text-blue-700">A</span>
                          <span className="mx-1 text-gray-400">|</span>
                          <span className="text-green-700">P</span>
                          <span className="mx-1 text-gray-400">|</span>
                          <span className="text-gray-500">J</span>
                          <span className="mx-1 text-gray-400">|</span>
                          <span className="text-red-600">F</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((student, index) => (
                    <tr key={`${student.IdAluno}-${student.UnidadeParceiro ?? ""}`} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/50`}>
                      <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">{student.IdAluno}</td>
                      <td className="border border-gray-200 px-3 py-2">{student.NomeJovem}</td>
                      {!isTotalCapacitacao && (
                        <td className="border border-gray-200 px-3 py-2">{student.UnidadeParceiro}</td>
                      )}
                      {data.columns.map(column => {
                        const total = student.totais[column.key];
                        return (
                          <td key={column.key} className="border border-gray-200 px-3 py-2 text-center whitespace-nowrap">
                            {total ? (
                              <>
                                <span className="font-semibold text-blue-700">{total.aulas}</span>
                                <span className="mx-1 text-gray-400">|</span>
                                <span className="font-semibold text-green-700">{total.presencas}</span>
                                <span className="mx-1 text-gray-400">|</span>
                                <span className="font-semibold text-gray-500">{total.justificadas ?? 0}</span>
                                <span className="mx-1 text-gray-400">|</span>
                                <span className="font-semibold text-red-600">{total.faltas}</span>
                              </>
                            ) : (
                              <span className="text-gray-300">&nbsp;</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                {filteredStudents.length
                  ? `Mostrando de ${start + 1} até ${end} de ${filteredStudents.length} registros`
                  : "Mostrando de 0 até 0 de 0 registros"}
              </div>
              {renderPagination(currentPage, totalPages)}
            </div>

            {renderExportButtons({
              filenameBase: `controle-presenca-${
                isTotalParceiro
                  ? "total-periodo-parceiros"
                  : isTotalCapacitacao
                    ? "total-periodo-turma-capacitacao"
                    : "total-periodo-turma"
              }-${selParceiro || selTurma || "periodo"}`,
              onExcel: () => exportTotalPeriodoTurmaCsv(data, {
                includeUnidade: !isTotalCapacitacao,
                slug: isTotalParceiro
                  ? "total-periodo-parceiros"
                  : isTotalCapacitacao
                    ? "total-periodo-turma-capacitacao"
                    : "total-periodo-turma",
              }),
            })}

            <div ref={reportPdfRef} className="p-4 text-xs text-gray-700" style={offscreenReportStyle(1400)}>
              <div className="mb-4 text-center">
                <h3 className="text-base font-bold text-[#133c86]">
                  {isTotalParceiro
                    ? "Total Periodo/Parceiros"
                    : isTotalCapacitacao
                      ? "Total Periodo/Turma Capacitacao"
                      : "Total Periodo/Turma"}
                </h3>
                <p className="text-gray-500">
                  {formatIsoToBrDate(startDate)} a {formatIsoToBrDate(endDate)} - {filteredStudents.length} registro(s)
                </p>
              </div>
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Matricula</th>
                    <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Nome</th>
                    {!isTotalCapacitacao && (
                      <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Parceiro/Unidade</th>
                    )}
                    {data.columns.map(column => (
                      <th key={column.key} className="border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[#133c86]">
                        {column.label}<br />A | P | J | F
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={`${student.IdAluno}-${student.UnidadeParceiro ?? ""}`}>
                      <td className="border border-gray-200 px-2 py-1">{student.IdAluno}</td>
                      <td className="border border-gray-200 px-2 py-1">{student.NomeJovem}</td>
                      {!isTotalCapacitacao && (
                        <td className="border border-gray-200 px-2 py-1">{student.UnidadeParceiro}</td>
                      )}
                      {data.columns.map(column => {
                        const total = student.totais[column.key];
                        return (
                          <td key={column.key} className="border border-gray-200 px-2 py-1 text-center">
                            {total ? `${total.aulas} | ${total.presencas} | ${total.justificadas ?? 0} | ${total.faltas}` : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      const data = result as { disciplina: string; totalDias: number; totalSessoes: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Disciplina</TH><TH>Dias de Aula</TH><TH>Total Sessões</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/50">
                  <TD>{r.disciplina}</TD><TD center>{r.totalDias}</TD><TD center>{r.totalSessoes}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 4. Conteúdos Lecionados
    if (tab === "conteudos-lecionados") {
      const data = result as { data: string; ordem: number; disciplina: string; conteudo: string; recursos: string; observacoes: string }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Data</TH><TH>Aula</TH><TH>Disciplina</TH><TH>Conteúdo Lecionado</TH><TH>Recursos Usados</TH><TH>Observações</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/50">
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
    if (tab === "parceiro-periodo") {
      const data = result as { IdAluno: number; NomeJovem: string; unidade: string; presencas: number; faltas: number; total: number; percentual: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Matrícula</TH><TH>Nome</TH><TH>Unidade</TH><TH>Presenças</TH><TH>Faltas</TH><TH>Total</TH><TH>% Freq.</TH></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={r.IdAluno} className="hover:bg-blue-50/50">
                  <TD>{r.IdAluno}</TD><TD>{r.NomeJovem}</TD><TD>{r.unidade}</TD>
                  <TD center>{r.presencas}</TD><TD center>{r.faltas}</TD><TD center>{r.total}</TD><TD center>{pct(r.percentual)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tab === "estatisticas-presenca-jovem") {
      const data = result as EstatisticaPresencaJovemRow[];
      if (!data?.length) return <Empty />;
      const term = gridSearch.trim().toLocaleLowerCase("pt-BR");
      const filteredRows = data.filter(row => !term || [
        row.codigo,
        row.nome,
        row.unidadeParceiro,
        row.status,
        row.inicioAprendizagem,
        row.previsaoFimAprendizagem,
      ].some(value => String(value ?? "").toLocaleLowerCase("pt-BR").includes(term)));
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / gridPageSize));
      const currentPage = Math.min(gridPage, totalPages);
      const start = filteredRows.length ? (currentPage - 1) * gridPageSize : 0;
      const end = Math.min(start + gridPageSize, filteredRows.length);
      const pageRows = filteredRows.slice(start, end);

      return (
        <div className="max-w-full overflow-hidden text-sm text-gray-600">
          <div className="mb-3 flex flex-wrap justify-between gap-3">
            <label className="flex items-center gap-2">
              <span>Mostrar</span>
              <select value={gridPageSize} onChange={e => { setGridPageSize(Number(e.target.value)); setGridPage(1); }} className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700">
                {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <span>registros</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <span>Procurar:</span>
                <input type="search" value={gridSearch} onChange={e => { setGridSearch(e.target.value); setGridPage(1); }} placeholder="Buscar na lista" className="h-9 w-52 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700" />
              </label>
              <button type="button" onClick={() => exportEstatisticasPresencaJovemCsv(filteredRows)} className="rounded-lg bg-[#133c86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2e6b]">
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="relative max-w-full overflow-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-[1700px] w-full border-collapse">
              <thead><tr>
                <TH>Código</TH><TH>Nome</TH><TH>Descrição</TH><TH>Status</TH>
                <TH>Início Aprendizagem</TH><TH>Previsão Fim Aprendizagem</TH>
                <TH>Faltas</TH><TH>Faltas Justificadas</TH><TH>A Cursar</TH>
                <TH>Total</TH><TH>Presença</TH><TH>Aulas Cursadas</TH><TH>Percentual</TH>
              </tr></thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={row.codigo} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/50`}>
                    <TD>{row.codigo}</TD><TD>{row.nome}</TD><TD>{row.unidadeParceiro}</TD><TD>{row.status}</TD>
                    <TD>{formatIsoToBrDate(row.inicioAprendizagem || "")}</TD>
                    <TD>{formatIsoToBrDate(row.previsaoFimAprendizagem || "")}</TD>
                    <TD center>{row.faltas}</TD><TD center>{row.faltasJustificadas}</TD><TD center>{row.aCursar}</TD>
                    <TD center>{row.total}</TD><TD center>{row.presenca}</TD><TD center>{row.aulasCursadas}</TD>
                    <TD center>{row.percentual.toFixed(2).replace(".", ",")}%</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>{filteredRows.length ? `Mostrando de ${start + 1} até ${end} de ${filteredRows.length} registros` : "Mostrando de 0 até 0 de 0 registros"}</div>
            {renderPagination(currentPage, totalPages)}
          </div>
        </div>
      );
    }

    // 8. Contagem de Faltas por Periodo
    if (tab === "contagem-faltas-periodo") {
      const data = result as ContagemFaltasPeriodoRow[];
      if (!data?.length) return <Empty />;
      const term = gridSearch.trim().toLowerCase();
      const filteredRows = data.filter(row => {
        if (!term) return true;
        return [
          row.parceiro,
          row.cnpj,
          row.codAprendiz,
          row.numSistExt,
          row.nome,
          row.faltaDias,
          row.horasFalta,
          row.aulasPeriodo,
        ].some(value => String(value).toLowerCase().includes(term));
      });
      const totalPages = Math.max(1, Math.ceil(filteredRows.length / gridPageSize));
      const currentPage = Math.min(gridPage, totalPages);
      const start = filteredRows.length ? (currentPage - 1) * gridPageSize : 0;
      const end = Math.min(start + gridPageSize, filteredRows.length);
      const pageRows = filteredRows.slice(start, end);

      return (
        <div className="max-w-full overflow-hidden text-sm text-gray-600">
          <div className="mb-3 flex flex-wrap justify-between gap-3">
            <label className="flex items-center gap-2">
              <span>Mostrar</span>
              <select
                value={gridPageSize}
                onChange={e => {
                  setGridPageSize(Number(e.target.value));
                  setGridPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              >
                {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <span>registros</span>
            </label>
            <label className="flex items-center gap-2">
              <span>Procurar:</span>
              <input
                type="search"
                value={gridSearch}
                onChange={e => {
                  setGridSearch(e.target.value);
                  setGridPage(1);
                }}
                placeholder="Search"
                className="h-9 w-48 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
              />
            </label>
          </div>

          <div className="relative max-w-full overflow-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full border-collapse bg-white text-sm text-gray-700">
              <thead>
                <tr>
                  <th className="min-w-[300px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Parceiro</th>
                  <th className="min-w-[120px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">CNPJ</th>
                  <th className="min-w-[100px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Cod Aprendiz</th>
                  <th className="min-w-[120px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Num. Sist. Ext.</th>
                  <th className="min-w-[260px] border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Nome</th>
                  <th className="min-w-[90px] border border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Falta Dias</th>
                  <th className="min-w-[90px] border border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Horas Falta</th>
                  <th className="min-w-[100px] border border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#133c86] whitespace-nowrap">Aulas Periodo</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={`${row.codAprendiz}-${row.cnpj}-${index}`} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/50`}>
                    <td className="border border-gray-200 px-3 py-2">{row.parceiro}</td>
                    <td className="border border-gray-200 px-3 py-2">{row.cnpj}</td>
                    <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">{row.codAprendiz}</td>
                    <td className="border border-gray-200 px-3 py-2">{row.numSistExt || "\u00a0"}</td>
                    <td className="border border-gray-200 px-3 py-2">{row.nome}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{row.faltaDias}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{row.horasFalta}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{row.aulasPeriodo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              {filteredRows.length
                ? `Mostrando de ${start + 1} até ${end} de ${filteredRows.length} registros`
                : "Mostrando de 0 até 0 de 0 registros"}
            </div>
            {renderPagination(currentPage, totalPages)}
          </div>

          {renderExportButtons({
            filenameBase: `controle-presenca-contagem-faltas-periodo-${tipoPagamento}-${startDate || "inicio"}-${endDate || "fim"}`,
            onExcel: () => exportContagemFaltasPeriodoCsv(filteredRows),
          })}

          <div ref={reportPdfRef} className="p-4 text-xs text-gray-700" style={offscreenReportStyle(1400)}>
            <div className="mb-4 text-center">
              <h3 className="text-base font-bold text-[#133c86]">Contagem Faltas Periodo</h3>
              <p className="text-gray-500">
                {formatIsoToBrDate(startDate)} a {formatIsoToBrDate(endDate)} - {filteredRows.length} registro(s)
              </p>
            </div>
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Parceiro</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">CNPJ</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Cod Aprendiz</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Num. Sist. Ext.</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left text-[#133c86]">Nome</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[#133c86]">Falta Dias</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[#133c86]">Horas Falta</th>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-center text-[#133c86]">Aulas Periodo</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={`${row.codAprendiz}-${row.cnpj}-pdf-${index}`}>
                    <td className="border border-gray-200 px-2 py-1">{row.parceiro}</td>
                    <td className="border border-gray-200 px-2 py-1">{row.cnpj}</td>
                    <td className="border border-gray-200 px-2 py-1">{row.codAprendiz}</td>
                    <td className="border border-gray-200 px-2 py-1">{row.numSistExt}</td>
                    <td className="border border-gray-200 px-2 py-1">{row.nome}</td>
                    <td className="border border-gray-200 px-2 py-1 text-center">{row.faltaDias}</td>
                    <td className="border border-gray-200 px-2 py-1 text-center">{row.horasFalta}</td>
                    <td className="border border-gray-200 px-2 py-1 text-center">{row.aulasPeriodo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 9. Aulas Dadas
    if (tab === "aulas-dadas") {
      const data = result as { data: string; ordem: number; turma: string; disciplina: string; conteudo: string }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Data</TH><TH>Aula</TH><TH>Turma</TH><TH>Disciplina</TH><TH>Conteúdo</TH></tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50/50">
                  <TD>{fmtDate(r.data)}</TD><TD center>{r.ordem}ª</TD><TD>{r.turma}</TD><TD>{r.disciplina}</TD><TD>{r.conteudo || "—"}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 10. Aprendizes com Faltas
    if (tab === "controle-faltas") {
      const data = result as { IdAluno: number; NomeJovem: string; turma: string; unidadeParceiro: string; faltas: number }[];
      if (!data?.length) return <Empty />;
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><TH>Matrícula</TH><TH>Nome</TH><TH>Turma</TH><TH>Unidade Parceiro</TH><TH>Faltas</TH></tr></thead>
            <tbody>
              {data.map(r => (
                <tr key={`${r.IdAluno}-${r.turma}`} className="hover:bg-blue-50/50">
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
    "comunicado-faltas": "Comunicado Faltas",
    "data-turma": "Controle de Presença por Data/Turma",
    "data-turma-capacitacao": "Controle de Presença por Data/Turma Capacitação",
    "turma-periodo": "Controle de Presença de Turma por Período",
    "turma-periodo-capacitacao": "Controle de Presença por Turma/Período Capacitação",
    "parceiro-periodo": "Controle de Presença por Parceiro/Período",
    "total-aulas-turma": "Total Período/Turma",
    "total-aulas-turma-capacitacao": "Total Período/Turma Capacitação",
    "total-aulas-parceiro": "Total Período/Parceiros",
    "faltas-parceiro": "Total Período/Faltas",
    "contagem-faltas-periodo": "Contagem Faltas Período",
    "conteudos-lecionados": "Conteúdos Lecionados no Período",
    "aulas-dadas": "Aulas Dadas no Período",
    "controle-faltas": "Controle de Faltas (8 faltas)",
    "estatisticas-presenca-jovem": "Estatísticas de Presença por Jovem",
  };

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-gray-900">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
          <h1 className="text-2xl font-bold text-[#133c86] tracking-tight">CONTROLE DE PRESENÇA</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tabTitles[tab]}</p>

          {/* Main tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all whitespace-nowrap ${
                  tab === t.id
                    ? "bg-[#133c86] border-[#133c86] text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:text-[#133c86] hover:bg-gray-50 hover:border-[#133c86]/30"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-6 p-8 bg-gray-100">
          {tab === "data-turma" || tab === "data-turma-capacitacao" ? (
            renderDataTurmaPanel()
          ) : tab === "turma-periodo" ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
                {renderFilters()}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="rounded-lg bg-[#133c86] px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0f2e6b] disabled:bg-gray-300"
                >
                  {loading ? "Pesquisando..." : "Pesquisar"}
                </button>
              </div>
              {(result || loading) && (
                <div className="mt-2">
                  {renderResults()}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Filters + Search button */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-end">
                  {renderFilters()}
                  {tab !== "comunicado-faltas" && (
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-[#133c86] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f2e6b] disabled:bg-gray-300 transition-all shadow-md active:scale-95"
                    >
                      {loading ? "Pesquisando..." : "Pesquisar"}
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              {(result || loading) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resultados
                  </div>
                  <div className="p-4">
                    {renderResults()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
