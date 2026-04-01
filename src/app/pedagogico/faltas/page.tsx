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

interface StudentAttendance {
  IdAluno: number;
  NomeJovem: string;
  Presenca: string | null;
  Observacao: string;
}

export default function LancarFaltasPage() {
  // Filters
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [datas, setDatas] = useState<string[]>([]);
  
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedData, setSelectedData] = useState<string>("");
  
  // Data
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI State

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initial load: Turmas
  useEffect(() => {
    async function loadTurmas() {
      try {
        const response = await api.get("/turmas?limit=1000");
        setTurmas(response.data.data);
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        toast.error("Erro ao carregar lista de turmas.");
      }
    }
    loadTurmas();
  }, []);

  // Initial load: Disciplinas
  useEffect(() => {
    async function loadDisciplinas() {
      try {
        const first = await api.get("/disciplinas?page=1&limit=100");
        const { data, meta } = first.data;
        const all: Disciplina[] = [...data];
        for (let p = 2; p <= meta.totalPages; p++) {
          const res = await api.get(`/disciplinas?page=${p}&limit=100`);
          all.push(...res.data.data);
        }
        setDisciplinas(all);
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        toast.error("Erro ao carregar lista de disciplinas.");
      }
    }
    loadDisciplinas();
  }, []);

  // On Turma change: reset discipline/dates
  useEffect(() => {
    if (!selectedTurma) {
      setSelectedDisciplina("");
      setDatas([]);
      setSelectedData("");
    }
  }, [selectedTurma]);

  // On Discipline change: Load Dates
  useEffect(() => {
    if (!selectedTurma || !selectedDisciplina) {
      setDatas([]);
      setSelectedData("");
      return;
    }

    async function loadDates() {
      try {
        const response = await api.get(`/attendance/turmas/${selectedTurma}/disciplines/${selectedDisciplina}/dates`);
        setDatas(response.data);
        setSelectedData("");
      } catch (error) {
        console.error("Erro ao carregar datas:", error);
        toast.error("Erro ao carregar datas de aula disponiveis.");
      }
    }
    loadDates();
  }, [selectedTurma, selectedDisciplina]);

  // On filter complete: Load Students
  useEffect(() => {
    if (!selectedTurma || !selectedDisciplina || !selectedData) {
      setStudents([]);
      return;
    }

    async function loadStudents() {
      setLoadingStudents(true);
      try {
        const response = await api.get(
          `/attendance/turmas/${selectedTurma}/disciplines/${selectedDisciplina}/students?date=${selectedData}`
        );
        setStudents(response.data);
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        toast.error("Erro ao carregar relação de alunos.");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [selectedTurma, selectedDisciplina, selectedData]);

  const handlePresenceChange = (studentId: number, value: string) => {
    setStudents(prev => prev.map(s => 
      s.IdAluno === studentId ? { ...s, Presenca: value.toUpperCase() } : s
    ));
  };

  const handleSave = async () => {
    if (!selectedTurma || !selectedDisciplina || !selectedData) {
      toast.error("Selecione todos os filtros antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/attendance", {
        turmaId: Number(selectedTurma),
        disciplineId: Number(selectedDisciplina),
        date: selectedData,
        records: students.map(s => ({
          studentId: s.IdAluno,
          presence: s.Presenca || ".", // . for default? Or keep null if not marked?
          observation: s.Observacao
        }))
      });
      toast.success("Lançamentos salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar faltas:", error);
      toast.error("Erro ao salvar os lançamentos de falta.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.NomeJovem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#133c86] tracking-tight">LANÇAMENTO DE FALTAS</h1>
              <p className="text-slate-500 text-sm mt-1">Registre a presença dos alunos nas aulas presenciais.</p>
            </div>
            <div className="flex gap-3">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</label>
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none transition-all"
              >
                <option value="">Selecione uma turma...</option>
                {turmas.map(t => (
                  <option key={t.TurCodigo} value={t.TurCodigo}>{t.TurNome}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disciplina</label>
              <select
                value={selectedDisciplina}
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none transition-all"
              >
                <option value="">Selecione a disciplina...</option>
                {disciplinas.map(d => (
                  <option key={d.DisCodigo} value={d.DisCodigo}>{d.DisDescricao}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data da Aula</label>
              <select
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                disabled={!selectedDisciplina}
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
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {(!selectedTurma || !selectedDisciplina || !selectedData) ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Aguardando Filtros</h3>
              <p className="text-slate-500 max-w-sm mt-1">Selecione a turma, disciplina e data acima para carregar a lista de alunos.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-300 rounded-full"></span> F - Falta</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-300 rounded-full"></span> J - Justificada</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-300 rounded-full"></span> L - Licença</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-300 rounded-full"></span> S - Serviço Mil.</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full"></span> P - Presença</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filtrar aluno por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <th className="px-6 py-4 text-center font-semibold w-64">Presença / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <tr key={s.IdAluno} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#133c86] font-bold text-xs">
                                  {s.NomeJovem.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-700">{s.NomeJovem}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <input
                                  type="text"
                                  maxLength={1}
                                  value={s.Presenca || ""}
                                  onChange={(e) => handlePresenceChange(s.IdAluno, e.target.value)}
                                  placeholder="."
                                  className={`w-12 h-12 text-center rounded-xl border-2 font-bold text-lg transition-all focus:ring-4 outline-none ${
                                    s.Presenca?.toUpperCase() === 'P' 
                                      ? 'bg-green-50 border-green-500 text-green-700 focus:ring-green-100' 
                                      : s.Presenca && s.Presenca !== '.' 
                                        ? 'bg-red-50 border-red-400 text-red-700 focus:ring-red-100'
                                        : 'bg-white border-slate-200 text-slate-400 focus:border-[#133c86] focus:ring-[#133c86]/10'
                                  }`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-20 text-center text-slate-400 italic">
                             Nenhum aluno encontrado nesta turma para os critérios selecionados.
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
