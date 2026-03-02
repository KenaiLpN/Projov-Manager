import React from "react";

export interface CadastroRegiao {
  CodRegiao: number;
  DescRegiao: string;
}

interface TabelaProps {
  dados: CadastroRegiao[];
  loading: boolean;
  error: string | null;
  onEdit: (item: CadastroRegiao) => void;
  onDelete: (id: number) => void;
}

const TabelaCadastroRegiao: React.FC<TabelaProps> = ({
  dados,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <div className="text-center p-8 text-[#133c86]">Carregando...</div>;
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
        Nenhuma região cadastrada.
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
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr key={item.CodRegiao} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.CodRegiao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.DescRegiao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.CodRegiao)}
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

export default TabelaCadastroRegiao;
