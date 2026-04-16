import React from "react";

export interface PlanoCurricular {
  PlcCodigoPlano: number;
  PlcDisciplina: number;
  PlcCargaHoraria: number | null;
  PlcTipoAvaliacao: string | null;
  PlcNumeroAulas: number | null;
  PlcDescricao: string | null;
  PlcOrdemDisciplina: number | null;
  PlcGeraCronograma: string | null;
  EducCodigo: number | null;
  plano: { PlanCodigo: number; PlanDescricao: string | null; PlanCurso: string } | null;
  disciplina: { DisCodigo: number; DisDescricao: string } | null;
  educador: { EducCodigo: number; EducNome: string | null } | null;
}

interface Props {
  dados: PlanoCurricular[];
  loading: boolean;
  error: string | null;
  onEdit: (item: PlanoCurricular) => void;
  onDelete: (codigoPlano: number, disciplina: number) => void;
}

const tipoAvaliacaoLabel = (tipo: string | null) => {
  if (tipo === "C") return "Conceito";
  if (tipo === "N") return "Nota";
  return "-";
};

const geraCronogramaLabel = (val: string | null) => {
  if (val === "S" || val === "s") return "Sim";
  if (val === "N" || val === "n") return "Não";
  return "-";
};

const TabelaPlanoCurricular = React.memo(function TabelaPlanoCurricular({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}: Props) {
  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto m-5 rounded-lg shadow">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-[#123A83] text-white">
          <tr>
            <th className="py-3 px-4 text-left font-semibold uppercase text-xs">Cód. Plano</th>
            <th className="py-3 px-4 text-left font-semibold uppercase text-xs">Plano</th>
            <th className="py-3 px-4 text-left font-semibold uppercase text-xs">Disciplina</th>
            <th className="py-3 px-4 text-left font-semibold uppercase text-xs">Educador</th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-xs">Ordem</th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-xs">Tipo Aval.</th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-xs">Nº Aulas</th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-xs">C.H.</th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-xs">Cronograma</th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-xs">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {dados.length > 0 ? (
            dados.map((item) => (
              <tr
                key={`${item.PlcCodigoPlano}-${item.PlcDisciplina}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-700 font-mono text-sm">
                  {item.PlcCodigoPlano}
                </td>
                <td className="py-3 px-4 text-gray-700 text-sm">
                  {item.plano?.PlanDescricao || `Plano ${item.PlcCodigoPlano}`}
                </td>
                <td className="py-3 px-4 text-gray-700 text-sm">
                  {item.disciplina?.DisDescricao || `Cód. ${item.PlcDisciplina}`}
                </td>
                <td className="py-3 px-4 text-gray-700 text-sm">
                  {item.educador?.EducNome || "-"}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 text-sm">
                  {item.PlcOrdemDisciplina ?? "-"}
                </td>
                <td className="py-3 px-4 text-center text-sm">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      item.PlcTipoAvaliacao === "C"
                        ? "bg-purple-100 text-purple-700"
                        : item.PlcTipoAvaliacao === "N"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tipoAvaliacaoLabel(item.PlcTipoAvaliacao)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-700 text-sm">
                  {item.PlcNumeroAulas ?? "-"}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 text-sm">
                  {item.PlcCargaHoraria ? `${item.PlcCargaHoraria}h` : "-"}
                </td>
                <td className="py-3 px-4 text-center text-sm">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      item.PlcGeraCronograma === "S" || item.PlcGeraCronograma === "s"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {geraCronogramaLabel(item.PlcGeraCronograma)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.PlcCodigoPlano, item.PlcDisciplina)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Excluir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="py-8 text-center text-gray-500 italic">
                Nenhum plano curricular encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default TabelaPlanoCurricular;