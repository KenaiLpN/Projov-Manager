import React from "react";
export interface RamoAtividade {
  IdRamo: number;
  Descricao: string;
  CodigoCNAE?: string;
  Observacao?: string;
  Ativo?: boolean;
}
interface TabelaProps {
  dados: RamoAtividade[];
  loading: boolean;
  error: string | null;
  onEdit: (item: RamoAtividade) => void;
  onDelete: (id: number) => void;
}
const TabelaRamosAtividade: React.FC<TabelaProps> = ({
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
        Nenhum ramo de atividade cadastrado.
      </div>
    );
  }
  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-[#123A83] text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider rounded-tl-lg">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              CNAE
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider rounded-tr-lg">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr
              key={item.IdRamo}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.IdRamo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {item.Descricao}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {item.CodigoCNAE || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${item.Ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.Ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.IdRamo)}
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
export default TabelaRamosAtividade;