"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, Loader2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { ParceiroPageShell } from "@/components/parceiro/ParceiroPageShell";
import api from "@/services/api";

type MonthColumn = { key: string; label: string };
type MonthlyTotal = { aulas: number; presencas: number; justificadas: number; faltas: number };
type TotalStudent = {
  IdAluno: number;
  NomeJovem: string;
  UnidadeParceiro: string;
  totais: Record<string, MonthlyTotal>;
};
type TotalResult = {
  kind: "total-periodo-turma";
  columns: MonthColumn[];
  students: TotalStudent[];
};

const pageSizes = [10, 25, 50, 100];
const emptySummary = { aulas: 0, presencas: 0, justificadas: 0, faltas: 0 };

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function PresencaTotalPeriodoPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<TotalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return result?.students ?? [];
    return (result?.students ?? []).filter((student) =>
      [student.IdAluno, student.NomeJovem, student.UnidadeParceiro]
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [result, search]);

  const summary = useMemo(
    () => filteredStudents.reduce((acc, student) => {
      Object.values(student.totais).forEach((total) => {
        acc.aulas += total.aulas;
        acc.presencas += total.presencas;
        acc.justificadas += total.justificadas;
        acc.faltas += total.faltas;
      });
      return acc;
    }, { ...emptySummary }),
    [filteredStudents],
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = filteredStudents.length ? (currentPage - 1) * pageSize : 0;
  const endIndex = Math.min(startIndex + pageSize, filteredStudents.length);
  const pageStudents = filteredStudents.slice(startIndex, endIndex);

  async function searchTotals(event: React.FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate) return toast.error("Informe a data inicial e a data final.");
    if (startDate > endDate) return toast.error("A data inicial deve ser anterior à data final.");

    setLoading(true);
    try {
      const response = await api.get<TotalResult>("/empresa/controle-presenca/total-periodo", {
        params: { startDate, endDate },
      });
      setResult({
        kind: "total-periodo-turma",
        columns: Array.isArray(response.data?.columns) ? response.data.columns : [],
        students: Array.isArray(response.data?.students) ? response.data.students : [],
      });
      setSearch("");
      setPage(1);
    } catch {
      toast.error("Não foi possível consultar os totais de presença.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!result?.students.length) return;
    const headers = [
      "Matrícula", "Nome", "Parceiro/Unidade",
      ...result.columns.flatMap((column) => [
        `${column.label} Aulas`, `${column.label} Presenças`,
        `${column.label} Justificadas`, `${column.label} Faltas`,
      ]),
    ];
    const rows = filteredStudents.map((student) => [
      student.IdAluno, student.NomeJovem, student.UnidadeParceiro,
      ...result.columns.flatMap((column) => {
        const total = student.totais[column.key];
        return total
          ? [total.aulas, total.presencas, total.justificadas, total.faltas].map(String)
          : ["", "", "", ""];
      }),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `total-presenca-empresa-${startDate}-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ParceiroPageShell>
      <div className="min-h-full bg-gray-100 px-5 pb-8 pt-8 text-gray-800 dark:bg-[#08111f] dark:text-slate-100">
        <div className="mx-auto max-w-[112rem]">
          <header className="mb-5 flex items-center gap-3 rounded-xl bg-[#133c86] px-6 py-5 text-white shadow-sm dark:bg-[#102b5c]">
            <BarChart3 size={29} />
            <div>
              <h1 className="text-2xl font-bold">Total Aulas por Período</h1>
              <p className="text-sm text-blue-100">Totais mensais dos aprendizes vinculados às unidades da sua empresa.</p>
            </div>
          </header>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#101b2d]">
            <div className="border-b border-gray-200 p-5 dark:border-slate-700">
              <h2 className="text-lg font-bold text-[#133c86] dark:text-blue-300">Total Aulas por Período</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <Legend className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">A Aulas</Legend>
                <Legend className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">P Presenças</Legend>
                <Legend className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">F Faltas</Legend>
                <Legend className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">J Justificadas</Legend>
              </div>
            </div>

            <form onSubmit={searchTotals} className="flex flex-wrap items-end gap-4 border-b border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-[#0c1728]">
              <DateField label="Período inicial" value={startDate} onChange={setStartDate} />
              <DateField label="Período final" value={endDate} onChange={setEndDate} />
              <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#133c86] px-5 py-2.5 font-bold text-white hover:bg-[#0f2e6b] disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-600">
                {loading ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />} Pesquisar
              </button>
            </form>

            {result && (
              <>
                <div className="grid gap-3 border-b border-gray-200 p-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-slate-700">
                  <SummaryCard label="Aulas" value={summary.aulas} className="text-blue-700 dark:text-blue-300" />
                  <SummaryCard label="Presenças" value={summary.presencas} className="text-emerald-700 dark:text-emerald-300" />
                  <SummaryCard label="Justificadas" value={summary.justificadas} className="text-amber-700 dark:text-amber-300" />
                  <SummaryCard label="Faltas" value={summary.faltas} className="text-red-700 dark:text-red-300" />
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 p-4 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    Mostrar
                    <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-2 py-2 dark:border-slate-600 dark:bg-[#152238]">
                      {pageSizes.map((size) => <option key={size}>{size}</option>)}
                    </select>
                    registros
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={17} />
                      <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Procurar na tabela" className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#133c86] dark:border-slate-600 dark:bg-[#152238]" />
                    </label>
                    <button type="button" onClick={exportCsv} disabled={!filteredStudents.length} className="flex items-center gap-2 rounded-lg border border-[#133c86] px-4 py-2 text-sm font-bold text-[#133c86] hover:bg-blue-50 disabled:opacity-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/40">
                      <Download size={17} /> Exportar CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 z-20 bg-[#34495E] text-white dark:bg-[#162842]">
                      <tr>
                        <TH className="sticky left-0 z-30 min-w-28 bg-[#34495E] dark:bg-[#162842]">Matrícula</TH>
                        <TH className="sticky left-28 z-30 min-w-64 bg-[#34495E] dark:bg-[#162842]">Nome</TH>
                        <TH className="min-w-72">Parceiro/Unidade</TH>
                        {result.columns.map((column) => <TH key={column.key} className="min-w-36 text-center">{column.label}<span className="block text-xs font-medium text-blue-100">A | P | F</span></TH>)}
                      </tr>
                    </thead>
                    <tbody>
                      {pageStudents.map((student, index) => (
                        <tr key={`${student.IdAluno}-${student.UnidadeParceiro}`} className="group">
                          <StickyTD index={index} left="left-0" className="font-bold text-[#133c86] dark:text-blue-300">{student.IdAluno}</StickyTD>
                          <StickyTD index={index} left="left-28" className="font-semibold text-gray-900 dark:text-slate-100">{student.NomeJovem}</StickyTD>
                          <TD>{student.UnidadeParceiro || "-"}</TD>
                          {result.columns.map((column) => <TotalCell key={column.key} total={student.totais[column.key]} />)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredStudents.length && <p className="p-12 text-center text-gray-500 dark:text-slate-400">Nenhum aprendiz com aulas foi encontrado nesse período.</p>}
                </div>

                {filteredStudents.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-slate-700 dark:text-slate-300">
                    <p>Mostrando de {startIndex + 1} até {endIndex} de {filteredStudents.length} registros</p>
                    <div className="flex items-center gap-2">
                      <PageButton disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</PageButton>
                      <span className="rounded-lg bg-[#133c86] px-3 py-2 font-bold text-white dark:bg-blue-700">{currentPage} / {totalPages}</span>
                      <PageButton disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Seguinte</PageButton>
                    </div>
                  </div>
                )}
              </>
            )}

            {!result && !loading && (
              <div className="px-6 py-16 text-center text-gray-500 dark:text-slate-400">
                <BarChart3 className="mx-auto mb-3 text-[#133c86] dark:text-blue-300" size={38} />
                <p className="font-semibold">Selecione o período para consultar os totais dos aprendizes alocados.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </ParceiroPageShell>
  );
}

function Legend({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full border px-3 py-1 ${className}`}>{children}</span>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex min-w-52 flex-col gap-1.5 text-sm font-bold text-gray-700 dark:text-slate-200">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-[#133c86] dark:border-slate-600 dark:bg-[#152238] dark:[color-scheme:dark]" /></label>;
}

function SummaryCard({ label, value, className }: { label: string; value: number; className: string }) {
  return <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-700 dark:bg-[#0c1728]"><p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p><p className={`mt-1 text-2xl font-black ${className}`}>{value}</p></div>;
}

function TH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`border-b border-r border-white/15 px-4 py-3 ${className}`}>{children}</th>;
}

function TD({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-r border-gray-200 px-4 py-3 dark:border-slate-700">{children}</td>;
}

function StickyTD({ children, index, left, className }: { children: React.ReactNode; index: number; left: string; className: string }) {
  return <td className={`sticky ${left} z-10 border-b border-r border-gray-200 px-4 py-3 dark:border-slate-700 ${className} ${index % 2 ? "bg-gray-50 dark:bg-[#0d1829]" : "bg-white dark:bg-[#101b2d]"} group-hover:bg-blue-50 dark:group-hover:bg-[#1a2b45]`}>{children}</td>;
}

function TotalCell({ total }: { total?: MonthlyTotal }) {
  return <td className="border-b border-r border-gray-200 px-3 py-3 text-center dark:border-slate-700">{total ? <span className="whitespace-nowrap font-bold"><span className="text-blue-700 dark:text-blue-300">{total.aulas}</span><span className="mx-1 text-gray-300 dark:text-slate-600">|</span><span className="text-emerald-700 dark:text-emerald-300">{total.presencas}</span><span className="mx-1 text-gray-300 dark:text-slate-600">|</span><span className="text-red-700 dark:text-red-300">{total.faltas}</span></span> : <span className="text-gray-300 dark:text-slate-600">-</span>}</td>;
}

function PageButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded-lg border border-gray-300 px-3 py-2 font-bold hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800">{children}</button>;
}
