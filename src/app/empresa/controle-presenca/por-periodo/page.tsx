"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Download, Loader2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { ParceiroPageShell } from "@/components/parceiro/ParceiroPageShell";
import api from "@/services/api";

type MatrixColumn = {
  key: string;
  label: string;
  date: string;
  ordem: number;
};

type MatrixStudent = {
  key: string;
  IdAluno: number;
  NomeJovem: string;
  UnidadeParceiro: string;
  Turma: string;
  presencas: Record<string, string>;
};

type MatrixResult = {
  kind: "period-matrix";
  columns: MatrixColumn[];
  students: MatrixStudent[];
};

const pageSizes = [10, 25, 50, 100];

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function presenceClass(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "." || normalized === "P") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
  }
  if (normalized === "F") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";
  }
  if (normalized === "J") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300";
  }
  return "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500";
}

export default function PresencaPorPeriodoPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [matrix, setMatrix] = useState<MatrixResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return matrix?.students ?? [];

    return (matrix?.students ?? []).filter((student) =>
      [
        student.IdAluno,
        student.NomeJovem,
        student.UnidadeParceiro,
        student.Turma,
        ...Object.values(student.presencas),
      ].some((value) => String(value ?? "").toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [matrix, search]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = filteredStudents.length ? (currentPage - 1) * pageSize : 0;
  const endIndex = Math.min(startIndex + pageSize, filteredStudents.length);
  const pageStudents = filteredStudents.slice(startIndex, endIndex);

  async function searchAttendance(event: React.FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Informe a data inicial e a data final.");
      return;
    }
    if (startDate > endDate) {
      toast.error("A data inicial deve ser anterior à data final.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<MatrixResult>("/empresa/controle-presenca/por-periodo", {
        params: { startDate, endDate },
      });
      setMatrix({
        kind: "period-matrix",
        columns: Array.isArray(response.data?.columns) ? response.data.columns : [],
        students: Array.isArray(response.data?.students) ? response.data.students : [],
      });
      setSearch("");
      setPage(1);
    } catch {
      toast.error("Não foi possível consultar o controle de presença.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!matrix?.students.length) return;
    const headers = ["Matrícula", "Nome", "Unidade", "Turma", ...matrix.columns.map((column) => column.label)];
    const rows = filteredStudents.map((student) => [
      student.IdAluno,
      student.NomeJovem,
      student.UnidadeParceiro,
      student.Turma,
      ...matrix.columns.map((column) => student.presencas[column.key] ?? ""),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-presenca-empresa-${startDate}-${endDate}.csv`;
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
            <CalendarRange size={29} />
            <div>
              <h1 className="text-2xl font-bold">Controle de Presença por Período</h1>
              <p className="text-sm text-blue-100">Presença dos aprendizes alocados nas unidades da sua empresa.</p>
            </div>
          </header>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#101b2d]">
            <div className="border-b border-gray-200 p-5 dark:border-slate-700">
              <h2 className="text-lg font-bold text-[#133c86] dark:text-blue-300">
                Controle de Presença por Período dos Aprendizes Alocados
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">. Presença</span>
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">F Falta</span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">J Falta justificada</span>
              </div>
            </div>

            <form onSubmit={searchAttendance} className="flex flex-wrap items-end gap-4 border-b border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-[#0c1728]">
              <label className="flex min-w-52 flex-col gap-1.5 text-sm font-bold text-gray-700 dark:text-slate-200">
                Período inicial
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal text-gray-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20 dark:border-slate-600 dark:bg-[#152238] dark:text-slate-100 dark:[color-scheme:dark]"
                />
              </label>
              <label className="flex min-w-52 flex-col gap-1.5 text-sm font-bold text-gray-700 dark:text-slate-200">
                Período final
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal text-gray-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20 dark:border-slate-600 dark:bg-[#152238] dark:text-slate-100 dark:[color-scheme:dark]"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[#133c86] px-5 py-2.5 font-bold text-white transition-colors hover:bg-[#0f2e6b] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {loading ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}
                Pesquisar
              </button>
            </form>

            {matrix && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 p-4 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    Mostrar
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-gray-800 dark:border-slate-600 dark:bg-[#152238] dark:text-slate-100"
                    >
                      {pageSizes.map((size) => <option key={size}>{size}</option>)}
                    </select>
                    registros
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={17} />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="Procurar na tabela"
                        className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-[#133c86] focus:ring-2 focus:ring-[#133c86]/20 dark:border-slate-600 dark:bg-[#152238] dark:text-slate-100"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={exportCsv}
                      disabled={!filteredStudents.length}
                      className="flex items-center gap-2 rounded-lg border border-[#133c86] px-4 py-2 text-sm font-bold text-[#133c86] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-950/40"
                    >
                      <Download size={17} />
                      Exportar CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 z-20 bg-[#34495E] text-white dark:bg-[#162842]">
                      <tr>
                        <th className="sticky left-0 z-30 min-w-28 border-b border-r border-white/15 bg-[#34495E] px-4 py-3 dark:bg-[#162842]">Matrícula</th>
                        <th className="sticky left-28 z-30 min-w-64 border-b border-r border-white/15 bg-[#34495E] px-4 py-3 dark:bg-[#162842]">Nome</th>
                        <th className="min-w-64 border-b border-r border-white/15 px-4 py-3">Unidade</th>
                        <th className="min-w-40 border-b border-r border-white/15 px-4 py-3">Turma</th>
                        {matrix.columns.map((column) => (
                          <th key={column.key} className="min-w-24 whitespace-nowrap border-b border-r border-white/15 px-3 py-3 text-center">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageStudents.map((student, index) => (
                        <tr key={student.key} className="group">
                          <td className={`sticky left-0 z-10 border-b border-r border-gray-200 px-4 py-3 font-bold text-[#133c86] dark:border-slate-700 dark:text-blue-300 ${index % 2 ? "bg-gray-50 dark:bg-[#0d1829]" : "bg-white dark:bg-[#101b2d]"} group-hover:bg-blue-50 dark:group-hover:bg-[#1a2b45]`}>
                            {student.IdAluno}
                          </td>
                          <td className={`sticky left-28 z-10 border-b border-r border-gray-200 px-4 py-3 font-semibold text-gray-900 dark:border-slate-700 dark:text-slate-100 ${index % 2 ? "bg-gray-50 dark:bg-[#0d1829]" : "bg-white dark:bg-[#101b2d]"} group-hover:bg-blue-50 dark:group-hover:bg-[#1a2b45]`}>
                            {student.NomeJovem}
                          </td>
                          <td className="border-b border-r border-gray-200 px-4 py-3 dark:border-slate-700">{student.UnidadeParceiro || "-"}</td>
                          <td className="border-b border-r border-gray-200 px-4 py-3 font-medium dark:border-slate-700">{student.Turma || "-"}</td>
                          {matrix.columns.map((column) => {
                            const value = student.presencas[column.key] ?? "";
                            return (
                              <td key={column.key} className="border-b border-r border-gray-200 px-2 py-2 text-center dark:border-slate-700">
                                <span className={`inline-flex min-h-7 min-w-7 items-center justify-center rounded-md border px-1.5 font-bold ${presenceClass(value)}`}>
                                  {value || "–"}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredStudents.length && (
                    <p className="p-12 text-center text-gray-500 dark:text-slate-400">
                      Nenhum aprendiz alocado com registros de presença foi encontrado nesse período.
                    </p>
                  )}
                </div>

                {filteredStudents.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-slate-700 dark:text-slate-300">
                    <p>Mostrando de {startIndex + 1} até {endIndex} de {filteredStudents.length} registros</p>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-gray-300 px-3 py-2 font-bold hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800">Anterior</button>
                      <span className="rounded-lg bg-[#133c86] px-3 py-2 font-bold text-white dark:bg-blue-700">{currentPage} / {totalPages}</span>
                      <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-gray-300 px-3 py-2 font-bold hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800">Seguinte</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!matrix && !loading && (
              <div className="px-6 py-16 text-center text-gray-500 dark:text-slate-400">
                <CalendarRange className="mx-auto mb-3 text-[#133c86] dark:text-blue-300" size={38} />
                <p className="font-semibold">Selecione o período para consultar os aprendizes alocados e suas presenças.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </ParceiroPageShell>
  );
}
