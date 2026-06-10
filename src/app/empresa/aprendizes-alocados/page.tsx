"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Download, Eye, Search, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import Modal from "@/components/modal";
import Pagination from "@/components/pagination";
import { ParceiroPageShell } from "@/components/parceiro/ParceiroPageShell";

type AllocationRow = {
  alocacaoOrdem: number;
  codigo: number;
  nome: string;
  turmaCodigo: number;
  turma: string;
  unidade: string;
  situacao: string;
  dataEntrada: string | null;
  dataPrevTermino: string | null;
};

type Details = {
  apprentice: Record<string, string | number | null>;
  allocations: Array<{
    ordem: number;
    turma: string;
    unidade: string;
    status: string | null;
    dataEntrada: string | null;
    dataPrevTermino: string | null;
    dataTermino: string | null;
  }>;
  documents: Array<{
    sequencia: number;
    codigo: string;
    documento: string;
    status: string | null;
    dataSolicitacao: string | null;
    dataEntrega: string | null;
    previsaoEntrega: string | null;
    possuiAnexo: boolean;
  }>;
  attendance: {
    resumo: { registros: number; faltas: number; justificadas: number };
    registros: Array<{
      turma: string;
      data: string | null;
      cargaHoraria: number;
      presenca: string | null;
      presencaTarde: string | null;
      observacoes: string | null;
    }>;
  };
};

type SavedCalendar = {
  aprendiz: { codigo: number; nome: string };
  empresa: string;
  alocacoes: Array<{
    turma: number;
    unidade: string;
    dataEntrada: string | null;
    dataPrevTermino: string | null;
  }>;
  dias: Array<{ data: string; tipo: number | null }>;
};

const detailFields: Array<[string, string]> = [
  ["Apr_Codigo", "Código"],
  ["Apr_Nome", "Nome"],
  ["Apr_NomeSocial", "Nome social"],
  ["situacao", "Situação"],
  ["Apr_CPF", "CPF"],
  ["Apr_DataDeNascimento", "Data de nascimento"],
  ["Apr_Sexo", "Sexo"],
  ["Apr_Email", "E-mail"],
  ["Apr_Celular", "Celular"],
  ["Apr_Telefone", "Telefone"],
  ["Apr_Endereco", "Endereço"],
  ["Apr_NumeroEndereco", "Número"],
  ["Apr_Complemento", "Complemento"],
  ["Apr_Bairro", "Bairro"],
  ["Apr_Cidade", "Cidade"],
  ["Apr_UF", "UF"],
  ["Apr_CEP", "CEP"],
  ["Apr_NomeEscola", "Escola"],
  ["Apr_Escolaridade", "Escolaridade"],
  ["Apr_TurnoEscolar", "Turno escolar"],
  ["Apr_TipoAprendizagem", "Tipo de aprendizagem"],
  ["Apr_HorasDiarias", "Horas diárias"],
  ["Apr_DataContrato", "Data do contrato"],
  ["Apr_InicioAprendizagem", "Início da aprendizagem"],
  ["Apr_PrevFimAprendizagem", "Previsão de término"],
];

