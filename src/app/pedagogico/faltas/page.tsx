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

interface StudentAttendance {
  IdAluno: number;
  NomeJovem: string;
  presenca: string;
}

const AULA_OPTIONS = [
  { value: "1", label: "Aula 1 — Manhã" },
  { value: "2", label: "Aula 2 — Tarde" },
  { value: "3", label: "Aula 3" },
];

const PRESENCA_OPTIONS = [
  { value: "P", label: "P - Presença" },
  { value: "F", label: "F - Falta" },
  { value: "J", label: "J - Falta Justificada" },
  { value: "L", label: "L - Licença Maternidade" },
  { value: "S", label: "S - Serviço Militar" },
  { value: "D", label: "D - Desligado" },
];

const PRESENCA_ROW_COLOR: Record<string, string> = {
  P: "bg-green-50",
  F: "bg-red-50",
  J: "bg-amber-50",
  L: "bg-blue-50",
  S: "bg-purple-50",
  D: "bg-slate-100",
};

const PRESENCA_AVATAR_COLOR: Record<string, string> = {
  P: "bg-green-100 text-green-700",
  F: "bg-red-100 text-red-700",
  J: "bg-amber-100 text-amber-700",
  L: "bg-blue-100 text-blue-700",
  S: "bg-purple-100 text-purple-700",
  D: "bg-slate-200 text-slate-600",
};

