import React from "react";
export interface Disciplina {
  DisCodigo: number;
  DisDescricao: string;
  DisAbreviatura: string | null;
  DisCor: string | null;
}
interface TabelaDisciplinasProps {
  dados: Disciplina[];
  loading: boolean;
  error: string | null;
  onEdit: (disciplina: Disciplina) => void;
  onDelete: (id: number) => void;
}
const TabelaDisciplinas: React.FC<TabelaDisciplinasProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) return <div className="p-4 text-center">Carregando...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  return (
    <div className="overflow-x-auto m-5 rounded-lg shadow">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-[#34495E] text-white">
          <tr>
            <th className="py-3 px-4 text-left font-semibold uppercase text-sm border-b">
              Código
            </th>
            <th className="py-3 px-4 text-left font-semibold uppercase text-sm border-b">
              Descrição
            </th>
            <th className="py-3 px-4 text-left font-semibold uppercase text-sm border-b">
              Abreviatura
            </th>
            <th className="py-3 px-4 text-left font-semibold uppercase text-sm border-b">
              Cor
            </th>
            <th className="py-3 px-4 text-center font-semibold uppercase text-sm border-b">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {dados.length > 0 ? (
            dados.map((item) => (
              <tr
                key={item.DisCodigo}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-700">{item.DisCodigo}</td>
                <td className="py-3 px-4 text-gray-700">{item.DisDescricao}</td>
                <td className="py-3 px-4 text-gray-700">
                  {item.DisAbreviatura || "-"}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    {item.DisCor && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.DisCor }}
                      />
                    )}
                    <span>{item.DisCor || "-"}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Editar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.DisCodigo)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Excluir"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500 italic">
                Nenhuma disciplina encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default TabelaDisciplinas;