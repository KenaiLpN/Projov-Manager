"use client";

import { useState, useEffect } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Turma {
  TurCodigo: number;
  TurNome: string;
}

interface Disciplina {
  DisCodigo: number;
  DisDescricao: string;
}

const PERIODOS = [
  { id: 1, nome: "ENCONTRO SEMANAL - Aula 01" },
  { id: 2, nome: "ENCONTRO SEMANAL - Aula 02" },
  { id: 3, nome: "ENCONTRO SEMANAL - Aula 03" },
];

interface StudentAttendance {
  IdAluno: number;
  NomeJovem: string;
  presenca: string;
}

const PRESENCA_OPTIONS = [
  { value: ".", label: ". — Sem registro" },
  { value: "P", label: "P — Presença" },
  { value: "F", label: "F — Falta" },
  { value: "J", label: "J — Falta Justificada" },
  { value: "L", label: "L — Licença Maternidade" },
  { value: "S", label: "S — Serviço Militar" },
  { value: "D", label: "D — Desligado" },
];

const PRESENCA_ROW_COLOR: Record<string, string> = {
  P: "bg-green-50",
  F: "bg-red-50",
  J: "bg-amber-50",
  L: "bg-blue-50",
  S: "bg-purple-50",
  D: "bg-slate-100",
};

const PRESENCA_BADGE: Record<string, string> = {
  P: "bg-green-100 text-green-700",
  F: "bg-red-100 text-red-700",
  J: "bg-amber-100 text-amber-700",
  L: "bg-blue-100 text-blue-700",
  S: "bg-purple-100 text-purple-700",
  D: "bg-slate-200 text-slate-600",
  ".": "bg-slate-100 text-slate-400",
};

