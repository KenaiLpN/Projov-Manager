import React from "react";

export interface Ocorrencia {
  OcadOrdem: number;
  OcadCodAprendiz: number;
  OcadCodOcorrencia: number;
  OcadDataOcorrencia: string; // Vem como string ISO da API
  OcadObservacoes: string;
}

interface TabelaOcorrenciasProps {
  dados: Ocorrencia[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Ocorrencia) => void;
  onDelete: (id: number) => void;
}

const TabelaOcorrencias: React.FC<TabelaOcorrenciasProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-[#133c86]">
        Carregando ocorrências...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center border-t border-red-200">
        ❌ Erro: {error}
      </div>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhuma ocorrência registrada.
      </div>
    );
  }

  // Função simples para formatar data (dd/mm/aaaa)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "UTC", // Importante para não alterar o dia devido ao fuso
    });
  };

  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Ordem
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              ID Aprendiz
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Cód. Ocor.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Observações
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr key={item.OcadOrdem} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.OcadOrdem}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(item.OcadDataOcorrencia)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.OcadCodAprendiz}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.OcadCodOcorrencia}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                {item.OcadObservacoes}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.OcadOrdem)}
                  className="text-red-600 hover:text-red-900 cursor-pointer"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaOcorrencias;
