import React from "react";
import { CalendarioGerado, TipoDia } from "@/utils/calendarioAprendizagem";
import { X, Printer } from "lucide-react";

interface Props {
  calendario: CalendarioGerado;
  onClose: () => void;
}

const CORES: Record<TipoDia, { bg: string; text: string; border: string }> = {
  introducao: {
    bg: "bg-yellow-300",
    text: "text-yellow-900",
    border: "border-yellow-400",
  },
  semanal: {
    bg: "bg-[#1F4E79]",
    text: "text-white",
    border: "border-[#1F4E79]",
  },
  mensal: {
    bg: "bg-[#1F4E79]",
    text: "text-white",
    border: "border-[#1F4E79]",
  },
  pratica: {
    bg: "bg-green-400",
    text: "text-green-900",
    border: "border-green-500",
  },
  feriado: {
    bg: "bg-red-500",
    text: "text-white",
    border: "border-red-600",
  },
  ferias: {
    bg: "bg-sky-400",
    text: "text-sky-900",
    border: "border-sky-500",
  },
  suspensao: {
    bg: "bg-orange-300",
    text: "text-orange-900",
    border: "border-orange-400",
  },
  finaldesemana: {
    bg: "bg-gray-200",
    text: "text-gray-400",
    border: "border-gray-200",
  },
  inactive: {
    bg: "bg-gray-100",
    text: "text-gray-400",
    border: "border-gray-200",
  },
  vazio: {
    bg: "bg-transparent",
    text: "text-transparent",
    border: "border-transparent",
  },
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarioPreview({ calendario, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-auto">
      <div className="min-h-screen py-8 px-4">
        {/* Header flutuante - escondido na impressão */}
        <div className="print:hidden sticky top-0 z-10 max-w-7xl mx-auto mb-6 flex justify-between items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-6 py-4 border border-gray-200">
          <h2 className="text-xl font-bold text-[#133c86]">
            📅 ANEXO - CALENDÁRIO DA APRENDIZAGEM
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#133c86] text-white rounded-lg hover:bg-[#0f2e6b] transition-all font-medium text-sm"
            >
              <Printer size={16} />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm"
            >
              <X size={16} />
              Fechar
            </button>
          </div>
        </div>

        {/* Conteúdo imprimível */}
        <div
          id="calendario-print"
          className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8 print:shadow-none print:rounded-none print:p-4"
        >
          {/* Cabeçalho */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 print:text-lg">
              ANEXO - CALENDÁRIO DA APRENDIZAGEM
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <p>
                <strong>Nome do Aprendiz:</strong> {calendario.nomeAprendiz}
              </p>
              <p>
                <strong>Curso:</strong> {calendario.curso}
              </p>
              <p>
                <strong>Empresa Parceira:</strong> {calendario.empresa}
              </p>
              <p>
                <strong>Carga Horária Diária:</strong>{" "}
                {calendario.cargaHorariaDiaria}
              </p>
              <p>
                <strong>Dia Encontro Semanal:</strong>{" "}
                {calendario.diaEncontroSemanal}
              </p>
              <p>
                <strong>Atividade Complementar:</strong>{" "}
                {calendario.atividadeComplementar}
              </p>
              <p>
                <strong>Introdutórios:</strong> {calendario.introdutorios}
              </p>
              <p>
                <strong>Duração do Contrato:</strong>{" "}
                {calendario.duracaoContrato}
              </p>
            </div>

            {/* Legenda */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-yellow-300 border border-yellow-400 inline-block"></span>
                Introdutório
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#1F4E79] inline-block"></span>
                Encontro Semanal/Mensal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-green-400 border border-green-500 inline-block"></span>
                Prática
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-red-500 inline-block"></span>
                Feriado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-sky-400 border border-sky-500 inline-block"></span>
                Férias
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-orange-300 border border-orange-400 inline-block"></span>
                Suspensão
              </span>
            </div>
          </div>

          {/* Grid de meses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            {calendario.meses.map((mes) => (
              <div
                key={`${mes.ano}-${mes.mes}`}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-gray-300"
              >
                {/* Nome do mês */}
                <div className="bg-[#133c86] text-white text-center py-2 font-bold text-xs tracking-wider print:py-1 print:text-[10px]">
                  {mes.nome}
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                  {DIAS_SEMANA.map((dia) => (
                    <div
                      key={dia}
                      className="text-center py-1 text-[10px] font-semibold text-gray-500 print:text-[8px] print:py-0.5"
                    >
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Semanas */}
                <div className="p-1">
                  {mes.semanas.map((semana, si) => (
                    <div key={si} className="grid grid-cols-7 gap-px">
                      {semana.map((dia, di) => {
                        if (!dia) {
                          return (
                            <div key={di} className="aspect-square p-0.5"></div>
                          );
                        }

                        const cor = CORES[dia.tipo];

                        return (
                          <div
                            key={di}
                            className={`aspect-square p-0.5 flex flex-col items-center justify-center rounded-md ${cor.bg} ${cor.border} border text-center transition-all`}
                            title={`${dia.dia} - ${dia.tipo}`}
                          >
                            <span
                              className={`text-xs font-bold leading-none ${cor.text} print:text-[9px]`}
                            >
                              {dia.dia}
                            </span>
                            {dia.label && (
                              <span
                                className={`text-[8px] font-medium ${cor.text} print:text-[6px]`}
                              >
                                {dia.label}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Resumo Geral */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 print:text-sm">
              Resumo Geral
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full max-w-lg text-sm border-collapse">
                <thead>
                  <tr className="bg-[#133c86] text-white">
                    <th className="text-left px-4 py-2 rounded-tl-lg"></th>
                    <th className="text-right px-4 py-2">Encontros</th>
                    <th className="text-right px-4 py-2">Horas</th>
                    <th className="text-right px-4 py-2">Porcentagem</th>
                    <th className="text-right px-4 py-2 rounded-tr-lg">
                      Início Formação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">
                      Teoria
                    </th>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.encontrosTeoria}
                    </td>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.horasTeoria}
                    </td>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.porcentagemTeoria.toFixed(2)}%
                    </td>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.inicioFormacao}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">
                      Prática
                    </th>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.encontrosPratica}
                    </td>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.horasPratica}
                    </td>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.porcentagemPratica.toFixed(2)}%
                    </td>
                    <td className="text-right px-4 py-2"></td>
                  </tr>
                  <tr className="bg-[#133c86]/10 font-bold">
                    <th className="text-left px-4 py-2 rounded-bl-lg">Total</th>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.totalEncontros}
                    </td>
                    <td className="text-right px-4 py-2">
                      {calendario.resumo.totalHoras}
                    </td>
                    <td className="text-right px-4 py-2 rounded-br-lg"></td>
                    <td className="text-right px-4 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm text-gray-600 print:mt-8">
            <div>
              <div className="border-t border-gray-400 pt-2 mx-8">
                {calendario.nomeAprendiz}
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-2 mx-8">
                Responsável Legal do Aprendiz
              </div>
            </div>
            <div className="mt-6">
              <div className="border-t border-gray-400 pt-2 mx-8">
                Entidade Formadora
              </div>
            </div>
            <div className="mt-6">
              <div className="border-t border-gray-400 pt-2 mx-8">
                {calendario.empresa}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