export default function LancarFaltasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [datas, setDatas] = useState<string[]>([]);

  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedData, setSelectedData] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [selectedDisciplina, setSelectedDisciplina] = useState("");

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carrega turmas e disciplinas na montagem
  useEffect(() => {
    api.get("/turmas?limit=1000")
      .then(r => setTurmas(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => toast.error("Erro ao carregar turmas."));
    api.get("/attendance/disciplinas")
      .then(r => setDisciplinas(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Erro ao carregar disciplinas."));
  }, []);

  // Turma → carrega datas (passadas + futuras no mesmo dia da semana, até 1 mês)
  useEffect(() => {
    setDatas([]);
    setSelectedData("");
    setSelectedPeriodo("");
    setSelectedDisciplina("");
    setStudents([]);
    if (!selectedTurma) return;

    api.get(`/attendance/turmas/${selectedTurma}/dates`)
      .then(r => {
        const list: string[] = (Array.isArray(r.data) ? r.data : [])
          .map((d: string) => d.substring(0, 10));
        setDatas(list);
      })
      .catch(() => toast.error("Erro ao carregar datas da turma."));
  }, [selectedTurma]);

  // Turma + Data → carrega alunos automaticamente (sem depender de período ou disciplina)
  useEffect(() => {
    setStudents([]);
    if (!selectedTurma || !selectedData) return;

    setLoadingStudents(true);
    api
      .get(`/attendance/turmas/${selectedTurma}/students?date=${selectedData}`)
      .then(r => {
        const data: Array<{ IdAluno: number; NomeJovem: string }> = r.data;
        setStudents(data.map(a => ({ IdAluno: a.IdAluno, NomeJovem: a.NomeJovem, presenca: "." })));
      })
      .catch(() => toast.error("Erro ao carregar alunos."))
      .finally(() => setLoadingStudents(false));
  }, [selectedTurma, selectedData]);

  const handlePresencaChange = (studentId: number, value: string) => {
    setStudents(prev => prev.map(s => s.IdAluno === studentId ? { ...s, presenca: value } : s));
  };

  const handleMarkAll = (value: string) => {
    setStudents(prev => prev.map(s => ({ ...s, presenca: value })));
  };

  const handleSave = async () => {
    if (!selectedTurma || !selectedData || !selectedDisciplina || !selectedPeriodo) {
      toast.error("Selecione turma, data, período e disciplina antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/attendance/faltas", {
        turmaId: Number(selectedTurma),
        disciplineId: Number(selectedDisciplina),
        date: selectedData,
        periodo: Number(selectedPeriodo),
        records: students.map(s => ({
          studentId: s.IdAluno,
          presence: s.presenca,
        })),
      });
      toast.success("Lançamentos salvos com sucesso!");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      console.error("FALTAS ERROR RESPONSE:", data);
      const msg = data?.error ?? data?.message;
      toast.error(msg ? `Erro: ${msg}` : "Erro ao salvar os lançamentos.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.NomeJovem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const faltaCount = students.filter(s => s.presenca === "F" || s.presenca === "J").length;

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">

        {/* Header com filtros */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4 mb-4">
            {/* Turma */}
            <div className="flex flex-col gap-1 min-w-[200px] flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</label>
              <select
                value={selectedTurma}
                onChange={e => setSelectedTurma(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {turmas.map(t => (
                  <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="flex flex-col gap-1 min-w-[180px] flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data</label>
              <select
                value={selectedData}
                onChange={e => setSelectedData(e.target.value)}
                disabled={!selectedTurma}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {datas.map(d => (
                  <option key={d} value={d}>
                    {format(new Date(d + "T12:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div className="flex flex-col gap-1 min-w-[240px] flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período</label>
              <select
                value={selectedPeriodo}
                onChange={e => setSelectedPeriodo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {PERIODOS.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Disciplina (CA_Disciplinas) */}
            <div className="flex flex-col gap-1 min-w-[200px] flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disciplina</label>
              <select
                value={selectedDisciplina}
                onChange={e => setSelectedDisciplina(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {disciplinas.map(d => (
                  <option key={d.DisCodigo} value={d.DisCodigo}>{d.DisDescricao}</option>
                ))}
              </select>
            </div>

            {/* Salvar */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#2563eb] text-white px-6 py-1.5 rounded text-sm font-semibold hover:bg-[#1d4ed8] transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {/* Legenda */}
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Legenda</span>{" "}
            F - Falta,{" "}J - Falta Justificada,{" "}L - Licença Maternidade,{" "}S - Serviço Militar,{" "}D - Desligado,{" "}P - Presença.
          </p>
        </div>

        {/* Tabela */}
        <div className="p-6">
          {(!selectedTurma || !selectedData) ? (
            <div className="bg-white rounded border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-slate-500 text-sm">Selecione a turma e a data para carregar os alunos.</p>
            </div>
          ) : (
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  {students.length > 0 && (
                    <>
                      <span className="text-xs text-slate-500">{faltaCount} falta(s) em {students.length} aluno(s)</span>
                      <button onClick={() => handleMarkAll("P")} className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded hover:bg-green-200 transition-colors">
                        Todos Presentes
                      </button>
                      <button onClick={() => handleMarkAll("F")} className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded hover:bg-red-200 transition-colors">
                        Todos Falta
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Procurar:</span>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-[#133c86]/30"
                  />
                </div>
              </div>

              {loadingStudents ? (
                <div className="p-16 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#133c86]/20 border-t-[#133c86] rounded-full animate-spin"></div>
                  <p className="text-slate-500 mt-3 text-sm">Carregando alunos...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 text-sm text-slate-700">
                      <th className="px-4 py-2 text-left font-semibold">Aluno</th>
                      <th className="px-4 py-2 text-left font-semibold w-48">Presença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(s => (
                        <tr key={s.IdAluno} className={`text-sm ${PRESENCA_ROW_COLOR[s.presenca] ?? ""}`}>
                          <td className="px-4 py-2 text-slate-800 font-medium">{s.NomeJovem}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${PRESENCA_BADGE[s.presenca] ?? "bg-slate-100 text-slate-400"}`}>
                                {s.presenca}
                              </span>
                              <select
                                value={s.presenca}
                                onChange={e => handlePresencaChange(s.IdAluno, e.target.value)}
                                className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#133c86]/30 focus:outline-none cursor-pointer"
                              >
                                {PRESENCA_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-16 text-center text-slate-400 text-sm italic">
                          Nenhum aluno encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