const calendarTypes: Record<number, { label: string; className: string }> = {
  1: { label: "Feriado", className: "bg-red-500 text-white" },
  2: { label: "Fim de semana", className: "bg-gray-100 text-gray-400" },
  3: { label: "Introdutório", className: "bg-yellow-300 text-yellow-900" },
  5: { label: "Prática", className: "bg-lime-300 text-lime-900" },
  6: { label: "Férias", className: "bg-sky-400 text-sky-950" },
  7: { label: "Encontro mensal", className: "bg-violet-700 text-white" },
  8: { label: "Encontro semanal", className: "bg-[#1F4E79] text-white" },
  10: { label: "Encontro final", className: "bg-amber-600 text-white" },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function ReadOnlyGrid({ data }: { data: Record<string, string | number | null> }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {detailFields.map(([key, label]) => (
        <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 min-h-5 text-sm font-medium text-gray-900">
            {key.toLowerCase().includes("data") || key.includes("Inicio") || key.includes("PrevFim")
              ? formatDate(String(data[key] || ""))
              : String(data[key] ?? "-") || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}

function DetailsContent({ details }: { details: Details }) {
  const [tab, setTab] = useState<"dados" | "alocacoes" | "frequencia" | "documentos">("dados");
  const tabs = [
    ["dados", "Dados do aprendiz"],
    ["alocacoes", "Alocações"],
    ["frequencia", "Frequência e faltas"],
    ["documentos", "Documentação"],
  ] as const;

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-gray-900">Detalhes do aprendiz</h2>
      <p className="mb-5 text-sm text-gray-500">Consulta somente leitura. Nenhum dado pode ser alterado pela empresa.</p>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              tab === id ? "bg-[#133c86] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dados" && <ReadOnlyGrid data={details.apprentice} />}

      {tab === "alocacoes" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#133c86] text-white">
              <tr>
                <th className="px-4 py-3">Turma</th>
                <th className="px-4 py-3">Unidade</th>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Prev. término</th>
                <th className="px-4 py-3">Término</th>
              </tr>
            </thead>
            <tbody>
              {details.allocations.map((allocation) => (
                <tr key={allocation.ordem} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold">{allocation.turma}</td>
                  <td className="px-4 py-3">{allocation.unidade}</td>
                  <td className="px-4 py-3">{formatDate(allocation.dataEntrada)}</td>
                  <td className="px-4 py-3">{formatDate(allocation.dataPrevTermino)}</td>
                  <td className="px-4 py-3">{formatDate(allocation.dataTermino)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "frequencia" && (
        <div>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["Registros de aula", details.attendance.resumo.registros],
              ["Faltas", details.attendance.resumo.faltas],
              ["Faltas justificadas", details.attendance.resumo.justificadas],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase text-blue-700">{label}</p>
                <p className="mt-1 text-2xl font-black text-[#133c86]">{value}</p>
              </div>
            ))}
          </div>
          <div className="max-h-96 overflow-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#133c86] text-white">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Turma</th>
                  <th className="px-4 py-3">Manhã</th>
                  <th className="px-4 py-3">Tarde</th>
                  <th className="px-4 py-3">Observações</th>
                </tr>
              </thead>
              <tbody>
                {details.attendance.registros.map((record, index) => (
                  <tr key={`${record.turma}-${record.data}-${index}`} className="border-t border-gray-200">
                    <td className="px-4 py-3">{formatDate(record.data)}</td>
                    <td className="px-4 py-3 font-semibold">{record.turma}</td>
                    <td className="px-4 py-3">{record.presenca || "-"}</td>
                    <td className="px-4 py-3">{record.presencaTarde || "-"}</td>
                    <td className="px-4 py-3">{record.observacoes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!details.attendance.registros.length && <p className="p-8 text-center text-gray-500">Nenhum registro encontrado.</p>}
          </div>
        </div>
      )}

      {tab === "documentos" && (
        <div className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#133c86] text-white">
              <tr>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Solicitação</th>
                <th className="px-4 py-3">Previsão</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Anexo</th>
              </tr>
            </thead>
            <tbody>
              {details.documents.map((document) => (
                <tr key={document.sequencia} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold">{document.documento}</td>
                  <td className="px-4 py-3">{formatDate(document.dataSolicitacao)}</td>
                  <td className="px-4 py-3">{formatDate(document.previsaoEntrega)}</td>
                  <td className="px-4 py-3">{formatDate(document.dataEntrega)}</td>
                  <td className="px-4 py-3">{document.status || "-"}</td>
                  <td className="px-4 py-3">{document.possuiAnexo ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!details.documents.length && <p className="p-8 text-center text-gray-500">Nenhum documento encontrado.</p>}
        </div>
      )}
    </div>
  );
}

function SavedCalendarContent({ calendar }: { calendar: SavedCalendar }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const dayMap = useMemo(() => new Map(calendar.dias.map((day) => [day.data, day.tipo])), [calendar.dias]);
  const months = useMemo(() => {
    if (!calendar.dias.length) return [];
    const first = new Date(`${calendar.dias[0].data}T00:00:00Z`);
    const last = new Date(`${calendar.dias[calendar.dias.length - 1].data}T00:00:00Z`);
    const result: Date[] = [];
    for (let date = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1)); date <= last; date.setUTCMonth(date.getUTCMonth() + 1)) {
      result.push(new Date(date));
    }
    return result;
  }, [calendar.dias]);

  async function downloadPdf() {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(printRef.current, { scale: 1.5, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const image = canvas.toDataURL("image/png");
      for (let offset = 0; offset < height; offset += pageHeight) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(image, "PNG", 0, -offset, width, height);
      }
      pdf.save(`Calendario_${calendar.aprendiz.nome.replace(/\s+/g, "_")}.pdf`);
    } catch {
      toast.error("Não foi possível gerar o PDF do calendário.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendário da aprendizagem</h2>
          <p className="text-sm text-gray-500">Calendário salvo para este aprendiz.</p>
        </div>
        {!!calendar.dias.length && (
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg bg-[#133c86] px-4 py-2 font-bold text-white disabled:opacity-60"
          >
            <Download size={17} />
            {downloading ? "Gerando PDF..." : "Baixar PDF"}
          </button>
        )}
      </div>

      <div ref={printRef} className="bg-white p-2">
        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm">
          <p><strong>Aprendiz:</strong> {calendar.aprendiz.nome} (#{calendar.aprendiz.codigo})</p>
          <p><strong>Empresa:</strong> {calendar.empresa}</p>
          <p><strong>Alocações:</strong> {calendar.alocacoes.map((item) => `${item.unidade} / turma ${item.turma}`).join("; ")}</p>
        </div>
        <div className="mb-5 flex flex-wrap gap-3 text-xs">
          {Object.entries(calendarTypes).map(([type, config]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className={`h-4 w-4 rounded ${config.className}`} />
              {config.label}
            </span>
          ))}
        </div>
        {!calendar.dias.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
            Ainda não existe calendário salvo para este aprendiz.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {months.map((month) => {
              const year = month.getUTCFullYear();
              const monthIndex = month.getUTCMonth();
              const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
              const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
              return (
                <div key={`${year}-${monthIndex}`} className="overflow-hidden rounded-xl border border-gray-200">
                  <h3 className="bg-[#133c86] px-3 py-2 text-center text-sm font-bold capitalize text-white">
                    {monthFormatter.format(month)}
                  </h3>
                  <div className="grid grid-cols-7 bg-gray-50 text-center text-[10px] font-bold text-gray-500">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <span key={day} className="py-1">{day}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 p-2">
                    {Array.from({ length: firstWeekday }).map((_, index) => <span key={`blank-${index}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const type = dayMap.get(key);
                      const config = type ? calendarTypes[type] : undefined;
                      return (
                        <span
                          key={key}
                          title={config?.label}
                          className={`flex aspect-square items-center justify-center rounded text-xs font-bold ${
                            config?.className || "bg-white text-gray-300"
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AprendizesAlocadosPage() {
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<Details | null>(null);
  const [calendar, setCalendar] = useState<SavedCalendar | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/empresa/aprendizes-alocados", {
        params: { page, limit: 10, search: appliedSearch || undefined },
      });
      setRows(response.data.data);
      setTotal(response.data.meta.total);
      setTotalPages(response.data.meta.totalPages);
    } catch {
      toast.error("Não foi possível carregar os aprendizes alocados.");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  async function openDetails(apprenticeId: number) {
    setModalLoading(true);
    try {
      const response = await api.get(`/empresa/aprendizes-alocados/${apprenticeId}/detalhes`);
      setDetails(response.data);
    } catch {
      toast.error("Não foi possível carregar os detalhes do aprendiz.");
    } finally {
      setModalLoading(false);
    }
  }

  async function openCalendar(apprenticeId: number) {
    setModalLoading(true);
    try {
      const response = await api.get(`/empresa/aprendizes-alocados/${apprenticeId}/calendario`);
      setCalendar(response.data);
    } catch {
      toast.error("Não foi possível carregar o calendário do aprendiz.");
    } finally {
      setModalLoading(false);
    }
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  return (
    <ParceiroPageShell>
      <div className="min-h-full bg-gray-100 px-5 pb-5 pt-8">
        <div className="mx-auto max-w-[96rem]">
          <header className="mb-5 flex items-center gap-3 rounded-xl bg-[#133c86] px-6 py-5 text-white shadow-sm">
            <Users size={28} />
            <div>
              <h1 className="text-2xl font-bold">Aprendizes Alocados</h1>
              <p className="text-sm text-blue-100">Aprendizes em aprendizagem vinculados às unidades da empresa.</p>
            </div>
          </header>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3 border-b border-gray-200 bg-gray-50 p-5">
              <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm font-bold text-gray-700">
                Pesquisar por código ou nome
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Digite o nome ou código do aprendiz"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20"
                />
              </label>
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-[#133c86] px-5 py-2.5 font-bold text-white hover:bg-[#0f2e6b]">
                <Search size={17} />
                Pesquisar
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[76rem] text-left text-sm">
                <thead className="bg-[#34495E] text-white">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Turma</th>
                    <th className="px-4 py-3">Unidade</th>
                    <th className="px-4 py-3">Situação</th>
                    <th className="px-4 py-3">Data Entrada</th>
                    <th className="px-4 py-3">Data Prev. Término</th>
                    <th className="px-4 py-3 text-center">Detalhes</th>
                    <th className="px-4 py-3 text-center">Emitir Calendário</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && rows.map((row) => (
                    <tr
                      key={row.alocacaoOrdem}
                      className="border-t border-gray-200 even:bg-gray-50 hover:bg-blue-50 dark:even:bg-[#111a2c] dark:hover:bg-[#22324a]"
                    >
                      <td className="px-4 py-3 font-semibold text-[#133c86]">{row.codigo}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{row.nome}</td>
                      <td className="px-4 py-3">{row.turma}</td>
                      <td className="px-4 py-3">{row.unidade}</td>
                      <td className="px-4 py-3"><span className="whitespace-nowrap rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">{row.situacao}</span></td>
                      <td className="px-4 py-3">{formatDate(row.dataEntrada)}</td>
                      <td className="px-4 py-3">{formatDate(row.dataPrevTermino)}</td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => openDetails(row.codigo)} title="Consultar detalhes" className="rounded-lg p-2 text-[#133c86] hover:bg-blue-100">
                          <Eye size={19} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => openCalendar(row.codigo)} title="Emitir calendário" className="rounded-lg p-2 text-[#133c86] hover:bg-blue-100">
                          <CalendarDays size={19} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <p className="p-12 text-center text-gray-500">Carregando aprendizes alocados...</p>}
              {!loading && !rows.length && <p className="p-12 text-center text-gray-500">Nenhum aprendiz em aprendizagem foi encontrado para esta empresa.</p>}
            </div>

            {!loading && total > 0 && (
              <div className="border-t border-gray-200 p-4">
                <p className="mb-3 text-sm text-gray-500">{total} alocação(ões) encontrada(s).</p>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal isOpen={Boolean(details)} onClose={() => setDetails(null)} maxWidth="max-w-7xl">
        {details && <DetailsContent details={details} />}
      </Modal>
      <Modal isOpen={Boolean(calendar)} onClose={() => setCalendar(null)} maxWidth="max-w-7xl">
        {calendar && <SavedCalendarContent calendar={calendar} />}
      </Modal>
      {modalLoading && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-6 py-4 font-bold text-[#133c86] shadow-xl">Carregando consulta...</div>
        </div>
      )}
    </ParceiroPageShell>
  );
}
