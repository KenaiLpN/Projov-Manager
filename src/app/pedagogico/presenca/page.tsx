"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BotaoBaixarPDF = dynamic(
  () => import("@/components/PresencaPDF").then(m => m.BotaoBaixarPDF),
  { ssr: false, loading: () => null }
);

interface Turma {
  TurCodigo: number;
  TurNome: string;
}

interface Student {
  IdAluno: number;
  NomeJovem: string;
  UnidadeParceiro: string;
}

interface PresencaData {
  turma: { nome: string; nucleo: string };
  students: Student[];
}

const DISCIPLINAS = [
  { id: 1, nome: "ENCONTRO SEMANAL - Aula 01" },
  { id: 2, nome: "ENCONTRO SEMANAL - Aula 02" },
  { id: 3, nome: "ENCONTRO SEMANAL - Aula 03" },
];

const PAGE_SIZE = 22;

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ListaPresencaPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [datas, setDatas] = useState<string[]>([]);
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedData, setSelectedData] = useState("");
  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [presencaData, setPresencaData] = useState<PresencaData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/turmas?limit=1000")
      .then(r => setTurmas(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => toast.error("Erro ao carregar turmas."));
  }, []);

  // On turma change: load dates, reset rest
  useEffect(() => {
    setSelectedData("");
    setSelectedDisciplina("");
    setPresencaData(null);
    if (!selectedTurma) { setDatas([]); return; }
    api.get(`/attendance/turmas/${selectedTurma}/dates`)
      .then(r => setDatas(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Erro ao carregar datas."));
  }, [selectedTurma]);

  // On date change: reset discipline and result
  useEffect(() => {
    setSelectedDisciplina("");
    setPresencaData(null);
  }, [selectedData]);

  const handleGerar = async () => {
    if (!selectedTurma || !selectedData) {
      toast.error("Selecione turma e data.");
      return;
    }
    setLoading(true);
    try {
      const r = await api.get(
        `/attendance/turmas/${selectedTurma}/presenca-list?date=${selectedData}`
      );
      setPresencaData(r.data);
    } catch {
      toast.error("Erro ao gerar relatório.");
    } finally {
      setLoading(false);
    }
  };

  const dataFormatada = selectedData
    ? format(new Date(selectedData.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
    : "";
  const diaSemana = selectedData
    ? capitalize(format(new Date(selectedData.substring(0, 10) + "T12:00:00"), "EEEE", { locale: ptBR }))
    : "";

  const disciplinaNome = DISCIPLINAS.find(d => String(d.id) === selectedDisciplina)?.nome ?? "";

  const pages = presencaData
    ? Array.from(
        { length: Math.ceil(presencaData.students.length / PAGE_SIZE) },
        (_, i) => presencaData.students.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
      )
    : [];

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          .page-break { page-break-before: always; }
        }
        #print-area { display: none; }
      `}</style>

      {/* Área de impressão (oculta na tela, visível ao imprimir) */}
      <div id="print-area" className="font-sans text-black bg-white p-6">
        {pages.map((pageStudents, pageIndex) => (
          <div key={pageIndex} className={pageIndex > 0 ? "page-break" : ""}>
            <div className="text-center mb-3">
              <div className="font-bold text-base">PROJOV SEDE</div>
              <div className="text-xs">Rua Pará N°159, Bairro: Aldeia de Barueri, BARUERI - SP</div>
              <div className="text-xs">. CEP: 06440-130 - Telefone: (11) 4166-2630.</div>
              <div className="font-bold text-sm mt-2">
                Lista de Presença Aula do Dia&nbsp;&nbsp;&nbsp;{dataFormatada}
              </div>
              {disciplinaNome && (
                <div className="text-xs mt-1">{disciplinaNome}</div>
              )}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
              <thead>
                <tr style={{ backgroundColor: "#d1d5db" }}>
                  <td colSpan={9} style={{ border: "1px solid #6b7280", padding: "4px 8px", fontWeight: "bold", textAlign: "center" }}>
                    Turma: {presencaData?.turma.nome}&nbsp;&nbsp;&nbsp;
                    Núcleo: {presencaData?.turma.nucleo}&nbsp;&nbsp;&nbsp;
                    Dia do encontro: {diaSemana}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "left", width: "60px" }}>Matrícula</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "left" }}>Nome</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "left", width: "140px" }}>Unidade do Parceiro</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "center", width: "40px" }}>1ª Aula</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "center", width: "40px" }}>2ª Aula</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "center", width: "40px" }}>3ª Aula</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "center", width: "100px" }}>Assinatura</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "center", width: "100px" }}>Assinatura</th>
                  <th style={{ border: "1px solid #6b7280", padding: "4px 6px", textAlign: "center", width: "100px" }}>Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map(s => (
                  <tr key={s.IdAluno}>
                    <td style={{ border: "1px solid #6b7280", padding: "6px", textAlign: "center" }}>{s.IdAluno}</td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}>{s.NomeJovem}</td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}>{s.UnidadeParceiro}</td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #6b7280", padding: "6px" }}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", fontSize: "10px" }}>
              <div>
                <div style={{ borderTop: "1px solid black", width: "160px", marginBottom: "4px" }}></div>
                <div>Educador</div>
              </div>
              <div>{format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</div>
              <div>Página {pageIndex + 1}</div>
            </div>
          </div>
        ))}
      </div>

      {/* UI da tela */}
      <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
        <PedagogicoSidebar />
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
          <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#133c86] tracking-tight">LISTA DE PRESENÇA</h1>
                <p className="text-slate-500 text-sm mt-1">Gere a lista de presença para impressão dos educadores.</p>
              </div>
              {presencaData && (
                <div className="flex items-center gap-3">
                  <BotaoBaixarPDF
                    presencaData={presencaData}
                    dataFormatada={dataFormatada}
                    diaSemana={diaSemana}
                    disciplinaNome={disciplinaNome}
                  />

                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* 1. Turma */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</label>
                <select
                  value={selectedTurma}
                  onChange={e => setSelectedTurma(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none transition-all"
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map(t => (
                    <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                  ))}
                </select>
              </div>

              {/* 2. Data */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data</label>
                <select
                  value={selectedData}
                  onChange={e => setSelectedData(e.target.value)}
                  disabled={!selectedTurma}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Selecione a data...</option>
                  {datas.map(d => (
                    <option key={d} value={d}>
                      {format(new Date(d.substring(0, 10) + "T12:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Disciplina */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disciplina</label>
                <select
                  value={selectedDisciplina}
                  onChange={e => setSelectedDisciplina(e.target.value)}
                  disabled={!selectedData}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Selecione a disciplina...</option>
                  {DISCIPLINAS.map(d => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              </div>

              {/* 4. Botão */}
              <div className="flex items-end">
                <button
                  onClick={handleGerar}
                  disabled={loading || !selectedTurma || !selectedData}
                  className="w-full bg-[#133c86] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#0f2e6b] transition-all disabled:bg-slate-300 disabled:shadow-none shadow-md active:scale-95"
                >
                  {loading ? "Gerando..." : "Gerar Relatório"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!presencaData ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Nenhum relatório gerado</h3>
                <p className="text-slate-500 max-w-sm mt-1">Selecione a turma, data e disciplina, depois clique em Gerar Relatório.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div className="text-sm font-semibold text-slate-700">
                    Pré-visualização — {presencaData.turma.nome} / {dataFormatada}
                    {disciplinaNome && <span className="text-slate-500 font-normal"> · {disciplinaNome}</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {presencaData.students.length} aluno(s) · {pages.length} página(s)
                  </div>
                </div>

                <div className="overflow-x-auto p-6">
                  <div className="text-center mb-4">
                    <div className="font-bold text-base">PROJOV SEDE</div>
                    <div className="text-xs text-slate-500">Rua Pará N°159, Bairro: Aldeia de Barueri, BARUERI - SP · CEP: 06440-130</div>
                    <div className="font-bold text-sm mt-1">Lista de Presença Aula do Dia &nbsp; {dataFormatada}</div>
                    {disciplinaNome && <div className="text-xs text-slate-500 mt-0.5">{disciplinaNome}</div>}
                  </div>

                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-200">
                        <td colSpan={9} className="border border-slate-400 px-3 py-2 font-bold text-center text-slate-700">
                          Turma: {presencaData.turma.nome} &nbsp;&nbsp; Núcleo: {presencaData.turma.nucleo} &nbsp;&nbsp; Dia do encontro: {diaSemana}
                        </td>
                      </tr>
                      <tr className="bg-[#133c86] text-white text-xs uppercase tracking-wider">
                        <th className="border border-slate-400 px-3 py-2 text-left w-16">Matrícula</th>
                        <th className="border border-slate-400 px-3 py-2 text-left">Nome</th>
                        <th className="border border-slate-400 px-3 py-2 text-left w-40">Unidade do Parceiro</th>
                        <th className="border border-slate-400 px-3 py-2 text-center w-12">1ª Aula</th>
                        <th className="border border-slate-400 px-3 py-2 text-center w-12">2ª Aula</th>
                        <th className="border border-slate-400 px-3 py-2 text-center w-12">3ª Aula</th>
                        <th className="border border-slate-400 px-3 py-2 text-center w-24">Assinatura</th>
                        <th className="border border-slate-400 px-3 py-2 text-center w-24">Assinatura</th>
                        <th className="border border-slate-400 px-3 py-2 text-center w-24">Assinatura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {presencaData.students.map(s => (
                        <tr key={s.IdAluno} className="hover:bg-slate-50/50">
                          <td className="border border-slate-200 px-3 py-3 text-center text-slate-600">{s.IdAluno}</td>
                          <td className="border border-slate-200 px-3 py-3 font-medium text-slate-700">{s.NomeJovem}</td>
                          <td className="border border-slate-200 px-3 py-3 text-slate-600">{s.UnidadeParceiro}</td>
                          <td className="border border-slate-200 px-3 py-3"></td>
                          <td className="border border-slate-200 px-3 py-3"></td>
                          <td className="border border-slate-200 px-3 py-3"></td>
                          <td className="border border-slate-200 px-3 py-3"></td>
                          <td className="border border-slate-200 px-3 py-3"></td>
                          <td className="border border-slate-200 px-3 py-3"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