export default function LancarFaltasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [datas, setDatas] = useState<string[]>([]);

  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [selectedData, setSelectedData] = useState<string>("");
  const [selectedAula, setSelectedAula] = useState<string>("");

  // Disciplina buscada silenciosamente após seleção de turma — usada apenas nas chamadas de API
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null);

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/turmas?limit=1000")
      .then(r => setTurmas(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => toast.error("Erro ao carregar lista de turmas."));
  }, []);

  // Ao trocar de turma: carrega datas e busca disciplina silenciosamente
  useEffect(() => {
    setSelectedData("");
    setSelectedAula("");
    setDatas([]);
    setDisciplinaId(null);
    setStudents([]);
    if (!selectedTurma) return;

    api.get(`/attendance/turmas/${selectedTurma}/dates`)
      .then(r => setDatas(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Erro ao carregar datas de aula."));

    api.get(`/attendance/turmas/${selectedTurma}/disciplines`)
      .then(r => { if (r.data.length > 0) setDisciplinaId(r.data[0].DisCodigo); })
      .catch(() => {});
  }, [selectedTurma]);

  // Ao trocar de data: reinicia seleção de aula e alunos
  useEffect(() => {
    setSelectedAula("");
    setStudents([]);
  }, [selectedData]);

  // Ao selecionar turma + data + aula: carrega alunos com presença já existente
  useEffect(() => {
    setStudents([]);
    if (!selectedTurma || !selectedData || !selectedAula || !disciplinaId) return;
    setLoadingStudents(true);
    api
      .get(`/attendance/turmas/${selectedTurma}/disciplines/${disciplinaId}/students?date=${selectedData}&aula=${selectedAula}`)
      .then(r => {
        const data: Array<{ IdAluno: number; NomeJovem: string; Presenca: string | null }> = r.data;
        setStudents(data.map(a => ({
          IdAluno: a.IdAluno,
          NomeJovem: a.NomeJovem,
          presenca: a.Presenca || "P",
        })));
      })
      .catch(() => toast.error("Erro ao carregar lista de alunos."))
      .finally(() => setLoadingStudents(false));
  }, [selectedTurma, selectedData, selectedAula, disciplinaId]);

  const handlePresencaChange = (studentId: number, value: string) => {
    setStudents(prev =>
      prev.map(s => s.IdAluno === studentId ? { ...s, presenca: value } : s)
    );
  };

  const handleMarkAll = (value: string) => {
    setStudents(prev => prev.map(s => ({ ...s, presenca: value })));
  };

  const handleSave = async () => {
    if (!selectedTurma || !selectedData || !selectedAula || !disciplinaId) {
      toast.error("Selecione todos os filtros antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/attendance", {
        turmaId: Number(selectedTurma),
        disciplineId: disciplinaId,
        date: selectedData,
        aula: Number(selectedAula),
        records: students.map(s => ({
          studentId: s.IdAluno,
          presence: s.presenca,
          observation: "",
        })),
      });
      toast.success("Lançamentos salvos com sucesso!");
    } catch {
      toast.error("Erro ao salvar os lançamentos.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.NomeJovem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = students.filter(s => s.presenca === "P").length;

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#133c86] tracking-tight">LANÇAMENTO DE FALTAS</h1>
              <p className="text-slate-500 text-sm mt-1">Registre a presença dos alunos nas aulas presenciais.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              className="bg-[#133c86] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#0f2e6b] transition-all flex items-center gap-2 shadow-md active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Salvar Lançamentos
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data da Aula</label>
              <select
                value={selectedData}
                onChange={e => setSelectedData(e.target.value)}
                disabled={!selectedTurma || datas.length === 0}
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

            {/* 3. Aula */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aula</label>
              <select
                value={selectedAula}
                onChange={e => setSelectedAula(e.target.value)}
                disabled={!selectedData}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none transition-all disabled:opacity-50"
              >
                <option value="">Selecione a aula...</option>
                {AULA_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Legenda */}
          <div className="mb-4 bg-white rounded-xl border border-slate-200 px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Legenda:</span>
            {[
              { code: "P", label: "Presença",           bg: "bg-green-100",  text: "text-green-700"  },
              { code: "F", label: "Falta",               bg: "bg-red-100",    text: "text-red-700"    },
              { code: "J", label: "Falta Justificada",   bg: "bg-amber-100",  text: "text-amber-700"  },
              { code: "L", label: "Licença Maternidade", bg: "bg-blue-100",   text: "text-blue-700"   },
              { code: "S", label: "Serviço Militar",     bg: "bg-purple-100", text: "text-purple-700" },
              { code: "D", label: "Desligado",           bg: "bg-slate-200",  text: "text-slate-600"  },
            ].map(({ code, label, bg, text }) => (
              <div key={code} className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bg} ${text}`}>
                  {code}
                </span>
                <span className="text-sm text-slate-600">{label}</span>
              </div>
            ))}
          </div>

          {(!selectedTurma || !selectedData || !selectedAula) ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Aguardando Filtros</h3>
              <p className="text-slate-500 max-w-sm mt-1">Selecione a turma, data e aula acima para carregar a lista de alunos.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-600">
                    {presentCount} / {students.length} presentes
                  </span>
                  <button
                    onClick={() => handleMarkAll("P")}
                    className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    Marcar todos Presentes
                  </button>
                  <button
                    onClick={() => handleMarkAll("F")}
                    className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    Marcar todos Falta
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filtrar aluno por nome..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#133c86]/20 outline-none"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {loadingStudents ? (
                <div className="p-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#133c86]/20 border-t-[#133c86] rounded-full animate-spin"></div>
                  <p className="text-slate-500 mt-4 font-medium">Carregando lista de alunos...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#133c86] text-white text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Aluno</th>
                        <th className="px-6 py-4 text-center font-semibold w-56">Presença</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(s => (
                          <tr
                            key={s.IdAluno}
                            className={`transition-colors ${PRESENCA_ROW_COLOR[s.presenca] ?? ""}`}
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${PRESENCA_AVATAR_COLOR[s.presenca] ?? "bg-slate-100 text-slate-600"}`}>
                                  {s.NomeJovem.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-700">{s.NomeJovem}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex justify-center">
                                <select
                                  value={s.presenca}
                                  onChange={e => handlePresencaChange(s.IdAluno, e.target.value)}
                                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none cursor-pointer"
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
                          <td colSpan={2} className="px-6 py-20 text-center text-slate-400 italic">
                            Nenhum aluno encontrado nesta turma.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
