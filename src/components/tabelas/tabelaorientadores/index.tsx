import React from "react";
export interface Orientador {
  OriCodigo: number;
  OriUnidadeParceiro: number;
  OriNome: string;
  OriTelefone?: string;
  OriEmail?: string;
  UnidadeNome?: string;
}
interface TabelaProps {
  dados: Orientador[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Orientador) => void;
  onDelete: (id: number) => void;
}
const TabelaOrientadores: React.FC<TabelaProps> = ({
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
        Nenhum orientador cadastrado.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Nome do Orientador
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Unidade de Atuação
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              E-mail
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr
              key={item.OriCodigo}
              className="hover:bg-gray-50 transition-colors text-sm"
            >
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                {item.OriNome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {item.UnidadeNome || `Unidade ID: ${item.OriUnidadeParceiro}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.OriEmail || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.OriTelefone || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.OriCodigo)}
                  className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
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
export default TabelaOrientadores;