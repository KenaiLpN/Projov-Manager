import React from "react";
export interface Parceiro {
  ParCodigo: number;
  ParDescricao: string;
  ParNomeFantasia?: string;
  ParCNPJ?: string;
  ParCidade?: string;
  ParEstado?: string;
  ParSituacao?: string;
  RamoDescricao?: string;
}
interface TabelaProps {
  dados: Parceiro[];
  loading: boolean;
  error: string | null;
  onEdit: (item: Parceiro) => void;
  onDelete: (id: number) => void;
}
const TabelaParceiros: React.FC<TabelaProps> = ({
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
        Nenhuma empresa cadastrada.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-[#bacce6]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tl-lg">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Razão Social / Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              CNPJ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Ramo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Cidade/UF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#133c86] uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr
              key={item.ParCodigo}
              className="hover:bg-gray-50 transition-colors text-sm"
            >
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {item.ParCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                <div className="flex flex-col">
                  <span className="font-semibold">{item.ParDescricao}</span>
                  <span className="text-xs text-gray-400 italic">
                    {item.ParNomeFantasia}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.ParCNPJ || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.RamoDescricao || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {item.ParCidade && item.ParEstado
                  ? `${item.ParCidade}/${item.ParEstado}`
                  : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${item.ParSituacao === "A" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.ParSituacao === "A" ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.ParCodigo)}
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
export default TabelaParceiros;