import React from "react";
export interface UnidadeParceiro {
  ParUniCodigo: number;
  ParUniCodigoParceiro: number;
  ParUniDescricao: string;
  ParUniCNPJ?: string;
  ParUniCidade?: string;
  ParUniEstado?: string;
  EmpresaNome?: string;
}
interface TabelaProps {
  dados: UnidadeParceiro[];
  loading: boolean;
  error: string | null;
  onEdit: (item: UnidadeParceiro) => void;
  onDelete: (id: number, parceiroId: number) => void;
}
const TabelaUnidadeParceiro: React.FC<TabelaProps> = ({
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
        Nenhuma unidade cadastrada.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Empresa (Parceiro)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Descrição da Unidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              CNPJ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Cidade/UF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr
              key={`${item.ParUniCodigo}-${item.ParUniCodigoParceiro}`}
              className="hover:bg-gray-50 transition-colors text-sm"
            >
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                {item.EmpresaNome || `PID: ${item.ParUniCodigoParceiro}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {item.ParUniDescricao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.ParUniCNPJ || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.ParUniCidade && item.ParUniEstado
                  ? `${item.ParUniCidade}/${item.ParUniEstado}`
                  : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() =>
                    onDelete(item.ParUniCodigo, item.ParUniCodigoParceiro)
                  }
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
export default TabelaUnidadeParceiro;