import React from "react";

export interface Profissao {
  ProfCodigo: number;
  ProfDescricao: string;
}

interface TabelaProfissoesProps {
  dados: Profissao[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Profissao) => void;
  onDelete: (id: number) => void;
}

const TabelaProfissoes: React.FC<TabelaProfissoesProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-[#133c86]">
        Carregando profissões...
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
        Nenhuma profissão cadastrada.
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Nome da Profissão
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr key={item.ProfCodigo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.ProfCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                {item.ProfDescricao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.ProfCodigo)}
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

export default TabelaProfissoes;
