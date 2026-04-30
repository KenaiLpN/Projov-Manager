"use client";

import { useState } from "react";
import { PedagogicoSidebar } from "@/components/pedagogicosidebar";

type Aba = "cronogramas" | "intervalo" | "disciplina" | "cores" | "disciplinas-turma";

const ABAS: { id: Aba; label: string }[] = [
  { id: "cronogramas", label: "Cronogramas" },
  { id: "intervalo", label: "Cronograma por Intervalo" },
  { id: "disciplina", label: "Cronograma por Disciplina" },
  { id: "cores", label: "Cores Disciplinas" },
  { id: "disciplinas-turma", label: "Cronograma Disciplinas/Turma" },
];

export default function CronogramasPage() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("cronogramas");
  const [turma, setTurma] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
      <PedagogicoSidebar />
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">

        {/* Abas */}
        <div className="bg-white border-b border-slate-200 px-6 pt-4 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {ABAS.map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`px-4 py-2 rounded-t text-sm font-semibold transition-all ${
                  abaAtiva === aba.id
                    ? "bg-[#133c86] text-white"
                    : "bg-[#4a7cc9] text-white hover:bg-[#2d5fa8]"
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {abaAtiva === "cronogramas" && (
            <div className="bg-white rounded border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-700">Consulta de Cronograma Turma</h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col gap-1 min-w-[220px]">
                    <label className="text-xs font-semibold text-slate-600">Turma</label>
                    <select
                      value={turma}
                      onChange={e => setTurma(e.target.value)}
                      className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Data Inicial</label>
                    <input
                      type="date"
                      value={dataInicial}
                      onChange={e => setDataInicial(e.target.value)}
                      className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Data Final</label>
                    <input
                      type="date"
                      value={dataFinal}
                      onChange={e => setDataFinal(e.target.value)}
                      className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-[#133c86]/20 focus:outline-none"
                    />
                  </div>

                  <button
                    className="bg-[#133c86] text-white px-6 py-1.5 rounded text-sm font-semibold hover:bg-[#0f2e6b] transition-all active:scale-95"
                  >
                    Pesquisar
                  </button>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "intervalo" && (
            <div className="bg-white rounded border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-700">Cronograma por Intervalo</h2>
              </div>
              <div className="px-6 py-12 text-center text-slate-400 text-sm">Em desenvolvimento</div>
            </div>
          )}

          {abaAtiva === "disciplina" && (
            <div className="bg-white rounded border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-700">Cronograma por Disciplina</h2>
              </div>
              <div className="px-6 py-12 text-center text-slate-400 text-sm">Em desenvolvimento</div>
            </div>
          )}

          {abaAtiva === "cores" && (
            <div className="bg-white rounded border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-700">Cores Disciplinas</h2>
              </div>
              <div className="px-6 py-12 text-center text-slate-400 text-sm">Em desenvolvimento</div>
            </div>
          )}

          {abaAtiva === "disciplinas-turma" && (
            <div className="bg-white rounded border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-700">Cronograma Disciplinas/Turma</h2>
              </div>
              <div className="px-6 py-12 text-center text-slate-400 text-sm">Em desenvolvimento</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
